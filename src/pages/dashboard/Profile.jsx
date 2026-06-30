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
  orderBy,
} from "firebase/firestore";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import { db } from "../../firebase/config";

const Profile = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const bioRef = useRef(null);

  // Data States
  const [orders, setOrders] = useState([]);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [profileStrength, setProfileStrength] = useState(0);

  // Password fields
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Delete Account State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  // Notification State
  const [notifications, setNotifications] = useState({
    emailCourse: true,
    emailPromos: false,
    securityAlerts: true,
    smsAlerts: false,
  });

  // Form Data
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
    university: "", // New field for students
  });

  // --- 1. LOAD USER DATA & ORDERS ---
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;

      try {
        // A. Fetch User Profile
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

          // Calculate Profile Strength
          calculateStrength(data);

          // Enrolled Count
          if (data.enrolledCourses) {
            setEnrolledCount(data.enrolledCourses.length);
          }
        } else {
          // New User Init
          setFormData((prev) => ({
            ...prev,
            name: currentUser.displayName || "",
            email: currentUser.email || "",
            photoURL: currentUser.photoURL || "",
          }));
        }

        // B. Fetch Orders (Billing History)
        const q = query(
          collection(db, "orders"),
          where("userId", "==", currentUser.uid),
        );
        const orderSnap = await getDocs(q);
        const userOrders = orderSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Client-side sort to avoid index issues
        userOrders.sort(
          (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
        );
        setOrders(userOrders);
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    loadData();
  }, [currentUser]);

  // --- Helper: Calculate Strength ---
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
    // Max score 8, convert to percentage
    setProfileStrength(Math.round((score / fields.length) * 100));
  };

  // --- 2. SAVE PROFILE ---
  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedBio = bioRef.current?.value || formData.bio;

      // Update Auth
      if (currentUser.displayName !== formData.name) {
        await updateProfile(currentUser, { displayName: formData.name });
      }

      // Update Firestore
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
      calculateStrength({ ...formData, bio: updatedBio }); // Re-calc strength
      setIsEditing(false);
      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("Error updating:", error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. IMAGE UPLOAD ---
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

        // Resize logic (Max 600px)
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

  // --- 4. PASSWORD CHANGE ---
  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm)
      return alert("Passwords don't match!");
    if (passwords.new.length < 6)
      return alert("Password too short (min 6 chars)");

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwords.current,
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

  // --- 5. NOTIFICATIONS ---
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
    <div className="space-y-8 pb-10">
      {/* --- HEADER --- */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="h-48 md:h-64 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-[#0891b2] to-slate-900 opacity-80" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#5edff4]/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 font-bold text-9xl tracking-widest select-none">
            STUDENT
          </div>
        </div>

        <div className="px-8 pb-8 flex flex-col md:flex-row items-end md:items-center gap-6 -mt-16 md:-mt-12 relative z-10">
          <div className="relative group">
            <div className="size-32 md:size-40 rounded-[2rem] bg-white p-2 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <img
                src={
                  formData.photoURL ||
                  `https://ui-avatars.com/api/?name=${formData.name}&background=0f172a&color=5edff4&bold=true`
                }
                alt="Profile"
                className="size-full rounded-[1.5rem] object-cover bg-slate-100"
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
              className="absolute bottom-2 right-2 p-3 bg-[#5edff4] text-slate-900 rounded-xl shadow-lg hover:scale-110 transition-transform border-2 border-white cursor-pointer"
            >
              <Camera className="size-5" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left mt-4 md:mt-12">
            <h1 className="text-3xl font-bold text-slate-900">
              {formData.name || "Student Name"}
            </h1>
            <p className="text-[#0891b2] font-bold text-sm uppercase tracking-wide">
              {formData.role} • {formData.university || "University Student"}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-slate-400">
              {formData.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" /> {formData.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <BookOpen className="size-3" /> {enrolledCount} Courses Enrolled
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-4 md:mt-12 w-full md:w-auto">
            {activeTab === "personal" &&
              (isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 rounded-xl bg-slate-100 font-bold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-[#5edff4] hover:text-slate-900 transition-all shadow-lg flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin size-4" />
                    ) : (
                      <>
                        <Save className="size-4" /> Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-[#5edff4] hover:text-slate-900 transition-all shadow-lg"
                >
                  Edit Profile
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
            <nav className="space-y-1">
              <TabButton
                active={activeTab === "personal"}
                onClick={() => setActiveTab("personal")}
                icon={User}
                label="Personal Details"
              />
              <TabButton
                active={activeTab === "security"}
                onClick={() => setActiveTab("security")}
                icon={Shield}
                label="Login & Security"
              />
              <TabButton
                active={activeTab === "billing"}
                onClick={() => setActiveTab("billing")}
                icon={CreditCard}
                label="Billing History"
              />
              <TabButton
                active={activeTab === "notifications"}
                onClick={() => setActiveTab("notifications")}
                icon={Bell}
                label="Notifications"
              />
            </nav>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-[#5edff4]/10 rounded-full blur-2xl" />
            <h3 className="font-bold text-lg mb-2 relative z-10">
              Profile Strength
            </h3>
            <div className="flex items-end gap-2 mb-2 relative z-10">
              <span
                className={`text-4xl font-bold ${profileStrength === 100 ? "text-emerald-400" : "text-[#5edff4]"}`}
              >
                {profileStrength}%
              </span>
              <span className="text-slate-400 text-sm mb-1">
                {profileStrength === 100 ? "Excellent!" : "Complete it"}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4 relative z-10">
              <div
                className="h-full bg-[#5edff4] rounded-full transition-all duration-1000"
                style={{ width: `${profileStrength}%` }}
              />
            </div>
            {profileStrength < 100 && (
              <button
                onClick={() => {
                  setActiveTab("personal");
                  setIsEditing(true);
                }}
                className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors relative z-10"
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
              className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm min-h-[500px]"
            >
              {/* === TAB 1: PERSONAL === */}
              {activeTab === "personal" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Personal Information
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Manage your public student profile.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <InputGroup
                      label="Full Name"
                      value={formData.name}
                      icon={User}
                      isEditing={isEditing}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                    />
                    <InputGroup
                      label="Email"
                      value={formData.email}
                      icon={Mail}
                      isEditing={false}
                      disabled
                    />
                    <InputGroup
                      label="Phone"
                      value={formData.phone}
                      icon={Phone}
                      isEditing={isEditing}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                    <InputGroup
                      label="University / College"
                      value={formData.university}
                      icon={GraduationCap}
                      isEditing={isEditing}
                      onChange={(e) =>
                        handleInputChange("university", e.target.value)
                      }
                      placeholder="e.g. IIT Delhi"
                    />
                    <InputGroup
                      label="Location"
                      value={formData.location}
                      icon={MapPin}
                      isEditing={isEditing}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wide ml-1">
                      Bio / About Me
                    </label>
                    {isEditing ? (
                      <textarea
                        ref={bioRef}
                        defaultValue={formData.bio}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#5edff4] outline-none min-h-[120px] font-medium text-slate-700 resize-none"
                        placeholder="Tell us about your studies and skills..."
                      />
                    ) : (
                      <p className="p-4 bg-slate-50 rounded-2xl text-slate-600 leading-relaxed border border-transparent italic">
                        {formData.bio ||
                          "No bio added yet. Click edit to add one."}
                      </p>
                    )}
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">
                      Professional Links
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <InputGroup
                        label="Portfolio / Website"
                        value={formData.website}
                        icon={Globe}
                        isEditing={isEditing}
                        onChange={(e) =>
                          handleInputChange("website", e.target.value)
                        }
                      />
                      <InputGroup
                        label="GitHub"
                        value={formData.github}
                        icon={Github}
                        isEditing={isEditing}
                        onChange={(e) =>
                          handleInputChange("github", e.target.value)
                        }
                      />
                      <InputGroup
                        label="LinkedIn"
                        value={formData.linkedin}
                        icon={Linkedin}
                        isEditing={isEditing}
                        onChange={(e) =>
                          handleInputChange("linkedin", e.target.value)
                        }
                      />
                      <InputGroup
                        label="Twitter (X)"
                        value={formData.twitter}
                        icon={Twitter}
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
                <div className="space-y-10">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Login & Security
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Keep your student account secure.
                    </p>
                  </div>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <InputGroup
                        label="Current Password"
                        value={passwords.current}
                        icon={Lock}
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
                    <div className="flex justify-end">
                      <button
                        onClick={handlePasswordChange}
                        disabled={loading || !passwords.current}
                        className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-[#5edff4] hover:text-slate-900 transition-all shadow-lg text-sm"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 3: BILLING (Dynamic) === */}
              {activeTab === "billing" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Order History
                    </h2>
                    <p className="text-slate-500 text-sm">
                      View your course and ebook purchases.
                    </p>
                  </div>

                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    {orders.length > 0 ? (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 font-bold text-slate-500">
                              Item
                            </th>
                            <th className="px-6 py-4 font-bold text-slate-500">
                              Date
                            </th>
                            <th className="px-6 py-4 font-bold text-slate-500">
                              Amount
                            </th>
                            <th className="px-6 py-4 font-bold text-slate-500">
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
                        <div className="mx-auto size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <CreditCard className="size-8 text-slate-300" />
                        </div>
                        <p>No purchase history found.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === TAB 4: NOTIFICATIONS === */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Notification Preferences
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Control what you hear from us.
                    </p>
                  </div>
                  <NotificationToggle
                    label="Course Updates"
                    desc="Progress reports and new material."
                    active={notifications.emailCourse}
                    onClick={() => toggleNotification("emailCourse")}
                    icon={Laptop}
                  />
                  <NotificationToggle
                    label="Security Alerts"
                    desc="Login alerts and password changes."
                    active={notifications.securityAlerts}
                    onClick={() => toggleNotification("securityAlerts")}
                    icon={Shield}
                  />
                  <NotificationToggle
                    label="Promotional Emails"
                    desc="Discounts and new course launches."
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

// --- Sub Components ---

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer
        ${active ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10 scale-[1.02]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
  >
    <Icon
      className={`size-5 ${active ? "text-[#5edff4]" : "text-slate-400"}`}
    />
    {label}
  </button>
);

const InvoiceRow = ({ order }) => {
  // Determine Display Name
  const itemName =
    order.assetName ||
    order.title ||
    order.productName ||
    order.item ||
    "Digital Product";
  // Determine Price
  const price = order.saleValue || order.amount || order.price || 0;
  // Format Date
  const date = order.date
    ? new Date(order.date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4 font-bold text-slate-900">{itemName}</td>
      <td className="px-6 py-4 text-slate-500">{date}</td>
      <td className="px-6 py-4 font-medium text-slate-900">₹{price}</td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
          <CheckCircle className="size-3" /> {order.status || "Completed"}
        </span>
      </td>
    </tr>
  );
};

const NotificationToggle = ({ label, desc, active, onClick, icon: Icon }) => (
  <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/30">
    <div className="flex items-start gap-4">
      <div
        className={`p-2 rounded-xl ${active ? "bg-[#5edff4]/20 text-[#0891b2]" : "bg-slate-100 text-slate-400"}`}
      >
        <Icon className="size-5" />
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-sm">{label}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
    <button
      onClick={onClick}
      className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 cursor-pointer ${active ? "bg-[#5edff4]" : "bg-slate-300"}`}
    >
      <motion.div
        layout
        className="size-4 bg-white rounded-full shadow-sm"
        animate={{ x: active ? 24 : 0 }}
      />
    </button>
  </div>
);

const InputGroup = ({
  label,
  value,
  icon: Icon,
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
    <div className="space-y-2 group">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 group-focus-within:text-[#0891b2] transition-colors">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon
            className={`size-5 ${isEditing ? "text-slate-400 group-focus-within:text-[#5edff4]" : "text-slate-300"}`}
          />
        </div>
        <input
          type={currentType}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          disabled={!isEditing || disabled}
          className={`w-full pl-12 pr-12 py-3.5 rounded-xl outline-none font-bold text-slate-700 transition-all ${isEditing ? "bg-slate-50 border border-slate-200 focus:border-[#5edff4] focus:ring-4 focus:ring-[#5edff4]/10 focus:bg-white shadow-sm" : "bg-transparent border border-transparent"} ${disabled && "opacity-60 cursor-not-allowed"}`}
        />
        {isPassword && isEditing && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
