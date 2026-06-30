import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, BookOpen, Clock, Play, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCourse } from "../context/CourseContext";
import AuthModal from "../components/AuthModal";
import FAQSection from "../components/FAQSection";
import CourseVideoPlayer from "../components/CourseVideoPlayer";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

const Courses = () => {
  const { currentUser } = useAuth();
  // enrollCourse hata diya kyunki ab enrollment Webhook (Backend) karega
  const { isEnrolled, getEnrolledCourse } = useCourse();
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [playingCourse, setPlayingCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courseVideos"));
        const courseList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort courses to show oldest first (jo pahle upload hua wo pahle, naya last me)
        courseList.sort((a, b) => {
          const getTimestamp = (item) => {
            if (item.createdAt && item.createdAt.toDate)
              return item.createdAt.toDate().getTime();
            if (item.createdAt) return new Date(item.createdAt).getTime();
            if (item.timestamp && item.timestamp.toDate)
              return item.timestamp.toDate().getTime();
            if (item.timestamp) return new Date(item.timestamp).getTime();
            return 0; // Fallback if no date field exists
          };
          return getTimestamp(a) - getTimestamp(b);
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

  // --- [UPDATED] REAL PAYMENT LOGIC START ---

  const processPayment = (course) => {
    // 1. Check if the course has a payment link (from Admin Panel)
    const paymentUrl = course.paymentLink;

    if (paymentUrl) {
      // 2. REAL MODE: Redirect user to Superprofile/Razorpay
      window.location.href = paymentUrl;
    } else {
      // Fallback if Admin forgot to add link
      alert(
        "Payment link is not configured for this course. Please contact support.",
      );
    }
  };

  // 3. Watch for Login Success to Resume Purchase
  useEffect(() => {
    if (currentUser) {
      const pendingCourse = localStorage.getItem("pendingCheckoutCourse");
      if (pendingCourse) {
        const courseData = JSON.parse(pendingCourse);

        // Clear storage immediately to prevent loops
        localStorage.removeItem("pendingCheckoutCourse");

        // Trigger Real Payment immediately after login
        processPayment(courseData);
      }
    }
  }, [currentUser]);

  // --- PAYMENT LOGIC END ---

  const handlePlayVideo = (courseId) => {
    const enrolledCourse = getEnrolledCourse(courseId);
    if (enrolledCourse) {
      setPlayingCourse(enrolledCourse);
      setShowVideoPlayer(true);
    }
  };

  // --- Handle Buy Logic ---
  const handleBuyClick = (course) => {
    if (!currentUser) {
      localStorage.setItem("pendingCheckoutCourse", JSON.stringify(course));
      setIsAuthOpen(true);
      return;
    }
    processPayment(course);
  };

  useEffect(() => {
    if (currentUser) {
      const pendingCourseJSON = localStorage.getItem("pendingCheckoutCourse");
      if (pendingCourseJSON) {
        const courseData = JSON.parse(pendingCourseJSON);
        setTimeout(() => {
          processPayment(courseData);
          localStorage.removeItem("pendingCheckoutCourse");
        }, 1000);
      }
    }
  }, [currentUser]);

  // Filter Logic
  const filteredCourses = courses.filter((course) => {
    const title = course.title || "";
    const instructor = course.instructor || "";

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans">
      {/* Mobile me top padding kam kar di hai (pt-8) aur laptop me same rakhi hai (md:pt-32) */}
      <div className="pt-8 md:pt-32 pb-20">
        {/* --- Header Section --- */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-2">
                Explore Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5edff4] to-[#0891b2]">
                  Courses
                </span>
              </h1>
              <p className="text-slate-500">
                Transform your career with industry-leading skills.
              </p>
            </div>

            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="size-5 text-slate-400 group-focus-within:text-[#5edff4] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 bg-white shadow-sm focus:outline-none focus:border-[#5edff4] focus:ring-1 focus:ring-[#5edff4] transition-all"
              />
            </div>
          </div>
        </div>

        {/* --- STYLISH PREMIUM MEGA OFFER BANNER --- */}
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#0891b2] border border-[#5edff4]/40 rounded-3xl py-12 px-6 sm:px-10 text-center shadow-2xl shadow-[#0891b2]/30 relative overflow-hidden"
          >
            {/* Decorative background glows */}
            <div className="absolute -top-24 -right-24 size-64 bg-[#5edff4] blur-[100px] rounded-full opacity-30 pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 size-64 bg-amber-500 blur-[100px] rounded-full opacity-20 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
              {/* BIG Heading */}
              <h2 className="font-black tracking-tight mb-8 flex flex-col items-center justify-center gap-4 leading-[1.3] sm:leading-tight">
                <span className="text-3xl sm:text-5xl lg:text-6xl text-white drop-shadow-md">
                  Buy{" "}
                  <span className="text-[#5edff4] underline decoration-4 underline-offset-4">
                    any
                  </span>{" "}
                  Course at{" "}
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 px-5 py-2 rounded-2xl shadow-xl border-2 border-yellow-200 inline-block transform -rotate-3 scale-110 ml-2 mt-2 sm:mt-0">
                    ₹499
                  </span>
                </span>
              </h2>

              {/* Stylish Secondary Heading */}
              <div className="mb-8 w-full">
                <span className="block sm:inline-block bg-white/10 backdrop-blur-md text-white text-xl sm:text-3xl lg:text-4xl font-black px-6 sm:px-10 py-4 rounded-full shadow-lg border border-white/20 transform transition-transform hover:scale-105">
                  <span className="text-yellow-400 mr-2">🎁</span>
                  And Get All Other Courses{" "}
                  <span className="text-[#5edff4] uppercase tracking-wider">
                    Completely FREE!
                  </span>
                </span>
              </div>

              {/* Disclaimer Pill */}
              <div className="inline-flex items-center gap-3 bg-rose-500/10 backdrop-blur-md px-6 py-2.5 rounded-full border border-rose-500/30">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <p className="text-[10px] sm:text-xs font-bold text-rose-200 uppercase tracking-widest">
                  Disclaimer: Offer is for limited Period Only
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- Courses Grid --- */}
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="size-10 text-[#5edff4] animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {filteredCourses.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {filteredCourses.map((course) => {
                    const displayPrice = course.price;
                    return (
                      <CourseCard
                        key={course.id}
                        course={course}
                        isEnrolled={isEnrolled(course.id)}
                        onBuy={() => handleBuyClick(course)}
                        onPlay={() => handlePlayVideo(course.id)}
                        displayPrice={displayPrice}
                      />
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="size-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    No courses found
                  </h3>
                  <p className="text-slate-500">Try adjusting your search.</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      <FAQSection />

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

// --- COURSE CARD COMPONENT ---
const CourseCard = ({ course, isEnrolled, onBuy, onPlay, displayPrice }) => {
  const imageUrl =
    course.image ||
    (course.videoId
      ? `https://img.youtube.com/vi/${course.videoId}/maxresdefault.jpg`
      : "https://placehold.co/600x400?text=No+Image");

  const finalPrice =
    displayPrice !== undefined && displayPrice !== null
      ? displayPrice
      : course.price;

  const priceDisplay =
    finalPrice === "Free" || finalPrice === 0 || finalPrice === "0"
      ? "Free"
      : `₹${finalPrice}`;
  const originalPrice = course.originalPrice
    ? `₹${course.originalPrice}`
    : null;

  // --- Dynamic Randomization Logic using Course ID ---
  const getSeededRandom = (seedStr) => {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const seed = getSeededRandom(course.id || "default_id");
  const possibleRatings = [4.1, 4.3, 4.5, 4.6, 4.7, 4.8, 4.9, 4.0, 4.4, 4.2];

  const rating =
    course.rating || possibleRatings[seed % possibleRatings.length];
  const reviews = course.reviews || 80 + (seed % 420); // Generates between 80 to 499 reviews

  const duration = course.duration || "Flexible";
  const category = course.category || "General";

  let lecturesCount = "1 Module";
  if (course.lectures && Array.isArray(course.lectures)) {
    lecturesCount = `${course.lectures.length} Lectures`;
  } else if (
    typeof course.lectures === "string" ||
    typeof course.lectures === "number"
  ) {
    lecturesCount = course.lectures;
  }

  // Check Coming Soon Status
  const isComingSoon = course.isComingSoon === true;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 group transition-all duration-300 h-full flex flex-col ${
        isComingSoon
          ? "opacity-95"
          : "hover:shadow-2xl hover:shadow-[#5edff4]/10 hover:-translate-y-1"
      }`}
    >
      {/* Image Section - Modified Transparent Coming Soon Box */}
      {isComingSoon ? (
        <div className="relative w-full aspect-video overflow-hidden shrink-0 block bg-slate-100">
          <img
            src={imageUrl}
            alt={course.title}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="bg-amber-500/80 backdrop-blur-sm text-white px-5 py-2 rounded-xl text-sm font-black tracking-widest uppercase shadow-2xl transform -rotate-6 border-2 border-white/30">
              Coming Soon
            </span>
          </div>
        </div>
      ) : (
        <Link
          to={`/courses/${course.id}`}
          className="relative w-full aspect-video overflow-hidden shrink-0 block cursor-pointer bg-slate-100"
        >
          <img
            src={imageUrl}
            alt={course.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60" />
        </Link>
      )}

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[#0891b2] bg-[#f0fdff] px-2 py-1 rounded-md uppercase tracking-wider">
            {category}
          </span>
          {/* Coming soon courses par se reviews hata diya gaya hai */}
          {!isComingSoon && (
            <div className="flex items-center gap-1">
              <Star className="size-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-slate-700">{rating}</span>
              <span className="text-xs text-slate-400">({reviews})</span>
            </div>
          )}
        </div>

        {/* Title Section */}
        {isComingSoon ? (
          <div className="block">
            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 min-h-14 leading-tight">
              {course.title || "Untitled Course"}
            </h3>
          </div>
        ) : (
          <Link to={`/courses/${course.id}`} className="block">
            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 min-h-14 leading-tight group-hover:text-[#0891b2] transition-colors">
              {course.title || "Untitled Course"}
            </h3>
          </Link>
        )}

        <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {duration}
          </div>
          <div className="size-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1">
            <BookOpen className="size-3.5" />
            {lecturesCount}
          </div>
        </div>

        {/* Highlighting Card Offer Banner - Updated TEXT */}
        <div className="mb-4">
          <span className="inline-block bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-900 text-[11px] font-black uppercase tracking-wide px-3 py-1.5 rounded-lg border border-amber-200/50 shadow-sm">
            🎁 Buy ANY Course at ₹499 & Get ALL Free!
          </span>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              {originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {originalPrice}
                </span>
              )}
              <span
                className={`text-xl font-bold ${
                  priceDisplay === "Free" ? "text-green-600" : "text-slate-900"
                }`}
              >
                {priceDisplay}
              </span>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div
            className={
              isComingSoon ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"
            }
          >
            {isComingSoon ? (
              <button
                disabled
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold border border-slate-200 cursor-not-allowed w-full uppercase tracking-wide"
              >
                Coming Soon
              </button>
            ) : (
              <>
                <Link
                  to={`/courses/${course.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 hover:text-slate-900 transition-all text-center"
                >
                  Explore
                </Link>

                {isEnrolled ? (
                  <button
                    onClick={onPlay}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5edff4] text-slate-900 text-xs font-bold hover:bg-[#4ecee4] transition-all shadow-lg cursor-pointer"
                  >
                    <Play className="size-4" /> Watch Now
                  </button>
                ) : (
                  <button
                    onClick={onBuy}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-lg cursor-pointer
                      ${
                        priceDisplay === "Free"
                          ? "bg-green-600 hover:bg-green-500 shadow-green-600/20"
                          : "bg-slate-900 hover:bg-[#5edff4] hover:text-slate-900 shadow-slate-900/10 hover:shadow-[#5edff4]/30"
                      }`}
                  >
                    {priceDisplay === "Free" ? "Enroll" : "Buy Now"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Courses;
