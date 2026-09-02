import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowRight,
  CheckCircle2,
  Globe,
  MessageSquare,
  Clock,
  Calendar,
  Zap,
  Heart,
  ShieldCheck,
  Award,
  Users,
  Smile,
  ExternalLink,
} from "lucide-react";

const ContactUs = () => {
  const [formState, setFormState] = useState("idle");

  const contactEmail = "rehablito@gmail.com";
  const contactPhone = "+91 92047 86220";
  const contactAddress = "no 6c, 6c, RK Ave, behind DR A K Agarwal, near gold's gym, Dujra, Rajendra Nagar, Patna, Bihar 800016";
  const googleMapsUrl = "https://www.google.com/maps/dir/26.7091928,83.4540611/Rehablito+Physio+%26+Autism+Center,+no+6c,+6c,+RK+Ave,+behind+DR+A+K+Agarwal,+near+gold's+gym,+Dujra,+Rajendra+Nagar,+Patna,+Bihar+800016/@26.1718045,82.9931645,437455m/data=!3m2!1e3!4b1!4m9!4m8!1m1!4e1!1m5!1m1!1s0x39ed59e9fa0aba19:0x2fe67e58a852a940!2m2!1d85.1647886!2d25.6098294?entry=ttu&g_ep=EgoyMDI2MDgzMC4wIKXMDSoASAFQAw%3D%3D";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWhatsAppRedirect = (customText) => {
    const textToEncode = customText || "Hello Rehablito Team, I want to book a consultation for my child!";
    const waUrl = `https://wa.me/919204786220?text=${encodeURIComponent(textToEncode)}`;
    window.open(waUrl, "_blank");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormState("submitting");

    const waMessage = `
*New Website Contact Inquiry* 🚀
----------------------------
👤 *Name:* ${formData.name}
📞 *Phone:* ${formData.phone || "Not Provided"}
📧 *Email:* ${formData.email}
📝 *Subject:* ${formData.subject}
----------------------------
💬 *Message:*
${formData.message}
    `.trim();

    setTimeout(() => {
      handleWhatsAppRedirect(waMessage);
      setFormState("success");
    }, 800);
  };

  // Why Visit Rehablito 5 Features
  const whyVisitFeatures = [
    {
      title: "Child-Centered Care",
      desc: "Every therapy plan is customized to your child's unique needs.",
      icon: Heart,
      color: "#E6007E",
      bgColor: "#FCE7F3",
    },
    {
      title: "Expert Professionals",
      desc: "Certified and experienced therapists dedicated to your child's progress.",
      icon: Award,
      color: "#16A34A",
      bgColor: "#DCFCE7",
    },
    {
      title: "Compassionate Support",
      desc: "We treat every child with empathy, patience and respect.",
      icon: Smile,
      color: "#EA580C",
      bgColor: "#FFEDD5",
    },
    {
      title: "Proven Results",
      desc: "Evidence-based therapies that help children achieve real progress.",
      icon: ShieldCheck,
      color: "#0284C7",
      bgColor: "#E0F2FE",
    },
    {
      title: "Safe & Friendly Space",
      desc: "A warm, inclusive and secure environment for learning and growth.",
      icon: Users,
      color: "#9333EA",
      bgColor: "#F3E8FF",
    },
  ];

  return (
    <div className="w-full bg-[#F8FAFC] font-sans text-[#0F1B3D]">
      
      {/* ================= 1. HERO SECTION WITH RESPONSIVE ARehab BACKGROUND IMAGES ================= */}
      <section className="relative w-full h-screen min-h-screen overflow-hidden flex items-start lg:items-center pt-28 sm:pt-32 lg:pt-28 pb-12">
        
        {/* Responsive Background Banner Images (ARehab / ARehabPhone) */}
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
              alt="Rehablito Contact Banner"
              className="w-full h-full object-fill lg:object-cover object-top lg:object-right"
              loading="eager"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/40 to-transparent lg:from-white/80 lg:via-white/40 lg:to-transparent" />
        </div>

        {/* Hero Overlay Content */}
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-4">
          <div className="w-full lg:w-[50%] flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-md mb-4">
              <Heart className="w-4 h-4 text-[#E6007E] fill-[#E6007E]" />
              <span className="text-xs sm:text-sm font-bold text-[#0F1B3D]">
                Contact Us
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] font-extrabold tracking-tight leading-[1.12] text-[#0F1B3D] mb-4">
              We're Here to Help
              <br />
              <span className="inline-flex font-black tracking-tight">
                <span style={{ color: "#F51B22" }}>Y</span>
                <span style={{ color: "#FF8A16" }}>o</span>
                <span style={{ color: "#FFE11A" }}>u</span>
              </span>{" "}
              & Your{" "}
              <span className="inline-flex font-black tracking-tight">
                <span style={{ color: "#63B632" }}>C</span>
                <span style={{ color: "#2499C7" }}>h</span>
                <span style={{ color: "#E6007E" }}>i</span>
                <span style={{ color: "#A34773" }}>l</span>
                <span style={{ color: "#FFD51A" }}>d</span>
              </span>
              .
            </h1>

            {/* Minimal Subtitle */}
            <p className="text-slate-800 text-xs sm:text-sm md:text-base font-semibold leading-relaxed max-w-[500px] mb-6">
              Have questions or need guidance? Our team is ready to support you. Reach out to us anytime!
            </p>

            {/* 4 Contact Quick Cards */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-[540px]">
              <div
                onClick={() => handleWhatsAppRedirect()}
                className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-9 h-9 rounded-full bg-[#FCE7F3] text-[#E6007E] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[11px] font-extrabold text-[#0F1B3D] truncate">{contactPhone}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Mon - Sat, 9am - 6pm</p>
                </div>
              </div>

              <a
                href={`mailto:${contactEmail}`}
                className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-9 h-9 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[11px] font-extrabold text-[#0F1B3D] truncate">{contactEmail}</p>
                  <p className="text-[10px] text-slate-500 font-medium">We reply in 24 hours</p>
                </div>
              </a>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-9 h-9 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[11px] font-extrabold text-[#0F1B3D] truncate">Patna, Bihar 800016</p>
                  <p className="text-[10px] text-slate-500 font-medium">Visit our center</p>
                </div>
              </a>

              <div
                onClick={() => handleWhatsAppRedirect()}
                className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-9 h-9 rounded-full bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[11px] font-extrabold text-[#0F1B3D] truncate">Book Consultation</p>
                  <p className="text-[10px] text-slate-500 font-medium">Schedule 1-on-1 session</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 2. MAIN CONTACT FORM & GET IN TOUCH ================= */}
      <section className="py-14 sm:py-16 lg:py-20 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Left Form: Send Us a Message */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-md">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-[#FFD60A] fill-[#FFD60A]" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F1B3D]">
                  Send Us a Message
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Fill out the form and our team will get back to you on WhatsApp.
              </p>
            </div>

            {formState === "success" ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 bg-[#DCFCE7] text-[#16A34A] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#0F1B3D]">
                  Opening WhatsApp Chat...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We are redirecting your query directly to our expert support team on WhatsApp.
                </p>
                <button
                  onClick={() => setFormState("idle")}
                  className="px-6 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 p-3 rounded-2xl border border-slate-200 focus:border-[#0F1B3D] outline-none text-xs font-semibold text-[#0F1B3D]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      placeholder="+91 92047 86220"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 p-3 rounded-2xl border border-slate-200 focus:border-[#0F1B3D] outline-none text-xs font-semibold text-[#0F1B3D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      placeholder="rehablito@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 p-3 rounded-2xl border border-slate-200 focus:border-[#0F1B3D] outline-none text-xs font-semibold text-[#0F1B3D]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 p-3 rounded-2xl border border-slate-200 focus:border-[#0F1B3D] outline-none text-xs font-semibold text-[#0F1B3D] cursor-pointer"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Autism / ADHD Guidance">Autism / ADHD Guidance</option>
                      <option value="Speech Therapy Inquiry">Speech Therapy Inquiry</option>
                      <option value="Occupational Therapy">Occupational Therapy</option>
                      <option value="Behaviour Therapy">Behaviour Therapy</option>
                      <option value="Special Education">Special Education</option>
                      <option value="Book Free Consultation">Book Free Consultation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="4"
                    name="message"
                    placeholder="Type your message here..."
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 p-3 rounded-2xl border border-slate-200 focus:border-[#0F1B3D] outline-none text-xs font-medium text-[#0F1B3D] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="w-full py-3.5 rounded-full bg-[#0F1B3D] text-white font-bold text-xs sm:text-sm hover:bg-[#1a2e5c] active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Send Message</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Right Card: Get in Touch Quick Info */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-[#FFD60A] fill-[#FFD60A]" />
                <h2 className="text-xl font-extrabold text-[#0F1B3D]">Get in Touch</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-6">
                Multiple ways to connect with our care team.
              </p>

              <div className="space-y-5">
                {/* Phone */}
                <div
                  onClick={() => handleWhatsAppRedirect()}
                  className="flex items-start gap-3.5 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FCE7F3] text-[#E6007E] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#0F1B3D]">Call / WhatsApp Us</p>
                    <p className="text-xs font-bold text-[#E6007E]">{contactPhone}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Mon - Sat: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>

                {/* Email */}
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-start gap-3.5 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#0F1B3D]">Email Us</p>
                    <p className="text-xs font-bold text-[#16A34A]">{contactEmail}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">We reply within 24 hours</p>
                  </div>
                </a>

                {/* Address */}
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3.5 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#0F1B3D]">Visit Us</p>
                    <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                      no 6c, 6c, RK Ave, behind DR A K Agarwal, near gold's gym, Dujra, Rajendra Nagar, Patna, Bihar 800016
                    </p>
                    <span className="text-[11px] font-bold text-[#EA580C] underline inline-flex items-center gap-1 mt-1">
                      <span>Get directions</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </a>

                {/* Website */}
                <a
                  href="https://www.rehablito.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3.5 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#0F1B3D]">Website</p>
                    <p className="text-xs font-bold text-[#9333EA]">www.rehablito.com</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Explore our therapy programs</p>
                  </div>
                </a>

                {/* Consultation */}
                <div
                  onClick={() => handleWhatsAppRedirect()}
                  className="flex items-start gap-3.5 cursor-pointer group pt-2 border-t border-slate-100"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#0F1B3D]">Book a Consultation</p>
                    <p className="text-[10px] text-slate-500 font-medium">Schedule a free 1-on-1 session</p>
                    <span className="text-xs font-bold text-[#0284C7] inline-flex items-center gap-1 mt-1">
                      <span>Book Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= 3. GOOGLE MAPS INTERACTIVE LOCATION SECTION ================= */}
      <section className="pb-14 sm:pb-16 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-lg h-[360px] bg-slate-100">
          
          {/* Embedded Map */}
          <iframe
            title="Rehablito Patna Location"
            src="https://maps.google.com/maps?q=25.6098294,85.1647886&t=&z=15&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0"
            allowFullScreen=""
            loading="lazy"
          ></iframe>

          {/* Floating Location Card */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 max-w-sm bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-slate-200">
            <h3 className="text-sm font-extrabold text-[#0F1B3D] mb-1">
              Rehablito Speech Therapy & Autism Center
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
              no 6c, 6c, RK Ave, behind DR A K Agarwal, near gold's gym, Dujra, Rajendra Nagar, Patna, Bihar 800016
            </p>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#E6007E] hover:underline"
            >
              <span>View on Google Maps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>

      {/* ================= 4. WHY VISIT REHABLITO? (5 CARDS) ================= */}
      <section className="py-14 sm:py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F1B3D] text-center mb-10">
            Why Visit{" "}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 text-center">
            {whyVisitFeatures.map((item, idx) => {
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

      {/* ================= 5. STILL HAVE QUESTIONS? BANNER ================= */}
      <section className="py-14 sm:py-16 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="relative w-full bg-[#071838] text-white rounded-3xl p-8 sm:p-10 shadow-xl overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
          
          <div className="max-w-2xl text-center lg:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Still Have <span className="text-[#E6007E]">Questions?</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Our care team is happy to help you. Reach out on WhatsApp anytime for instant support!
            </p>
          </div>

          <button
            onClick={() => handleWhatsAppRedirect()}
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-white text-[#0F1B3D] font-bold text-sm shadow-md hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span>Book a Free Consultation</span>
            <ArrowRight className="w-4 h-4 text-[#0F1B3D] transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

    </div>
  );
};

export default ContactUs;
