import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  RefreshCcw,
  Sparkles,
  ShieldCheck,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";

const AuthModal = ({ isOpen, onClose, defaultMode = "login" }) => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [errors, setErrors] = useState({});

  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("idle");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [strength, setStrength] = useState({ score: 0, label: "", color: "" });

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setErrors({});
      setResetStatus("idle");
      setSyncing(false);
      setResetEmail("");
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [isOpen, defaultMode]);

  const checkStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: "", color: "" };

    if (pass.length > 6) score++;
    if (pass.length > 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const labels = ["Weak", "Fair", "Good", "Strong", "Excellent"];
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-[#FFD60A]",
      "bg-blue-500",
      "bg-[#63DA6B]",
    ];

    setStrength({
      score,
      label: labels[score - 1] || "Weak",
      color: colors[score - 1] || "bg-red-500",
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (mode === "signup") {
      if (!formData.name) newErrors.name = "Full Name is required";
      if (!formData.phone) newErrors.phone = "Phone Number is required";
      if (formData.phone.length < 10) newErrors.phone = "Invalid Phone Number";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 chars";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      if (mode === "login") {
        await login(formData.email, formData.password);
        onClose();
        const pendingCourseJSON = localStorage.getItem("pendingCheckoutCourse");
        if (pendingCourseJSON) {
          const pendingCourse = JSON.parse(pendingCourseJSON);
          window.location.href = pendingCourse.paymentLink;
        } else {
          navigate("/dashboard");
        }
      } else if (mode === "signup") {
        await signup(
          formData.email,
          formData.password,
          formData.name,
          formData.phone
        );

        setSyncing(true);
        setLoading(false);

        setTimeout(() => {
          const pendingCourseJSON = localStorage.getItem(
            "pendingCheckoutCourse"
          );

          if (pendingCourseJSON) {
            const pendingCourse = JSON.parse(pendingCourseJSON);
            window.location.href = pendingCourse.paymentLink;
          } else {
            navigate("/dashboard");
          }
          onClose();
          setSyncing(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Auth Error:", error);
      setErrors({ general: error.message });
      setLoading(false);
      setSyncing(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setErrors({ email: "Please enter your registered email" });
      return;
    }

    setResetStatus("sending");
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetStatus("success");
      setErrors({});
    } catch (error) {
      console.error(error);
      setResetStatus("error");
      setErrors({ general: error.message || "Failed to send reset link" });
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { scale: 0.9, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: { scale: 0.95, opacity: 0, y: 10 },
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
          className="absolute inset-0 bg-[#071838]/70 backdrop-blur-md cursor-pointer"
        />

        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-20 cursor-pointer shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Vibrant Dark Navy Header Section with Rehablito Colors */}
          <div className="h-36 bg-[#071838] relative overflow-hidden shrink-0">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 bg-[#E6007E] rounded-full blur-[60px] opacity-35" />
            <div className="absolute bottom-[-30px] left-[-30px] w-36 h-36 bg-[#FFD60A] rounded-full blur-[60px] opacity-25" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-[#FFD60A] mb-2 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#FFD60A]" />
                <span>
                  <span style={{ color: "#F51B22" }}>R</span>
                  <span style={{ color: "#FF8A16" }}>e</span>
                  <span style={{ color: "#FFE11A" }}>h</span>
                  <span style={{ color: "#63B632" }}>a</span>
                  <span style={{ color: "#2499C7" }}>b</span>
                  <span style={{ color: "#E6007E" }}>l</span>
                  <span style={{ color: "#A34773" }}>i</span>
                  <span style={{ color: "#FFD51A" }}>t</span>
                  <span style={{ color: "#FFE11A" }}>o</span> Academy
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {mode === "login"
                  ? "Welcome Back"
                  : mode === "signup"
                  ? "Join Academy"
                  : "Reset Password"}
              </h2>
              <p className="text-slate-300 text-xs font-semibold mt-1">
                {mode === "login"
                  ? "Continue your learning journey"
                  : mode === "signup"
                  ? "Start your therapy guidance today"
                  : "Recover your account access"}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-white">
            {/* Syncing Loader */}
            {syncing ? (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 animate-ping rounded-full bg-[#E0F2FE] opacity-75"></div>
                  <div className="relative bg-[#E0F2FE] p-5 rounded-full text-[#0284C7]">
                    <RefreshCcw className="w-10 h-10 animate-spin" />
                  </div>
                </div>
                <h3 className="text-lg font-extrabold text-[#0F1B3D] mb-1">
                  Syncing Your Profile
                </h3>
                <p className="text-slate-500 text-xs max-w-[280px]">
                  Setting up your student dashboard... You'll be redirected shortly.
                </p>
              </div>
            ) : mode === "forgot" ? (
              <div className="text-center">
                {resetStatus === "success" ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="w-16 h-16 bg-[#DCFCE7] text-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-[#0F1B3D] mb-2">
                      Link Sent!
                    </h3>
                    <p className="text-slate-500 mb-6 text-xs leading-relaxed">
                      We've sent a password reset link to <br />
                      <span className="font-bold text-[#0F1B3D]">{resetEmail}</span>.
                      <br />
                      Please check your inbox & spam folder.
                    </p>
                    <button
                      onClick={() => {
                        setMode("login");
                        setResetStatus("idle");
                        setErrors({});
                      }}
                      className="w-full bg-[#0F1B3D] text-white font-bold py-3 rounded-full hover:bg-[#1d2e5e] transition-all cursor-pointer text-xs"
                    >
                      Back to Login
                    </button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="w-14 h-14 bg-[#E0F2FE] text-[#0284C7] rounded-full flex items-center justify-center mx-auto mb-4">
                      <KeyRound size={28} />
                    </div>
                    <p className="text-slate-500 mb-6 text-xs font-medium">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <InputGroup
                        icon={Mail}
                        iconColor="#0284C7"
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        error={errors.email}
                      />
                      {errors.general && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-xs font-bold text-center">
                          {errors.general}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={resetStatus === "sending"}
                        className="w-full bg-[#0F1B3D] text-white font-bold text-xs py-3.5 rounded-full hover:bg-[#1d2e5e] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        {resetStatus === "sending" ? (
                          <>
                            Sending <Loader2 size={16} className="animate-spin" />
                          </>
                        ) : (
                          "Send Reset Link"
                        )}
                      </button>
                    </form>
                    <button
                      onClick={() => {
                        setMode("login");
                        setErrors({});
                      }}
                      className="mt-5 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0F1B3D] transition-colors mx-auto cursor-pointer"
                    >
                      <ArrowLeft size={14} /> Back to Login
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <>
                {/* Colorful Pill Tab Switcher */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200">
                  <button
                    onClick={() => setMode("login")}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                      mode === "login"
                        ? "bg-[#0F1B3D] text-white shadow-md"
                        : "text-slate-600 hover:text-[#0F1B3D]"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setMode("signup")}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                      mode === "signup"
                        ? "bg-[#E6007E] text-white shadow-md"
                        : "text-slate-600 hover:text-[#E6007E]"
                    }`}
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {mode === "signup" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <InputGroup
                          icon={User}
                          iconColor="#E6007E"
                          type="text"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          error={errors.name}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <InputGroup
                    icon={Mail}
                    iconColor="#0284C7"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    error={errors.email}
                  />

                  <AnimatePresence mode="popLayout">
                    {mode === "signup" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <InputGroup
                          icon={Phone}
                          iconColor="#16A34A"
                          type="tel"
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          error={errors.phone}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-[#0F1B3D] transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className={`w-full bg-slate-50 border rounded-2xl py-3 pl-11 pr-11 outline-none transition-all font-semibold text-xs text-slate-800 ${
                        errors.password
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-200 focus:border-[#0F1B3D]"
                      }`}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (mode === "signup") checkStrength(e.target.value);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-[11px] font-bold ml-1">
                      {errors.password}
                    </p>
                  )}

                  {mode === "signup" && formData.password && (
                    <div className="flex items-center gap-2 px-1">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strength.color}`}
                          style={{ width: `${(strength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {strength.label}
                      </span>
                    </div>
                  )}

                  <AnimatePresence mode="popLayout">
                    {mode === "signup" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-1"
                      >
                        <div className="relative group">
                          <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-[#E6007E] transition-colors" />
                          <input
                            type="password"
                            placeholder="Confirm Password"
                            className={`w-full bg-slate-50 border rounded-2xl py-3 pl-11 pr-4 outline-none transition-all font-semibold text-xs text-slate-800 ${
                              errors.confirmPassword
                                ? "border-red-300 focus:border-red-500"
                                : "border-slate-200 focus:border-[#E6007E]"
                            }`}
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                confirmPassword: e.target.value,
                              })
                            }
                          />
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-[11px] font-bold ml-1 mt-1">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {errors.general && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-xs font-bold text-center">
                      {errors.general}
                    </div>
                  )}

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full text-white font-extrabold text-xs sm:text-sm py-3.5 rounded-full active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-70 ${
                      mode === "login"
                        ? "bg-[#0F1B3D] hover:bg-[#1a2e5c]"
                        : "bg-[#E6007E] hover:bg-[#cc006f]"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {mode === "login"
                            ? "Login to Dashboard"
                            : "Create Account"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Quick Demo Login Buttons (Load Admin & Load Student) */}
            {mode === "login" && !syncing && (
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2">
                <div className="relative text-center mb-1">
                  <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Demo Access
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        email: "admin@gmail.com",
                        password: "@Admin00",
                      });
                    }}
                    className="bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] font-bold text-xs py-2.5 rounded-2xl hover:bg-[#FFEDD5] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>Load Admin</span>
                  </button>

                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        email: "student@gmail.com",
                        password: "@Student00",
                      });
                    }}
                    className="bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7] font-bold text-xs py-2.5 rounded-2xl hover:bg-[#DCFCE7] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Award className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Load Student</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Link */}
          {mode !== "forgot" && !syncing && (
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              {mode === "login" ? (
                <p className="text-slate-600 text-xs font-semibold">
                  New to Academy?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="font-extrabold text-[#E6007E] hover:underline cursor-pointer ml-1"
                  >
                    Create Account
                  </button>
                </p>
              ) : (
                <p className="text-slate-600 text-xs font-semibold">
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="font-extrabold text-[#0F1B3D] hover:underline cursor-pointer ml-1"
                  >
                    Login
                  </button>
                </p>
              )}
              {mode === "login" && (
                <button
                  onClick={() => setMode("forgot")}
                  className="block w-full mt-2 text-[11px] font-bold text-slate-400 hover:text-[#0F1B3D] cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

const InputGroup = ({ icon: Icon, iconColor, error, success, ...props }) => (
  <div className="relative group">
    <Icon
      className={`absolute left-4 top-3.5 w-4 h-4 transition-colors ${
        error ? "text-red-400" : "text-slate-400 group-focus-within:text-[#0F1B3D]"
      }`}
      style={!error && iconColor ? { color: iconColor } : {}}
    />
    <input
      {...props}
      className={`w-full bg-slate-50 border rounded-2xl py-3 pl-11 pr-4 outline-none transition-all font-semibold text-xs text-slate-800
      ${
        error
          ? "border-red-300 focus:border-red-500"
          : "border-slate-200 focus:border-[#0F1B3D]"
      }`}
    />
    {error && (
      <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-wider">
        {error}
      </p>
    )}
  </div>
);

export default AuthModal;
