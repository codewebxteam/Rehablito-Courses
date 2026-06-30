import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlayCircle,
  CheckCircle,
  ListVideo,
  Play,
  ChevronRight,
  Clock, // NEW: Icon for coming soon
  Download,
} from "lucide-react";

const CourseCard = ({ course, onPlay }) => {
  const progress = Number(course.progress) || 0;
  const isCompleted = course.status === "completed" || progress >= 100;
  const [timeAgo, setTimeAgo] = useState("");

  // ─────────────────────────────────────────────
  // Coming Soon Check
  // ─────────────────────────────────────────────
  const isCourseComingSoon =
    course?.isComingSoon === true ||
    course?.status === "coming_soon" ||
    course?.status === "Coming Soon";

  // [CLEAN DATA FIX]
  // 1. Array check karo
  // 2. Agar Array nahi hai to 1 video maano (String garbage ignore karo)
  let lecturesList = [];
  if (course.lectures && Array.isArray(course.lectures)) {
    lecturesList = course.lectures;
  } else if (course.videoId || course.url) {
    lecturesList = [1]; // Legacy support
  }

  const totalLectures = lecturesList.length;
  const completedLecturesCount =
    totalLectures > 0 ? Math.floor((progress / 100) * totalLectures) : 0;

  // Clean 'Next Up' Logic
  const nextIndex = Math.min(completedLecturesCount, totalLectures - 1);
  const nextLectureData = lecturesList[nextIndex];

  // Title ko safely nikalo (agar object hai to title, nahi to "Next Lesson")
  const nextLectureTitle =
    nextLectureData &&
    typeof nextLectureData === "object" &&
    nextLectureData.title
      ? nextLectureData.title
      : `Lesson ${nextIndex + 1}`;

  useEffect(() => {
    const calculateTimeAgo = () => {
      if (!course.lastAccessed) return "Start Learning";
      const now = new Date();
      const lastAccess = new Date(course.lastAccessed);
      const diffMs = now - lastAccess;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    };
    setTimeAgo(calculateTimeAgo());
  }, [course.lastAccessed]);

  // [IMAGE FIX] 404 Error handling
  const handleImageError = (e) => {
    // Agar image na mile to default badhiya wali photo laga do
    e.target.src =
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden flex flex-col h-full group hover:shadow-xl transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-slate-900 overflow-hidden">
        <img
          src={course.image}
          onError={handleImageError}
          alt={course.title}
          className={`w-full h-full object-cover transition-all duration-500 ${isCourseComingSoon ? "opacity-60 blur-[2px]" : "opacity-90 group-hover:scale-105"}`}
        />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {isCourseComingSoon ? (
            <div className="bg-slate-900/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 text-white font-bold text-sm shadow-lg flex items-center gap-2">
              <Clock size={16} className="text-[#5edff4]" />
              Coming Soon
            </div>
          ) : (
            <button
              onClick={() => onPlay && onPlay(course)}
              className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/50 text-white hover:bg-[#5edff4] hover:text-black transition-all transform hover:scale-110"
            >
              <PlayCircle className="size-10" />
            </button>
          )}
        </div>

        {totalLectures > 0 && !isCourseComingSoon && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5">
            <ListVideo size={12} className="text-[#5edff4]" />
            {totalLectures} Videos
          </div>
        )}

        <div className="absolute bottom-3 right-3 px-3 py-1 bg-slate-900/90 backdrop-blur-md rounded-lg text-xs font-bold text-[#5edff4] border border-white/10">
          {isCourseComingSoon ? (
            <span className="flex items-center gap-1 text-slate-300">
              <Clock size={12} /> Upcoming
            </span>
          ) : isCompleted ? (
            <span className="flex items-center gap-1">
              <CheckCircle size={12} /> Done
            </span>
          ) : (
            `${Math.round(progress)}%`
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="font-bold text-lg text-slate-900 leading-tight mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {course.title || "Untitled Course"}
          </h3>

          <div className="flex items-center justify-between text-xs font-medium text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <div className="flex items-center gap-1.5">
              <span
                className={`size-2 rounded-full ${
                  course.lastAccessed ? "bg-green-500" : "bg-slate-300"
                }`}
              />
              {isCourseComingSoon ? "Not started" : timeAgo}
            </div>
            {totalLectures > 0 && !isCourseComingSoon && (
              <div className="flex items-center gap-1">
                <span className="text-slate-900 font-bold">
                  {isCompleted ? totalLectures : completedLecturesCount}/
                  {totalLectures}
                </span>
                <span>Completed</span>
              </div>
            )}
          </div>
        </div>

        {/* Up Next - Only valid logic & hide if coming soon */}
        {!isCompleted &&
          !isCourseComingSoon &&
          progress > 0 &&
          totalLectures > 1 && (
            <div
              className="mb-4 cursor-pointer"
              onClick={() => onPlay && onPlay(course)}
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                Up Next
              </p>
              <div className="flex items-center justify-between p-2 bg-indigo-50/50 hover:bg-indigo-50 rounded-lg border border-indigo-100 transition-colors">
                <p className="text-xs font-bold text-slate-900 truncate flex-1 pr-2">
                  {nextLectureTitle}
                </p>
                <ChevronRight size={14} className="text-indigo-400" />
              </div>
            </div>
          )}

        <div className="mt-auto space-y-4">
          {!isCompleted && !isCourseComingSoon && (
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-[#5edff4] to-[#0891b2] rounded-full"
              />
            </div>
          )}

          {course.driveLink && !isCourseComingSoon && (
            <a
              href={course.driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 transition-all shadow-sm active:scale-95"
            >
              <Download size={16} /> Download Notes
            </a>
          )}

          <button
            onClick={() => {
              if (!isCourseComingSoon && onPlay) onPlay(course);
            }}
            disabled={isCourseComingSoon}
            className={`w-full block text-center py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 ${
              isCourseComingSoon
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none"
                : isCompleted
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-slate-900 text-white hover:bg-indigo-600"
            }`}
          >
            {isCourseComingSoon
              ? "Coming Soon"
              : isCompleted
                ? "Review Course"
                : progress === 0
                  ? "Start Learning"
                  : "Continue"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
