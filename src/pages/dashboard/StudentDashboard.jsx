import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PlayCircle,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  Zap,
  Calendar,
  Star,
  CheckCircle,
  Target,
  Flame,
  Crown,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCourse } from "../../context/CourseContext";
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const { enrolledCourses } = useCourse();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [continueLearning, setContinueLearning] = useState(null);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [liveEnrolledCourses, setLiveEnrolledCourses] = useState([]);
  const [gamification, setGamification] = useState({
    level: 1,
    xp: 0,
    streak: 0,
    maxStreak: 0,
  });

  // 1. Streak Tracking Logic
  useEffect(() => {
    const handleStreak = async () => {
      if (!currentUser) return;

      const userRef = doc(db, "users", currentUser.uid);

      try {
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const lastLogin = data.lastLoginDate?.toDate();
          const currentStreak = data.streak || 0;
          const currentMaxStreak = data.maxStreak || 0;

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let newStreak = currentStreak;
          let shouldUpdate = false;

          if (lastLogin) {
            const lastLoginDate = new Date(lastLogin);
            lastLoginDate.setHours(0, 0, 0, 0);

            const diffTime = Math.abs(today - lastLoginDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              newStreak = currentStreak + 1;
              shouldUpdate = true;
            } else if (diffDays > 1) {
              newStreak = 1;
              shouldUpdate = true;
            }
          } else {
            newStreak = 1;
            shouldUpdate = true;
          }

          let newMaxStreak = currentMaxStreak;
          if (newStreak > currentMaxStreak) {
            newMaxStreak = newStreak;
            shouldUpdate = true;
          } else if (currentStreak > currentMaxStreak) {
            newMaxStreak = currentStreak;
            shouldUpdate = true;
          }

          if (shouldUpdate) {
            await updateDoc(userRef, {
              streak: newStreak,
              maxStreak: newMaxStreak,
              lastLoginDate: serverTimestamp(),
            });
          }
        }
      } catch (error) {
        console.error("Error updating streak:", error);
      }
    };

    handleStreak();
  }, [currentUser]);

  // 2. Realtime User Data Listener
  useEffect(() => {
    if (!currentUser) return;

    const unsub = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const courses = enrolledCourses || [];
        setLiveEnrolledCourses(courses);

        setGamification({
          level: data.level || 1,
          xp: data.xp || 0,
          streak: data.streak || 0,
          maxStreak: data.maxStreak || 0,
        });

        const totalSecs = courses.reduce(
          (acc, curr) => acc + (Number(curr.watchedDuration) || 0),
          0
        );
        setActiveSeconds(totalSecs);

        if (courses.length > 0) {
          const sortedCourses = [...courses].sort(
            (a, b) =>
              new Date(b.lastAccessed || 0) - new Date(a.lastAccessed || 0)
          );
          const nextCourse = sortedCourses.find(
            (c) => (Number(c.progress) || 0) < 100
          );
          setContinueLearning(nextCourse || sortedCourses[0]);
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser, enrolledCourses]);

  // 3. Stats Data Formatting
  useEffect(() => {
    let timeDisplay = "0s";
    if (activeSeconds > 0) {
      if (activeSeconds < 60) {
        timeDisplay = `${Math.round(activeSeconds)}s`;
      } else if (activeSeconds < 3600) {
        timeDisplay = `${Math.round(activeSeconds / 60)}m`;
      } else {
        timeDisplay = `${(activeSeconds / 3600).toFixed(1)}h`;
      }
    }

    const certificatesCount = liveEnrolledCourses.filter(
      (c) => Math.round(Number(c.progress) || 0) >= 100
    ).length;

    setStats([
      {
        title: "Active Learning",
        value: timeDisplay,
        icon: Clock,
        color: "text-[#0284C7]",
        bg: "bg-[#E0F2FE]",
        border: "border-slate-200/90",
        change: "Total Watch Time",
      },
      {
        title: "Enrolled Courses",
        value: liveEnrolledCourses.length,
        icon: BookOpen,
        color: "text-[#16A34A]",
        bg: "bg-[#DCFCE7]",
        border: "border-slate-200/90",
        change: "In Progress",
      },
      {
        title: "Certificates",
        value: certificatesCount,
        icon: Award,
        color: "text-[#E6007E]",
        bg: "bg-[#FCE7F3]",
        border: "border-slate-200/90",
        change: "Earned",
      },
      {
        title: "Max Streak",
        value: `${gamification.maxStreak} Days`,
        icon: Crown,
        color: "text-[#EA580C]",
        bg: "bg-[#FFEDD5]",
        border: "border-slate-200/90",
        change: "All Time Best",
      },
    ]);
  }, [activeSeconds, liveEnrolledCourses, gamification.maxStreak]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#E6007E] rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-bold animate-pulse">Loading Student Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-24 md:pb-12 font-sans text-[#0F1B3D]">
      
      {/* === HEADER SECTION === */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-white p-5 md:p-8 rounded-3xl border border-slate-200/90 shadow-md relative overflow-hidden">
        {/* Background Accent Blob */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#FCE7F3] rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2 opacity-60" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 md:gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0F1B3D]">
              Welcome to{" "}
              <span className="inline-flex font-black tracking-tight ml-1">
                <span style={{ color: "#F51B22" }}>R</span>
                <span style={{ color: "#FF8A16" }}>e</span>
                <span style={{ color: "#FFE11A" }}>h</span>
                <span style={{ color: "#63B632" }}>a</span>
                <span style={{ color: "#2499C7" }}>b</span>
                <span style={{ color: "#E6007E" }}>l</span>
                <span style={{ color: "#A34773" }}>i</span>
                <span style={{ color: "#FFD51A" }}>t</span>
                <span style={{ color: "#FFE11A" }}>o</span>
              </span>{" "}
              Academy
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Hello,{" "}
            <span className="font-bold text-[#0F1B3D]">
              {currentUser?.displayName?.split(" ")[0] || "Student"}
            </span>
            ! Ready to continue your therapy learning journey?
          </p>
        </div>

        {/* Current Streak Badge */}
        <div className="flex items-center gap-3 z-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#FFEDD5] border border-[#FFD8A8] text-[#EA580C] rounded-full shadow-xs">
            <Flame
              size={18}
              className="fill-[#EA580C] text-[#EA580C] animate-pulse"
            />
            <span className="text-xs md:text-sm font-extrabold">
              {gamification.streak} Day Streak
            </span>
          </div>

          <button className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all shadow-xs hidden md:flex cursor-pointer">
            <Calendar className="w-5 h-5 text-[#0F1B3D]" />
          </button>
        </div>
      </div>

      {/* === STATS GRID (4 COLORFUL CARDS) === */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white p-5 rounded-3xl border ${stat.border} shadow-sm hover:shadow-md transition-all group relative overflow-hidden`}
          >
            <div className="flex justify-between items-start mb-3">
              <div
                className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-xs`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">
                {stat.title}
              </p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#0F1B3D] tracking-tight">
                {stat.value}
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#16A34A]" />{" "}
                {stat.change}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* === MAIN LAYOUT: CONTINUE LEARNING & DISCOVER === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* RESUME LEARNING MAIN BANNER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-[#071838] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[300px] shadow-xl border border-slate-800"
        >
          {/* Background Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E6007E] rounded-full blur-[140px] opacity-30 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FFD60A] rounded-full blur-[140px] opacity-20 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm text-[#FFD60A]">
                <span className="w-2 h-2 rounded-full bg-[#FFD60A] animate-pulse"></span>
                Resume Learning
              </span>
            </div>

            {continueLearning ? (
              <div className="max-w-xl">
                <h2 className="text-2xl md:text-3xl font-extrabold mb-3 leading-tight line-clamp-2 text-white">
                  {continueLearning.title}
                </h2>
                <div className="flex items-center gap-4 mb-6">
                  <p className="text-slate-300 text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#FFD60A] fill-[#FFD60A]" /> Premium Therapy Course
                  </p>
                </div>
              </div>
            ) : (
              <h2 className="text-2xl md:text-3xl font-extrabold mb-4 leading-tight text-white">
                Start your first therapy course today!
              </h2>
            )}
          </div>

          {/* Progress Card */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/15 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
            {continueLearning ? (
              <div className="flex-1 w-full">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-200 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-[#FFD60A]" /> Course Progress
                  </span>
                  <span className="text-[#FFD60A]">
                    {Math.round(Number(continueLearning.progress) || 0)}%
                  </span>
                </div>
                <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.round(Number(continueLearning.progress) || 0)}%`,
                    }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-[#E6007E] via-[#2499C7] to-[#FFD60A] rounded-full shadow-md"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 text-slate-300 text-xs sm:text-sm font-medium w-full text-center sm:text-left">
                Browse our course catalog to begin learning.
              </div>
            )}

            <button
              onClick={() =>
                navigate(
                  continueLearning
                    ? "/dashboard/my-courses"
                    : "/dashboard/explore"
                )
              }
              className="w-full sm:w-auto bg-white text-[#0F1B3D] p-3.5 rounded-xl hover:bg-[#FFD60A] transition-all shadow-md group flex justify-center items-center cursor-pointer"
            >
              {continueLearning ? (
                <PlayCircle className="w-6 h-6 text-[#0F1B3D] group-hover:scale-110 transition-transform" />
              ) : (
                <ArrowRight className="w-6 h-6 text-[#0F1B3D] group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </div>
        </motion.div>

        {/* DISCOVER CATALOG CARD */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md flex flex-col justify-between min-h-[260px]"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-[#0F1B3D]">
                Discover
              </h3>
              <div className="p-2.5 bg-[#FCE7F3] rounded-2xl text-[#E6007E]">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <h4 className="text-xl font-extrabold text-[#0F1B3D] mb-2">
              New Programs
            </h4>
            <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
              Explore the latest therapeutic programs added to Rehablito Academy for speech therapy, autism, and child development.
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={() => navigate("/dashboard/explore")}
              className="w-full py-3.5 bg-[#0F1B3D] text-white font-bold rounded-full hover:bg-[#1b2e5e] transition-colors shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

      </div>

      {/* === RECENT MILESTONES === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <h3 className="font-extrabold text-base sm:text-lg text-[#0F1B3D] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#EA580C]" /> Recent Milestones
          </h3>
          <Link
            to="/dashboard/certificates"
            className="text-xs font-bold text-[#E6007E] bg-[#FCE7F3] hover:bg-[#fbcfe8] px-4 py-2 rounded-full transition-colors text-center shadow-xs"
          >
            View Certificates
          </Link>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center gap-5 border border-slate-200/80 border-dashed hover:border-[#E6007E]/50 transition-colors">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FFD60A] to-[#EA580C] rounded-2xl flex items-center justify-center text-white shadow-md rotate-3 shrink-0">
            <Star className="w-8 h-8 fill-current text-white" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h4 className="font-extrabold text-[#0F1B3D] text-base sm:text-lg">
              {gamification.streak > 0
                ? `You're on a ${gamification.streak} Day Learning Streak!`
                : "Start Your Learning Streak Today"}
            </h4>
            <p className="text-slate-500 text-xs mt-1 max-w-lg leading-relaxed font-medium">
              {gamification.streak > 0
                ? `Consistency is key! Keep logging in daily to Rehablito Academy to increase your streak and master therapy modules.`
                : "Log in daily to build your streak and gain confidence in child rehabilitation practices."}
            </p>
          </div>
          {gamification.streak > 0 && (
            <div className="px-3.5 py-2 bg-[#DCFCE7] text-[#16A34A] rounded-full font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs">
              <CheckCircle className="w-4 h-4" /> Streak Active
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
};

export default StudentDashboard;
