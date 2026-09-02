import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  ChevronDown,
  Menu,
  X,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

// Fallback Courses for Dropdown when Firestore has 0 courses uploaded
const FALLBACK_DROPDOWN_COURSES = [
  {
    id: "autism-asd-101",
    title: "Understanding Autism Spectrum Disorder (ASD)",
    category: "Autism / ADHD",
  },
  {
    id: "speech-therapy-201",
    title: "Speech Therapy: From Basics to Advanced",
    category: "Speech Therapy",
  },
  {
    id: "occupational-therapy-301",
    title: "Occupational Therapy for Daily Living Skills",
    category: "Occupational Therapy",
  },
  {
    id: "behaviour-support-401",
    title: "Positive Behaviour Support Techniques",
    category: "Behaviour Therapy",
  },
  {
    id: "special-education-501",
    title: "Special Education: Inclusive Learning Strategies",
    category: "Special Education",
  },
  {
    id: "pediatric-rehab-601",
    title: "Pediatric Rehabilitation Essentials",
    category: "Pediatric Rehab",
  },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser, userData, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCoursesDropdownOpen, setIsCoursesDropdownOpen] = useState(false);
  const [isMobileCoursesOpen, setIsMobileCoursesOpen] = useState(false);

  const [coursesList, setCoursesList] = useState([]);
  const profileMenuRef = useRef(null);

  const brandColor = "#0a2a59"; // Dark Blue
  const accentYellow = "#facc15"; // Yellow

  const isAdmin = userData?.role === "admin";
  let dashboardPath = "/dashboard";
  if (isAdmin) dashboardPath = "/admin";

  let profilePath = "/dashboard/profile";
  if (isAdmin) profilePath = "/admin/settings";

  // Fetch real-time courses for Navbar dropdown (Only uploaded courses)
  useEffect(() => {
    const fetchDropdownCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courseVideos"));
        const fetched = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCoursesList(fetched);
      } catch (err) {
        console.error("Error fetching courses for navbar:", err);
        setCoursesList([]);
      }
    };
    fetchDropdownCourses();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile & dropdown menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCoursesDropdownOpen(false);
  }, [location.pathname]);

  const openAuth = () => {
    setIsAuthOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileMenu(false);
      setIsMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses", hasDropdown: true },
    { name: "Programs", path: "/programs" },
    { name: "Our Experts", path: "/experts" },
    { name: "About Us", path: "/about" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-md"
        style={{ backgroundColor: brandColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between py-2 sm:py-3">

          {/* --- Logo Section (Bigger Size) --- */}
          <NavLink to="/" className="flex items-center shrink-0">
            <img
              src="https://ik.imagekit.io/5glnyqfxu/Courses/LogoRehab.webp"
              alt="Rehablito Academy"
              className="h-20 sm:h-24 lg:h-[5.5rem] w-auto object-contain transition-all"
            />
          </NavLink>

          {/* --- Desktop Links --- */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((item) => {
              if (item.hasDropdown) {
                return (
                  <div
                    key={item.name}
                    className="relative py-2"
                    onMouseEnter={() => setIsCoursesDropdownOpen(true)}
                    onMouseLeave={() => setIsCoursesDropdownOpen(false)}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `text-[15px] font-medium transition-colors flex items-center gap-1 cursor-pointer
                        ${isActive || isCoursesDropdownOpen
                          ? "text-[#facc15]"
                          : "text-white hover:text-[#facc15]"
                        }`
                      }
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 mt-0.5 opacity-80 transition-transform duration-200 ${
                          isCoursesDropdownOpen ? "rotate-180 text-[#facc15]" : ""
                        }`}
                      />
                    </NavLink>

                    {/* Transparent/Blur Courses Hover Dropdown Closer to Nav */}
                    <AnimatePresence>
                      {isCoursesDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 3 }}
                          transition={{ duration: 0.12 }}
                          className="absolute left-0 top-full pt-0.5 min-w-[240px] max-w-xs z-50"
                        >
                          <div className="bg-[#0a2a59]/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 py-1 text-white">
                            {coursesList.length > 0 ? (
                              coursesList.map((course) => (
                                <Link
                                  key={course.id}
                                  to={`/courses/${course.id}`}
                                  onClick={() => setIsCoursesDropdownOpen(false)}
                                  className="block px-4 py-2 text-xs font-bold text-[#facc15] hover:text-white hover:bg-white/10 transition-colors cursor-pointer truncate"
                                >
                                  • {course.title}
                                </Link>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-xs text-slate-300 font-semibold italic">
                                No courses uploaded yet
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative py-2 text-[15px] font-medium transition-colors flex items-center gap-1
                    ${isActive
                      ? "text-[#facc15]"
                      : "text-white hover:text-[#facc15]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-0 right-0 h-[2px]"
                          style={{ backgroundColor: accentYellow }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* --- Action Buttons (Desktop & Hamburger Trigger) --- */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-600 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <div className="size-6 sm:size-7 rounded-full bg-[#facc15] text-[#0a2a59] flex items-center justify-center font-bold text-xs">
                    {currentUser.displayName
                      ? currentUser.displayName[0].toUpperCase()
                      : "U"}
                  </div>
                  <div className="hidden sm:block text-left text-white">
                    <p className="text-sm font-medium leading-none">
                      {currentUser.displayName
                        ? currentUser.displayName.split(" ")[0]
                        : "User"}
                    </p>
                  </div>
                  <ChevronDown
                    className={`size-4 text-white transition-transform duration-300 ${showProfileMenu ? "rotate-180" : ""
                      }`}
                  />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-2 z-50 text-[#0F1B3D]"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 mb-1">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                          Signed in as
                        </p>
                        <p className="text-sm font-bold text-[#0a2a59] truncate">
                          {currentUser.email}
                        </p>
                      </div>

                      <Link
                        to={dashboardPath}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-[#0a2a59] hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Link>

                      <Link
                        to={profilePath}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-[#0a2a59] hover:bg-slate-50 transition-colors"
                      >
                        <Settings className="size-4" />
                        Settings
                      </Link>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
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
              <button
                onClick={openAuth}
                className="hidden sm:flex px-5 py-1.5 sm:px-6 sm:py-2 text-sm font-medium text-white rounded-full items-center gap-2 transition-all hover:bg-[#facc15]/10 active:scale-95 border cursor-pointer"
                style={{ borderColor: accentYellow }}
              >
                <User className="w-4 h-4" style={{ color: accentYellow }} />
                <span>Login</span>
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-[#facc15] focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-7 h-7 text-[#facc15]" />
              ) : (
                <Menu className="w-7 h-7 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* --- Mobile Dropdown Menu --- */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden bg-[#071f42] border-t border-slate-700/80 overflow-hidden px-4 py-4"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((item) => {
                  if (item.hasDropdown) {
                    return (
                      <div key={item.name} className="flex flex-col">
                        <div className="flex items-center justify-between py-2 px-3 rounded-lg text-slate-200">
                          <NavLink
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-base font-medium hover:text-[#facc15]"
                          >
                            <span>{item.name}</span>
                          </NavLink>
                          <button
                            onClick={() => setIsMobileCoursesOpen(!isMobileCoursesOpen)}
                            className="p-1 text-slate-300 hover:text-[#facc15]"
                          >
                            <ChevronDown
                              className={`w-5 h-5 transition-transform duration-200 ${
                                isMobileCoursesOpen ? "rotate-180 text-[#facc15]" : ""
                              }`}
                            />
                          </button>
                        </div>

                        {/* Mobile Sub-courses list */}
                        {isMobileCoursesOpen && (
                          <div className="pl-4 py-1 space-y-1.5 border-l-2 border-[#facc15]/40 ml-4 my-1">
                            {coursesList.map((c) => (
                              <Link
                                key={c.id}
                                to={`/courses/${c.id}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block py-1.5 px-2 text-xs font-semibold text-slate-300 hover:text-[#facc15] truncate"
                              >
                                • {c.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `py-2 px-3 rounded-lg text-base font-medium transition-colors flex items-center justify-between
                        ${isActive
                          ? "text-[#facc15] bg-white/10 font-bold"
                          : "text-slate-200 hover:text-[#facc15] hover:bg-white/5"
                        }`
                      }
                    >
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}

                {!currentUser && (
                  <div className="pt-3 border-t border-slate-700/60 mt-2">
                    <button
                      onClick={openAuth}
                      className="w-full py-2.5 px-4 text-center font-semibold text-[#0a2a59] bg-[#facc15] rounded-full shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>Login / Register</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="login"
      />
    </>
  );
};

export default Navbar;