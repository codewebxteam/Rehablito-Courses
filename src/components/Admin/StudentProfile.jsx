import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  FileText,
  ShoppingBag,
  Shield,
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const StudentProfile = ({ student, onClose }) => {
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. SMART DATA FETCHING ---
  useEffect(() => {
    const fetchFullDetails = async () => {
      setLoading(true);
      const historyMap = new Map(); // Use Map to avoid duplicates

      try {
        // A. FETCH OFFICIAL ORDERS (Payment History)
        // We check multiple fields to ensure we catch the order
        const queries = [];
        if (student.id) {
          queries.push(
            query(
              collection(db, "orders"),
              where("studentId", "==", student.id),
            ),
          );
          queries.push(
            query(collection(db, "orders"), where("userId", "==", student.id)),
          );
        }
        if (student.email) {
          queries.push(
            query(
              collection(db, "orders"),
              where("studentEmail", "==", student.email),
            ),
          );
          queries.push(
            query(
              collection(db, "orders"),
              where("email", "==", student.email),
            ),
          );
        }

        // Run all order queries in parallel
        const responses = await Promise.all(queries.map((q) => getDocs(q)));

        responses.forEach((snap) => {
          snap.forEach((doc) => {
            const data = doc.data();
            // Item ID helps us merge with manual access lists later
            const itemId = data.courseId || data.bookId || doc.id;

            if (!historyMap.has(itemId)) {
              historyMap.set(itemId, {
                id: itemId,
                title:
                  data.courseName ||
                  data.productName ||
                  data.title ||
                  "Unknown Purchase",
                type: data.productType || (data.courseId ? "course" : "ebook"),
                price: data.price || 0,
                date: data.createdAt?.toDate
                  ? data.createdAt.toDate()
                  : new Date(),
                source: "order", // It's a real order
                status: "Paid",
              });
            }
          });
        });

        // B. FETCH MANUAL COURSES (From User's 'enrolledCourses' Array)
        if (student.enrolledCourses && Array.isArray(student.enrolledCourses)) {
          const rawCourseIds = student.enrolledCourses.map((c) =>
            typeof c === "object" ? c.courseId || c.id : c
          );
          const missingCourses = rawCourseIds.filter(
            (id) => id && typeof id === "string" && !historyMap.has(id)
          );

          await Promise.all(
            missingCourses.map(async (courseId) => {
              try {
                const courseRef = doc(db, "courseVideos", courseId);
                const courseSnap = await getDoc(courseRef);

                if (courseSnap.exists()) {
                  const cData = courseSnap.data();
                  historyMap.set(courseId, {
                    id: courseId,
                    title: cData.title || "Untitled Course",
                    type: "course",
                    price: cData.price || 0,
                    date: new Date(student.createdAt),
                    source: "manual",
                    status: "Granted",
                  });
                } else {
                  historyMap.set(courseId, {
                    id: courseId,
                    title: `Legacy Course (ID: ${courseId})`,
                    type: "course",
                    price: 0,
                    date: new Date(student.createdAt),
                    source: "manual",
                    status: "Legacy",
                  });
                }
              } catch (e) {
                console.error(e);
              }
            })
          );
        }

        // Convert Map to Array & Sort by Date (Newest First)
        const combinedList = Array.from(historyMap.values()).sort(
          (a, b) => b.date - a.date,
        );

        setPurchaseHistory(combinedList);
      } catch (error) {
        console.error("Error fetching full profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (student?.id) {
      fetchFullDetails();
    }
  }, [student]);

  if (!student) return null;

  // Calculate Totals (Sum of all items found)
  const totalSpent = purchaseHistory
    .filter((i) => i.source === "order") // Only count real money orders for Total Spent
    .reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const coursesCount = purchaseHistory.filter(
    (i) => i.type === "course",
  ).length;
  const ebooksCount = purchaseHistory.filter((i) => i.type === "ebook").length;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl relative z-50 overflow-hidden flex flex-col max-h-[90vh]"
    >
      {/* 1. HEADER SECTION */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 shrink-0 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#5edff4]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-5">
            <div className="size-16 sm:size-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-black shadow-inner border border-white/20 text-[#5edff4]">
              {student.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {student.name}
                </h2>
                {student.role === "admin" && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                    Admin
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-slate-400 text-xs sm:text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} /> {student.email}
                </span>
                <span className="hidden sm:inline text-slate-700">|</span>
                <span className="flex items-center gap-1.5">
                  <Shield size={14} /> {student.uid?.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="size-9 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 2. SUMMARY GRID */}
      <div className="grid grid-cols-3 gap-4 p-6 border-b border-slate-100 bg-slate-50/50 text-center sm:text-left">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Lifetime Value
          </p>
          <p className="text-lg sm:text-2xl font-black text-slate-900">
            ₹{totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="border-l border-slate-200 pl-4 sm:pl-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Courses Owned
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <BookOpen size={18} className="text-indigo-500" />
            <p className="text-lg sm:text-2xl font-black text-indigo-600">
              {coursesCount}
            </p>
          </div>
        </div>
        <div className="border-l border-slate-200 pl-4 sm:pl-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            E-Books Owned
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <FileText size={18} className="text-orange-500" />
            <p className="text-lg sm:text-2xl font-black text-orange-600">
              {ebooksCount}
            </p>
          </div>
        </div>
      </div>

      {/* 3. DETAILS & LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Product List */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
              <ShoppingBag size={18} className="text-slate-400" /> Products &
              Access
            </h4>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-[#5edff4]" size={32} />
              </div>
            ) : purchaseHistory.length > 0 ? (
              <div className="space-y-3">
                {purchaseHistory.map((item, i) => (
                  <div
                    key={item.id + i}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-[#5edff4]/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`size-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 
                                        ${item.type === "ebook" ? "bg-orange-50 text-orange-600" : "bg-indigo-50 text-indigo-600"}`}
                      >
                        {item.type === "ebook" ? (
                          <FileText size={20} />
                        ) : (
                          <BookOpen size={20} />
                        )}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 max-w-[150px] sm:max-w-xs">
                          {item.title}
                        </h5>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
                          <span className="capitalize">{item.type}</span>
                          <span className="size-1 rounded-full bg-slate-300" />
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Clock size={10} /> Payment: {item.date.toLocaleString("en-US", {
                              year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-slate-900 text-sm sm:text-base">
                        {item.price == 0 || item.price === "Free"
                          ? "Free"
                          : `₹${item.price}`}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide
                                        ${item.source === "order" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <AlertCircle className="size-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium text-sm">
                  No courses or books found.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Access list is empty.
                </p>
              </div>
            )}
          </div>

          {/* Right: Personal Info */}
          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
              <User size={18} className="text-slate-400" /> Personal Details
            </h4>
            <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100">
              <DetailRow label="Full Name" value={student.name} />
              <DetailRow label="Email" value={student.email} />
              <DetailRow
                label="Phone"
                value={student.phone || "Not Provided"}
              />
              <div className="h-px bg-slate-200 my-2" />
              <DetailRow
                label="Registration Date & Time"
                value={new Date(student.createdAt).toLocaleString("en-US", {
                  year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true
                })}
              />
              <div className="pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  User ID
                </p>
                <code className="block bg-white border border-slate-200 rounded p-2 text-xs font-mono text-slate-600 break-all select-all">
                  {student.uid}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper Component
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
      {label}
    </span>
    <span className="text-sm font-bold text-slate-900 truncate" title={value}>
      {value}
    </span>
  </div>
);

export default StudentProfile;
