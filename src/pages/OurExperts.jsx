import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Award,
  UserCheck,
  Users,
  Brain,
  MessageSquare,
  Activity,
  HeartHandshake,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Linkedin,
  Mail,
  GraduationCap,
  BookMarked,
  Stethoscope,
  Smile,
} from "lucide-react";
import AuthModal from "../components/AuthModal";

const OurExperts = () => {
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleConsultation = () => {
    const waUrl = `https://wa.me/919204786220?text=${encodeURIComponent(
      "Hello Rehablito Team, I would like to book a consultation with your expert therapists!"
    )}`;
    window.open(waUrl, "_blank");
  };

  // 5 Expert Therapists Data
  const experts = [
    {
      id: 1,
      name: "Dr. Priya Sharma",
      role: "Clinical Psychologist",
      experience: "8+ Years Experience",
      bio: "Specialist in child development, autism assessment & behaviour therapy.",
      icon: Brain,
      color: "#E6007E",
      bgColor: "#FCE7F3",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      name: "Mr. Rahul Verma",
      role: "Speech Language Pathologist",
      experience: "6+ Years Experience",
      bio: "Expert in speech delay, language disorders & communication therapy.",
      icon: MessageSquare,
      color: "#9333EA",
      bgColor: "#F3E8FF",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80",
    },
    {
      id: 3,
      name: "Ms. Neha Kapoor",
      role: "Occupational Therapist",
      experience: "7+ Years Experience",
      bio: "Focuses on motor skills, sensory integration & daily living activities.",
      icon: Activity,
      color: "#16A34A",
      bgColor: "#DCFCE7",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&auto=format&fit=crop&q=80",
    },
    {
      id: 4,
      name: "Ms. Anjali Mehta",
      role: "Behaviour Therapist",
      experience: "5+ Years Experience",
      bio: "Specialist in behaviour modification, social skills & emotional regulation.",
      icon: HeartHandshake,
      color: "#EA580C",
      bgColor: "#FFEDD5",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
    },
    {
      id: 5,
      name: "Mr. Arjun Nair",
      role: "Special Educator",
      experience: "6+ Years Experience",
      bio: "Experienced in special education planning, learning disabilities & inclusive education.",
      icon: BookOpen,
      color: "#0284C7",
      bgColor: "#E0F2FE",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=80",
    },
  ];

  // Why Our Experts Make a Difference Features
  const differences = [
    {
      title: "Advanced Qualifications",
      desc: "Our team holds advanced degrees and certifications in their respective fields.",
      icon: GraduationCap,
      color: "#E6007E",
      bgColor: "#FCE7F3",
    },
    {
      title: "Continuous Learning",
      desc: "We stay updated with the latest research, techniques and global best practices.",
      icon: BookMarked,
      color: "#9333EA",
      bgColor: "#F3E8FF",
    },
    {
      title: "Collaborative Approach",
      desc: "Our experts work together to create personalized plans for every child.",
      icon: Users,
      color: "#16A34A",
      bgColor: "#DCFCE7",
    },
    {
      title: "Compassionate Care",
      desc: "We treat every child with patience, respect and unwavering support.",
      icon: Heart,
      color: "#EA580C",
      bgColor: "#FFEDD5",
    },
    {
      title: "Proven Results",
      desc: "Our approach ensures measurable progress and happier families.",
      icon: ShieldCheck,
      color: "#0284C7",
      bgColor: "#E0F2FE",
    },
  ];

  return (
    <div className="w-full bg-[#F8FAFC] font-sans text-[#0F1B3D]">
      
      {/* ================= 1. HERO SECTION WITH RESPONSIVE ARehab BACKGROUND IMAGES ================= */}
      <section className="relative w-full h-screen min-h-screen overflow-hidden flex items-start lg:items-center pt-28 sm:pt-32 lg:pt-28 pb-12">
        
        {/* Responsive Background Banner Images (100% Full Screen Cover) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <picture className="w-full h-full block">
            {/* Desktop Banner Image */}
            <source
              media="(min-width: 1024px)"
              srcSet="https://ik.imagekit.io/5glnyqfxu/Courses/ARehab.webp"
            />
            {/* Mobile / Phone Banner Image */}
            <img
              src="https://ik.imagekit.io/5glnyqfxu/Courses/ARehabPhone.webp"
              alt="Rehablito Experts Banner"
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
                Our Experts
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] font-extrabold tracking-tight leading-[1.12] text-[#0F1B3D] mb-4">
              Experienced Minds.
              <br />
              Compassionate Hearts.
              <br />
              Better{" "}
              <span className="inline-flex font-black tracking-tight">
                <span style={{ color: "#F51B22" }}>O</span>
                <span style={{ color: "#FF8A16" }}>u</span>
                <span style={{ color: "#FFE11A" }}>t</span>
                <span style={{ color: "#63B632" }}>c</span>
                <span style={{ color: "#2499C7" }}>o</span>
                <span style={{ color: "#E6007E" }}>m</span>
                <span style={{ color: "#A34773" }}>e</span>
                <span style={{ color: "#FFD51A" }}>s</span>
              </span>
              .
            </h1>

            {/* Subtitle */}
            <p className="text-slate-800 text-xs sm:text-sm md:text-base lg:text-[1.05rem] font-semibold leading-relaxed max-w-[540px] mb-6">
              Our team of certified therapists and specialists are dedicated to
              supporting your child's growth with expertise, empathy and evidence-based care.
            </p>

            {/* 3 Feature Badges (Hidden on Phone View) */}
            <div className="hidden sm:grid grid-cols-3 gap-3 w-full max-w-[560px] mb-8">
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#FCE7F3] text-[#E6007E] flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#0F1B3D]">Highly Qualified</p>
                  <p className="text-[10px] text-slate-500 font-medium">Certified pros</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#0F1B3D]">Child-Centered</p>
                  <p className="text-[10px] text-slate-500 font-medium">Personalized care</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#0F1B3D]">Evidence Based</p>
                  <p className="text-[10px] text-slate-500 font-medium">Research therapies</p>
                </div>
              </div>
            </div>

            {/* 5 Stats Banner (Hidden on Phone View) */}
            <div className="hidden sm:grid w-full max-w-[660px] bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-4 shadow-lg grid-cols-5 gap-2">
              <div className="text-center border-r border-slate-200 pr-1">
                <p className="text-base sm:text-lg font-extrabold text-[#0F1B3D]">1000+</p>
                <p className="text-[10px] text-slate-500 font-semibold">Happy Families</p>
              </div>
              <div className="text-center border-r border-slate-200 pr-1">
                <p className="text-base sm:text-lg font-extrabold text-[#0F1B3D]">50+</p>
                <p className="text-[10px] text-slate-500 font-semibold">Therapists</p>
              </div>
              <div className="text-center border-r border-slate-200 pr-1">
                <p className="text-base sm:text-lg font-extrabold text-[#0F1B3D]">20+</p>
                <p className="text-[10px] text-slate-500 font-semibold">Programs</p>
              </div>
              <div className="text-center border-r border-slate-200 pr-1">
                <p className="text-base sm:text-lg font-extrabold text-[#0F1B3D]">5000+</p>
                <p className="text-[10px] text-slate-500 font-semibold">Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-base sm:text-lg font-extrabold text-[#0F1B3D]">98%</p>
                <p className="text-[10px] text-slate-500 font-semibold">Satisfaction</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 2. MEET OUR EXPERT TEAM ================= */}
      <section className="py-14 sm:py-16 lg:py-20 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Title */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-1.5">
            <Zap className="w-6 h-6 text-[#FFD60A] fill-[#FFD60A]" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F1B3D]">
              Meet Our Expert Team
            </h2>
            <Zap className="w-6 h-6 text-[#FFD60A] fill-[#FFD60A]" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Dedicated professionals committed to your child's progress.
          </p>
        </div>

        {/* 5 Expert Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {experts.map((exp) => {
            const IconComp = exp.icon;
            return (
              <div
                key={exp.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Doctor Avatar Image Container */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={exp.image}
                    alt={exp.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Floating Role Badge Icon */}
                  <div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                    style={{ backgroundColor: exp.bgColor }}
                  >
                    <IconComp className="w-5 h-5" style={{ color: exp.color }} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 text-center flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0F1B3D] leading-snug">
                      {exp.name}
                    </h3>
                    <p
                      className="text-xs font-bold mt-0.5"
                      style={{ color: exp.color }}
                    >
                      {exp.role}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">
                      {exp.experience}
                    </p>

                    <p className="text-xs text-slate-500 font-normal leading-relaxed mt-3 line-clamp-3">
                      {exp.bio}
                    </p>
                  </div>

                  {/* Social Buttons */}
                  <div className="flex items-center justify-center gap-2 pt-4 mt-3 border-t border-slate-100">
                    <button
                      onClick={handleConsultation}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#0F1B3D] hover:text-white text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                      title="Contact Specialist"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleConsultation}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#0F1B3D] hover:text-white text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                      title="Send Message"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ================= 3. WHY OUR EXPERTS MAKE A DIFFERENCE ================= */}
      <section className="py-14 sm:py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center mb-10">
            <div className="lg:col-span-1 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B3D] leading-tight mb-3">
                Why Our Experts Make a{" "}
                <span className="inline-flex font-black tracking-tight">
                  <span style={{ color: "#F51B22" }}>D</span>
                  <span style={{ color: "#FF8A16" }}>i</span>
                  <span style={{ color: "#FFE11A" }}>f</span>
                  <span style={{ color: "#63B632" }}>f</span>
                  <span style={{ color: "#2499C7" }}>e</span>
                  <span style={{ color: "#E6007E" }}>r</span>
                  <span style={{ color: "#A34773" }}>e</span>
                  <span style={{ color: "#FFD51A" }}>n</span>
                  <span style={{ color: "#FFE11A" }}>c</span>
                  <span style={{ color: "#63B632" }}>e</span>
                </span>
                ?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mb-4">
                Our experts combine knowledge, experience and empathy to deliver the best outcomes for your child.
              </p>
              <button
                onClick={handleConsultation}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 text-xs font-bold text-[#0F1B3D] hover:bg-[#0F1B3D] hover:text-white transition-colors cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 5 Feature Cards */}
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
              {differences.map((diff, idx) => {
                const IconComp = diff.icon;
                return (
                  <div
                    key={idx}
                    className="bg-slate-50/70 p-4 rounded-3xl border border-slate-200/70 flex flex-col items-center justify-between"
                  >
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: diff.bgColor }}
                    >
                      <IconComp
                        className="w-5.5 h-5.5"
                        style={{ color: diff.color }}
                      />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-[#0F1B3D] mb-1">
                        {diff.title}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-normal leading-relaxed line-clamp-3">
                        {diff.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ================= 4. BOOK A FREE CONSULTATION BANNER ================= */}
      <section className="py-14 sm:py-16 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="relative w-full bg-[#071838] text-white rounded-3xl p-8 sm:p-10 shadow-xl overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
          
          <div className="max-w-2xl text-center lg:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Book a Free <span className="text-[#FFD60A]">Consultation</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Connect with our experts and take the first step towards your child's brighter future.
            </p>
          </div>

          <button
            onClick={handleConsultation}
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-white text-[#0F1B3D] font-bold text-sm shadow-md hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span>Book Now</span>
            <ArrowRight className="w-4 h-4 text-[#0F1B3D] transition-transform group-hover:translate-x-1" />
          </button>
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

export default OurExperts;
