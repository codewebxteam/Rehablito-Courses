import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  Play,
  Clock,
  FileVideo,
  ChevronRight,
  List,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import CourseCard from "../../components/dashboard/CourseCard";
import CourseVideoPlayer from "../../components/CourseVideoPlayer";
import { useCourse } from "../../context/CourseContext";

const MyCourses = () => {
  const { enrolledCourses } = useCourse();
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [playingVideoIndex, setPlayingVideoIndex] = useState(null);

  const filteredCourses = enrolledCourses.filter((course) => {
    const matchesSearch = course.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === "all") return true;
    if (filterStatus === "in-progress") return course.status === "in-progress";
    if (filterStatus === "completed") return course.status === "completed";
    return true;
  });

  const inProgressCount = enrolledCourses.filter(
    (c) => c.status === "in-progress"
  ).length;

  const getLecturesList = (course) => {
    if (!course) return [];

    if (
      course.lectures &&
      Array.isArray(course.lectures) &&
      course.lectures.length > 0
    ) {
      return course.lectures;
    }

    if (course.videoId) {
      return [
        {
          id: "legacy",
          videoId: course.videoId,
          title: course.title || "Full Class",
          url: course.url || "",
        },
      ];
    }

    return [];
  };

  const handleOpenCourse = (course) => {
    setSelectedCourse(course);
    setPlayingVideoIndex(null);
  };

  const handlePlayVideo = (index) => {
    setPlayingVideoIndex(index);
  };

  const handleCloseAll = () => {
    setSelectedCourse(null);
    setPlayingVideoIndex(null);
  };

  const getThumbnail = (vidId) => {
    return vidId
      ? `https://img.youtube.com/vi/${vidId}/mqdefault.jpg`
      : "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80";
  };

  const currentLectures = getLecturesList(selectedCourse);

  return (
    <div className="space-y-8 pb-12 font-sans text-[#0F1B3D]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FCE7F3] text-[#E6007E] text-xs font-extrabold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>My Learning Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B3D]">
            My <span className="text-[#E6007E]">Learning</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Manage your enrolled therapy courses and track progress.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-[#0F1B3D]" />
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold focus:border-[#0F1B3D] outline-none w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-slate-200 pb-1">
        <button
          onClick={() => setFilterStatus("all")}
          className={`pb-3 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            filterStatus === "all"
              ? "text-[#E6007E] border-b-2 border-[#E6007E]"
              : "text-slate-500 hover:text-[#0F1B3D]"
          }`}
        >
          All Enrolled ({enrolledCourses.length})
        </button>
        <button
          onClick={() => setFilterStatus("in-progress")}
          className={`pb-3 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            filterStatus === "in-progress"
              ? "text-[#16A34A] border-b-2 border-[#16A34A]"
              : "text-slate-500 hover:text-[#0F1B3D]"
          }`}
        >
          In Progress ({inProgressCount})
        </button>
      </div>

      {/* Course Cards Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.courseId}
              course={course}
              onPlay={handleOpenCourse}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 space-y-4">
          <p className="text-xs sm:text-sm text-slate-500 font-medium">No enrolled courses found.</p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0F1B3D] text-white font-bold text-xs hover:bg-[#1d2e5e] shadow-md"
          >
            <span>Explore Courses</span>
          </Link>
        </div>
      )}

      {/* === PLAYLIST MODAL (Video List) === */}
      <AnimatePresence>
        {selectedCourse && playingVideoIndex === null && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseAll}
              className="absolute inset-0 bg-[#071838]/70 backdrop-blur-md cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl relative z-10 flex flex-col overflow-hidden border border-slate-200"
            >
              {/* Dark Navy Header */}
              <div className="p-6 bg-[#071838] text-white flex justify-between items-start">
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-white leading-snug">
                    {selectedCourse.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-[#FFD60A] text-xs font-bold">
                    <List className="w-4 h-4" />
                    <span>
                      {currentLectures.length} Videos Available
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCloseAll}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* List Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3.5 bg-slate-50">
                {currentLectures.length > 0 ? (
                  currentLectures.map((video, idx) => (
                    <div
                      key={idx}
                      onClick={() => handlePlayVideo(idx)}
                      className="group bg-white p-3.5 rounded-2xl border border-slate-200/90 hover:border-[#E6007E] hover:shadow-md transition-all cursor-pointer flex gap-4 items-center"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-28 h-16 md:w-36 md:h-20 bg-[#071838] rounded-xl overflow-hidden shrink-0">
                        <img
                          src={getThumbnail(video.videoId)}
                          className="w-full h-full object-cover opacity-90"
                          alt=""
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                          <div className="p-2 bg-[#E6007E] rounded-full text-white shadow-md">
                            <Play className="w-4 h-4 fill-current" />
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5 block">
                          Lesson {idx + 1}
                        </span>
                        <h3 className="font-extrabold text-[#0F1B3D] text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-[#E6007E] transition-colors">
                          {video.title || `Video Part ${idx + 1}`}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600">
                            <FileVideo size={10} /> Video Lesson
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className="w-5 h-5 text-slate-300 group-hover:text-[#E6007E] transition-colors"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-xs font-bold">
                      No videos found in this course.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Video Player */}
      {selectedCourse && playingVideoIndex !== null && (
        <CourseVideoPlayer
          course={selectedCourse}
          playlist={currentLectures}
          initialIndex={playingVideoIndex}
          onClose={() => setPlayingVideoIndex(null)}
        />
      )}
    </div>
  );
};

export default MyCourses;
