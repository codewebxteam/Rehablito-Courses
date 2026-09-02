import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Award,
  UserCheck,
  CheckCircle2,
  Users,
  Calendar,
  Brain,
  MessageSquare,
  Activity,
  HeartHandshake,
  BookOpen,
  Baby,
  ArrowRight,
  ShieldCheck,
  Zap,
  Quote,
  Star,
  Sparkles,
  ClipboardList,
  Target,
  TrendingUp,
  Mail,
  Send,
} from "lucide-react";
import AuthModal from "../components/AuthModal";

const Programs = () => {
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleProgramClick = (category) => {
    navigate(`/courses?category=${encodeURIComponent(category)}`);
  };

  const handleConsultation = () => {
    const waUrl = `https://wa.me/919204786220?text=${encodeURIComponent(
      "Hello Rehablito Team, I want to book a free consultation for my child!"
    )}`;
    window.open(waUrl, "_blank");
  };

  // 6 Programs Data (Cards without images as requested by user)
  const programs = [
    {
      id: "autism-adhd",
      title: "Autism / ADHD",
      subtitle: "Support for communication, behavior, social skills and daily living.",
      icon: Brain,
      color: "#E6007E",
      bgColor: "#FCE7F3",
      buttonColor: "#E6007E",
      bullets: [
        "Behavior Management",
        "Social Skills Training",
        "Communication Support",
        "Parent Guidance",
      ],
    },
    {
      id: "speech-therapy",
      title: "Speech Therapy",
      subtitle: "Improve speech clarity, language skills and effective communication.",
      icon: MessageSquare,
      color: "#9333EA",
      bgColor: "#F3E8FF",
      buttonColor: "#9333EA",
      bullets: [
        "Speech Clarity",
        "Language Development",
        "Voice & Fluency",
        "Articulation Therapy",
      ],
    },
    {
      id: "occupational-therapy",
      title: "Occupational Therapy",
      subtitle: "Build daily living skills, motor skills and independence.",
      icon: Activity,
      color: "#16A34A",
      bgColor: "#DCFCE7",
      buttonColor: "#16A34A",
      bullets: [
        "Fine Motor Skills",
        "Sensory Integration",
        "Daily Living Activities",
        "Gross Motor Development",
      ],
    },
    {
      id: "behaviour-therapy",
      title: "Behaviour Therapy",
      subtitle: "Positive behaviour support and emotional regulation strategies.",
      icon: HeartHandshake,
      color: "#EA580C",
      bgColor: "#FFEDD5",
      buttonColor: "#EA580C",
      bullets: [
        "Positive Reinforcement",
        "Emotional Regulation",
        "Self-Control Strategies",
        "Functional Behavior Support",
      ],
    },
    {
      id: "special-education",
      title: "Special Education",
      subtitle: "Individualized learning programs for academic growth.",
      icon: BookOpen,
      color: "#0284C7",
      bgColor: "#E0F2FE",
      buttonColor: "#0284C7",
      bullets: [
        "Academic Support",
        "Learning Disabilities",
        "Individualized Education Plan",
        "Cognitive Development",
      ],
    },
    {
      id: "pediatric-rehab",
      title: "Pediatric Rehabilitation",
      subtitle: "Holistic rehabilitation for overall physical and developmental growth.",
      icon: Baby,
      color: "#65A30D",
      bgColor: "#ECFCCB",
      buttonColor: "#65A30D",
      bullets: [
        "Physical Therapy",
        "Developmental Delay",
        "Adaptive Skills",
        "Holistic Care",
      ],
    },
  ];

  // Why Families Choose Rehablito 5 Pillars
  const whyChoosePillars = [
    {
      title: "Child-Centered Approach",
      icon: Heart,
      bgColor: "#FCE7F3",
      color: "#E6007E",
    },
    {
      title: "Expert & Certified Therapists",
      icon: UserCheck,
      bgColor: "#F3E8FF",
      color: "#9333EA",
    },
    {
      title: "Safe, Supportive & Nurturing Environment",
      icon: ShieldCheck,
      bgColor: "#DCFCE7",
      color: "#16A34A",
    },
    {
      title: "Proven Results & Continuous Support",
      icon: Award,
      bgColor: "#FFEDD5",
      color: "#EA580C",
    },
    {
      title: "Parent Training & Guidance",
      icon: Users,
      bgColor: "#E0F2FE",
      color: "#0284C7",
    },
  ];

  // 5 Step Approach
  const approachSteps = [
    {
      step: "1. Assessment",
      description: "We understand your child's unique needs.",
      icon: MessageSquare,
      bgColor: "#FCE7F3",
      color: "#E6007E",
    },
    {
      step: "2. Personalized Plan",
      description: "Experts create a customized program for your child.",
      icon: ClipboardList,
      bgColor: "#F3E8FF",
      color: "#9333EA",
    },
    {
      step: "3. Therapy & Support",
      description: "One-on-one sessions and continuous support.",
      icon: Users,
      bgColor: "#DCFCE7",
      color: "#16A34A",
    },
    {
      step: "4. Track Progress",
      description: "Regular assessments and progress tracking.",
      icon: TrendingUp,
      bgColor: "#FFEDD5",
      color: "#EA580C",
    },
    {
      step: "5. Achieve Potential",
      description: "Building confidence and independence every day.",
      icon: Target,
      bgColor: "#E0F2FE",
      color: "#0284C7",
    },
  ];

  // Real Parent Reviews
  const parentReviews = [
    {
      name: "Priya Sharma",
      text: "Rehablito has been a blessing for our family. The expert guidance and support helped our child improve in ways we couldn't imagine.",
      avatar: "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=150&auto=format&fit=crop&q=80",
    },
    {
      name: "Rajesh Verma",
      text: "Very professional and caring team. The personalized attention makes a huge difference in progress.",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
    },
    {
      name: "Anjali Mehta",
      text: "Best decision we made! My child is more confident and independent now.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="w-full bg-[#F8FAFC] font-sans text-[#0F1B3D]">
      
      {/* ================= 1. HERO SECTION WITH RESPONSIVE BACKGROUND IMAGES ================= */}
      <section className="relative w-full h-screen min-h-screen overflow-hidden flex items-start lg:items-center pt-28 sm:pt-32 lg:pt-28 pb-12">
        
        {/* Responsive Background Banner Images (Full Screen Cover) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <picture className="w-full h-full block">
            {/* Desktop Banner Image */}
            <source
              media="(min-width: 1024px)"
              srcSet="https://ik.imagekit.io/5glnyqfxu/Courses/ProgramHero.webp"
            />
            {/* Mobile / Phone Banner Image */}
            <img
              src="https://ik.imagekit.io/5glnyqfxu/Courses/ProgramHeroPhone.webp"
              alt="Rehablito Programs Banner"
              className="w-full h-full object-fill lg:object-cover object-top lg:object-right"
              loading="eager"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/30 to-transparent lg:from-white/70 lg:via-white/30 lg:to-transparent" />
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-2 sm:py-4">
          <div className="w-full lg:w-[52%] flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-md mb-4">
              <Heart className="w-4 h-4 text-[#E6007E] fill-[#E6007E]" />
              <span className="text-xs sm:text-sm font-bold text-[#0F1B3D]">
                Our Programs
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.12] text-[#0F1B3D] mb-4">
              Specialized Programs.
              <br />
              Meaningful{" "}
              <span className="inline-flex font-black tracking-tight">
                <span style={{ color: "#F51B22" }}>P</span>
                <span style={{ color: "#FF8A16" }}>r</span>
                <span style={{ color: "#FFE11A" }}>o</span>
                <span style={{ color: "#63B632" }}>g</span>
                <span style={{ color: "#2499C7" }}>r</span>
                <span style={{ color: "#E6007E" }}>e</span>
                <span style={{ color: "#A34773" }}>s</span>
                <span style={{ color: "#FFD51A" }}>s</span>
              </span>
              .
            </h1>

            {/* Subtitle */}
            <p className="text-slate-800 text-xs sm:text-sm md:text-base lg:text-[1.05rem] font-semibold leading-relaxed max-w-[540px] mb-6">
              Expert-designed therapy and development programs to help children
              overcome challenges and reach their true potential.
            </p>

            {/* 3 Feature Badges (Hidden on Phone View) */}
            <div className="hidden sm:grid grid-cols-3 gap-3 w-full max-w-[560px] mb-8">
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#FCE7F3] text-[#E6007E] flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#0F1B3D]">Expert Designed</p>
                  <p className="text-[10px] text-slate-500 font-medium">By certified pros</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#0F1B3D]">Evidence Based</p>
                  <p className="text-[10px] text-slate-500 font-medium">Research backed</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#0F1B3D]">Personalized</p>
                  <p className="text-[10px] text-slate-500 font-medium">For every child</p>
                </div>
              </div>
            </div>

            {/* 4 Stats Pill Banner (Hidden on Phone View) */}
            <div className="hidden sm:grid w-full max-w-[620px] bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-4 shadow-lg grid-cols-4 gap-3">
              <div className="text-center border-r border-slate-200 pr-2">
                <p className="text-base sm:text-lg font-extrabold text-[#0F1B3D]">1000+</p>
                <p className="text-[10px] text-slate-500 font-semibold">Happy Families</p>
              </div>
              <div className="text-center border-r border-slate-200 pr-2">
                <p className="text-base sm:text-lg font-extrabold text-[#0F1B3D]">50+</p>
                <p className="text-[10px] text-slate-500 font-semibold">Expert Therapists</p>
              </div>
              <div className="text-center border-r border-slate-200 pr-2">
                <p className="text-base sm:text-lg font-extrabold text-[#0F1B3D]">20+</p>
                <p className="text-[10px] text-slate-500 font-semibold">Specialized Programs</p>
              </div>
              <div className="text-center">
                <p className="text-base sm:text-lg font-extrabold text-[#0F1B3D]">5000+</p>
                <p className="text-[10px] text-slate-500 font-semibold">Sessions Conducted</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 2. OUR SPECIALIZED PROGRAMS (6 Clean Cards Without Images) ================= */}
      <section className="py-14 sm:py-16 lg:py-20 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Title */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-1.5">
            <Zap className="w-6 h-6 text-[#FFD60A] fill-[#FFD60A]" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F1B3D]">
              Our Specialized Programs
            </h2>
            <Zap className="w-6 h-6 text-[#FFD60A] fill-[#FFD60A]" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Comprehensive support for every child's development need.
          </p>
        </div>

        {/* 6 Program Cards Grid (Clean layout with icons, titles, bullet lists & circular arrow) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {programs.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleProgramClick(item.title)}
                className="group bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
              >
                <div>
                  {/* Icon & Title Header */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <div
                      className="w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300"
                      style={{ backgroundColor: item.bgColor }}
                    >
                      <IconComp
                        className="w-6.5 h-6.5"
                        style={{ color: item.color }}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-[#0F1B3D] leading-snug group-hover:text-[#0a2a59] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-normal leading-relaxed mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Bullets List */}
                  <ul className="space-y-2 my-5 pt-2 border-t border-slate-100">
                    {item.bullets.map((bullet, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2.5 text-xs font-semibold text-slate-700"
                      >
                        <CheckCircle2
                          className="w-4 h-4 shrink-0"
                          style={{ color: item.color }}
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Circular Arrow Button */}
                <div className="pt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-[#0F1B3D] transition-colors">
                    Explore Courses
                  </span>
                  <div
                    className="w-9 h-9 rounded-full text-white flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-sm"
                    style={{ backgroundColor: item.buttonColor }}
                  >
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ================= 3. WHY FAMILIES CHOOSE REHABLITO (5 PILLARS) ================= */}
      <section className="py-12 sm:py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F1B3D] text-center mb-10">
            Why Families Choose{" "}
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
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            {whyChoosePillars.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className="w-13 h-13 sm:w-15 sm:h-15 rounded-full flex items-center justify-center mb-3 shadow-xs"
                    style={{ backgroundColor: item.bgColor }}
                  >
                    <IconComp
                      className="w-6 h-6 sm:w-7.5 sm:h-7.5"
                      style={{ color: item.color }}
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#0F1B3D] max-w-[170px] leading-snug">
                    {item.title}
                  </h3>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================= 4. OUR APPROACH (5 CONNECTED STEPS) ================= */}
      <section className="py-14 sm:py-16 lg:py-20 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-1.5">
            <Zap className="w-6 h-6 text-[#FFD60A] fill-[#FFD60A]" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F1B3D]">
              Our Approach
            </h2>
            <Zap className="w-6 h-6 text-[#FFD60A] fill-[#FFD60A]" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Simple steps, life-changing outcomes for your child.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
          {approachSteps.map((stepItem, idx) => {
            const IconComp = stepItem.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col items-center justify-between"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: stepItem.bgColor }}
                >
                  <IconComp
                    className="w-6 h-6"
                    style={{ color: stepItem.color }}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0F1B3D] mb-1.5">
                    {stepItem.step}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed">
                    {stepItem.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ================= 5. READY TO START YOUR CHILD'S JOURNEY BANNER ================= */}
      <section className="pb-14 sm:pb-16 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="relative w-full bg-[#071838] text-white rounded-3xl p-8 sm:p-10 shadow-xl overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Content */}
          <div className="max-w-2xl text-center lg:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Ready to Start Your Child's{" "}
              <span className="text-[#E6007E]">Journey?</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Connect with our certified experts and find the right program tailored for your child's bright future.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleConsultation}
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-white text-[#0F1B3D] font-bold text-sm shadow-md hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span>Book a Free Consultation</span>
            <ArrowRight className="w-4 h-4 text-[#0F1B3D] transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* ================= 6. WHAT PARENTS SAY ================= */}
      <section className="pb-16 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-3 mb-1">
            <Zap className="w-6 h-6 text-[#FFD60A] fill-[#FFD60A]" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F1B3D]">
              What Parents Say
            </h2>
            <Zap className="w-6 h-6 text-[#FFD60A] fill-[#FFD60A]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {parentReviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between relative"
            >
              <Quote className="w-8 h-8 text-[#E6007E]/20 absolute top-6 right-6" />
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-6">
                "{rev.text}"
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <p className="text-xs font-bold text-[#0F1B3D]">– {rev.name}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="login"
      />
    </div>
  );
};

export default Programs;
