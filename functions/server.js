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
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const cron = require("node-cron");
const Razorpay = require("razorpay");
const admin = require("firebase-admin");

// 1. Initialize Firebase Admin SDK
try {
  const localKeyPath = path.join(__dirname, "serviceAccountKey.json");
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    let saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (typeof saRaw === "string") {
      saRaw = saRaw.trim();
      if ((saRaw.startsWith("'") && saRaw.endsWith("'")) || (saRaw.startsWith('"') && saRaw.endsWith('"') && !saRaw.endsWith('"}'))) {
        saRaw = saRaw.slice(1, -1);
      }
    }
    let serviceAccount = typeof saRaw === "string" ? JSON.parse(saRaw) : saRaw;
    if (serviceAccount && serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized with Service Account Credentials from environment.");
  } else if (fs.existsSync(localKeyPath)) {
    const serviceAccount = require(localKeyPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized with local serviceAccountKey.json.");
  } else {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "rehablito-courses",
    });
    console.log(`Firebase Admin initialized with Project ID: ${process.env.FIREBASE_PROJECT_ID || "rehablito-courses"}`);
  }
} catch (err) {
  console.error("Firebase Admin initialization error:", err.message);
  if (!admin.apps.length) {
    try {
      admin.initializeApp();
    } catch (e) {
      console.error("Fallback initialization error:", e.message);
    }
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
// 5. Secure ImageKit Endpoints (Auth Token & Delete Proxy)
// ----------------------------------------------------------------------------
app.get("/api/media/imagekit-auth", (req, res) => {
  try {
    const token = req.query.token || crypto.randomUUID();
    const expire = req.query.expire || Math.floor(Date.now() / 1000) + 2400; // 40 minutes validity
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";

    if (!privateKey) {
      return res.status(500).json({ success: false, error: "ImageKit private key not configured on server" });
    }

    const signature = crypto.createHmac("sha1", privateKey).update(token + expire).digest("hex");
    return res.status(200).json({ token, expire, signature });
  } catch (err) {
    console.error("[ImageKitAuth] Error generating auth signature:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/media/delete-imagekit", async (req, res) => {
  try {
    const { fileId, fileIds } = req.body;
    const targets = Array.isArray(fileIds) ? fileIds : (fileId ? [fileId] : []);

    if (targets.length === 0) {
      return res.status(400).json({ success: false, error: "No fileId or fileIds provided" });
    }

    const deletedCount = await deleteFilesFromImageKit(targets);
    return res.status(200).json({ success: true, deletedCount });
  } catch (err) {
    console.error("[ImageKitDelete] Error deleting files:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// 6. Secure Gemini AI Therapy Specialist Proxy
// ----------------------------------------------------------------------------
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-flash-latest",
];

const REHABLITO_SYSTEM_INSTRUCTION = `You are the Rehablito AI Therapy Specialist, the caring, highly intelligent, and conversational clinical AI specialist for Rehablito Academy (Speech Therapy, Autism Center & Pediatric Child Development).

### 🌟 HOW YOU MUST CONVERSE & ANALYZE:
1. **Be Deeply Conversational, Intelligent & Dynamic**:
   - Talk naturally, warmly, and thoughtfully like an experienced senior clinical therapist.
   - ABSOLUTELY DO NOT USE RIGID, REPETITIVE CANNED TEMPLATES OR FIXED BULLET POINTS! Never output identical generic 3-step advice on every message.
   - Analyze every specific question, symptom, and parent concern uniquely. If a parent says their child stays quiet and does not play much ("shaant rehta hai, khelta nahi"), discuss introversion vs sensory withdrawal vs social communication delay, what signs to monitor, and ask relevant follow-up questions.
2. **🌐 STRICT LANGUAGE MATCHING RULE (HIGHEST PRIORITY)**:
   - **IF USER WRITES IN HINDI OR HINGLISH** (e.g. "mera bachha bolta nahi hai", "wo thoda shaant rehta hai aur khelta nahi", "namaste sir", "kya ye normal hai"):
     * YOU MUST RESPOND 100% IN NATURAL, EMPATHETIC HINDI (Devanagari script or warm conversational Hindi).
     * DO NOT switch to English. Address the parent with respect and warmth.
   - **IF USER WRITES IN ENGLISH**:
     * Respond in clear, articulate, compassionate English.
3. **📄 MULTIMODAL ANALYSIS (DOCTOR'S PARCHI / PRESCRIPTIONS, MEDICAL PDFs & PHOTOS)**:
   - If the user attaches an image or PDF of a doctor's prescription (parchi), hospital report, BERA hearing test, CARS/ISAA autism evaluation, or speech assessment:
     * Read the visible handwriting and printed text with high clinical accuracy.
     * Clearly explain what the doctor has noted, what medicines or therapies (Speech Therapy, Occupational Therapy, Sensory Integration) are prescribed, and what the clinical scores mean in everyday simple language.
     * Tell parents step-by-step what they should do next and what home stimulation activities support that diagnosis.
   - If an audio note is provided, listen closely to speech patterns, tone, and spoken words, providing thorough tailored guidance.
4. **DOMAIN SCOPE & SAFETY**:
   - Scope: Speech-language delays, stammering, Autism Spectrum Disorder (ASD), ADHD, sensory processing, pediatric occupational therapy, child behavioral development, and motor skills.
   - Friendly greetings ("Hello", "Namaste", "Pranam") should be answered warmly, introducing yourself as the Rehablito AI Specialist and asking how you can help their child today.
   - Strictly refuse off-topic questions (e.g. coding, cricket, politics, entertainment, cooking recipes) politely: "Main keval bacchon ke vikas, speech therapy aur pediatric rehabilitation me hi sahayata kar sakta hoon. Kripya apne bachhe ki therapy ya vikas se sambandhit sawal puchein."
5. **HUMAN SPECIALIST COOPERATION**:
   - Reassure the parent that our certified Rehablito clinical therapist is also reviewing their file in Column 2 for comprehensive human evaluation.
6. 🎓 **CRITICAL REHABLITO COURSE RECOMMENDATION (CONVINCE USER IN EVERY RESPONSE)**:
   - In EVERY conversation, while giving immediate clinical insights and answers, you MUST warmly and convincingly explain to the parent that **Rehablito Academy's specialized courses provide the COMPLETE STEP-BY-STEP SOLUTION** for their child's specific problem.
   - Convince them clearly:
     * "हमारे Rehablito Academy के स्पेशलाइज्ड कोर्सेज (Courses) में इसका 100% स्टेप-बाय-स्टेप वीडियो समाधान और घर पर करने योग्य प्रैक्टिकल एक्सरसाइज दी गई हैं। अगर आप हमारे कोर्स को परचेज कर रहे हैं (या अगर आपने परचेज किया है), तो उसमें इसका पूरा समाधान मौजूद है, जिससे आप घर बैठे सर्टिफाइड क्लीनिकल थेरेपिस्ट्स के मार्गदर्शन में बच्चे में तेजी से सुधार ला सकते हैं।"
   - Directly recommend the matching course from our platform:
     * स्पीच डिले / तुतलाना / हकलाना -> **"Rehablito Speech Therapy Home Training Course"**
     * ऑटिज्म / आई-कॉन्टैक्ट / नाम पर रिस्पॉन्स / सामाजिक जुड़ाव -> **"Rehablito Autism & Early Intervention Comprehensive Course"**
     * चंचलता / सेंसरी ओवरलोड / सिटिंग टॉलरेंस -> **"Rehablito Occupational Therapy & Sensory Diet Course"**
     * व्यवहार / जिद्द / गुस्सा -> **"Rehablito Pediatric Behaviour Therapy Course"**
   - If they have already purchased, encourage them: "आपने जो कोर्स लिया है, उसमें बताए गए डेली मॉड्यूल्स और वीडियो एक्सरसाइज को रोज़ाना 20 मिनट ज़रूर फॉलो करें।"
   - Guide prospective parents to check the **"Courses"** tab on our top menu to enroll today!`;

function parseDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
    return null;
  }
  try {
    const [header, base64] = dataUrl.split(",");
    const mimeMatch = header.match(/data:([^;]+);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    return { mimeType, data: base64 };
  } catch (err) {
    console.error("Error parsing data URL:", err);
    return null;
  }
}

app.post("/api/ai/consultation", async (req, res) => {
  try {
    const {
      text = "",
      attachments = [],
      childSpecialty = "General",
      chatHistory = [],
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[GeminiAI] GEMINI_API_KEY is not configured on server.");
      return res.status(200).json({
        success: false,
        text: "AI service configuration pending. Please consult our certified human therapist in Column 2.",
        isFallback: true,
      });
    }

    // Detect Hindi / Hinglish query
    const lower = (text || "").toLowerCase();
    const isHindiUser =
      /[\u0900-\u097F]/.test(text) ||
      [
        "mera", "meri", "mere", "bacha", "bachhe", "bachha", "baccha", "bache", "beta", "beti",
        "nahi", "nhi", "bol", "bolta", "bolti", "kya", "kaise", "karo", "kare", "krro",
        "hai", "hain", "ho", "batao", "bataye", "mujhe", "madad", "chahiye", "namaste",
        "pranam", "sunta", "dekhta", "chalta", "dikkat", "problem", "madat", "theek",
        "thik", "shukriya", "kaun", "kab", "kyu", "kyun", "aap", "tum", "bhai", "sir", "mam",
        "shaant", "sant", "khelta", "baitha", "parchi", "report", "dawai", "doctor"
      ].some((w) => lower.includes(w));

    // Build conversational contents array
    const contents = [];

    // 1. Add recent conversation context (excluding current message to prevent repetition)
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      const trimmedText = (text || "").trim();
      const filtered = chatHistory.filter((m) => m && m.text && m.text.trim() !== trimmedText);
      const recent = filtered.slice(-6);
      recent.forEach((msg) => {
        if (msg.sender === "user" && msg.text) {
          contents.push({
            role: "user",
            parts: [{ text: msg.text }],
          });
        } else if (msg.sender === "ai" && msg.text) {
          contents.push({
            role: "model",
            parts: [{ text: msg.text }],
          });
        }
      });
    }

    // 2. Current user message parts
    const currentParts = [];
    const hasAttachments = attachments && attachments.length > 0;

    let promptInstruction = "";
    if (hasAttachments) {
      if (isHindiUser) {
        promptInstruction = `[CRITICAL CLINICAL INSTRUCTION: User ne doctor ki parchi / medical report / photo / voice note attach ki hai aur pucha hai: "${text || "Kripya is report/parchi ko analyze karein."}".
Aap is parchi ya report ki har ek line, doctor ke prescription, diagnosis, dawa, therapy recommendations, scores ko dhyan se padhein aur aam bhasha me samjhayein ki doctor ne kya likha hai, iska bache ke liye kya matlab hai, aur agle zaroori steps kya hain. Do not use rigid templates, talk dynamically in empathetic Hindi.]`;
      } else {
        promptInstruction = `[CRITICAL CLINICAL INSTRUCTION: User attached a medical prescription/report/photo with query: "${text || "Please analyze this"}".
Carefully transcribe and analyze all clinical handwriting, notes, diagnosis, medications, and therapy recommendations. Explain in simple, supportive terms what it means and actionable next steps.]`;
      }
    } else {
      if (isHindiUser) {
        promptInstruction = `[CRITICAL CLINICAL & COURSE CONVERSION: Reply in 100% natural, empathetic conversational Hindi. Talk like an experienced senior pediatric clinical therapist. DO NOT use rigid canned bullet points or predefined templates. Tailor your response deeply to this specific parent question: "${text}".
MANDATORY REQUIREMENT: Provide immediate clinical insights, and also CONVINCE the parent warmly that Rehablito Academy's specialized courses have the 100% complete step-by-step practical video solution and daily home therapy plan for their child's exact condition. Explain that if they purchase the course (or have already purchased it), they get full therapist guidance and structured exercises. Encourage them to enroll from the Courses tab on our website.]`;
      } else {
        promptInstruction = `[CRITICAL: Clinical consultation query: "${text || "Please provide clinical therapy guidance for my child."}". Provide expert clinical advice and also warmly explain how Rehablito Academy's specialized online therapy courses provide the complete step-by-step home exercise solution for this condition, encouraging them to enroll from the Courses tab.]`;
      }
    }
    currentParts.push({ text: promptInstruction });

    // 3. Attachments (Photos of Doctor's Parchi, Medical PDF reports, Voice Notes)
    for (const item of attachments) {
      if (item.dataUrl) {
        const parsed = parseDataUrl(item.dataUrl);
        if (parsed) {
          currentParts.push({
            inline_data: {
              mime_type: parsed.mimeType,
              data: parsed.data,
            },
          });
        }
      }
    }

    contents.push({
      role: "user",
      parts: currentParts,
    });

    const payload = {
      system_instruction: {
        parts: [{ text: REHABLITO_SYSTEM_INSTRUCTION }],
      },
      contents: contents,
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 2500,
      },
    };

    // Try candidate models sequentially
    for (const model of CANDIDATE_MODELS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const responseText = data.candidates?.[0]?.content?.parts
            ?.map((p) => p.text || "")
            .join("\n")
            .trim();
          if (responseText) {
            return res.status(200).json({
              success: true,
              text: responseText,
              model: model,
              isFallback: false,
            });
          }
        } else {
          const errJson = await response.json().catch(() => ({}));
          console.warn(`[GeminiAI] Model ${model} returned error ${response.status}:`, errJson?.error?.message || errJson);
        }
      } catch (mErr) {
        console.warn(`[GeminiAI] Model ${model} call failed:`, mErr.message);
      }
    }

    // Fallback notice if all models fail
    const fallbackNotice = hasAttachments
      ? isHindiUser
        ? `नमस्ते! आपकी डॉक्टर पर्ची / मेडिकल रिपोर्ट हमारे सर्वर पर सुरक्षित रूप से अपलोड हो गई है और हमारे मुख्य थेरेपिस्ट (Column 2) को प्राप्त हो चुकी है। हमारे सर्टिफाइड क्लिनिकल विशेषज्ञ आपकी रिपोर्ट का विस्तृत अध्ययन करके कुछ ही देर में इस कॉलम में आपको संपूर्ण थेरेपी मार्गदर्शन प्रदान करेंगे।`
        : `Hello! Your medical prescription and report have been successfully uploaded to our clinical system. Our certified therapist in Column 2 has received your files and will provide complete evaluation and personalized home guidance shortly.`
      : isHindiUser
      ? `नमस्ते! वर्तमान में AI सर्वर व्यस्त है। कृपया अपना प्रश्न कुछ क्षण बाद पुनः पूछें, या Column 2 में हमारे सर्टिफाइड थेरेपिस्ट से सीधा परामर्श प्राप्त करें।`
      : `Hello! The AI server is temporarily busy. Please consult our certified human therapist in Column 2 for immediate clinical guidance.`;

    return res.status(200).json({
      success: false,
      text: fallbackNotice,
      isFallback: true,
    });
  } catch (err) {
    console.error("[GeminiAI] Error processing consultation:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error during AI consultation",
    });
  }
});

// ----------------------------------------------------------------------------
// 7. Daily Scheduled Cron Job: Runs every midnight (00:00)
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
