import { db } from "./config";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const getStartDate = (timeRange) => {
  const now = new Date();
  switch (timeRange) {
    case "Today":
      return new Date(now.setHours(0, 0, 0, 0)).toISOString();
    case "7D":
      return new Date(now.setDate(now.getDate() - 7)).toISOString();
    case "30D":
      return new Date(now.setDate(now.getDate() - 30)).toISOString();
    case "Quarter":
      return new Date(now.setMonth(now.getMonth() - 3)).toISOString();
    case "Year":
      return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    default:
      return new Date(0).toISOString();
  }
};

export const subscribeToRevenueData = (timeRange, callback) => {
  const startDate = getStartDate(timeRange);
  // Using transactions or payments collection based on your DB structure
  const q = query(collection(db, "transactions"), where("createdAt", ">=", startDate));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, () => callback([]));
};

export const subscribeToStudentData = (callback) => {
  return onSnapshot(collection(db, "students"), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, () => callback([]));
};

// [UPDATED] Simplified Metrics - Removed Partner/Direct Split
export const calculateMetrics = (transactions, students, enrollments) => {
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalEnrollments = enrollments.length;
  const totalStudents = students.length;
  
  return {
    totalRevenue,
    totalEnrollments,
    totalStudents,
    // Maintaining structure for chart compatibility if needed
    directRevenue: totalRevenue, 
    partnerRevenue: 0,
  };
};