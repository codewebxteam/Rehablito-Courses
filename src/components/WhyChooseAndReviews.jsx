import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  Award,
  Clock,
  Users,
  TrendingUp,
  ShieldCheck,
  Star,
  Quote,
  Wallet,
  Sparkles,
  Stethoscope,
} from "lucide-react";

const WhyChooseAndReviews = () => {
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  // 9 Features data for Left Box (Why Choose Rehablito?)
  const features = [
    {
      title: "Expert Guidance",
      description: "Learn from certified and experienced professionals.",
      icon: UserCheck,
      bgColor: "#E0F2FE",
      color: "#0284C7",
    },
    {
      title: "Evidence Based",
      description: "All our programs are backed by research and proven techniques.",
      icon: Award,
      bgColor: "#DCFCE7",
      color: "#16A34A",
    },
    {
      title: "Flexible Learning",
      description: "Learn anytime, anywhere at your own pace.",
      icon: Clock,
      bgColor: "#F3E8FF",
      color: "#9333EA",
    },
    {
      title: "Family Support",
      description: "Dedicated support for parents and caregivers at every step.",
      icon: Users,
      bgColor: "#FFEDD5",
      color: "#EA580C",
    },
    {
      title: "Progress Tracking",
      description: "Monitor your child's improvement with smart assessment tools.",
      icon: TrendingUp,
      bgColor: "#FCE7F3",
      color: "#E6007E",
    },
    {
      title: "Safe & Trusted",
      description: "A secure and trusted platform for your child's growth.",
      icon: ShieldCheck,
      bgColor: "#CCFBF1",
      color: "#0D9488",
    },
    {
      title: "Affordable Care",
      description: "Quality therapy & guidance accessible for every family.",
      icon: Wallet,
      bgColor: "#FEF9C3",
      color: "#CA8A04",
    },
    {
      title: "1-on-1 Sessions",
      description: "Personalized attention tailored to your child's needs.",
      icon: Sparkles,
      bgColor: "#FFE4E6",
      color: "#E11D48",
    },
    {
      title: "Certified Doctors",
      description: "Multidisciplinary team of top rehabilitation specialists.",
      icon: Stethoscope,
      bgColor: "#E0E7FF",
      color: "#4F46E5",
    },
  ];

  // Exact Real Reviews provided by the User with Authentic Indian Avatars
  const reviews = [
    {
      name: "Pintu Kumar",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
      text: "I went to many centres to get my child treated but till date I did not find anyone better than Rehablito charitable foundation which is selflessly working for the needy people and is committed to make India autism-free.",
      badgeColor: "#FFE11A",
    },
    {
      name: "Shubham Kumar",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
      text: "In my opinion, there is no better autism organization than this which is standing with the needy for free and is doing rehabilitation which is the work of the government.",
      badgeColor: "#FF8A16",
    },
    {
      name: "Priyanka Singh",
      avatar: "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=150&auto=format&fit=crop&q=80",
      text: "Best physiotherapy centre in Patna with best doctors team. Highly professional and dedicated staff!",
      badgeColor: "#E6007E",
    },
    {
      name: "Amarjeet Kumar",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      text: "Professional friendly and effective treatment. The therapists truly care about their patients. Thanks to this centre, I'm back on my feet! Great team, wonderful experience 👏 Five Stars isn't enough!!",
      badgeColor: "#2499C7",
    },
  ];

  // Auto rotate reviews every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <section className="w-full bg-[#F8FAFC] py-12 sm:py-16 lg:py-20 text-[#0F1B3D]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          
          {/* ================= LEFT BOX: Why Choose Rehablito? (9 Cards Grid) ================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200/80 flex flex-col justify-between h-full">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F1B3D] text-center mb-8 sm:mb-10">
                Why Choose{" "}
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

              <div className="grid grid-cols-3 gap-2.5 sm:gap-5 md:gap-6 text-center">
                {features.map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center p-1.5 sm:p-3 rounded-2xl hover:bg-slate-50/80 transition-colors duration-200"
                    >
                      <div
                        className="w-11 h-11 sm:w-15 sm:h-15 rounded-full flex items-center justify-center mb-2 sm:mb-3 transition-transform hover:scale-110 duration-300 shadow-xs"
                        style={{ backgroundColor: item.bgColor }}
                      >
                        <IconComp
                          className="w-5 h-5 sm:w-7.5 sm:h-7.5"
                          style={{ color: item.color }}
                        />
                      </div>
                      <h3 className="text-xs sm:text-base font-bold text-[#0F1B3D] mb-1 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-normal leading-relaxed max-w-[190px]">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================= RIGHT BOX: What Parents Say ================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200/80 relative flex flex-col justify-between h-full min-h-[500px]">
            
            {/* Top Bar with Title & Large Decorative Quote */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F1B3D]">
                What <span className="text-[#E6007E]">Parents</span> Say
              </h2>

              {/* Large Pink Quote Icon */}
              <div className="text-[#E6007E]/20 text-5xl font-serif">
                <Quote className="w-12 h-12 text-[#E6007E] fill-[#E6007E]/10" />
              </div>
            </div>

            {/* Reviews Cards Slider / List */}
            <div className="space-y-4 my-auto">
              {reviews.map((rev, index) => {
                const isActive = index === activeReviewIndex;
                return (
                  <motion.div
                    key={rev.name}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0.65,
                      scale: isActive ? 1 : 0.98,
                    }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setActiveReviewIndex(index)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-slate-50/90 border-slate-200 shadow-md"
                        : "bg-white border-slate-100 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={rev.avatar}
                          alt={rev.name}
                          className="w-11 h-11 sm:w-13 sm:h-13 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <span
                          className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white"
                          style={{ backgroundColor: rev.badgeColor }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-2.5">
                          "{rev.text}"
                        </p>

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-xs sm:text-sm font-bold text-[#0F1B3D]">
                            – {rev.name}
                          </p>

                          {/* 5 Gold Stars */}
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#FFB800] text-[#FFB800]"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination Dots at Bottom */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveReviewIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === activeReviewIndex
                      ? "w-7 bg-[#E6007E]"
                      : "w-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseAndReviews;
