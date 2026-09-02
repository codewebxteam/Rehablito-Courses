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
  Sparkles,
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

import { useCourse } from "../../context/CourseContext";
import { initiateRazorpayPayment } from "../../utils/razorpay";

const PricingCard = ({ course, isEnrolled }) => {
  const { currentUser } = useAuth();
  const { enrollCourse } = useCourse();
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle");

  useEffect(() => {
    if (!currentUser || !course) return;

    const q = query(
      collection(db, "payment_notifications"),
      where("userId", "==", currentUser.uid),
      where("courseId", "==", course.id),
      where("status", "==", "pending")
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

  useEffect(() => {
    const handleRedirectionAndSync = async () => {
      const pendingCourseJSON = localStorage.getItem("pendingCheckoutCourse");

      if (currentUser && pendingCourseJSON) {
        const pendingCourse = JSON.parse(pendingCourseJSON);

        if (pendingCourse.id === course.id) {
          localStorage.removeItem("pendingCheckoutCourse");
          initiateRazorpayPayment({
            item: pendingCourse,
            type: "course",
            currentUser: currentUser,
            onSuccess: async () => {
              await enrollCourse(pendingCourse);
              alert("🎉 Payment Successful! Access granted to " + (pendingCourse.title || "the course"));
              navigate("/dashboard/my-courses");
            },
          });
        }
      }
    };

    handleRedirectionAndSync();
  }, [currentUser, course.id, navigate, enrollCourse]);

  const formatCurrency = (amount) => {
    if (!amount) return "Free Access";
    const strAmount = String(amount).toLowerCase();
    if (strAmount === "free" || strAmount === "0") return "Free Access";
    const numericValue = parseInt(String(amount).replace(/[^0-9]/g, ""));
    if (isNaN(numericValue) || numericValue === 0) return "Free Access";
    return `₹${numericValue.toLocaleString("en-IN")}`;
  };

  const displayPrice = formatCurrency(course.price);
  const displayOriginalPrice = formatCurrency(course.originalPrice);

  const handleBuyClick = () => {
    if (!currentUser) {
      localStorage.setItem("pendingCheckoutCourse", JSON.stringify(course));
      setIsAuthOpen(true);
      return;
    }

    initiateRazorpayPayment({
      item: course,
      type: "course",
      currentUser: currentUser,
      onSuccess: async () => {
        await enrollCourse(course);
        alert("🎉 Payment Successful! Access granted to " + (course.title || "the course"));
        navigate("/dashboard/my-courses");
      },
    });
  };

  const handleNotifyAdmin = async () => {
    if (!currentUser) {
      localStorage.setItem("pendingCheckoutCourse", JSON.stringify(course));
      setIsAuthOpen(true);
      return;
    }

    const confirmPay = window.confirm(
      "Did you complete the payment successfully?"
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
    <div className="lg:absolute lg:-top-80 lg:right-0 w-full lg:w-[380px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden sticky top-28"
      >
        {/* Course Preview Thumbnail */}
        <div className="relative h-48 sm:h-52 bg-[#0F1B3D] group cursor-pointer overflow-hidden">
          <img
            src={course.image || course.thumbnail}
            alt="course preview"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <PlayCircle className="w-7 h-7 text-[#0F1B3D] translate-x-[1px]" />
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7">
          {isSyncing ? (
            <div className="py-6 text-center space-y-4">
              <RefreshCcw className="w-10 h-10 text-[#0F1B3D] animate-spin mx-auto" />
              <p className="font-extrabold text-[#0F1B3D]">
                Setting up your access...
              </p>
              <p className="text-xs text-slate-500 font-semibold">
                Redirecting to secure payment.
              </p>
            </div>
          ) : isEnrolled ? (
            <>
              <div className="mb-6 flex items-center gap-3 text-emerald-700 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <CheckCircle className="w-6 h-6 shrink-0 text-emerald-600" />
                <div>
                  <span className="font-extrabold text-base block leading-none mb-1">
                    You have access to this course
                  </span>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Ready to Watch
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate("/dashboard/my-courses")}
                className="w-full py-3.5 text-white font-bold text-sm rounded-full shadow-lg bg-[#63DA6B] hover:bg-[#52c85a] flex items-center justify-center gap-2 mb-4 cursor-pointer transition-all"
              >
                Go to Dashboard
              </button>
            </>
          ) : paymentStatus === "pending" ? (
            <>
              <div className="mb-6 flex items-center gap-3 text-amber-700 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <Clock className="w-6 h-6 shrink-0 animate-pulse text-amber-600" />
                <div>
                  <span className="font-extrabold text-base block leading-none mb-1">
                    Verification Pending
                  </span>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                    Admin is reviewing
                  </span>
                </div>
              </div>
              <button
                disabled
                className="w-full py-3.5 bg-slate-100 text-slate-400 font-bold text-sm rounded-full flex items-center justify-center gap-2 mb-4"
              >
                <Loader2 className="w-4 h-4 animate-spin" /> Waiting for Approval...
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-3xl font-extrabold text-[#0F1B3D]">
                    {displayPrice}
                  </span>
                  {displayOriginalPrice !== displayPrice && (
                    <span className="text-sm text-slate-400 line-through ml-2">
                      {displayOriginalPrice}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleBuyClick}
                className="w-full py-3.5 text-white font-bold text-sm rounded-full bg-[#0F1B3D] hover:bg-[#1c2e5e] transition-all shadow-lg active:scale-95 cursor-pointer mb-3"
              >
                {displayPrice === "Free Access" ? "Enroll for Free" : "Enroll Now"}
              </button>

              {/* {displayPrice !== "Free Access" && (
                <button
                  onClick={handleNotifyAdmin}
                  disabled={notifyLoading}
                  className="w-full py-2.5 bg-slate-50 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
                >
                  {notifyLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <BellRing className="w-4 h-4 text-[#0F1B3D]" />
                  )}
                  {notifyLoading ? "Sending Request..." : "I have already paid"}
                </button>
              )} */}
            </>
          )}

          <div className="space-y-3 mt-6 pt-5 border-t border-slate-100">
            <h4 className="font-bold text-[#0F1B3D] text-xs uppercase tracking-wider">
              This course includes:
            </h4>
            <FeatureItem icon={Smartphone} text="Access on Mobile & Laptop" />
            <FeatureItem icon={Trophy} text="Certificate of Completion" />
            <FeatureItem icon={ShieldCheck} text="Certified Therapist Q&A Support" />
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
  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
    <Icon className="w-4 h-4 text-[#0F1B3D]" />
    <span>{text}</span>
  </div>
);

export default PricingCard;
