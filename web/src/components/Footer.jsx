import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Globe,
  Heart,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [activePolicy, setActivePolicy] = useState(null); // 'privacy' | 'refund' | 'terms' | null

  const supportEmail = "rehablito@gmail.com";
  const supportPhone = "+91 92047 86220";
  const whatsappLink = `https://wa.me/919204786220`;

  // Policy modal content
  const POLICY_CONTENT = {
    privacy: {
      title: "Privacy Policy",
      content: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            We collect personal information such as your name, email, phone number, and payment details strictly for course enrollment and guidance.
          </p>
          <p>
            We do not share your personal information with third parties except for payment processing via authorized payment gateways.
          </p>
          <p>
            You may request deletion of your personal data at any time by contacting us at{" "}
            <a href={`mailto:${supportEmail}`} className="text-[#FFD60A] underline">
              {supportEmail}
            </a>.
          </p>
        </div>
      ),
    },
    refund: {
      title: "Refund Policy",
      content: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            All online courses and digital materials offered on Rehablito provide instant digital access after purchase.
          </p>
          <p>
            If you face technical difficulties accessing your course, please contact our support team at{" "}
            <a href={`mailto:${supportEmail}`} className="text-[#FFD60A] underline">
              {supportEmail}
            </a>{" "}
            or WhatsApp us at{" "}
            <a href={whatsappLink} className="text-[#FFD60A] underline">
              {supportPhone}
            </a>.
          </p>
        </div>
      ),
    },
    terms: {
      title: "Terms & Conditions",
      content: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            By enrolling in any Rehablito course or guidance program, you agree to access course materials solely for personal learning.
          </p>
          <p>
            Reproduction, distribution, or unauthorized sharing of course content is strictly prohibited.
          </p>
        </div>
      ),
    },
  };

  return (
    <footer className="relative bg-[#05132d] text-white pt-16 pb-8 overflow-hidden font-sans border-t border-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* ================= TOP GRID (5 COLUMNS) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-slate-800/80">
          
          {/* COLUMN 1: Logo, Description & Social Icons */}
          <div className="lg:col-span-1 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="https://ik.imagekit.io/5glnyqfxu/Courses/LogoRehab.webp"
                alt="Rehablito Speech Therapy & Autism Center"
                className="h-20 sm:h-24 w-auto object-contain"
              />
            </Link>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Rehablito is dedicated to supporting children with special needs and empowering families through expert-led online courses and guidance programs.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/desire.physio/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 fill-white" />
              </a>

              <a
                href="https://www.instagram.com/rehablito/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FFB800] via-[#E6007E] to-[#9333EA] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href="https://www.youtube.com/@rehablito"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4 fill-white" />
              </a>

              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 fill-white" />
              </a>
            </div>
          </div>

          {/* COLUMN 2: Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 font-medium">
              <li>
                <Link to="/" className="hover:text-[#FFD60A] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-[#FFD60A] transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/programs" className="hover:text-[#FFD60A] transition-colors">
                  Programs
                </Link>
              </li>
              <li>
                <Link to="/experts" className="hover:text-[#FFD60A] transition-colors">
                  Our Experts
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-[#FFD60A] transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#FFD60A] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#FFD60A] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Our Programs */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-4">
              Our Programs
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 font-medium">
              <li>
                <Link to="/courses" className="hover:text-[#FFD60A] transition-colors">
                  Autism / ADHD
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-[#FFD60A] transition-colors">
                  Speech Therapy
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-[#FFD60A] transition-colors">
                  Occupational Therapy
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-[#FFD60A] transition-colors">
                  Behaviour Therapy
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-[#FFD60A] transition-colors">
                  Special Education
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-[#FFD60A] transition-colors">
                  Pediatric Rehabilitation
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: Support */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-4">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 font-medium">
              <li>
                <Link to="/contact" className="hover:text-[#FFD60A] transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <a href="/#faq" className="hover:text-[#FFD60A] transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy("privacy")}
                  className="hover:text-[#FFD60A] transition-colors text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy("terms")}
                  className="hover:text-[#FFD60A] transition-colors text-left cursor-pointer"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy("refund")}
                  className="hover:text-[#FFD60A] transition-colors text-left cursor-pointer"
                >
                  Refund Policy
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 5: Contact Us (Exact Details) */}
          <div className="space-y-3.5">
            <h4 className="text-base sm:text-lg font-bold text-white mb-4">
              Contact Us
            </h4>
            
            {/* Address */}
            <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 font-medium">
              <div className="w-8 h-8 rounded-full bg-[#FFD60A]/15 text-[#FFD60A] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <span>
                no 6c, 6c, RK Ave, behind DR A K Agarwal, near gold's gym, Dujra, Rajendra Nagar, Patna, Bihar 800016
              </span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 font-medium">
              <div className="w-8 h-8 rounded-full bg-[#FFD60A]/15 text-[#FFD60A] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <a
                href="tel:+919204786220"
                className="hover:text-[#FFD60A] transition-colors"
              >
                +91 92047 86220
              </a>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 font-medium">
              <div className="w-8 h-8 rounded-full bg-[#FFD60A]/15 text-[#FFD60A] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <a
                href="mailto:rehablito@gmail.com"
                className="hover:text-[#FFD60A] transition-colors"
              >
                rehablito@gmail.com
              </a>
            </div>

            {/* Website */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 font-medium">
              <div className="w-8 h-8 rounded-full bg-[#FFD60A]/15 text-[#FFD60A] flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <a
                href="https://www.rehablito.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FFD60A] transition-colors"
              >
                www.rehablito.com
              </a>
            </div>
          </div>

        </div>

        {/* ================= BOTTOM COPYRIGHT & CREDITS STRIP ================= */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-6 text-xs sm:text-sm text-slate-400 font-medium gap-3 text-center md:text-left">
          <p>© 2026 Rehablito Speech Therapy & Autism Center. All Rights Reserved.</p>
          <p className="flex items-center justify-center gap-1.5 flex-wrap">
            <span>Designed with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <a
              href="https://codewebx.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FFD60A] hover:underline font-bold"
            >
              CodeWebX
            </a>
          </p>
        </div>

      </div>

      {/* ================= POLICY MODAL ================= */}
      <AnimatePresence>
        {activePolicy && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePolicy(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#071838] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 z-10 text-white"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
                <h3 className="text-lg font-bold text-white">
                  {POLICY_CONTENT[activePolicy]?.title}
                </h3>
                <button
                  onClick={() => setActivePolicy(null)}
                  className="p-1 rounded-full hover:bg-slate-800 text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div>{POLICY_CONTENT[activePolicy]?.content}</div>
              <div className="pt-5 text-right">
                <button
                  onClick={() => setActivePolicy(null)}
                  className="px-5 py-2 rounded-full bg-[#FFD60A] text-[#0F1B3D] font-bold text-xs hover:bg-[#ffe042] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
