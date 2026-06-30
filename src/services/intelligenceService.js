import { db } from "../firebase/config";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

/**
 * Intelligence Hub Real-time Data Service
 * Fetches analytics data from Firebase Firestore
 */

// Helper function to get date range based on timeRange
const getDateRange = (timeRange, customDates = null) => {
  const now = new Date();
  let startDate = new Date();
  
  switch (timeRange) {
    case "Today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "7D":
      startDate.setDate(now.getDate() - 7);
      break;
    case "30D":
      startDate.setDate(now.getDate() - 30);
      break;
    case "Quarter":
      startDate.setMonth(now.getMonth() - 3);
      break;
    case "Year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case "Custom":
      if (customDates?.start && customDates?.end) {
        startDate = new Date(customDates.start);
        const endDate = new Date(customDates.end);
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate };
      }
      startDate.setDate(now.getDate() - 7);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }
  
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
};

// Fetch revenue data
export const getRevenueData = async (timeRange = "7D", customDates = null) => {
  try {
    const { startDate, endDate } = getDateRange(timeRange, customDates);
    
    // In a real app, you would query a 'transactions' or 'orders' collection
    // Here we're simulating based on time range for chart display
    // For production, replace with actual Firestore query:
    // const q = query(collection(db, "orders"), where("createdAt", ">=", startDate), where("createdAt", "<=", endDate));
    
    // Placeholder data structure for charts
    const labels = [];
    const data = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      labels.push(new Date(currentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      // Random mock data for visualization - Replace with real aggregation
      data.push(Math.floor(Math.random() * 5000) + 1000); 
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return { labels, datasets: [{ label: 'Revenue', data, borderColor: '#6366f1', tension: 0.4 }] };
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return { labels: [], datasets: [] };
  }
};

// [UPDATED] Calculate Key Metrics - Removed Partner Logic
export const calculateMetrics = (transactions, students, enrollments) => {
  // 1. Total Revenue
  const totalRevenue = transactions.reduce((sum, t) => sum + (Number(t.price) || Number(t.amount) || 0), 0);
  
  // 2. Total Enrollments
  const totalEnrollments = enrollments.length;
  
  // 3. Active Students
  const totalStudents = students.length;
  
  return {
    totalRevenue,
    totalEnrollments,
    totalStudents,
    averageOrderValue: totalEnrollments > 0 ? Math.round(totalRevenue / totalEnrollments) : 0,
  };
};

// Fetch hot asset spotlight
export const getHotAssetSpotlight = async (timeRange = "7D", customDates = null) => {
  try {
    const enrollmentsRef = collection(db, "enrollments");
    const snapshot = await getDocs(enrollmentsRef);
    
    const { startDate, endDate } = getDateRange(timeRange, customDates);
    const courseMap = {};
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const enrollDate = data.createdAt?.toDate() || data.enrolledAt?.toDate();
      
      if (enrollDate && enrollDate >= startDate && enrollDate <= endDate) {
        const courseName = data.courseName || "Unknown";
        courseMap[courseName] = (courseMap[courseName] || 0) + 1;
      }
    });
    
    const topCourse = Object.entries(courseMap).sort((a, b) => b[1] - a[1])[0];
    return topCourse ? { name: topCourse[0], units: topCourse[1] } : { name: "N/A", units: 0 };
  } catch (error) {
    console.error("Error fetching hot asset:", error);
    return { name: "Error", units: 0 };
  }
};

// Fetch retention data (Mock for now, can be connected to real data)
export const getRetentionData = async () => {
  return {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Retention Rate',
        data: [100, 85, 70, 65, 60, 55],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };
};

// Fetch recent activity
export const getRecentActivity = async (limitCount = 5) => {
  try {
    const q = query(
      collection(db, "orders"), 
      orderBy("createdAt", "desc"), 
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        user: data.studentName || data.user?.name || "Anonymous",
        action: `purchased ${data.productName || "a course"}`,
        time: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleTimeString() : "Just now",
        amount: data.price || data.amount || 0
      };
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
};