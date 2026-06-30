import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlayCircle,
  ShieldCheck,
  Trophy,
  Smartphone,
  CheckCircle,
  BellRing,
  Loader2,
  Clock,
  RefreshCcw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthModal from "../../components/AuthModal";
import { db } from "../../firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

const PricingCard = ({ course, isEnrolled }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Status State: 'idle', 'pending', 'approved'
  const [paymentStatus, setPaymentStatus] = useState("idle");

  // Check if user has already sent a notification for THIS course
  useEffect(() => {
    if (!currentUser || !course) return;

    const q = query(
      collection(db, "payment_notifications"),
      where("userId", "==", currentUser.uid),
      where("courseId", "==", course.id),
      where("status", "==", "pending"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setPaymentStatus("pending");
      } else {
        setPaymentStatus("idle");
      }
    });

    return () => unsubscribe();
  }, [currentUser, course]);

  // [CRITICAL UPDATE] Handle User Data Sync and Redirection
  useEffect(() => {
    const handleRedirectionAndSync = async () => {
      const pendingCourseJSON = localStorage.getItem("pendingCheckoutCourse");

      if (currentUser && pendingCourseJSON) {
        const pendingCourse = JSON.parse(pendingCourseJSON);

        // Match only if the current course matches the intended one
        if (pendingCourse.id === course.id) {
          setIsSyncing(true);

          try {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);

            // Agar user database mein nahi hai, toh uska profile create karein
            if (!userSnap.exists()) {
              await setDoc(userRef, {
                uid: currentUser.uid,
                name: currentUser.displayName || "Student",
                email: currentUser.email,
                photoURL: currentUser.photoURL || "",
                role: "student",
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                enrolledCourses: [],
                purchasedBooks: [],
                phone: currentUser.phoneNumber || "",
                interestedCourse: pendingCourse?.title || "None",
                registrationSource: "PricingCard_BuyNow",
              });
            }

            // Small delay to ensure Firestore write completes before redirect
            setTimeout(() => {
              localStorage.removeItem("pendingCheckoutCourse");
              setIsSyncing(false);

              if (pendingCourse.paymentLink) {
                window.location.href = pendingCourse.paymentLink;
              } else {
                navigate("/dashboard");
              }
            }, 2500);
          } catch (error) {
            console.error("Error during sync:", error);
            setIsSyncing(false);
            // Fallback: Proceed to payment even if sync fails
            if (pendingCourse.paymentLink)
              window.location.href = pendingCourse.paymentLink;
          }
        }
      }
    };

    handleRedirectionAndSync();
  }, [currentUser, course.id, navigate]);

  // Helper: Format Currency
  const formatCurrency = (amount) => {
    if (!amount) return "Free";
    const strAmount = String(amount).toLowerCase();
    if (strAmount === "free" || strAmount === "0") return "Free";
    const numericValue = parseInt(String(amount).replace(/[^0-9]/g, ""));
    if (isNaN(numericValue) || numericValue === 0) return "Free";
    return `₹${numericValue.toLocaleString("en-IN")}`;
  };

  const displayPrice = formatCurrency(course.price);
  const displayOriginalPrice = formatCurrency(course.originalPrice);

  const handleBuyClick = () => {
    if (!course?.paymentLink && displayPrice !== "Free") {
      alert("Payment link is not configured. Please contact support.");
      return;
    }

    if (!currentUser) {
      localStorage.setItem("pendingCheckoutCourse", JSON.stringify(course));
      setIsAuthOpen(true);
      return;
    }

    window.location.href = course.paymentLink;
  };

  const handleNotifyAdmin = async () => {
    if (!currentUser) {
      localStorage.setItem("pendingCheckoutCourse", JSON.stringify(course));
      setIsAuthOpen(true);
      return;
    }

    const confirmPay = window.confirm(
      "Did you complete the payment successfully?",
    );
    if (!confirmPay) return;

    setNotifyLoading(true);
    try {
      await addDoc(collection(db, "payment_notifications"), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || "User",
        userPhone: currentUser.phoneNumber || "",
        courseId: course.id,
        courseTitle: course.title,
        amount: course.price,
        status: "pending",
        requestDate: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Failed to notify. Please try again.");
    } finally {
      setNotifyLoading(false);
    }
  };

  return (
    <div className="lg:absolute lg:-top-80 lg:right-0 w-full lg:w-95">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-100 overflow-hidden sticky top-24"
      >
        <div className="relative h-48 bg-slate-900 group cursor-pointer overflow-hidden">
          <img
            src={course.image || course.thumbnail}
            alt="preview"
            className="size-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-14 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <PlayCircle className="size-6 text-slate-900 ml-1" />
            </div>
          </div>
        </div>

        <div className="p-8">
          {isSyncing ? (
            <div className="py-6 text-center space-y-4">
              <div className="relative flex justify-center">
                <RefreshCcw className="size-10 text-[#5edff4] animate-spin" />
              </div>
              <p className="font-black text-slate-800">
                Setting up your profile...
              </p>
              <p className="text-xs text-slate-500">
                Redirecting to payment securely.
              </p>
            </div>
          ) : isEnrolled ? (
            <>
              <div className="mb-6 flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <CheckCircle className="size-6 shrink-0" />
                <div>
                  <span className="font-black text-lg block leading-none mb-1">
                    You own this course
                  </span>
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                    Ready to watch
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate("/dashboard/my-courses")}
                className="w-full py-4 text-white font-bold text-lg rounded-xl shadow-lg bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center gap-2 mb-4 cursor-pointer"
              >
                Go to Dashboard
              </button>
            </>
          ) : paymentStatus === "pending" ? (
            <>
              <div className="mb-6 flex items-center gap-3 text-orange-600 bg-orange-50 p-4 rounded-xl border border-orange-100">
                <Clock className="size-6 shrink-0 animate-pulse" />
                <div>
                  <span className="font-black text-lg block leading-none mb-1">
                    Verification Pending
                  </span>
                  <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                    Admin is checking
                  </span>
                </div>
              </div>
              <button
                disabled
                className="w-full py-4 bg-slate-100 text-slate-400 font-bold text-lg rounded-xl flex items-center justify-center gap-2 mb-4"
              >
                <Loader2 className="size-5 animate-spin" /> Waiting for
                Approval...
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className="text-4xl font-black text-slate-900">
                  {displayPrice}
                </span>
                {displayOriginalPrice !== displayPrice && (
                  <span className="text-lg text-slate-400 line-through">
                    {displayOriginalPrice}
                  </span>
                )}
              </div>
              <button
                onClick={handleBuyClick}
                className="w-full py-4 text-slate-900 font-bold text-lg rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer mb-3"
                style={{ backgroundColor: "#5edff4" }}
              >
                {displayPrice === "Free" ? "Enroll for Free" : "Buy Now"}
              </button>

              {displayPrice !== "Free" && (
                <button
                  onClick={handleNotifyAdmin}
                  disabled={notifyLoading}
                  className="w-full py-3 bg-slate-50 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
                >
                  {notifyLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <BellRing className="size-4" />
                  )}
                  {notifyLoading ? "Sending Request..." : "I have already paid"}
                </button>
              )}
            </>
          )}

          <div className="space-y-4 mt-6">
            <h4 className="font-bold text-slate-900 text-sm">
              This course includes:
            </h4>
            <FeatureItem icon={Smartphone} text="Access on mobile and Laptop" />
            <FeatureItem icon={Trophy} text="Certificate of completion" />
            <FeatureItem icon={ShieldCheck} text="Expert Q&A Support" />
          </div>
        </div>
      </motion.div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="login"
      />
    </div>
  );
};

const FeatureItem = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-3 text-sm text-slate-600">
    <Icon className="size-4 text-slate-400" />
    <span>{text}</span>
  </div>
);

export default PricingCard;
