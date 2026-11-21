import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquareHeart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const FloatingChatButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Hide the floating button on the chat page, admin routes, and dashboard pages
  if (
    location.pathname === "/chat" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/dashboard")
  ) {
    return null;
  }

  const handleClick = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
    } else {
      navigate("/chat");
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          onClick={handleClick}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.92 }}
          className="relative group p-4 rounded-full bg-gradient-to-tr from-[#071838] to-[#0F1B3D] text-white shadow-2xl border-2 border-white/20 hover:border-[#5edff4] transition-all cursor-pointer flex items-center justify-center"
          aria-label="Chat with Experts"
        >
          {/* Subtle Glow Ring */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#E6007E] to-[#5edff4] rounded-full blur opacity-40 group-hover:opacity-100 transition duration-300"></div>

          <div className="relative">
            <MessageSquareHeart className="w-6 h-6 text-[#5edff4] group-hover:text-[#E6007E] transition-colors" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-slate-900"></span>
            </span>
          </div>
        </motion.button>
      </div>

      {/* Auth Modal for logged-out visitors */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultView="login"
      />
    </>
  );
};

export default FloatingChatButton;
