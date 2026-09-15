const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

exports.handlePaymentWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const payload = req.body; 

    console.log("Payment Webhook Received:", payload);

    // 1. Payment Success Check
    // (Superprofile kabhi 'success' bhejta hai, kabhi 'captured')
    if (payload.status !== "success" && payload.payment_status !== "captured") {
        return res.status(200).send("Payment not successful, ignoring.");
    }

    // 2. Data Nikalein
    const userEmail = payload.customer_email || payload.email; 
    // Note: Superprofile me Product Name set karein ya Product ID match karein
    // Filhal hum man rahe hain ki product_id hi courseId hai
    const courseId = payload.product_id || payload.notes?.courseId; 

    if (!userEmail || !courseId) {
        console.error("Missing Email or Course ID");
        return res.status(400).send("Invalid Data");
    }

    // 3. User Dhundhein
    const userSnapshot = await db.collection("users").where("email", "==", userEmail).limit(1).get();

    if (userSnapshot.empty) {
        console.error("User not found:", userEmail);
        return res.status(404).send("User not found in database");
    }

    const userId = userSnapshot.docs[0].id;

    // 4. Enrollment (Access Dena)
    // Hum user ke document me 'enrolledCourses' array update karenge
    // (Ya subcollection, jaisa aapka database structure ho)
    
    // Tarika 1: Agar 'enrolledCourses' ek Array hai User Doc me:
    await db.collection("users").doc(userId).update({
        enrolledCourses: admin.firestore.FieldValue.arrayUnion({
            courseId: courseId,
            enrolledAt: new Date().toISOString()
        })
    });
    
    // Tarika 2: Agar Dashboard collection alag hai (Jo aapne StudentDashboard.jsx me dikhaya tha)
    // Dashboard stats update karein
    const dashboardRef = db.collection("dashboard").doc(userId);
    const dashboardDoc = await dashboardRef.get();
    
    if (dashboardDoc.exists) {
        await dashboardRef.update({
            "stats.enrolledCourses": admin.firestore.FieldValue.increment(1),
            "currentCourse": { title: "New Course", progress: 0 } // Optional
        });
    }

    console.log(`Success! Given access to ${userEmail}`);
    return res.status(200).send("Webhook Handled");

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Server Error");
  }
});

const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;

/**
 * Permanently delete files from ImageKit in bulk using ImageKit API
 */
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
    console.error("Failed to bulk delete from ImageKit in Cloud Function:", err);
  }
  return 0;
}

/**
 * Core cleanup logic: Permanently deletes consultation messages and attachments
 * older than 7 days from both Firestore and ImageKit CDN
 */
async function purgeExpiredConsultationChats(retentionDays = 7) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  console.log(`[CloudCleanup] Purging consultation messages before ${cutoff.toISOString()}`);

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

  console.log(`[CloudCleanup] Purged ${deletedMsgCount} messages and ${deletedFileCount} files from ImageKit.`);
  return { deletedMessages: deletedMsgCount, deletedFiles: deletedFileCount };
}

/**
 * Scheduled Daily Cron Job (Runs automatically every 24 hours)
 */
exports.scheduledDailyChatCleanup = functions.pubsub
  .schedule("every 24 hours")
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    return purgeExpiredConsultationChats(7);
  });

/**
 * On-demand HTTP endpoint to trigger cleanup manually
 */
exports.manualChatCleanup = functions.https.onRequest(async (req, res) => {
  try {
    const result = await purgeExpiredConsultationChats(7);
    return res.status(200).json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});