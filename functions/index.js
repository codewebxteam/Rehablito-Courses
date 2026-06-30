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