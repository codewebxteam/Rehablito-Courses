import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config";

// [REMOVED] listenToOrders (Partner specific)

// Keep this for Admin to see all orders
export const listenToAllOrders = (callback) => {
  const q = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  });
};

// [UPDATED] Removed Commission and PartnerID logic
export const createOrder = async ({
  studentName,
  studentEmail,
  userId,
  assetName,
  type,
  saleValue,
  // commission & partnerId removed from destructuring
  courseId,
  ebookId,
}) => {
  await addDoc(collection(db, "orders"), {
    studentName,
    studentEmail,
    userId: userId || null,
    productName: assetName,
    productType: type,
    price: Number(saleValue),
    commission: 0, // Always 0
    partnerId: "direct", // Always direct
    partnerName: "Direct",
    courseId: courseId || null,
    ebookId: ebookId || null,
    videoProgress: 0,
    certificateIssued: false,
    status: "verified",
    purchasedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
};

export const updateCourseProgress = async (userId, courseId, progress) => {
  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      where("courseId", "==", courseId),
      where("productType", "==", "course")
    );
    const snapshot = await getDocs(q);

    snapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        videoProgress: progress,
        lastUpdated: serverTimestamp(),
      });
    });
  } catch (error) {
    console.error("Error updating order progress:", error);
  }
};