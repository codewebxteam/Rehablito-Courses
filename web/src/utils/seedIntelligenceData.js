import { db } from "../firebase/config";
import { collection, addDoc, Timestamp } from "firebase/firestore";

/**
 * Sample Data Seeder for Intelligence Hub
 * Run this once to populate your Firebase with test data
 */

export const seedIntelligenceData = async () => {
  try {
    console.log("🌱 Starting to seed Intelligence Hub data...");

    // 1. Seed Payments (Removed Partner & Payouts)
    const payments = [
      { amount: 5000, status: "completed", source: "direct", type: "purchase", createdAt: Timestamp.now() },
      { amount: 3000, status: "completed", source: "direct", type: "purchase", createdAt: Timestamp.now() },
      { amount: 50000, status: "pending", type: "withdrawal", createdAt: Timestamp.now() },
    ];

    for (const payment of payments) {
      await addDoc(collection(db, "payments"), payment);
    }
    console.log("✅ Payments seeded");

    // 2. Seed Students (All set to direct)
    const students = [
      { name: "John Doe", email: "john@example.com", source: "direct", courseStatus: "in_progress", certificationStatus: "eligible", createdAt: Timestamp.now() },
      { name: "Jane Smith", email: "jane@example.com", source: "direct", courseStatus: "completed", certificationStatus: "issued", createdAt: Timestamp.now() },
      { name: "Mike Johnson", email: "mike@example.com", source: "direct", courseStatus: "not_started", certificationStatus: "pending", createdAt: Timestamp.now() },
      { name: "Sarah Williams", email: "sarah@example.com", source: "direct", courseStatus: "completed", certificationStatus: "issued", createdAt: Timestamp.now() },
      { name: "Tom Brown", email: "tom@example.com", source: "direct", courseStatus: "in_progress", certificationStatus: "eligible", createdAt: Timestamp.now() },
    ];

    for (const student of students) {
      await addDoc(collection(db, "students"), student);
    }
    console.log("✅ Students seeded");

    // 3. Seed Enrollments (All set to direct)
    const enrollments = [
      { courseName: "React Pro Mastery", source: "direct", studentId: "student1", createdAt: Timestamp.now() },
      { courseName: "React Pro Mastery", source: "direct", studentId: "student2", createdAt: Timestamp.now() },
      { courseName: "UI/UX Master", source: "direct", studentId: "student3", createdAt: Timestamp.now() },
      { courseName: "Node Backend", source: "direct", studentId: "student4", createdAt: Timestamp.now() },
      { courseName: "Python AI", source: "direct", studentId: "student5", createdAt: Timestamp.now() },
      { courseName: "React Pro Mastery", source: "direct", studentId: "student6", createdAt: Timestamp.now() },
    ];

    for (const enrollment of enrollments) {
      await addDoc(collection(db, "enrollments"), enrollment);
    }
    console.log("✅ Enrollments seeded");

    // 4. Seed Ebook Sales
    const ebookSales = [
      { ebookName: "JS Pocket Guide", price: 299, studentId: "student1", createdAt: Timestamp.now() },
      { ebookName: "Tailwind Guide", price: 399, studentId: "student2", createdAt: Timestamp.now() },
      { ebookName: "Freelance 101", price: 499, studentId: "student3", createdAt: Timestamp.now() },
      { ebookName: "JS Pocket Guide", price: 299, studentId: "student4", createdAt: Timestamp.now() },
      { ebookName: "Tailwind Guide", price: 399, studentId: "student5", createdAt: Timestamp.now() },
    ];

    for (const sale of ebookSales) {
      await addDoc(collection(db, "ebook_sales"), sale);
    }
    console.log("✅ Ebook sales seeded");

    console.log("🎉 All Intelligence Hub data seeded successfully!");
    return { success: true, message: "Data seeded successfully" };
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    return { success: false, message: error.message };
  }
};

// Export for use in admin panel or console
export default seedIntelligenceData;