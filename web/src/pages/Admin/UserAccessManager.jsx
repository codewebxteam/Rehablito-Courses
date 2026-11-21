import React, { useState, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Unlock,
  UserCheck,
  BookOpen,
  MonitorPlay,
  BellRing,
  Check,
  X,
  Clock,
  ShieldCheck,
  Mail,
  Zap,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const UserAccessManager = () => {
  // --- Manual Search State ---
  const [email, setEmail] = useState("");
  const [userStatus, setUserStatus] = useState("idle");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Content Data
  const [courses, setCourses] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedEbook, setSelectedEbook] = useState("");

  // --- Pending Requests State ---
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchContent();

    const q = query(
      collection(db, "payment_notifications"),
      where("status", "==", "pending"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingRequests(reqs);
    });

    return () => unsubscribe();
  }, []);

  const fetchContent = async () => {
    try {
      const courseSnap = await getDocs(collection(db, "courseVideos"));
      setCourses(
        courseSnap.docs.map((d) => ({
          id: d.id,
          title: d.data().title,
          price: d.data().price,
        })),
      );

      const ebookSnap = await getDocs(collection(db, "ebooks"));
      setEbooks(
        ebookSnap.docs.map((d) => ({
          id: d.id,
          title: d.data().title,
          price: d.data().price,
        })),
      );
    } catch (error) {
      console.error("Error loading content:", error);
    }
  };

  // --- UNIVERSAL SALES ENTRY FUNCTION ---
  const createOrderEntry = async (
    userId,
    userName,
    userEmail,
    itemTitle,
    itemId,
    rawPrice,
    type,
  ) => {
    try {
      // 1. Check if entry already exists to avoid duplicates
      const fieldName = type === "course" ? "courseId" : "ebookId";
      const q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        where(fieldName, "==", itemId)
      );
      const existingDocs = await getDocs(q);
      
      if (!existingDocs.empty) {
        console.log("Sales Entry Already Exists ✅");
        return; // Prevent duplicate entry
      }

      // 2. Clean Price (Remove '₹' and ',')
      let saleAmount = 0;
      if (rawPrice) {
        saleAmount = parseInt(String(rawPrice).replace(/[^0-9]/g, "")) || 0;
      }

      // 3. Add to Orders Collection
      await addDoc(collection(db, "orders"), {
        userId: userId,
        studentName: userName || "Unknown",
        studentEmail: userEmail || "No Email",
        courseId: type === "course" ? itemId : null,
        ebookId: type === "ebook" ? itemId : null,

        // Multiple field names to ensure dashboard catches it
        assetName: itemTitle,
        title: itemTitle,
        productName: itemTitle,
        item: itemTitle,

        saleValue: saleAmount,
        amount: saleAmount,
        price: saleAmount,

        type: type,
        productType: type, // Ensure we have productType for consistency
        partnerId: "manual_approval",
        source: "manual",
        status: "completed",
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });

      console.log("Sales Entry Created Successfully ✅");
    } catch (error) {
      console.error("Error creating sales entry:", error);
    }
  };

  // --- UNDO SALES ENTRY FUNCTION (Ctrl+Z) ---
  const undoOrderEntry = async (userId, itemId, type) => {
    try {
      const fieldName = type === "course" ? "courseId" : "ebookId";

      // Look for the exact order assigned to this user for this item
      const q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        where(fieldName, "==", itemId),
      );
      const querySnapshot = await getDocs(q);

      // Delete the entry completely (Ctrl+Z)
      const deletePromises = querySnapshot.docs.map((document) =>
        deleteDoc(doc(db, "orders", document.id)),
      );

      await Promise.all(deletePromises);
      console.log("Sales Entry Completely Erased (Undo) ✅");
    } catch (error) {
      console.error("Error undoing sales entry:", error);
    }
  };

  // --- Action Handlers ---
  const handleApproveRequest = async (request) => {
    if (!window.confirm(`Grant Access to ${request.userName}?`)) return;

    setProcessingId(request.id);
    try {
      const userRef = doc(db, "users", request.userId);
      await updateDoc(userRef, {
        enrolledCourses: arrayUnion(request.courseId),
      });

      await createOrderEntry(
        request.userId,
        request.userName,
        request.userEmail,
        request.courseTitle,
        request.courseId,
        request.amount,
        "course",
      );

      const notifRef = doc(db, "payment_notifications", request.id);
      await updateDoc(notifRef, { status: "approved" });
    } catch (error) {
      console.error("Error approving:", error);
      alert("Failed. Check console.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (request) => {
    if (!window.confirm("Reject this request?")) return;

    setProcessingId(request.id);
    try {
      const notifRef = doc(db, "payment_notifications", request.id);
      await updateDoc(notifRef, { status: "rejected" });
    } catch (error) {
      console.error("Error rejecting:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSearch = async () => {
    if (!email) return;
    setUserStatus("searching");
    setUserData(null);
    setMessage(null);

    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setUserData({ id: userDoc.id, ...userDoc.data() });
        setUserStatus("found");
      } else {
        setUserStatus("not-found");
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Search failed" });
      setUserStatus("idle");
    }
  };

  const grantAccess = async (type) => {
    if (!userData) return;
    setLoading(true);
    setMessage(null);

    try {
      const userRef = doc(db, "users", userData.id);
      let updateData = {};
      let selectedItem = null;

      if (type === "course") {
        if (!selectedCourse) {
          setLoading(false);
          return alert("Select a course first");
        }

        if (selectedCourse === "all_courses") {
          const allCourseIds = courses.map((c) => c.id);
          const hasAllCourses = allCourseIds.every(id => userData.enrolledCourses?.includes(id));
          
          if (hasAllCourses) {
            setMessage({ type: "error", text: "User is already enrolled in All Courses!" });
            setLoading(false);
            return;
          }

          updateData = { enrolledCourses: arrayUnion(...allCourseIds) };
          selectedItem = {
            title: "Course Bundle",
            id: "all_courses_bundle",
            price: 499,
          };
        } else {
          if (userData.enrolledCourses?.includes(selectedCourse)) {
            setMessage({ type: "error", text: "User is already enrolled in this Course!" });
            setLoading(false);
            return;
          }

          selectedItem = courses.find((c) => c.id === selectedCourse);
          updateData = { enrolledCourses: arrayUnion(selectedCourse) };
        }
      } else if (type === "ebook") {
        if (!selectedEbook) return alert("Select an ebook first");
        selectedItem = ebooks.find((b) => b.id === selectedEbook);
        updateData = { purchasedBooks: arrayUnion(selectedEbook) };
      }

      await updateDoc(userRef, updateData);

      if (selectedItem) {
        await createOrderEntry(
          userData.id,
          userData.name,
          userData.email,
          selectedItem.title,
          selectedItem.id,
          selectedItem.price,
          type,
        );
      }

      const updatedSnap = await getDoc(userRef);
      setUserData({ id: updatedSnap.id, ...updatedSnap.data() });
      setMessage({
        type: "success",
        text: "Access Granted & 499₹ Sales Recorded! 🎉",
      });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to grant access" });
    } finally {
      setLoading(false);
    }
  };

  const revokeAccess = async (type) => {
    if (!userData) return;
    if (!window.confirm(`Are you sure you want to revoke this ${type} access?`))
      return;

    setLoading(true);
    setMessage(null);

    try {
      const userRef = doc(db, "users", userData.id);
      let targetIds = [];
      let selectedItem = null;

      if (type === "course") {
        if (!selectedCourse) return alert("Select a course first to revoke");

        if (selectedCourse === "all_courses") {
          targetIds = courses.map((c) => c.id);
          selectedItem = {
            title: "Course Bundle",
            id: "all_courses_bundle",
            price: 499,
          };
        } else {
          targetIds = [selectedCourse];
          selectedItem = courses.find((c) => c.id === selectedCourse);
        }

        // 1. Clean users/{uid} document enrolledCourses array (supporting BOTH string IDs and Objects)
        const currentUserSnap = await getDoc(userRef);
        if (currentUserSnap.exists()) {
          const currentEnrolled = currentUserSnap.data().enrolledCourses || [];
          const updatedEnrolled = currentEnrolled.filter((item) => {
            const itemCourseId = typeof item === "object" ? (item.courseId || item.id) : item;
            return !targetIds.includes(itemCourseId);
          });
          await setDoc(userRef, { enrolledCourses: updatedEnrolled }, { merge: true });
        }

        // 2. Clean enrolledCourses/{uid} document (which CourseContext reads)
        const enrolledDocRef = doc(db, "enrolledCourses", userData.id);
        const enrolledSnap = await getDoc(enrolledDocRef);
        if (enrolledSnap.exists()) {
          const currentCourses = enrolledSnap.data().courses || [];
          const updatedCourses = currentCourses.filter((item) => {
            const itemCourseId = item.courseId || item.id;
            return !targetIds.includes(itemCourseId);
          });
          await setDoc(enrolledDocRef, { courses: updatedCourses });
        }

        // 3. Delete order entries matching target IDs
        for (const cId of targetIds) {
          await undoOrderEntry(userData.id, cId, type);
        }
      } else if (type === "ebook") {
        if (!selectedEbook) return alert("Select an ebook first to revoke");
        targetIds = [selectedEbook];
        selectedItem = ebooks.find((b) => b.id === selectedEbook);

        const currentUserSnap = await getDoc(userRef);
        if (currentUserSnap.exists()) {
          const currentBooks = currentUserSnap.data().purchasedBooks || [];
          const updatedBooks = currentBooks.filter((item) => {
            const itemBookId = typeof item === "object" ? (item.ebookId || item.id) : item;
            return !targetIds.includes(itemBookId);
          });
          await setDoc(userRef, { purchasedBooks: updatedBooks }, { merge: true });
        }

        for (const bId of targetIds) {
          await undoOrderEntry(userData.id, bId, type);
        }
      }

      const updatedSnap = await getDoc(userRef);
      setUserData({ id: updatedSnap.id, ...updatedSnap.data() });
      setMessage({
        type: "success",
        text: "Access Revoked & Removed Completely! 🚫",
      });
    } catch (error) {
      console.error("Revoke error:", error);
      setMessage({ type: "error", text: "Failed to revoke access" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-12 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-transparent bg-clip-text">
              Access Manager
            </span>
            <ShieldCheck className="text-emerald-500 size-8" />
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage student permissions and verify payments
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm font-bold text-slate-600 flex items-center gap-2">
          <Zap className="size-4 text-amber-500 fill-amber-500" />
          System Status: <span className="text-emerald-600">Active</span>
        </div>
      </div>

      {/* Pending Requests */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BellRing className="size-5 text-indigo-500" />
            Pending Payment Requests
          </h2>
          {pendingRequests.length > 0 && (
            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
              {pendingRequests.length} New
            </span>
          )}
        </div>

        <div className="grid gap-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg uppercase shrink-0">
                    {req.userName?.[0] || "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">
                      {req.userName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Mail className="size-3" /> {req.userEmail}
                      </span>
                      <span className="hidden sm:inline text-slate-300">|</span>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="size-3" />{" "}
                        {new Date(req.requestDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full md:w-auto bg-slate-50 rounded-xl p-3 border border-slate-100 md:mx-4">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-slate-400 font-bold uppercase">
                      Requested Access
                    </p>
                    <p className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 rounded">
                      {req.amount ? req.amount : "Check Price"}
                    </p>
                  </div>
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <MonitorPlay className="size-4 text-emerald-500" />
                    {req.courseTitle}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleRejectRequest(req)}
                    disabled={processingId === req.id}
                    className="flex-1 md:flex-none p-3 rounded-xl border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                  <button
                    onClick={() => handleApproveRequest(req)}
                    disabled={processingId === req.id}
                    className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 min-w-[140px]"
                  >
                    {processingId === req.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Check size={18} /> Approve
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
              <div className="size-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                All Caught Up!
              </h3>
              <p className="text-slate-500">
                No pending payment requests at the moment.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-slate-50 px-4 text-sm text-slate-400 font-bold uppercase tracking-widest">
            Manual Controls
          </span>
        </div>
      </div>

      {/* Manual Grant Section */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-100">
          <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2 mb-6">
            <UserCheck size={24} className="text-slate-400" />
            Search & Grant Access
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
              <input
                type="email"
                placeholder="Enter student email address..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              Search User
            </button>
          </div>

          {userStatus === "searching" && (
            <div className="mt-4 text-slate-400 flex items-center gap-2 font-medium animate-pulse">
              <Loader2 className="animate-spin" size={18} /> Searching
              database...
            </div>
          )}

          {userStatus === "not-found" && (
            <div className="mt-4 text-red-500 font-bold flex items-center gap-2 bg-red-50 px-4 py-3 rounded-xl inline-flex border border-red-100">
              <AlertCircle size={20} /> User not found. Ask them to Sign Up
              first.
            </div>
          )}
        </div>

        {/* Result Area */}
        {userStatus === "found" && userData && (
          <div className="p-6 md:p-8 grid md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="size-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center font-black text-2xl border border-white/10">
                    {userData.name ? userData.name[0] : "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{userData.name}</h3>
                    <p className="text-slate-400 text-sm">
                      {userData.role || "Student"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-slate-400 text-xs uppercase font-bold mb-1">
                      Email
                    </p>
                    <p className="text-sm font-mono truncate">
                      {userData.email}
                    </p>
                  </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center col-span-2">
                      <span className="block text-2xl font-black text-emerald-400">
                        {userData.enrolledCourses?.length || 0}
                      </span>
                      <span className="text-slate-400 text-xs">Courses</span>
                    </div>
                    {/* <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
                      <span className="block text-2xl font-black text-emerald-400">
                        {userData.purchasedBooks?.length || 0}
                      </span>
                      <span className="text-slate-400 text-xs">E-Books</span>
                    </div> */}
                </div>
              </div>
            </div>

            <div className="md:col-span-8 space-y-6">
              {message && (
                <div
                  className={`p-4 rounded-xl flex items-center gap-3 font-bold border ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                  {message.text}
                </div>
              )}

              <div className="grid sm:grid-cols-1 gap-6">
                {/* Course Unlock/Revoke Block */}
                <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors flex flex-col">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-2">
                    <MonitorPlay size={14} className="text-emerald-500" />{" "}
                    Manage Course Access
                  </label>
                  <select
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none font-medium text-sm focus:border-emerald-500 transition-colors mb-2"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">Select Course...</option>
                    <option
                      value="all_courses"
                      className="font-bold text-emerald-600"
                    >
                      🌟 All Courses (Bundle)
                    </option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => grantAccess("course")}
                      disabled={loading}
                      className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      {loading ? "Wait..." : "Grant"}
                    </button>
                    <button
                      onClick={() => revokeAccess("course")}
                      disabled={loading}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-600 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                    >
                      {loading ? "Wait..." : "Revoke"}
                    </button>
                  </div>
                </div>

                {/* Ebook Unlock/Revoke Block Commented out as requested
                <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors flex flex-col">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-2">
                    <BookOpen size={14} className="text-emerald-500" /> Manage
                    E-Book Access
                  </label>
                  <select
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none font-medium text-sm focus:border-emerald-500 transition-colors mb-2"
                    value={selectedEbook}
                    onChange={(e) => setSelectedEbook(e.target.value)}
                  >
                    <option value="">Select E-Book...</option>
                    {ebooks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => grantAccess("ebook")}
                      disabled={loading}
                      className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg active:scale-95"
                    >
                      {loading ? "Wait..." : "Grant"}
                    </button>
                    <button
                      onClick={() => revokeAccess("ebook")}
                      disabled={loading}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-600 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                    >
                      {loading ? "Wait..." : "Revoke"}
                    </button>
                  </div>
                </div>
                */}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default UserAccessManager;
