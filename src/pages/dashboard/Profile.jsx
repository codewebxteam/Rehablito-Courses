import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Loader2,
  Shield,
  CreditCard,
  Bell,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Download,
  Plus,
  Trash2,
  AlertTriangle,
  Smartphone,
  Laptop,
  GraduationCap,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { db } from "../../firebase/config";

const Profile = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const bioRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [profileStrength, setProfileStrength] = useState(0);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [notifications, setNotifications] = useState({
    emailCourse: true,
    emailPromos: false,
    securityAlerts: true,
    smsAlerts: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    website: "",
    github: "",
    twitter: "",
    linkedin: "",
    photoURL: "",
    role: "Student",
    university: "",
  });

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setFormData({
            name: data.name || currentUser.displayName || "",
            email: currentUser.email || "",
            phone: data.phone || "",
            location: data.location || "",
            bio: data.bio || "",
            website: data.website || "",
            github: data.github || "",
            twitter: data.twitter || "",
            linkedin: data.linkedin || "",
            photoURL: data.photoURL || currentUser.photoURL || "",
            role: data.role || "Student",
            university: data.university || "",
          });
          setNotifications(data.notifications || notifications);

          calculateStrength(data);

          if (data.enrolledCourses) {
            setEnrolledCount(data.enrolledCourses.length);
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            name: currentUser.displayName || "",
            email: currentUser.email || "",
            photoURL: currentUser.photoURL || "",
          }));
        }

        const q = query(
          collection(db, "orders"),
          where("userId", "==", currentUser.uid)
        );
        const orderSnap = await getDocs(q);
        const userOrders = orderSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        userOrders.sort(
          (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
        );
        setOrders(userOrders);
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    loadData();
  }, [currentUser]);

  const calculateStrength = (data) => {
    let score = 0;
    const fields = [
      "name",
      "phone",
      "location",
      "bio",
      "github",
      "linkedin",
      "photoURL",
      "university",
    ];
    fields.forEach((field) => {
      if (data[field] && data[field].length > 0) score += 1;
    });
    setProfileStrength(Math.round((score / fields.length) * 100));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedBio = bioRef.current?.value || formData.bio;

      if (currentUser.displayName !== formData.name) {
        await updateProfile(currentUser, { displayName: formData.name });
      }

      const updateData = {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        bio: updatedBio,
        website: formData.website,
        github: formData.github,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        photoURL: formData.photoURL,
        university: formData.university,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", currentUser.uid), updateData, {
        merge: true,
      });

      setFormData((prev) => ({ ...prev, bio: updatedBio }));
      calculateStrength({ ...formData, bio: updatedBio });
      setIsEditing(false);
      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("Error updating:", error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) return alert("Image must be < 5MB");

    setLoading(true);
    try {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;
        const maxSize = 600;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const base64String = canvas.toDataURL("image/jpeg", 0.8);

        await updateDoc(doc(db, "users", currentUser.uid), {
          photoURL: base64String,
        });
        setFormData((prev) => ({ ...prev, photoURL: base64String }));
        calculateStrength({ ...formData, photoURL: base64String });

        setLoading(false);
      };
      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error("Image upload failed:", error);
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm)
      return alert("Passwords don't match!");
    if (passwords.new.length < 6)
      return alert("Password too short (min 6 chars)");

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwords.current
      );
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, passwords.new);
      setPasswords({ current: "", new: "", confirm: "" });
      alert("Password updated successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    await updateDoc(doc(db, "users", currentUser.uid), {
      notifications: updated,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 pb-12 font-sans text-[#0F1B3D]">
      
      {/* --- HERO HEADER --- */}
      <div className="relative rounded-3xl overflow-hidden bg-white shadow-md border border-slate-200/90">
        <div className="h-44 md:h-56 bg-[#071838] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E6007E] rounded-full blur-[120px] opacity-35" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FFD60A] rounded-full blur-[120px] opacity-25" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 font-black text-7xl md:text-9xl tracking-widest select-none">
            REHABLITO
          </div>
        </div>

        <div className="px-6 md:px-8 pb-8 flex flex-col md:flex-row items-end md:items-center gap-6 -mt-16 md:-mt-12 relative z-10">
          <div className="relative group">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-white p-2 shadow-xl border-2 border-white rotate-2 group-hover:rotate-0 transition-transform duration-500">
              <img
                src={
                  formData.photoURL ||
                  `https://ui-avatars.com/api/?name=${formData.name}&background=071838&color=FFD60A&bold=true`
                }
                alt="Profile"
                className="w-full h-full rounded-2xl object-cover bg-slate-100"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="absolute bottom-1 right-1 p-2.5 bg-[#E6007E] text-white rounded-2xl shadow-md hover:scale-110 transition-transform border-2 border-white cursor-pointer"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left mt-2 md:mt-12">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B3D]">
              {formData.name || "Student Name"}
            </h1>
            <p className="text-[#E6007E] font-extrabold text-xs sm:text-sm uppercase tracking-wide mt-0.5">
              {formData.role} • {formData.university || "Rehablito Scholar"}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-xs text-slate-500 font-semibold">
              {formData.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0284C7]" /> {formData.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#16A34A]" /> {enrolledCount} Courses Enrolled
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-4 md:mt-12 w-full md:w-auto">
            {activeTab === "personal" &&
              (isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-full bg-slate-100 font-bold text-xs hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-full bg-[#0F1B3D] text-white font-bold text-xs hover:bg-[#1d2e5e] transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 rounded-full bg-[#0F1B3D] text-white font-bold text-xs hover:bg-[#1d2e5e] transition-all shadow-md cursor-pointer"
                >
                  Edit Profile
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* LEFT TAB NAVIGATION */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-3 border border-slate-200/90 shadow-md">
            <nav className="space-y-1">
              <TabButton
                active={activeTab === "personal"}
                onClick={() => setActiveTab("personal")}
                icon={User}
                iconColor="#0284C7"
                label="Personal Details"
              />
              <TabButton
                active={activeTab === "security"}
                onClick={() => setActiveTab("security")}
                icon={Shield}
                iconColor="#E6007E"
                label="Login & Security"
              />
              <TabButton
                active={activeTab === "billing"}
                onClick={() => setActiveTab("billing")}
                icon={CreditCard}
                iconColor="#16A34A"
                label="Billing History"
              />
              <TabButton
                active={activeTab === "notifications"}
                onClick={() => setActiveTab("notifications")}
                icon={Bell}
                iconColor="#EA580C"
                label="Notifications"
              />
            </nav>
          </div>

          {/* Profile Strength Card */}
          <div className="bg-[#071838] rounded-3xl p-6 text-white relative overflow-hidden shadow-lg border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6007E] rounded-full blur-3xl opacity-20" />
            <h3 className="font-extrabold text-sm mb-2 relative z-10 text-white">
              Profile Completion
            </h3>
            <div className="flex items-end gap-2 mb-2 relative z-10">
              <span
                className={`text-3xl font-extrabold ${
                  profileStrength === 100 ? "text-[#16A34A]" : "text-[#FFD60A]"
                }`}
              >
                {profileStrength}%
              </span>
              <span className="text-slate-300 text-xs mb-1 font-semibold">
                {profileStrength === 100 ? "Complete!" : "Fill details"}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4 relative z-10">
              <div
                className="h-full bg-gradient-to-r from-[#E6007E] via-[#2499C7] to-[#FFD60A] rounded-full transition-all duration-1000"
                style={{ width: `${profileStrength}%` }}
              />
            </div>
            {profileStrength < 100 && (
              <button
                onClick={() => {
                  setActiveTab("personal");
                  setIsEditing(true);
                }}
                className="w-full py-2 bg-white/15 hover:bg-white/25 rounded-full text-xs font-bold transition-colors relative z-10 text-white cursor-pointer"
              >
                Add Missing Details
              </button>
            )}
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-md min-h-[480px]"
            >
              {/* === TAB 1: PERSONAL DETAILS === */}
              {activeTab === "personal" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F1B3D]">
                      Personal Information
                    </h2>
                    <p className="text-slate-500 text-xs font-medium">
                      Manage your public student profile.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <InputGroup
                      label="Full Name"
                      value={formData.name}
                      icon={User}
                      iconColor="#E6007E"
                      isEditing={isEditing}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                    />
                    <InputGroup
                      label="Email Address"
                      value={formData.email}
                      icon={Mail}
                      iconColor="#0284C7"
                      isEditing={false}
                      disabled
                    />
                    <InputGroup
                      label="Phone Number"
                      value={formData.phone}
                      icon={Phone}
                      iconColor="#16A34A"
                      isEditing={isEditing}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                    <InputGroup
                      label="University / Organization"
                      value={formData.university}
                      icon={GraduationCap}
                      iconColor="#EA580C"
                      isEditing={isEditing}
                      onChange={(e) =>
                        handleInputChange("university", e.target.value)
                      }
                      placeholder="e.g. Patna Medical College"
                    />
                    <InputGroup
                      label="Location / City"
                      value={formData.location}
                      icon={MapPin}
                      iconColor="#9333EA"
                      isEditing={isEditing}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-[#0F1B3D] uppercase tracking-wide ml-1">
                      Bio / About Me
                    </label>
                    {isEditing ? (
                      <textarea
                        ref={bioRef}
                        defaultValue={formData.bio}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#0F1B3D] outline-none min-h-[120px] font-semibold text-xs text-[#0F1B3D] resize-none"
                        placeholder="Tell us about your background and clinical interests..."
                      />
                    ) : (
                      <p className="p-4 bg-slate-50 rounded-2xl text-slate-600 text-xs leading-relaxed border border-slate-100 italic font-medium">
                        {formData.bio ||
                          "No bio added yet. Click Edit Profile to add one."}
                      </p>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h2 className="text-lg font-extrabold text-[#0F1B3D] mb-5">
                      Social & Professional Links
                    </h2>
                    <div className="grid md:grid-cols-2 gap-5">
                      <InputGroup
                        label="Portfolio / Website"
                        value={formData.website}
                        icon={Globe}
                        iconColor="#0284C7"
                        isEditing={isEditing}
                        onChange={(e) =>
                          handleInputChange("website", e.target.value)
                        }
                      />
                      <InputGroup
                        label="GitHub"
                        value={formData.github}
                        icon={Github}
                        iconColor="#0F1B3D"
                        isEditing={isEditing}
                        onChange={(e) =>
                          handleInputChange("github", e.target.value)
                        }
                      />
                      <InputGroup
                        label="LinkedIn"
                        value={formData.linkedin}
                        icon={Linkedin}
                        iconColor="#0284C7"
                        isEditing={isEditing}
                        onChange={(e) =>
                          handleInputChange("linkedin", e.target.value)
                        }
                      />
                      <InputGroup
                        label="Twitter (X)"
                        value={formData.twitter}
                        icon={Twitter}
                        iconColor="#E6007E"
                        isEditing={isEditing}
                        onChange={(e) =>
                          handleInputChange("twitter", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 2: SECURITY === */}
              {activeTab === "security" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0F1B3D]">
                      Login & Security
                    </h2>
                    <p className="text-slate-500 text-xs font-medium">
                      Keep your student account secure.
                    </p>
                  </div>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-5">
                      <InputGroup
                        label="Current Password"
                        value={passwords.current}
                        icon={Lock}
                        iconColor="#E6007E"
                        isEditing={true}
                        type="password"
                        onChange={(e) =>
                          setPasswords((prev) => ({
                            ...prev,
                            current: e.target.value,
                          }))
                        }
                      />
                      <div className="hidden md:block"></div>
                      <InputGroup
                        label="New Password"
                        value={passwords.new}
                        icon={Lock}
                        iconColor="#16A34A"
                        isEditing={true}
                        type="password"
                        onChange={(e) =>
                          setPasswords((prev) => ({
                            ...prev,
                            new: e.target.value,
                          }))
                        }
                      />
                      <InputGroup
                        label="Confirm Password"
                        value={passwords.confirm}
                        icon={Lock}
                        iconColor="#16A34A"
                        isEditing={true}
                        type="password"
                        onChange={(e) =>
                          setPasswords((prev) => ({
                            ...prev,
                            confirm: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={handlePasswordChange}
                        disabled={loading || !passwords.current}
                        className="px-6 py-3 bg-[#0F1B3D] text-white font-bold rounded-full hover:bg-[#1d2e5e] transition-all shadow-md text-xs cursor-pointer disabled:opacity-50"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 3: BILLING HISTORY === */}
              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0F1B3D]">
                      Order & Billing History
                    </h2>
                    <p className="text-slate-500 text-xs font-medium">
                      View your course and program purchases.
                    </p>
                  </div>

                  <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
                    {orders.length > 0 ? (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-5 py-3.5 font-extrabold text-[#0F1B3D]">
                              Item Name
                            </th>
                            <th className="px-5 py-3.5 font-extrabold text-[#0F1B3D]">
                              Date
                            </th>
                            <th className="px-5 py-3.5 font-extrabold text-[#0F1B3D]">
                              Amount
                            </th>
                            <th className="px-5 py-3.5 font-extrabold text-[#0F1B3D]">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {orders.map((order) => (
                            <InvoiceRow key={order.id} order={order} />
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-12 text-center text-slate-400">
                        <div className="mx-auto w-14 h-14 bg-[#FCE7F3] rounded-full flex items-center justify-center mb-3 text-[#E6007E]">
                          <CreditCard className="w-7 h-7" />
                        </div>
                        <p className="text-xs font-bold text-slate-500">No purchase history found.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === TAB 4: NOTIFICATIONS === */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0F1B3D]">
                      Notification Preferences
                    </h2>
                    <p className="text-slate-500 text-xs font-medium">
                      Control updates you receive from Rehablito.
                    </p>
                  </div>
                  <NotificationToggle
                    label="Course Updates"
                    desc="Module progress reports and new therapy content."
                    active={notifications.emailCourse}
                    onClick={() => toggleNotification("emailCourse")}
                    icon={Laptop}
                  />
                  <NotificationToggle
                    label="Security Alerts"
                    desc="Login notifications and password security updates."
                    active={notifications.securityAlerts}
                    onClick={() => toggleNotification("securityAlerts")}
                    icon={Shield}
                  />
                  <NotificationToggle
                    label="Promotional Emails"
                    desc="Special offers, workshop invites, and program launches."
                    active={notifications.emailPromos}
                    onClick={() => toggleNotification("emailPromos")}
                    icon={Mail}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const TabButton = ({ active, onClick, icon: Icon, iconColor, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-300 cursor-pointer
        ${
          active
            ? "bg-[#0F1B3D] text-white shadow-md"
            : "text-slate-600 hover:bg-slate-100 hover:text-[#0F1B3D]"
        }`}
  >
    <Icon
      className="w-4 h-4"
      style={{ color: active ? "#FFD60A" : iconColor }}
    />
    <span>{label}</span>
  </button>
);

const InvoiceRow = ({ order }) => {
  const itemName =
    order.assetName ||
    order.title ||
    order.productName ||
    order.item ||
    "Therapy Course";
  const price = order.saleValue || order.amount || order.price || 0;
  const date = order.date
    ? new Date(order.date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-5 py-3.5 font-bold text-[#0F1B3D]">{itemName}</td>
      <td className="px-5 py-3.5 text-slate-500 font-medium">{date}</td>
      <td className="px-5 py-3.5 font-extrabold text-[#0F1B3D]">₹{price}</td>
      <td className="px-5 py-3.5">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-[10px] font-extrabold border border-[#bbf7d0]">
          <CheckCircle className="w-3 h-3" /> {order.status || "Completed"}
        </span>
      </td>
    </tr>
  );
};

const NotificationToggle = ({ label, desc, active, onClick, icon: Icon }) => (
  <div className="flex items-center justify-between p-4 border border-slate-200/80 rounded-2xl bg-slate-50/50">
    <div className="flex items-start gap-3.5">
      <div
        className={`p-2.5 rounded-2xl ${
          active ? "bg-[#FCE7F3] text-[#E6007E]" : "bg-slate-100 text-slate-400"
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-extrabold text-[#0F1B3D] text-xs sm:text-sm">{label}</h4>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{desc}</p>
      </div>
    </div>
    <button
      onClick={onClick}
      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 cursor-pointer ${
        active ? "bg-[#E6007E]" : "bg-slate-300"
      }`}
    >
      <motion.div
        layout
        className="w-4 h-4 bg-white rounded-full shadow-sm"
        animate={{ x: active ? 20 : 0 }}
      />
    </button>
  </div>
);

const InputGroup = ({
  label,
  value,
  icon: Icon,
  iconColor,
  isEditing,
  disabled,
  type = "text",
  placeholder,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5 group">
      <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide ml-1 group-focus-within:text-[#0F1B3D] transition-colors">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon
            className="w-4 h-4 transition-colors text-slate-400 group-focus-within:text-[#0F1B3D]"
            style={iconColor ? { color: iconColor } : {}}
          />
        </div>
        <input
          type={currentType}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          disabled={!isEditing || disabled}
          className={`w-full pl-10 pr-10 py-3 rounded-2xl outline-none font-semibold text-xs text-[#0F1B3D] transition-all ${
            isEditing
              ? "bg-slate-50 border border-slate-200 focus:border-[#0F1B3D] focus:bg-white shadow-xs"
              : "bg-transparent border border-transparent"
          } ${disabled && "opacity-60 cursor-not-allowed"}`}
        />
        {isPassword && isEditing && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
