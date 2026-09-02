import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  MessageSquare,
  Activity,
  HeartHandshake,
  BookOpen,
  Baby,
  ArrowRight,
} from "lucide-react";

const ExploreCourses = () => {
  const navigate = useNavigate();

  const handleCardClick = (category) => {
    navigate(`/courses?category=${encodeURIComponent(category)}`);
  };

  const coursesData = [
    {
      id: "autism-adhd",
      title: "Autism / ADHD",
      description: "Understand & support neurodevelopmental differences",
      icon: Brain,
      color: "#E6007E",
      bgColor: "#FCE7F3",
      buttonColor: "#E6007E",
    },
    {
      id: "speech-therapy",
      title: "Speech Therapy",
      description: "Improve communication and speech skills step by step",
      icon: MessageSquare,
      color: "#9333EA",
      bgColor: "#F3E8FF",
      buttonColor: "#9333EA",
    },
    {
      id: "occupational-therapy",
      title: "Occupational Therapy",
      description: "Build daily living and motor skills for independence",
      icon: Activity,
      color: "#16A34A",
      bgColor: "#DCFCE7",
      buttonColor: "#16A34A",
    },
    {
      id: "behaviour-therapy",
      title: "Behaviour Therapy",
      description: "Positive strategies for better behaviour and emotional growth",
      icon: HeartHandshake,
      color: "#EA580C",
      bgColor: "#FFEDD5",
      buttonColor: "#EA580C",
    },
    {
      id: "special-education",
      title: "Special Education",
      description: "Personalized learning and academic development",
      icon: BookOpen,
      color: "#0284C7",
      bgColor: "#E0F2FE",
      buttonColor: "#0284C7",
    },
    {
      id: "pediatric-rehabilitation",
      title: "Pediatric Rehabilitation",
      description: "Holistic support for overall child development",
      icon: Baby,
      color: "#65A30D",
      bgColor: "#ECFCCB",
      buttonColor: "#65A30D",
    },
  ];

  return (
    <section className="relative w-full bg-[#081736] text-white py-14 sm:py-16 lg:py-20 overflow-hidden">
      
      {/* Decorative Corner Shape Left-Bottom */}
      <div className="absolute left-[-60px] bottom-[-60px] w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-[#FFB800] pointer-events-none z-0 opacity-90" />
      <div className="absolute left-4 bottom-12 hidden sm:grid grid-cols-4 gap-2 opacity-50 pointer-events-none z-0">
        {[...Array(16)].map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#FFD60A]" />
        ))}
      </div>

      {/* Decorative Corner Shape Right-Top */}
      <div className="absolute right-[-70px] top-[-30px] lg:top-[-50px] w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-[#E6007E] pointer-events-none z-0 opacity-90" />
      <div className="absolute right-6 top-24 hidden sm:grid grid-cols-4 gap-2 opacity-50 pointer-events-none z-0">
        {[...Array(16)].map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
        ))}
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Title Section */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-14">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            {/* Left Spark Burst */}
            <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 40 40" fill="none">
              <path d="M5 20L15 20" stroke="#FF5757" strokeWidth="4" strokeLinecap="round" />
              <path d="M8 8L15 15" stroke="#FFBD59" strokeWidth="4" strokeLinecap="round" />
              <path d="M8 32L15 25" stroke="#54B5FF" strokeWidth="4" strokeLinecap="round" />
            </svg>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight text-white">
              Explore Our <span className="text-[#FFD60A]">Online Courses</span>
            </h2>

            {/* Right Spark Burst */}
            <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 40 40" fill="none">
              <path d="M35 20L25 20" stroke="#FF5757" strokeWidth="4" strokeLinecap="round" />
              <path d="M32 8L25 15" stroke="#54B5FF" strokeWidth="4" strokeLinecap="round" />
              <path d="M32 32L25 25" stroke="#FFBD59" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal">
            Evidence-based courses designed by experts to help your child thrive.
          </p>
        </div>

        {/* Cards Grid / Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {coursesData.map((course, index) => {
            const IconComponent = course.icon;
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                onClick={() => handleCardClick(course.title)}
                className="group relative bg-white text-[#0F1B3D] rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-between text-center min-h-[280px] sm:min-h-[300px] shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-slate-100"
              >
                {/* Top Icon Circle */}
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
                  style={{ backgroundColor: course.bgColor }}
                >
                  <IconComponent
                    className="w-7 h-7 sm:w-8 sm:h-8"
                    style={{ color: course.color }}
                  />
                </div>

                {/* Card Title & Description */}
                <div className="flex-1 flex flex-col items-center justify-start my-1">
                  <h3 className="text-base sm:text-lg font-bold text-[#0F1B3D] leading-snug mb-2 group-hover:text-[#0a2a59] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 font-normal leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Bottom Circular Arrow Button */}
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center mt-4 transition-transform group-hover:scale-110 duration-300 shadow-md"
                  style={{ backgroundColor: course.buttonColor }}
                >
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Courses CTA Button */}
        <div className="mt-10 sm:mt-12 lg:mt-14 text-center">
          <button
            onClick={() => navigate("/courses")}
            className="group inline-flex items-center gap-2.5 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-[#FFD60A] text-[#0F1B3D] font-bold text-sm sm:text-base shadow-xl shadow-[#FFD60A]/20 hover:bg-[#ffe042] hover:shadow-2xl hover:shadow-[#FFD60A]/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F1B3D] transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default ExploreCourses;
