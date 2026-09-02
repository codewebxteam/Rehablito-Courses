import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  BookOpen,
  Clock,
  Play,
  Loader2,
  LayoutGrid,
  Brain,
  MessageSquare,
  Activity,
  HeartHandshake,
  Baby,
  Users,
  Award,
  ShieldCheck,
  Zap,
  BookMarked,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCourse } from "../context/CourseContext";
import AuthModal from "../components/AuthModal";
import CourseVideoPlayer from "../components/CourseVideoPlayer";
import StatsAndNewsletter from "../components/StatsAndNewsletter";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

// Standard preset therapy categories
const PRESET_TABS = [
  { id: "all", label: "All Courses", icon: LayoutGrid, bgColor: "#0F1B3D", textColor: "#ffffff" },
  { id: "autism-adhd", label: "Autism / ADHD", icon: Brain, bgColor: "#FCE7F3", textColor: "#E6007E" },
  { id: "speech-therapy", label: "Speech Therapy", icon: MessageSquare, bgColor: "#F3E8FF", textColor: "#9333EA" },
  { id: "occupational-therapy", label: "Occupational Therapy", icon: Activity, bgColor: "#DCFCE7", textColor: "#16A34A" },
  { id: "behaviour-therapy", label: "Behaviour Therapy", icon: HeartHandshake, bgColor: "#FFEDD5", textColor: "#EA580C" },
  { id: "special-education", label: "Special Education", icon: BookOpen, bgColor: "#E0F2FE", textColor: "#0284C7" },
  { id: "pediatric-rehab", label: "Pediatric Rehab", icon: Baby, bgColor: "#ECFCCB", textColor: "#65A30D" },
];

const Courses = () => {
  const { currentUser } = useAuth();
  const { isEnrolled, getEnrolledCourse } = useCourse();
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [playingCourse, setPlayingCourse] = useState(null);

  // REAL-TIME FIRESTORE FETCHING LOGIC (Preserved 100%)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courseVideos"));
        const courseList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        courseList.sort((a, b) => {
          const getTimestamp = (item) => {
            if (item.createdAt && item.createdAt.toDate)
              return item.createdAt.toDate().getTime();
            if (item.createdAt) return new Date(item.createdAt).getTime();
            return 0;
          };
          return getTimestamp(b) - getTimestamp(a);
        });

        setCourses(courseList);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Dynamically build category tabs including custom categories added by Admin
  const dynamicCategoryTabs = useMemo(() => {
    const tabs = [...PRESET_TABS];
    
    // Collect extra custom categories from uploaded courses
    courses.forEach((c) => {
      if (c.category) {
        const catName = c.category.trim();
        const existsInPresets = tabs.some(
          (t) =>
            t.label.toLowerCase() === catName.toLowerCase() ||
            t.id.toLowerCase() === catName.toLowerCase()
        );
        if (!existsInPresets) {
          tabs.push({
            id: catName.toLowerCase().replace(/\s+/g, "-"),
            label: catName,
            icon: BookMarked,
            bgColor: "#F1F5F9",
            textColor: "#0F1B3D",
          });
        }
      }
    });

    return tabs;
  }, [courses]);

  const processPayment = (course) => {
    const paymentUrl = course.paymentLink;
    if (paymentUrl) {
      window.location.href = paymentUrl;
    } else {
      alert("Payment link is not configured for this course. Please contact support.");
    }
  };

  const handlePlayVideo = (courseId) => {
    const enrolledCourse = getEnrolledCourse(courseId);
    if (enrolledCourse) {
      setPlayingCourse(enrolledCourse);
      setShowVideoPlayer(true);
    }
  };

  const handleBuyClick = (course) => {
    if (!currentUser) {
      localStorage.setItem("pendingCheckoutCourse", JSON.stringify(course));
      setIsAuthOpen(true);
      return;
    }
    processPayment(course);
  };

  // Filter Logic
  const filteredCourses = courses.filter((course) => {
    const title = course.title || "";
    const instructor = course.instructor || "";
    const cat = course.category || "";

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.toLowerCase().includes(searchQuery.toLowerCase());

    const selectedTab = dynamicCategoryTabs.find((t) => t.id === selectedCategory);
    const selectedLabel = selectedTab ? selectedTab.label : "";

    const matchesCategory =
      selectedCategory === "all" ||
      cat.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      cat.toLowerCase().includes(selectedLabel.toLowerCase()) ||
      (selectedCategory === "autism-adhd" && (cat.includes("Autism") || cat.includes("ADHD"))) ||
      (selectedCategory === "speech-therapy" && cat.includes("Speech")) ||
      (selectedCategory === "occupational-therapy" && cat.includes("Occupational")) ||
      (selectedCategory === "behaviour-therapy" && cat.includes("Behaviour")) ||
      (selectedCategory === "special-education" && cat.includes("Special")) ||
      (selectedCategory === "pediatric-rehab" && (cat.includes("Pediatric") || cat.includes("Rehab")));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] font-sans text-[#0F1B3D] pt-32 sm:pt-36 lg:pt-36 pb-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">

        {/* ================= 1. HEADER CONTROLS BAR (SEARCH ONLY) ================= */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-6 sm:mb-8">
          <div className="relative w-full max-w-xl mx-auto md:mx-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search guidance & therapy courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-[#0F1B3D] placeholder-slate-400 focus:outline-none focus:border-[#0F1B3D] transition-colors"
            />
          </div>
        </div>

        {/* ================= 2. HORIZONTAL CATEGORY TABS ================= */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
          {dynamicCategoryTabs.map((tab) => {
            const IconComp = tab.icon;
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 border ${
                  isActive
                    ? "bg-[#0F1B3D] text-white border-[#0F1B3D] shadow-md scale-[1.02]"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isActive ? "#ffffff20" : tab.bgColor,
                    color: isActive ? "#ffffff" : tab.textColor,
                  }}
                >
                  <IconComp className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= 3. SECTION HEADLINE ROW ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0F1B3D]">
                Therapy & Guidance Courses
              </span>
              <Zap className="w-5 h-5 text-[#FFD60A] fill-[#FFD60A]" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Expert guidance programs to help parents & caregivers support children.
            </p>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
        </div>

        {/* ================= 4. REAL-TIME COURSES GRID ================= */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-[#0F1B3D] animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredCourses.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12"
              >
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={isEnrolled(course.id)}
                    onBuy={() => handleBuyClick(course)}
                    onPlay={() => handlePlayVideo(course.id)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-3xl border border-slate-200 mb-12"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-[#0F1B3D]">
                  No courses available yet
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Courses uploaded by the Admin will appear here in real-time.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ================= 5. WHY LEARN WITH REHABLITO? SECTION ================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-xs mb-12">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0F1B3D] text-center mb-8 sm:mb-10">
            Why Learn With{" "}
            <span className="inline-flex font-black tracking-tight">
              <span style={{ color: "#F51B22" }}>R</span>
              <span style={{ color: "#FF8A16" }}>e</span>
              <span style={{ color: "#FFE11A" }}>h</span>
              <span style={{ color: "#63B632" }}>a</span>
              <span style={{ color: "#2499C7" }}>b</span>
              <span style={{ color: "#E6007E" }}>l</span>
              <span style={{ color: "#A34773" }}>i</span>
              <span style={{ color: "#FFD51A" }}>t</span>
              <span style={{ color: "#FFE11A" }}>o</span>
            </span>
            ?
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6 text-center">
            {/* Feature 1 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0F1B3D] mb-1">
                Trusted by Thousands
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed">
                Join 1000+ families who trust our expert guidance.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0F1B3D] mb-1">
                Expert Therapists
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed">
                Learn from certified and experienced professionals.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FCE7F3] text-[#E6007E] flex items-center justify-center mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0F1B3D] mb-1">
                Evidence-Based Content
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed">
                All our courses are backed by research and real results.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0F1B3D] mb-1">
                Lifetime Access
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed">
                Access your courses anytime, anywhere, lifetime.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="flex flex-col items-center col-span-2 sm:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#0F1B3D] mb-1">
                Certificate of Completion
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed">
                Get a certificate and boost your confidence.
              </p>
            </div>
          </div>
        </div>

        {/* ================= 6. STATS & WHATSAPP BANNER ================= */}
        <StatsAndNewsletter />

      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="login"
      />

      {showVideoPlayer && playingCourse && (
        <CourseVideoPlayer
          course={playingCourse}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}
    </div>
  );
};

// --- COURSE CARD COMPONENT FOR REAL DATA ---
const CourseCard = ({ course, isEnrolled, onBuy, onPlay }) => {
  const imageUrl =
    course.image ||
    (course.videoId
      ? `https://img.youtube.com/vi/${course.videoId}/maxresdefault.jpg`
      : "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&auto=format&fit=crop&q=80");

  const rating = course.rating || 4.8;
  const reviews = course.reviews || 120;
  const duration = course.duration || "Self Paced";
  const category = course.category || "General";
  const badge = course.isComingSoon ? "Coming Soon" : "Popular";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group h-full"
    >
      {/* Image Container with Badge */}
      <Link
        to={`/courses/${course.id}`}
        className="relative w-full aspect-[16/10] overflow-hidden shrink-0 block bg-slate-100"
      >
        <img
          src={imageUrl}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Floating Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-sm ${
              course.isComingSoon
                ? "bg-amber-500 text-white"
                : "bg-[#9333EA] text-white"
            }`}
          >
            {badge}
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
        <div>
          {/* Category Tag */}
          <span className="text-[11px] font-bold text-[#0284C7] bg-[#E0F2FE] px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 inline-block">
            {category}
          </span>

          {/* Title */}
          <Link to={`/courses/${course.id}`} className="block mb-2">
            <h3 className="text-base sm:text-lg font-extrabold text-[#0F1B3D] leading-snug group-hover:text-[#0a2a59] transition-colors line-clamp-2">
              {course.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-2 mb-4">
            {course.description || "A comprehensive therapy & guidance course designed by experts to support your child's growth."}
          </p>
        </div>

        {/* Meta Details Row */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-[#FFB800] fill-[#FFB800]" />
            <span className="font-extrabold text-[#0F1B3D]">{rating}</span>
            <span>({reviews})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{duration}</span>
          </div>
        </div>

        {/* Card Action Button */}
        <div className="mt-4 pt-3 flex items-center justify-between gap-3">
          <Link
            to={`/courses/${course.id}`}
            className="flex-1 py-2.5 rounded-full bg-slate-100 hover:bg-[#0F1B3D] hover:text-white text-[#0F1B3D] text-xs font-bold text-center transition-colors"
          >
            View Details
          </Link>

          {course.isComingSoon ? (
            <button
              disabled
              className="px-4 py-2.5 rounded-full bg-slate-100 text-slate-400 text-xs font-bold shrink-0 cursor-not-allowed uppercase"
            >
              Coming Soon
            </button>
          ) : isEnrolled ? (
            <button
              onClick={onPlay}
              className="px-4 py-2.5 rounded-full bg-[#63DA6B] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#52c85a] transition-all cursor-pointer shrink-0 shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Watch</span>
            </button>
          ) : (
            <button
              onClick={onBuy}
              className="px-4 py-2.5 rounded-full bg-[#0F1B3D] text-white text-xs font-bold hover:bg-[#1e2e5c] transition-all cursor-pointer shrink-0 shadow-md"
            >
              Enroll Now
            </button>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default Courses;
