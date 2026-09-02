import React from "react";
import { Star, Globe, Clock, ShieldCheck, Heart } from "lucide-react";

const CourseHero = ({ course }) => {
  const getSeededRandom = (seedStr) => {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const uniqueString = (course.id || "") + (course.title || "course");
  const seed = getSeededRandom(uniqueString);
  const possibleRatings = ["4.7", "4.8", "4.9", "4.6", "4.8"];

  const rating = course.rating || possibleRatings[seed % possibleRatings.length];
  const reviews = course.reviews || 120 + (seed % 280);
  const category = course.category || "General Guidance";

  return (
    <div className="bg-[#081736] text-white pt-28 sm:pt-32 lg:pt-36 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-10 relative overflow-hidden">
      {/* Background Decorative Shapes */}
      <div className="absolute right-[-40px] top-[-40px] w-64 h-64 rounded-full bg-[#E6007E] pointer-events-none opacity-20 blur-3xl" />
      <div className="absolute left-[-40px] bottom-[-40px] w-64 h-64 rounded-full bg-[#FFD60A] pointer-events-none opacity-15 blur-3xl" />

      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-3 gap-8 lg:gap-12 relative z-10">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {/* Category Badge & Breadcrumbs */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3.5 py-1 rounded-full bg-[#FFD60A] text-[#0F1B3D] text-xs font-extrabold uppercase tracking-wider">
              {category}
            </span>
            <span className="text-slate-400 text-xs sm:text-sm font-semibold">/</span>
            <span className="text-slate-300 text-xs sm:text-sm font-semibold line-clamp-1">
              {course.title}
            </span>
          </div>

          {/* Course Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-extrabold leading-tight text-white">
            {course.title}
          </h1>

          {/* Course Description */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl">
            {course.description || "A comprehensive therapy & guidance program designed by certified specialists to empower parents and caregivers."}
          </p>

          {/* Meta Data Row */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold pt-2 text-slate-300">
            {/* Rating */}
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <Star className="w-4 h-4 fill-[#FFD60A] text-[#FFD60A]" />
              <span className="font-extrabold text-white">{rating}</span>
              <span className="text-slate-300">({reviews} reviews)</span>
            </div>

            {/* Support Tag */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-[#63DA6B]" />
              <span>Certified Expert Guidance</span>
            </div>

            {/* Language */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <Globe className="w-4 h-4 text-[#40D6EF]" />
              <span>Hindi</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CourseHero;
