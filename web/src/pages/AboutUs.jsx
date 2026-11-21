import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Award,
  UserCheck,
  CheckCircle2,
  Users,
  Brain,
  MessageSquare,
  Activity,
  HeartHandshake,
  BookOpen,
  Baby,
  ArrowRight,
  ShieldCheck,
  Zap,
  Eye,
  Target,
  Smile,
  Compass,
  TrendingUp,
  Award as AwardIcon,
} from "lucide-react";
import AuthModal from "../components/AuthModal";

const AboutUs = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleConsultation = () => {
    const waUrl = `https://wa.me/919204786220?text=${encodeURIComponent(
      "Hello Rehablito Team, I want to know more about Rehablito Speech Therapy & Autism Center!"
    )}`;
    window.open(waUrl, "_blank");
  };

  // Why Families Trust Rehablito 6 Cards
  const trustFeatures = [
    {
      title: "Experienced Team",
      desc: "Certified and highly qualified professionals who care.",
      icon: Users,
      color: "#E6007E",
      bgColor: "#FCE7F3",
    },
    {
      title: "Personalized Plans",
      desc: "Individual therapy plans tailored to each child's needs.",
      icon: Target,
      color: "#9333EA",
      bgColor: "#F3E8FF",
    },
    {
      title: "Proven Results",
      desc: "Evidence-based approach with measurable progress.",
      icon: TrendingUp,
      color: "#16A34A",
      bgColor: "#DCFCE7",
    },
    {
      title: "Family Involvement",
      desc: "We work closely with families at every step of the journey.",
      icon: HeartHandshake,
      color: "#EA580C",
      bgColor: "#FFEDD5",
    },
    {
      title: "Safe & Supportive",
      desc: "A warm, inclusive and encouraging environment for every child.",
      icon: ShieldCheck,
      color: "#0284C7",
      bgColor: "#E0F2FE",
    },
    {
      title: "Holistic Development",
      desc: "Focus on communication, behavior, learning and independence.",
      icon: BookOpen,
      color: "#65A30D",
      bgColor: "#ECFCCB",
    },
  ];

  // 5 Step Approach
  const approachSteps = [
    {
      step: "1. Understand",
      description: "We listen, assess and understand your child's unique needs.",
      icon: MessageSquare,
      bgColor: "#FCE7F3",
      color: "#E6007E",
    },
    {
      step: "2. Plan",
      description: "We create a personalized therapy plan with clear goals.",
      icon: Target,
      bgColor: "#F3E8FF",
      color: "#9333EA",
    },
    {
      step: "3. Therapy",
      description: "Expert-led sessions using proven and engaging methods.",
      icon: Users,
      bgColor: "#DCFCE7",
      color: "#16A34A",
    },
    {
      step: "4. Progress",
      description: "We track progress regularly and adapt the plan as needed.",
      icon: TrendingUp,
      bgColor: "#FFEDD5",
      color: "#EA580C",
    },
    {
      step: "5. Empower",
      description: "We help your child achieve confidence, independence and joy.",
      icon: Smile,
      bgColor: "#E0F2FE",
      color: "#0284C7",
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
              alt="Rehablito About Us Banner"
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
                About Rehablito
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] font-extrabold tracking-tight leading-[1.12] text-[#0F1B3D] mb-4">
              We're Here to Help
              <br />
              Every Child Shine
              <br />
              Their{" "}
              <span className="inline-flex font-black tracking-tight">
                <span style={{ color: "#F51B22" }}>B</span>
                <span style={{ color: "#FF8A16" }}>r</span>
                <span style={{ color: "#FFE11A" }}>i</span>
                <span style={{ color: "#63B632" }}>g</span>
                <span style={{ color: "#2499C7" }}>h</span>
                <span style={{ color: "#E6007E" }}>t</span>
                <span style={{ color: "#A34773" }}>e</span>
                <span style={{ color: "#FFD51A" }}>s</span>
                <span style={{ color: "#FFE11A" }}>t</span>
              </span>
              .
            </h1>

            {/* Subtitle */}
            <p className="text-slate-800 text-xs sm:text-sm md:text-base lg:text-[1.05rem] font-semibold leading-relaxed max-w-[540px] mb-6">
              Rehablito Speech Therapy & Autism Center is dedicated to empowering
              children with special needs through personalized therapy, expert guidance, and compassionate care.
            </p>

            {/* 3 Feature Badges (Hidden on Phone View) */}
            <div className="hidden sm:grid grid-cols-3 gap-3 w-full max-w-[560px] mb-8">
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#FCE7F3] text-[#E6007E] flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#0F1B3D]">Child-Centered</p>
                  <p className="text-[10px] text-slate-500 font-medium">Personalized care</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#0F1B3D]">Evidence Based</p>
                  <p className="text-[10px] text-slate-500 font-medium">Modern techniques</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#0F1B3D]">Compassionate</p>
                  <p className="text-[10px] text-slate-500 font-medium">Safe environment</p>
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

      {/* ================= 2. OUR STORY (JOURNEY OF PASSION, PURPOSE & IMPACT) ================= */}
      <section className="py-14 sm:py-16 lg:py-20 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Story Text Header */}
        <div className="max-w-4xl mx-auto text-center mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FCE7F3] text-[#E6007E] text-xs font-extrabold shadow-xs">
            <Heart className="w-4 h-4 fill-[#E6007E]" />
            <span>Our Story</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F1B3D] leading-tight">
            A Journey of Passion, Purpose &{" "}
            <span className="inline-flex font-black tracking-tight">
              <span style={{ color: "#F51B22" }}>I</span>
              <span style={{ color: "#FF8A16" }}>m</span>
              <span style={{ color: "#FFE11A" }}>p</span>
              <span style={{ color: "#63B632" }}>a</span>
              <span style={{ color: "#2499C7" }}>c</span>
              <span style={{ color: "#E6007E" }}>t</span>
            </span>
            .
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto">
            Rehablito was founded with a simple yet powerful belief – that every child deserves the right support to reach their full potential. What started as a small initiative has grown into a trusted center for speech therapy, autism care, and pediatric rehabilitation programs.
          </p>
        </div>

        {/* Full-Width Uncropped Reception Image */}
        <div className="w-full max-w-[1400px] mx-auto my-8 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white group">
          <img
            src="https://ik.imagekit.io/5glnyqfxu/Courses/Rehab.webp"
            alt="Rehablito Speech Therapy & Autism Center"
            className="w-full h-auto object-contain rounded-2xl group-hover:scale-[1.01] transition-transform duration-500"
          />
        </div>

        {/* 3 Pillar Cards (Vision, Mission, Values) Below Image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1400px] mx-auto mt-10">
          {/* Our Vision Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md flex items-start gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0 shadow-xs">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F1B3D] mb-1">
                Our Vision
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                A world where every child communicates, learns and lives with confidence and independence.
              </p>
            </div>
          </div>

          {/* Our Mission Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md flex items-start gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 shadow-xs">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F1B3D] mb-1">
                Our Mission
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                To provide exceptional therapy and support that empowers children and strengthens families.
              </p>
            </div>
          </div>

          {/* Our Values Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md flex items-start gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0 shadow-xs">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F1B3D] mb-1">
                Our Values
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                Empathy, integrity, excellence, collaboration and respect in every therapy session we conduct.
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* ================= 3. WHY FAMILIES TRUST REHABLITO (6 CARDS) ================= */}
      <section className="py-14 sm:py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F1B3D] text-center mb-10">
            Why Families Trust{" "}
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
            ?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 text-center">
            {trustFeatures.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50/70 p-5 rounded-3xl border border-slate-200/80 flex flex-col items-center justify-between"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-xs"
                    style={{ backgroundColor: item.bgColor }}
                  >
                    <IconComp
                      className="w-6 h-6"
                      style={{ color: item.color }}
                    />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#0F1B3D] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================= 4. OUR APPROACH (5 COLORFUL CONNECTED STEPS) ================= */}
      <section className="py-14 sm:py-16 lg:py-20 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="bg-[#071838] text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden border border-slate-800 relative">
          
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center gap-2 mb-2">
              <Zap className="w-6 h-6 text-[#FFD60A] fill-[#FFD60A]" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
                Our Approach
              </h2>
              <Zap className="w-6 h-6 text-[#FFD60A] fill-[#FFD60A]" />
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Simple steps, life-changing outcomes for your child.
            </p>
          </div>

          {/* 5 Full Width Colorful Steps Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {approachSteps.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 flex flex-col items-center justify-between text-center hover:bg-white/20 hover:-translate-y-2 transition-all duration-300 group shadow-lg"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: step.bgColor }}
                  >
                    <IconComp
                      className="w-7 h-7"
                      style={{ color: step.color }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white mb-2">
                      {step.step}
                    </h3>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================= 5. JOIN THE REHABLITO FAMILY TODAY BANNER ================= */}
      <section className="pb-16 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md flex flex-col lg:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-5 flex-col sm:flex-row text-center sm:text-left">
            <img
              src="https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=300&auto=format&fit=crop&q=80"
              alt="Happy Family"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-sm"
            />
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F1B3D] mb-1">
                Join the{" "}
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
                </span>{" "}
                Family Today!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Let's work together to bring out the best in your child.
              </p>
            </div>
          </div>

          <button
            onClick={handleConsultation}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#0F1B3D] text-white font-bold text-xs sm:text-sm shadow-md hover:bg-[#1a2e5c] active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span>Book a Free Consultation</span>
            <ArrowRight className="w-4 h-4" />
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

export default AboutUs;
