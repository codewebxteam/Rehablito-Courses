/**
 * ============================================================================
 * Rehablito Academy - Railway Node.js Backend Server
 * ============================================================================
 * Features:
 * 1. Automatic Razorpay Payment Verification & Instant Course Enrollment
 * 2. Razorpay Order Creation API
 * 3. Razorpay Webhooks Listener
 * 4. 7-Day Auto-Cleanup: Permanently purges expired chat & ImageKit CDN media
 * 5. Daily Scheduled Cron Job (Runs every 24h at 00:00)
 * ============================================================================
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const cron = require("node-cron");
const Razorpay = require("razorpay");
const admin = require("firebase-admin");

// 1. Initialize Firebase Admin SDK
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === "string"
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : process.env.FIREBASE_SERVICE_ACCOUNT;
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized with Service Account Credentials.");
  } else {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "rehablito-courses",
    });
    console.log(`Firebase Admin initialized with Project ID: ${process.env.FIREBASE_PROJECT_ID || "rehablito-courses"}`);
  }
} catch (err) {
  console.warn("Firebase Admin init warning (using default credentials):", err.message);
  if (!admin.apps.length) {
    admin.initializeApp();
  }
}

const db = admin.firestore();

// 2. Initialize Razorpay Client
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// 3. Initialize Express App
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ----------------------------------------------------------------------------
// Health Check Endpoint (Required for Railway Deployments)
// ----------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    service: "Rehablito Academy Backend",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// ----------------------------------------------------------------------------
// 1. Razorpay: Create Order API
// ----------------------------------------------------------------------------
app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, notes = {} } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid amount provided." });
    }

    const options = {
      amount: Math.round(numericAmount * 100), // convert to paise
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes,
    };

    const order = await razorpay.orders.create(options);
    console.log(`Razorpay order created: ${order.id} for amount ₹${numericAmount}`);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create Razorpay order",
    });
  }
});

// ----------------------------------------------------------------------------
// 2. Razorpay: Verify Payment & Grant Automatic Course Access
// ----------------------------------------------------------------------------
app.post("/api/payment/verify", async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      userId,
      userEmail,
      studentName,
      courseId,
      ebookId,
      assetName,
      saleValue,
      type = "course",
    } = req.body;

    if (!razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required razorpay_payment_id parameter",
      });
    }

    console.log(`[VerifyPayment] Verifying payment: ${razorpay_payment_id} for user: ${userEmail || userId}`);

    let isPaymentValid = false;
    let paymentDetails = null;

    // Check 1: Cryptographic HMAC SHA256 Signature Verification (if order_id present)
    if (razorpay_order_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature === razorpay_signature) {
        isPaymentValid = true;
        console.log(`[VerifyPayment] Cryptographic HMAC signature MATCHED!`);
      } else {
        console.warn(`[VerifyPayment] HMAC signature mismatch! Trying direct Razorpay API check...`);
      }
    }

    // Check 2: Direct Razorpay API verification
    if (!isPaymentValid) {
      try {
        paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
        if (paymentDetails && (paymentDetails.status === "captured" || paymentDetails.status === "authorized")) {
          // Verify amount matches
          const expectedPaise = Math.round(Number(saleValue || 0) * 100);
          if (expectedPaise === 0 || paymentDetails.amount === expectedPaise) {
            isPaymentValid = true;
            console.log(`[VerifyPayment] Direct Razorpay API check SUCCESS! Status: ${paymentDetails.status}`);
          } else {
            console.warn(`[VerifyPayment] Amount mismatch! Expected: ${expectedPaise}, Got: ${paymentDetails.amount}`);
          }
        }
      } catch (fetchErr) {
        console.error("[VerifyPayment] Failed to fetch payment from Razorpay API:", fetchErr.message);
      }
    }

    if (!isPaymentValid) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Payment verification failed. Transaction was not captured or signature was invalid.",
      });
    }

    // --- AUTOMATIC ACCESS PROVISIONING IN FIRESTORE ---
    const nowTimestamp = admin.firestore.FieldValue.serverTimestamp();

    // 1. Record verified order in 'orders' collection
    const orderDocRef = await db.collection("orders").add({
      studentName: studentName || userEmail || "Student",
      studentEmail: userEmail || "",
      userId: userId || null,
      productName: assetName || "Course Access",
      productType: type,
      price: Number(saleValue) || 0,
      commission: 0,
      partnerId: "direct",
      partnerName: "Direct",
      courseId: courseId || null,
      ebookId: ebookId || null,
      videoProgress: 0,
      certificateIssued: false,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id || null,
      status: "verified",
      purchasedAt: nowTimestamp,
      createdAt: nowTimestamp,
    });

    // 2. Grant course access to user document
    if (userId) {
      const userRef = db.collection("users").doc(userId);

      if (type === "course" && courseId) {
        await userRef.set(
          {
            enrolledCourses: admin.firestore.FieldValue.arrayUnion({
              courseId: courseId,
              title: assetName || "Course",
              enrolledAt: new Date().toISOString(),
              orderId: orderDocRef.id,
            }),
          },
          { merge: true }
        );

        // Update dashboard statistics
        const dashboardRef = db.collection("dashboard").doc(userId);
        const dashSnap = await dashboardRef.get();
        if (dashSnap.exists) {
          await dashboardRef.update({
            "stats.enrolledCourses": admin.firestore.FieldValue.increment(1),
          });
        }
        console.log(`[VerifyPayment] Successfully enrolled userId: ${userId} in course: ${courseId}`);
      } else if (type === "ebook" && ebookId) {
        await userRef.set(
          {
            purchasedBooks: admin.firestore.FieldValue.arrayUnion({
              bookId: ebookId,
              title: assetName || "E-Book",
              purchasedAt: new Date().toISOString(),
              orderId: orderDocRef.id,
            }),
          },
          { merge: true }
        );
        console.log(`[VerifyPayment] Successfully added ebook: ${ebookId} to userId: ${userId}`);
      }
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: "Payment successfully verified and course access granted!",
      orderId: orderDocRef.id,
    });
  } catch (err) {
    console.error("[VerifyPayment] Server error verifying payment:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error during payment verification: " + err.message,
    });
  }
});

// ----------------------------------------------------------------------------
// 3. Razorpay Webhook Endpoint
// ----------------------------------------------------------------------------
app.post("/api/payment/webhook", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || RAZORPAY_KEY_SECRET;

    if (signature && webhookSecret) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (expectedSignature !== signature) {
        console.warn("[Webhook] Invalid webhook signature received.");
        return res.status(400).send("Invalid signature");
      }
    }

    const event = req.body.event;
    console.log(`[Webhook] Razorpay event received: ${event}`);

    if (event === "payment.captured" || event === "order.paid") {
      const payment = req.body.payload?.payment?.entity;
      const userEmail = payment?.email || payment?.notes?.email;
      const courseId = payment?.notes?.courseId;

      if (userEmail && courseId) {
        const userQuery = await db.collection("users").where("email", "==", userEmail).limit(1).get();
        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          await userDoc.ref.set(
            {
              enrolledCourses: admin.firestore.FieldValue.arrayUnion({
                courseId: courseId,
                enrolledAt: new Date().toISOString(),
                source: "razorpay_webhook",
              }),
            },
            { merge: true }
          );
          console.log(`[Webhook] Auto-enrolled ${userEmail} in course ${courseId}`);
        }
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("[Webhook] Error handling webhook:", error);
    return res.status(500).send("Webhook handler error");
  }
});

// ----------------------------------------------------------------------------
// 4. 7-Day Auto-Cleanup Logic: Purges Firestore Messages & ImageKit CDN Files
// ----------------------------------------------------------------------------
async function deleteFilesFromImageKit(fileIds) {
  if (!fileIds || !fileIds.length) return 0;
  try {
    const authHeader = "Basic " + Buffer.from(`${IMAGEKIT_PRIVATE_KEY}:`).toString("base64");
    const response = await fetch("https://api.imagekit.io/v1/files/batch/deleteByFileIds", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileIds }),
    });
    if (response.ok) {
      const data = await response.json();
      return (data.successfullyDeletedFileIds || []).length;
    }
  } catch (err) {
    console.error("Failed to bulk delete from ImageKit in server:", err.message);
  }
  return 0;
}

async function purgeExpiredConsultations(retentionDays = 7) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  console.log(`[Cleanup] Starting cleanup for messages before ${cutoff.toISOString()}...`);

  const threadsSnap = await db.collection("consultation_threads").get();
  let deletedMsgCount = 0;
  const fileIds = [];

  for (const threadDoc of threadsSnap.docs) {
    const messagesRef = threadDoc.ref.collection("messages");
    const expiredSnap = await messagesRef.where("createdAt", "<=", cutoff).get();

    if (!expiredSnap.empty) {
      const batch = db.batch();
      expiredSnap.forEach((doc) => {
        const data = doc.data();
        if (Array.isArray(data.attachments)) {
          data.attachments.forEach((att) => {
            if (att.fileId) fileIds.push(att.fileId);
          });
        }
        batch.delete(doc.ref);
      });
      await batch.commit();
      deletedMsgCount += expiredSnap.size;

      // Update thread lastMessage if all messages expired
      const remainingSnap = await messagesRef.limit(1).get();
      if (remainingSnap.empty) {
        await threadDoc.ref.update({
          lastMessage: "Messages older than 7 days were automatically cleared.",
          status: "pending",
          unreadAdminCount: 0,
          unreadUserCount: 0,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  }

  let deletedFileCount = 0;
  if (fileIds.length > 0) {
    deletedFileCount = await deleteFilesFromImageKit(fileIds);
  }

  console.log(`[Cleanup] Finished: Deleted ${deletedMsgCount} messages and ${deletedFileCount} ImageKit files.`);
  return { deletedMessages: deletedMsgCount, deletedFiles: deletedFileCount };
}

// Endpoint to trigger cleanup manually
app.all("/api/cleanup", async (req, res) => {
  try {
    const retentionDays = Number(req.query.days || 7);
    const result = await purgeExpiredConsultations(retentionDays);
    return res.status(200).json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 5. Daily Scheduled Cron Job: Runs every midnight (00:00)
// ----------------------------------------------------------------------------
cron.schedule("0 0 * * *", async () => {
  console.log("[ScheduledCron] Running automatic 7-day consultation & ImageKit cleanup...");
  try {
    await purgeExpiredConsultations(7);
  } catch (err) {
    console.error("[ScheduledCron] Failed to run automated cleanup:", err);
  }
});

// ----------------------------------------------------------------------------
// Start Server
// ----------------------------------------------------------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`===================================================`);
  console.log(`🚀 Rehablito Backend Server running on port ${PORT}`);
  console.log(`🔗 Ready for Railway deployment!`);
  console.log(`===================================================`);
});
