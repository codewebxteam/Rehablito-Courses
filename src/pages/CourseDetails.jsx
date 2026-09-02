import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCourse } from "../context/CourseContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import {
  Loader2,
  FileText,
  Download,
  Lock,
  PlayCircle,
  Sparkles,
} from "lucide-react";

// Components
import CourseHero from "../components/course-details/CourseHero";
import Curriculum from "../components/course-details/Curriculum";
import PricingCard from "../components/course-details/PricingCard";
import AuthModal from "../components/AuthModal";
import CourseVideoPlayer from "../components/CourseVideoPlayer";
import StatsAndNewsletter from "../components/StatsAndNewsletter";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isEnrolled } = useCourse();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeVideoPlaylist, setActiveVideoPlaylist] = useState(null);
  const [startIndex, setStartIndex] = useState(0);

  const userHasAccess = course ? isEnrolled(course.id) : false;

  const demoVideos = useMemo(() => {
    if (course?.demoVideos && Array.isArray(course.demoVideos)) {
      return course.demoVideos;
    }
    return [];
  }, [course?.demoVideos]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const docRef = doc(db, "courseVideos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCourse({
            id: docSnap.id,
            courseId: docSnap.id,
            ...data,
            instructor: data.instructor || "Specialist Mentor",
            category: data.category || "General Guidance",
            image:
              data.image ||
              (data.videoId
                ? `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`
                : "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80"),
            syllabusContent: data.syllabus || "No syllabus provided.",
            driveLink: data.driveLink || "",
            paymentLink: data.paymentLink || "",
            mainVideoId: data.mainVideoId || null,
          });
        } else {
          setError("Course not found");
        }
      } catch (err) {
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id]);

  const handleEnroll = () => {
    if (!course?.paymentLink) return alert("Payment link not configured.");
    if (!currentUser) {
      localStorage.setItem("pendingCheckoutCourse", JSON.stringify(course));
      setIsAuthOpen(true);
      return;
    }
    window.location.href = course.paymentLink;
  };

  const openPlayer = (playlist, index = 0) => {
    setActiveVideoPlaylist(playlist);
    setStartIndex(index);
  };

  const handleClosePlayer = () => {
    setActiveVideoPlaylist(null);
    window.location.reload();
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 text-[#0F1B3D] animate-spin" />
      </div>
    );

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md">
          <p className="text-base font-extrabold text-[#0F1B3D] mb-2">Course details unavailable</p>
          <button
            onClick={() => navigate("/courses")}
            className="px-6 py-2.5 rounded-full bg-[#0F1B3D] text-white text-xs font-bold"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-16 text-[#0F1B3D]">
      <CourseHero course={course} />

      {/* Mobile Pricing Card */}
      <div className="px-4 sm:px-6 lg:hidden relative z-20 -mt-8 mb-8">
        <PricingCard
          course={course}
          onEnroll={handleEnroll}
          isEnrolled={userHasAccess}
        />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 lg:mt-10 mb-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-8 sm:space-y-10">
            
            {/* 1. Course Introduction Video */}
            {course?.mainVideoId && (
              <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
                  <PlayCircle className="text-[#0F1B3D]" size={22} />
                  <h2 className="text-base sm:text-lg font-extrabold text-[#0F1B3D]">
                    Course Introduction Video
                  </h2>
                </div>

                <div
                  className="relative aspect-video bg-black group cursor-pointer"
                  onClick={() =>
                    openPlayer([
                      {
                        videoId: course.mainVideoId,
                        title: "Course Introduction",
                      },
                    ])
                  }
                >
                  <img
                    src={`https://img.youtube.com/vi/${course.mainVideoId}/maxresdefault.jpg`}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                    alt="Intro Thumbnail"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform">
                      <PlayCircle className="text-white w-10 h-10 translate-x-[1px]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Study Material & Notes Download Card */}
            {course?.driveLink && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#E0F2FE] text-[#0284C7] rounded-2xl flex items-center justify-center shrink-0">
                      <FileText size={26} />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold text-[#0F1B3D]">
                        Study Material & Resources
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Download guidance materials & notes for this course
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    {userHasAccess ? (
                      <a
                        href={course.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0F1B3D] text-white rounded-full text-xs font-bold transition-all shadow-md hover:bg-[#1d2d5a]"
                      >
                        <Download size={16} /> Download Resources
                      </a>
                    ) : (
                      <button
                        disabled
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-400 rounded-full text-xs font-bold border border-slate-200 cursor-not-allowed w-full"
                      >
                        <Lock size={16} /> Enroll to Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Demo Lessons Grid */}
            {demoVideos.length > 0 && (
              <div className="space-y-5">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#0F1B3D]">
                  Free Starter Lessons
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {demoVideos.map((video, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm group cursor-pointer transition-transform hover:-translate-y-1"
                      onClick={() => openPlayer(demoVideos, idx)}
                    >
                      <div className="aspect-video relative bg-slate-900">
                        <img
                          src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                          className="w-full h-full object-cover opacity-75 group-hover:opacity-55 transition-all"
                          alt={video.title}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlayCircle className="text-white w-10 h-10 opacity-90 group-hover:scale-110 transition-transform" />
                        </div>
                      </div>
                      <div className="p-4 bg-white">
                        <h3 className="font-extrabold text-[#0F1B3D] text-xs sm:text-sm line-clamp-1">
                          {video.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
                          Free Lesson {idx + 1}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Unlock Full Access Card */}
                  {!userHasAccess && (
                    <div
                      onClick={handleEnroll}
                      className="bg-[#081736] text-white rounded-3xl p-6 flex flex-col items-center justify-center text-center border border-slate-700 cursor-pointer hover:scale-[1.02] transition-transform group"
                    >
                      <div className="w-12 h-12 bg-[#FFD60A]/15 rounded-2xl flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform">
                        <Sparkles className="text-[#FFD60A] w-6 h-6" />
                      </div>
                      <h3 className="text-white font-extrabold text-base mb-1">
                        Unlock Full Access
                      </h3>
                      <p className="text-slate-300 text-xs mb-4">
                        Enroll to access all premium therapy videos.
                      </p>
                      <button className="px-6 py-2.5 bg-[#FFD60A] text-[#0F1B3D] rounded-full font-bold text-xs shadow-md">
                        Enroll Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Course Curriculum / Syllabus */}
            <Curriculum course={course} syllabus={course.syllabusContent} />
          </div>

          {/* Desktop Pricing Card */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28">
              <PricingCard
                course={course}
                onEnroll={handleEnroll}
                isEnrolled={userHasAccess}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Counter & WhatsApp Banner */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <StatsAndNewsletter />
      </div>

      {activeVideoPlaylist && (
        <CourseVideoPlayer
          course={course}
          playlist={activeVideoPlaylist}
          initialIndex={startIndex}
          onClose={handleClosePlayer}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="login"
      />
    </div>
  );
};

export default CourseDetails;
