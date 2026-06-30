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
  RefreshCcw, // Added for sync UI
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
  const [syncing, setSyncing] = useState(false); // [NEW LOGIC]
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
      setSyncing(false); // Reset sync when modal opens
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
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
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
        // Login ke baad agar course pending hai toh payment par bhejo
        const pendingCourseJSON = localStorage.getItem("pendingCheckoutCourse");
        if (pendingCourseJSON) {
          const pendingCourse = JSON.parse(pendingCourseJSON);
          window.location.href = pendingCourse.paymentLink;
        } else {
          navigate("/dashboard");
        }
      } else if (mode === "signup") {
        // STEP 1: Pehle Account Create karo aur Firestore mein data likho
        console.log("Creating account and writing to database...");
        await signup(
          formData.email,
          formData.password,
          formData.name,
          formData.phone,
        );

        // STEP 2: Loading screen dikhao (User ko rok kar rakho)
        setSyncing(true);
        setLoading(false);
        console.log("Database written! Now preparing redirection...");

        // STEP 3: Chhota sa delay (1.5s) taaki sab sync ho jaye, fir redirect
        setTimeout(() => {
          const pendingCourseJSON = localStorage.getItem(
            "pendingCheckoutCourse",
          );

          if (pendingCourseJSON) {
            const pendingCourse = JSON.parse(pendingCourseJSON);
            console.log("Redirecting to payment...");
            // Payment page par bhejne se pehle storage clear kar sakte hain
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
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
        />

        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors z-10 cursor-pointer"
          >
            <X className="size-5" />
          </button>

          {/* Header Section */}
          <div className="h-32 bg-[#0f172a] relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#5edff4] rounded-full blur-[80px] opacity-20" />
            <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-500 rounded-full blur-[50px] opacity-20" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <h2 className="text-2xl font-bold text-white mb-1">
                {mode === "login"
                  ? "Welcome Back"
                  : mode === "signup"
                    ? "Join Academy"
                    : "Reset Password"}
              </h2>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                {mode === "login"
                  ? "Continue your learning journey"
                  : mode === "signup"
                    ? "Start learning today"
                    : "Recover your account access"}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
            {/* [NEW UI INJECTION] Syncing View */}
            {syncing ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 animate-ping rounded-full bg-cyan-100 opacity-75"></div>
                  <div className="relative bg-cyan-50 p-5 rounded-full">
                    <RefreshCcw className="size-12 text-[#5edff4] animate-spin" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Syncing Your Profile
                </h3>
                <p className="text-slate-500 text-sm max-w-[280px]">
                  Setting up your student dashboard... You'll be redirected to
                  the payment page in 3 seconds.
                </p>
              </div>
            ) : mode === "forgot" ? (
              <div className="text-center">
                {resetStatus === "success" ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Link Sent!
                    </h3>
                    <p className="text-slate-500 mb-6 text-sm">
                      We've sent a password reset link to <br />
                      <span className="font-bold text-slate-800">
                        {resetEmail}
                      </span>
                      .<br />
                      Please check your inbox (and spam folder).
                    </p>
                    <button
                      onClick={() => {
                        setMode("login");
                        setResetStatus("idle");
                        setErrors({});
                      }}
                      className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Back to Login
                    </button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="size-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <KeyRound size={32} />
                    </div>
                    <p className="text-slate-500 mb-6 text-sm">
                      Enter your email address and we'll send you a link to
                      reset your password.
                    </p>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <InputGroup
                        icon={Mail}
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        error={errors.email}
                      />
                      {errors.general && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-bold text-center">
                          {errors.general}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={resetStatus === "sending"}
                        className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {resetStatus === "sending" ? (
                          <>
                            Sending{" "}
                            <Loader2 size={18} className="animate-spin" />
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
                      className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mx-auto cursor-pointer"
                    >
                      <ArrowLeft size={16} /> Back to Login
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <>
                <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                  <button
                    onClick={() => setMode("login")}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      mode === "login"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setMode("signup")}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      mode === "signup"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
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
                    <Lock className="absolute left-4 top-3.5 size-5 text-slate-400 group-focus-within:text-[#5edff4] transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className={`w-full bg-slate-50 border rounded-xl py-3 pl-12 pr-12 outline-none transition-all font-medium text-slate-700 ${
                        errors.password
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-200 focus:border-[#5edff4]"
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
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs ml-1">
                      {errors.password}
                    </p>
                  )}

                  {mode === "signup" && formData.password && (
                    <div className="flex items-center gap-2 px-1">
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
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
                        className="pt-2"
                      >
                        <div className="relative group">
                          <Lock className="absolute left-4 top-3.5 size-5 text-slate-400 group-focus-within:text-[#5edff4] transition-colors" />
                          <input
                            type="password"
                            placeholder="Confirm Password"
                            className={`w-full bg-slate-50 border rounded-xl py-3 pl-12 pr-4 outline-none transition-all font-medium text-slate-700 ${
                              errors.confirmPassword
                                ? "border-red-300 focus:border-red-500"
                                : "border-slate-200 focus:border-[#5edff4]"
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
                          <p className="text-red-500 text-xs ml-1 mt-1">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {errors.general && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-bold text-center">
                      {errors.general}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0f172a] text-white font-bold py-3.5 rounded-xl hover:bg-[#1e293b] active:scale-[0.98] transition-all shadow-xl shadow-slate-200 disabled:opacity-70 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin size-5" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {mode === "login"
                            ? "Login to Dashboard"
                            : "Create Account"}
                        </span>
                        <ArrowRight className="size-5" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {mode !== "forgot" && !syncing && (
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              {mode === "login" ? (
                <p className="text-slate-500 text-sm">
                  New to Academy?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="font-bold text-slate-900 hover:text-[#5edff4] transition-colors cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              ) : (
                <p className="text-slate-500 text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="font-bold text-slate-900 hover:text-[#5edff4] transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                </p>
              )}
              {mode === "login" && (
                <button
                  onClick={() => setMode("forgot")}
                  className="block w-full mt-2 text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
};

const InputGroup = ({ icon: Icon, error, success, ...props }) => (
  <div className="relative group">
    <Icon
      className={`absolute left-4 top-3.5 size-5 transition-colors ${error ? "text-red-400" : success ? "text-green-500" : "text-slate-400 group-focus-within:text-[#5edff4]"}`}
    />
    <input
      {...props}
      className={`w-full bg-slate-50 border rounded-xl py-3 pl-12 pr-4 outline-none transition-all font-medium text-slate-700
      ${error ? "border-red-300 focus:border-red-500" : success ? "border-green-300 focus:border-green-500" : "border-slate-200 focus:border-[#5edff4]"}`}
    />
    {error && (
      <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-wider">
        {error}
      </p>
    )}
  </div>
);

export default AuthModal;
