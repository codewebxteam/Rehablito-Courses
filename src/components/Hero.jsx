import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Play,
  ArrowRight,
  Users,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import AuthModal from "./AuthModal";

const Hero = () => {
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleExploreCourses = () => {
    navigate("/courses");
  };

  const handleHowItWorks = () => {
    const section = document.querySelector(
      '[class*="roadmap"], [id*="roadmap"], [id*="how-it-works"]'
    );
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/courses");
    }
  };

  return (
    <section className="relative w-full bg-slate-900 text-[#0F1B3D] overflow-hidden min-h-[calc(100vh-80px)] lg:min-h-screen flex items-center pt-28 sm:pt-32 lg:pt-28 pb-10 lg:pb-8">
      {/* ================= 1. RESPONSIVE BACKGROUND BANNER IMAGES (Mobile & Desktop) ================= */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <picture className="w-full h-full">
          {/* Desktop Banner Image */}
          <source
            media="(min-width: 1024px)"
            srcSet="https://ik.imagekit.io/5glnyqfxu/Courses/fullscreenbanner.webp"
          />
          {/* Mobile / Phone Banner Image */}
          <img
            src="https://ik.imagekit.io/5glnyqfxu/Courses/fullbannerphone.webp"
            alt="Rehablito Hero Banner"
            className="w-full h-full object-cover object-center lg:object-right"
            loading="eager"
          />
        </picture>

        {/* Minimal Soft Vignette & Subtle Left Overlay for High Visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-white/20 to-transparent lg:from-white/60 lg:via-white/25 lg:to-transparent" />

        {/* Subtle Edge Gradients */}
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-white/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white/40 to-transparent" />
      </div>

      {/* ================= 2. HERO CONTENT OVERLAY ================= */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-6 min-h-[calc(100vh-140px)]">

          {/* ================= LEFT SIDE: Text Details ================= */}
          <div className="w-full lg:w-[50%] flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Subtle Dotted Grid Decoration */}
            <div className="absolute -left-2 top-24 hidden xl:grid grid-cols-2 gap-2 opacity-60 pointer-events-none -z-10">
              {[...Array(8)].map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#40D6EF]"
                />
              ))}
            </div>

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_15px_rgba(15,27,61,0.08)] mb-3.5 sm:mb-4 md:mb-5 transition-transform hover:scale-[1.02]">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E6007E] fill-[#E6007E]" />
              <span className="text-xs sm:text-sm font-semibold tracking-tight text-[#0F1B3D]">
                Online Guidance. Real Progress.
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] xl:text-[3.8rem] font-extrabold tracking-tight leading-[1.12] text-[#0F1B3D] mb-3.5 sm:mb-4 md:mb-5 drop-shadow-sm">
              Learn. Grow.
              <br />
              Transform Lives
              <br />
              <span className="inline-flex items-center gap-1.5 sm:gap-2">
                with{" "}
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
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="text-slate-800 text-xs sm:text-sm md:text-base lg:text-[1.05rem] font-semibold leading-relaxed max-w-[520px] mb-5 sm:mb-6 md:mb-8 drop-shadow-2xs">
              Join our expert-led online courses and guidance programs designed
              to support children with special needs and empower families &
              caregivers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full">
              {/* Primary CTA */}
              <button
                onClick={handleExploreCourses}
                className="group inline-flex items-center gap-2 sm:gap-2.5 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full bg-[#0F1B3D] text-white text-xs sm:text-base font-semibold shadow-xl shadow-[#0F1B3D]/25 hover:shadow-2xl hover:shadow-[#0F1B3D]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/15 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Play className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-white text-white translate-x-[0.5px]" />
                </span>
                <span>Explore Courses</span>
              </button>

              {/* Secondary CTA */}
              <button
                onClick={handleHowItWorks}
                className="group inline-flex items-center gap-1.5 sm:gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-300/90 text-[#0F1B3D] text-xs sm:text-base font-semibold shadow-md hover:border-[#0F1B3D] hover:bg-white hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <span>How It Works</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F1B3D] transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* ================= RIGHT SIDE: Interactive Floating Cards & Video Button ================= */}
          <div className="w-full lg:w-[48%] relative flex flex-col lg:flex-row items-center justify-center lg:justify-end min-h-[220px] sm:min-h-[300px] lg:min-h-[460px] mt-6 lg:mt-0">
            
            {/* Paper Plane & Flight Path Decoration */}
            <div className="absolute top-2 right-[20%] z-20 pointer-events-none hidden sm:block">
              <svg
                className="w-24 h-14 sm:w-32 sm:h-20 text-[#2496C8]/60"
                viewBox="0 0 120 70"
                fill="none"
              >
                <path
                  d="M10 60 C 40 45, 65 15, 100 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>
              <div className="absolute top-1 right-2 animate-bounce-subtle">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-[#FFD60A] -rotate-12 drop-shadow-md"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </div>
            </div>

            {/* Watch Intro Video Floating Button (Positioned ~1 inch further left on laptop view) */}
            <div className="relative self-start sm:self-auto left-2 sm:left-4 lg:-left-12 xl:-left-16 lg:absolute lg:top-[48%] lg:-translate-y-1/2 z-30 mb-6 lg:mb-0 animate-pulse-gentle">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full shadow-[0_12px_35px_rgba(15,27,61,0.18)] border border-slate-100 p-1">
                {/* Rotating Circular Text */}
                <svg
                  className="w-full h-full animate-spin-ultra-slow"
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <path
                      id="videoCirclePath"
                      d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    />
                  </defs>
                  <text
                    className="text-[9px] font-bold fill-[#0F1B3D] tracking-[2.5px] uppercase"
                  >
                    <textPath href="#videoCirclePath" startOffset="0%">
                      Watch Our • Intro Video •
                    </textPath>
                  </text>
                </svg>

                {/* Center Play Button */}
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="absolute w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-[#63DA6B] text-white flex items-center justify-center shadow-lg shadow-[#63DA6B]/40 hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer"
                  aria-label="Watch Intro Video"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white translate-x-[1px]" />
                </button>
              </div>
            </div>

            {/* ================= FLOATING TRUST CARDS (TEMPORARILY COMMENTED OUT) ================= */}
            {/* 
            <div className="flex flex-row flex-wrap sm:flex-nowrap lg:flex-col items-center justify-center lg:justify-end gap-2.5 sm:gap-3.5 w-full lg:w-auto mt-2 lg:mt-0">
              
              <div className="relative lg:absolute lg:top-6 lg:right-6 z-30 animate-float-slow shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-[16px] sm:rounded-[22px] bg-white/95 backdrop-blur-md shadow-[0_8px_25px_rgba(15,27,61,0.12)] border border-slate-100/90 transition-transform hover:scale-105">
                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#E6007E]/10 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#E6007E]" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs sm:text-lg font-extrabold text-[#0F1B3D] leading-none">
                      1000+
                    </p>
                    <p className="text-[9px] sm:text-xs text-slate-500 font-semibold mt-0.5">
                      Happy Families
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative lg:absolute lg:top-[50%] lg:right-6 lg:-translate-y-1/2 z-30 animate-float-medium shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-[16px] sm:rounded-[22px] bg-white/95 backdrop-blur-md shadow-[0_8px_25px_rgba(15,27,61,0.12)] border border-slate-100/90 transition-transform hover:scale-105">
                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#63DA6B]/15 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#2E9B36]" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs sm:text-lg font-extrabold text-[#0F1B3D] leading-none">
                      50+
                    </p>
                    <p className="text-[9px] sm:text-xs text-slate-500 font-semibold mt-0.5">
                      Expert Courses
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative lg:absolute lg:bottom-6 lg:right-6 z-30 animate-float-fast shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-[16px] sm:rounded-[22px] bg-white/95 backdrop-blur-md shadow-[0_8px_25px_rgba(15,27,61,0.12)] border border-slate-100/90 transition-transform hover:scale-105">
                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#40D6EF]/15 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#2496C8]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] sm:text-sm font-bold text-[#0F1B3D] leading-tight">
                      Trusted by
                    </p>
                    <p className="text-[9px] sm:text-xs text-slate-500 font-semibold">
                      1000+ Families
                    </p>
                  </div>
                </div>
              </div>

            </div>
            */}

          </div>
        </div>
      </div>

      {/* Auth Modal Trigger */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="signup"
      />

      {/* Subtle Custom CSS Keyframes for Animations */}
      <style>{`
        @keyframes spinUltraSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-ultra-slow {
          animation: spinUltraSlow 16s linear infinite;
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        .animate-float-slow {
          animation: floatSlow 4s ease-in-out infinite;
        }

        @keyframes floatMedium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @media (min-width: 1024px) {
          .animate-float-medium {
            animation: floatMedium 3.8s ease-in-out infinite 0.5s;
          }
        }

        @keyframes floatFast {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        .animate-float-fast {
          animation: floatFast 4.2s ease-in-out infinite 1s;
        }

        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounceSubtle 3s ease-in-out infinite;
        }

        @keyframes pulseGentle {
          0%, 100% { transform: translateY(0%) scale(1); }
          50% { transform: translateY(0%) scale(1.04); }
        }
        @media (min-width: 1024px) {
          @keyframes pulseGentle {
            0%, 100% { transform: translateY(-50%) scale(1); }
            50% { transform: translateY(-50%) scale(1.03); }
          }
        }
        .animate-pulse-gentle {
          animation: pulseGentle 3.2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;