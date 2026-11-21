import React, { useState } from "react";
import {
  Users,
  GraduationCap,
  UserCheck,
  Calendar,
  Award,
  MessageCircle,
  Send,
  Mail,
} from "lucide-react";

const StatsAndNewsletter = () => {
  const [whatsappNum, setWhatsappNum] = useState("92047 86220");

  const stats = [
    {
      value: "1000+",
      label: "Happy Families",
      icon: Users,
      color: "#E6007E",
      bgColor: "#E6007E1A",
    },
    {
      value: "50+",
      label: "Expert Courses",
      icon: GraduationCap,
      color: "#63DA6B",
      bgColor: "#63DA6B1A",
    },
    {
      value: "20+",
      label: "Expert Therapists",
      icon: UserCheck,
      color: "#FFD60A",
      bgColor: "#FFD60A1A",
    },
    {
      value: "5000+",
      label: "Sessions Conducted",
      icon: Calendar,
      color: "#40D6EF",
      bgColor: "#40D6EF1A",
    },
    {
      value: "98%",
      label: "Satisfaction Rate",
      icon: Award,
      color: "#9333EA",
      bgColor: "#9333EA1A",
    },
  ];

  const handleWhatsAppConnect = (e) => {
    e.preventDefault();
    const cleanNumber = whatsappNum.replace(/\D/g, "");
    const targetNumber = cleanNumber.length >= 10 ? cleanNumber : "919204786220";
    const waUrl = `https://wa.me/${targetNumber.startsWith("91") ? targetNumber : "91" + targetNumber}?text=${encodeURIComponent(
      "Hello Rehablito Team, I want to get updates on courses and guidance!"
    )}`;
    window.open(waUrl, "_blank");
  };

  return (
    <section className="w-full bg-[#F8FAFC] pb-14 sm:pb-16 lg:pb-20 text-[#0F1B3D]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 space-y-6 sm:space-y-8">
        
        {/* ================= 1. DARK NAVY STATS BANNER ================= */}
        <div className="w-full bg-[#071838] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-0 divide-y sm:divide-y-0 lg:divide-x divide-slate-800/80">
            {stats.map((stat, idx) => {
              const IconComp = stat.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-center gap-3 sm:gap-4 px-2 sm:px-4 py-3 sm:py-0 ${
                    idx > 0 ? "pt-4 sm:pt-0" : ""
                  }`}
                >
                  <div
                    className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <IconComp
                      className="w-5 h-5 sm:w-6.5 sm:h-6.5"
                      style={{ color: stat.color }}
                    />
                  </div>

                  <div className="text-left">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-none">
                      {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= 2. LIGHT BLUE WHATSAPP / STAY UPDATED BANNER ================= */}
        <div className="relative w-full bg-[#F0F9FF] border border-sky-100 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          
          {/* Paper Airplane Decoration Right Side */}
          <div className="absolute top-4 right-8 z-10 pointer-events-none hidden sm:block">
            <svg
              className="w-24 h-16 text-[#40D6EF]/40"
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
            <div className="absolute top-1 right-2">
              <svg
                className="w-8 h-8 text-[#FFD60A] -rotate-12 drop-shadow-sm"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>
          </div>

          {/* Left Content Area (Envelope Icon + Text) */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center text-center sm:text-left gap-4 sm:gap-6 z-10 max-w-2xl">
            
            {/* Envelope Icon with Notification Badge 1 */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-100/80 flex items-center justify-center shadow-sm">
                <Mail className="w-9 h-9 sm:w-11 sm:h-11 text-amber-500 fill-amber-400" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-extrabold flex items-center justify-center shadow-md border-2 border-white">
                1
              </span>
            </div>

            {/* Headline & Description */}
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0F1B3D] mb-1.5">
                Stay Updated with{" "}
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
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Subscribe via WhatsApp for the latest courses, parenting tips,
                expert advice and special updates.
              </p>
            </div>
          </div>

          {/* Right Input / WhatsApp Action Form */}
          <form
            onSubmit={handleWhatsAppConnect}
            className="w-full lg:w-auto z-10 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-0 bg-white p-1.5 sm:p-2 rounded-2xl sm:rounded-full border border-slate-200 shadow-md max-w-md lg:max-w-none"
          >
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 w-full sm:w-64 lg:w-72">
              <MessageCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <input
                type="text"
                value={whatsappNum}
                onChange={(e) => setWhatsappNum(e.target.value)}
                placeholder="Enter WhatsApp number"
                className="w-full bg-transparent text-sm font-semibold text-[#0F1B3D] placeholder-slate-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4 fill-white" />
              <span>Connect on WhatsApp</span>
            </button>
          </form>

        </div>

      </div>
    </section>
  );
};

export default StatsAndNewsletter;
