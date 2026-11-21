import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlayCircle,
  CheckCircle,
  ListVideo,
  Play,
  ChevronRight,
  Clock,
  Download,
  Sparkles,
} from "lucide-react";

const CourseCard = ({ course, onPlay }) => {
  const progress = Number(course.progress) || 0;
  const isCompleted = course.status === "completed" || progress >= 100;
  const [timeAgo, setTimeAgo] = useState("");

  const isCourseComingSoon =
    course?.isComingSoon === true ||
    course?.status === "coming_soon" ||
    course?.status === "Coming Soon";

  let lecturesList = [];
  if (course.lectures && Array.isArray(course.lectures)) {
    lecturesList = course.lectures;
  } else if (course.videoId || course.url) {
    lecturesList = [1];
  }

  const totalLectures = lecturesList.length;
  const completedLecturesCount =
    totalLectures > 0 ? Math.floor((progress / 100) * totalLectures) : 0;

  const nextIndex = Math.min(completedLecturesCount, totalLectures - 1);
  const nextLectureData = lecturesList[nextIndex];

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

  const handleImageError = (e) => {
    e.target.src =
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6 }}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl overflow-hidden flex flex-col h-full group transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-[#071838] overflow-hidden">
        <img
          src={course.image}
          onError={handleImageError}
          alt={course.title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isCourseComingSoon ? "opacity-60 blur-[2px]" : "opacity-90 group-hover:scale-105"
          }`}
        />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {isCourseComingSoon ? (
            <div className="bg-[#071838]/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 text-[#FFD60A] font-bold text-xs shadow-lg flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FFD60A]" />
              <span>Coming Soon</span>
            </div>
          ) : (
            <button
              onClick={() => onPlay && onPlay(course)}
              className="bg-white/25 backdrop-blur-md p-3.5 rounded-full border border-white/40 text-white hover:bg-[#E6007E] transition-all transform hover:scale-110 cursor-pointer shadow-lg"
            >
              <PlayCircle className="w-10 h-10 text-white" />
            </button>
          )}
        </div>

        {totalLectures > 0 && !isCourseComingSoon && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-[10px] font-extrabold text-white flex items-center gap-1.5 border border-white/20">
            <ListVideo className="w-3.5 h-3.5 text-[#FFD60A]" />
            <span>{totalLectures} Lessons</span>
          </div>
        )}

        <div className="absolute bottom-3 right-3 px-3 py-1 bg-[#071838]/90 backdrop-blur-md rounded-full text-xs font-extrabold text-[#FFD60A] border border-white/15">
          {isCourseComingSoon ? (
            <span className="flex items-center gap-1 text-slate-300">
              <Clock size={12} /> Upcoming
            </span>
          ) : isCompleted ? (
            <span className="flex items-center gap-1 text-[#16A34A]">
              <CheckCircle size={12} /> Completed
            </span>
          ) : (
            `${Math.round(progress)}%`
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-[#0F1B3D] leading-snug mb-3 line-clamp-2 group-hover:text-[#E6007E] transition-colors">
            {course.title || "Untitled Course"}
          </h3>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 mb-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  course.lastAccessed ? "bg-[#16A34A]" : "bg-slate-300"
                }`}
              />
              <span className="text-[11px]">{isCourseComingSoon ? "Not started" : timeAgo}</span>
            </div>
            {totalLectures > 0 && !isCourseComingSoon && (
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-[#0F1B3D] font-extrabold">
                  {isCompleted ? totalLectures : completedLecturesCount}/
                  {totalLectures}
                </span>
                <span>Lessons</span>
              </div>
            )}
          </div>
        </div>

        {/* Up Next Badge */}
        {!isCompleted &&
          !isCourseComingSoon &&
          progress > 0 &&
          totalLectures > 1 && (
            <div
              className="mb-4 cursor-pointer"
              onClick={() => onPlay && onPlay(course)}
            >
              <p className="text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                Up Next
              </p>
              <div className="flex items-center justify-between p-2.5 bg-[#FCE7F3] hover:bg-[#fbcfe8] rounded-2xl border border-[#fbcfe8] transition-colors">
                <p className="text-xs font-bold text-[#E6007E] truncate flex-1 pr-2">
                  {nextLectureTitle}
                </p>
                <ChevronRight className="w-4 h-4 text-[#E6007E]" />
              </div>
            </div>
          )}

        <div className="space-y-3">
          {!isCompleted && !isCourseComingSoon && (
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-[#E6007E] via-[#2499C7] to-[#FFD60A] rounded-full"
              />
            </div>
          )}

          {course.driveLink && !isCourseComingSoon && (
            <a
              href={course.driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold text-xs bg-[#E0F2FE] text-[#0284C7] hover:bg-[#bae6fd] transition-all shadow-xs"
            >
              <Download className="w-4 h-4" /> Download Therapy Notes
            </a>
          )}

          <button
            onClick={() => {
              if (!isCourseComingSoon && onPlay) onPlay(course);
            }}
            disabled={isCourseComingSoon}
            className={`w-full block text-center py-3.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
              isCourseComingSoon
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none"
                : isCompleted
                ? "bg-[#16A34A] text-white hover:bg-[#15803d]"
                : "bg-[#0F1B3D] text-white hover:bg-[#1d2e5e]"
            }`}
          >
            {isCourseComingSoon
              ? "Coming Soon"
              : isCompleted
              ? "Review Course"
              : progress === 0
              ? "Start Learning"
              : "Continue Learning"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
