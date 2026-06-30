import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  GraduationCap,
  Users,
  Mail,
  LogIn,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  ChevronDown,
  Lock,
} from "lucide-react";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // --- Destructure userData for Role Detection ---
  const { currentUser, userData, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // [UPDATED] Hardcoded Brand Colors (Partner logic removed)
  const brandColor = "#0f172a";
  const accentColor = "#5edff4";

  // --- [UPDATED] Logical Dashboard Paths ---
  // If admin -> /admin, else (Student) -> /dashboard
  const isAdmin = userData?.role === "admin";

  let dashboardPath = "/dashboard";
  if (isAdmin) dashboardPath = "/admin";

  let profilePath = "/dashboard/profile";
  if (isAdmin) profilePath = "/admin/settings";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileMenu(false);
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // --- [UPDATED] Added isPremium flag and Crown icon to Partnership ---
  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Courses", path: "/courses", icon: GraduationCap },
    { name: "About Us", path: "/about", icon: Users },
    { name: "Contact Us", path: "/contact", icon: Mail },
    // Show Dashboard link only if logged in
    ...(currentUser
      ? [{ name: "Dashboard", path: dashboardPath, icon: LayoutDashboard }]
      : []),
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b
        ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-slate-200/50 py-2 shadow-lg shadow-slate-200/20"
            : "bg-transparent py-2 sm:py-3 border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* --- Logo Section --- */}
          <NavLink to="/" className="flex items-center gap-2 group shrink-0">
            <div
              className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 shadow-lg shrink-0"
              style={{
                backgroundColor: brandColor,
                boxShadow: `0 4px 12px ${accentColor}33`,
              }}
            >
              <GraduationCap
                className="w-5 h-5"
                style={{ color: accentColor }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 leading-none">
                REHABLITO ACADEMY
              </span>
              <span
                className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase block"
                style={{ color: accentColor }}
              ></span>
            </div>
          </NavLink>

          {/* --- Desktop Links --- */}
          <div className="hidden lg:flex items-center bg-slate-100/50 backdrop-blur-sm px-1 py-1 rounded-full border border-slate-200/60">
            {navLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `relative px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300
                  ${
                    isActive
                      ? "text-slate-900"
                      : "text-slate-500 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* --- [UPDATED] Premium Styling Logic for Desktop --- */}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {item.isPremium && (
                        <item.icon
                          className={`w-4 h-4 ${isActive ? "text-amber-600" : "text-amber-500"} drop-shadow-sm`}
                          fill="currentColor"
                        />
                      )}
                      <span
                        className={
                          item.isPremium
                            ? `bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent font-bold ${isActive ? "from-amber-600 to-orange-600" : ""}`
                            : ""
                        }
                      >
                        {item.name}
                      </span>
                    </span>

                    {isActive && (
                      <motion.div
                        layoutId="desktop-nav-bg"
                        className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-200/50"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* --- Action Buttons --- */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {currentUser ? (
              // Logged In State
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 cursor-pointer"
                >
                  <div
                    className="size-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-md border border-slate-200"
                    style={{ backgroundColor: brandColor }}
                  >
                    {currentUser.displayName
                      ? currentUser.displayName[0].toUpperCase()
                      : "U"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-none">
                      {currentUser.displayName
                        ? currentUser.displayName.split(" ")[0]
                        : "User"}
                    </p>
                  </div>
                  <ChevronDown
                    className={`size-4 text-slate-400 transition-transform duration-300 ${
                      showProfileMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2"
                    >
                      <div className="px-4 py-3 border-b border-slate-50 mb-1">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                          Signed in as
                        </p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {currentUser.email}
                        </p>
                      </div>

                      <Link
                        to={dashboardPath}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Link>

                      <Link
                        to={profilePath}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      >
                        <Settings className="size-4" />
                        Settings
                      </Link>

                      {/* Reset Password Option */}

                      <div className="border-t border-slate-50 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut className="size-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Logged Out State
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth("login")}
                  className="hidden sm:flex px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuth("signup")}
                  className="px-5 py-2 text-sm font-bold text-white rounded-xl shadow-lg shadow-slate-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  style={{ backgroundColor: brandColor }}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Up</span>
                  <span className="sm:hidden">Join</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* --- Mobile Bottom Nav --- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 lg:hidden pb-safe">
        <div className="flex justify-around items-center px-2 py-3">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            // --- [UPDATED] Mobile Theme Color Logic ---
            const themeColor = item.isPremium ? "#f59e0b" : accentColor; // Amber/Gold for Premium

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className="flex flex-col items-center gap-1 p-1 relative"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -2 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <item.icon
                      className={`w-5 h-5 transition-colors duration-300 ${
                        isActive
                          ? "stroke-[2.5px]"
                          : "text-slate-400 stroke-[1.5px]"
                      }`}
                      style={{
                        color: isActive
                          ? themeColor
                          : item.isPremium
                            ? "#fbbf24"
                            : undefined,
                      }}
                      fill={item.isPremium ? "currentColor" : "none"}
                    />
                  </motion.div>
                </div>

                <span
                  className={`text-[10px] mt-0.5 font-bold tracking-wide transition-colors duration-300 ${
                    isActive ? "text-slate-900" : "text-slate-400"
                  } ${item.isPremium && !isActive ? "!text-amber-500" : ""}`}
                  style={{
                    color: isActive && !item.isPremium ? themeColor : undefined,
                  }}
                >
                  {item.name}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="mobile-dot"
                    className="absolute -top-1 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: themeColor }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
      <div className="h-16 lg:hidden" />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
};

export default Navbar;
