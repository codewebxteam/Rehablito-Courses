import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  PlayCircle,
  ShoppingCart,
  LogOut,
  X,
  GraduationCap,
  Award,
  AlertTriangle,
  Heart,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, currentUser } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    if (!currentUser) return;

    const ref = doc(db, "dashboard", currentUser.uid);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setDashboard(snap.data());
      }
    });

    return () => unsub();
  }, [currentUser]);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: PlayCircle, label: "My Learning", path: "/dashboard/my-courses" },
    { icon: ShoppingCart, label: "Explore Courses", path: "/dashboard/explore" },
    { icon: Award, label: "Certificates", path: "/dashboard/certificates" },
  ];

  const SidebarContent = (
    <div className="h-full flex flex-col bg-[#071838] text-white border-r border-slate-800 relative">
      {/* 1. BRANDING AREA WITH 2X LARGER REHABLITO LOGO */}
      <div className="h-28 md:h-32 flex items-center px-6 border-b border-slate-800/80">
        <NavLink to="/" className="flex items-center gap-3 w-full">
          <img
            src="https://ik.imagekit.io/5glnyqfxu/Courses/LogoRehab.webp"
            alt="Rehablito Logo"
            className="h-20 md:h-24 w-auto max-w-[240px] object-contain"
          />
        </NavLink>
        <button
          onClick={onClose}
          className="ml-auto lg:hidden text-slate-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* 2. MENU ITEMS */}
      <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-4 mb-4">
          Student Portal
        </div>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => window.innerWidth < 1024 && onClose()}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-xs sm:text-sm ${
                isActive
                  ? "bg-white text-[#0F1B3D] shadow-lg shadow-black/20"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 ${isActive ? "text-[#E6007E]" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* 3. LOGOUT BUTTON */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-3 w-full px-4 py-3.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-bold text-xs cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* 4. LOGOUT CONFIRMATION POPUP */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-x-4 bottom-20 bg-slate-900 border border-slate-700 p-4 rounded-3xl shadow-2xl z-50"
          >
            <div className="flex items-center gap-3 mb-3 text-white">
              <div className="p-2 bg-red-500/20 rounded-2xl text-red-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm">Are you sure?</h4>
                <p className="text-[11px] text-slate-400">
                  You will be logged out of your student portal.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-colors shadow-md"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-72 shrink-0 h-screen sticky top-0 z-40">
        {SidebarContent}
      </div>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-[#071838]/80 backdrop-blur-md z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-60 lg:hidden shadow-2xl"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
