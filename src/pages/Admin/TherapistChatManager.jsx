import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Filter,
  User,
  Stethoscope,
  Clock,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Mic,
  Send,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  ShoppingBag,
  BookOpen,
  Reply,
  CornerUpLeft,
  X,
  CheckCheck,
  Eye,
  SlidersHorizontal,
  Paperclip,
} from "lucide-react";
import {
  listenToAllConsultations,
  listenToThreadMessages,
  sendTherapistConsultationReply,
  updateConsultationStatus,
  fetchUserCoursePurchaseStatus,
  markThreadAsSeenByAdmin,
  uploadAttachmentFile,
  autoCleanupExpiredConsultations,
} from "../../services/consultationService";
import { useAuth } from "../../context/AuthContext";
import { getDateStringForDivider } from "../ConsultationChat";
import FormattedMessageText from "../../components/chat/FormattedMessageText";

const QUICK_TEMPLATES = [
  "हमारे Rehablito Course में इसका 100% स्टेप-बाय-स्टेप वीडियो समाधान है। आप वेबसाइट के Courses सेक्शन से इसे तुरंत इनरोल कर सकते हैं।",
  "अगर आपने हमारा Rehablito Course परचेज किया है, तो उसके मॉड्यूल्स में दी गई थेरेपी वीडियो एक्सरसाइज को रोज़ाना 20 मिनट ज़रूर करवाएं।",
  "We have carefully reviewed your details. Please focus on 15 mins of daily interactive play without screen-time.",
  "Based on the attached doctor prescription, we recommend starting speech articulation drills as demonstrated in our Rehablito Course.",
  "Thank you for reaching out. Let's schedule a 1-on-1 clinical video assessment call with our senior specialist.",
];

const TherapistChatManager = () => {
  const { currentUser, userData } = useAuth();

  const [threads, setThreads] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [selectedThread, setSelectedThread] = useState(null);

  // Active Thread Messages
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Therapist Reply Input & Quoted Reply
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { id, text, senderName, sender }
  const [attachments, setAttachments] = useState([]); // [{ type: 'image'|'pdf'|'audio', name, dataUrl, blob, duration }]
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const [therapistName, setTherapistName] = useState(
    userData?.name || "Dr. Rehablito Expert"
  );
  const [therapistRole, setTherapistRole] = useState(
    "Senior Pediatric Clinical Specialist"
  );

  // Lightbox Modal for Image Viewing
  const [previewImage, setPreviewImage] = useState(null);

  const messagesEndRef = useRef(null);
  const chatScrollContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const isSendingRef = useRef(false);

  // File Upload (Images & PDFs)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const fileNameLower = (file.name || "").toLowerCase();
      const isImg =
        file.type.startsWith("image/") ||
        /\.(jpg|jpeg|png|webp|gif|bmp|heic|heif)$/i.test(fileNameLower);
      const isPdf =
        file.type === "application/pdf" ||
        fileNameLower.endsWith(".pdf");

      if (!isImg && !isPdf) {
        alert("Please upload only Images (JPG/PNG/WebP) or PDF clinical documents.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit. Please upload an image or document under 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments((prev) => [
          ...prev,
          {
            type: isImg ? "image" : "pdf",
            name: file.name,
            dataUrl: event.target.result,
            blob: file,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Voice Note Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlobObj = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const reader = new FileReader();
        reader.readAsDataURL(audioBlobObj);
        reader.onloadend = () => {
          const base64Data = reader.result;
          setAttachments((prev) => [
            ...prev,
            {
              type: "audio",
              name: `Therapist Voice Note (${recordingDuration}s).webm`,
              dataUrl: base64Data,
              blob: audioBlobObj,
              duration: recordingDuration,
            },
          ]);
        };

        // Stop all tracks to turn off mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Microphone access failed. Please grant audio permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
      audioChunksRef.current = [];
    }
  };

  const formatAudioTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 1. Listen to all consultation threads in real-time
  useEffect(() => {
    setLoadingThreads(true);
    const unsubscribe = listenToAllConsultations((allThreads) => {
      setThreads(allThreads);
      setLoadingThreads(false);

      // Auto-select first thread if none selected
      if (!selectedThread && allThreads.length > 0) {
        setSelectedThread(allThreads[0]);
      } else if (selectedThread) {
        // Keep selected thread data refreshed
        const updated = allThreads.find((t) => t.id === selectedThread.id);
        if (updated) setSelectedThread(updated);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Listen to active thread messages & mark thread seen by admin
  useEffect(() => {
    if (!selectedThread?.id) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    setReplyingTo(null); // clear any active quote when switching threads

    // Mark as seen by admin
    markThreadAsSeenByAdmin(selectedThread.id);

    const unsubscribe = listenToThreadMessages(selectedThread.id, (msgs) => {
      setMessages(msgs);
      setLoadingMessages(false);
      setTimeout(() => {
        if (chatScrollContainerRef.current) {
          chatScrollContainerRef.current.scrollTop =
            chatScrollContainerRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => unsubscribe();
  }, [selectedThread?.id]);

  // 3. User Course & Purchase Verification
  const [purchaseInfo, setPurchaseInfo] = useState(null);
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const [showCourseDetails, setShowCourseDetails] = useState(false);

  useEffect(() => {
    if (!selectedThread?.userId && !selectedThread?.userEmail) {
      setPurchaseInfo(null);
      return;
    }

    let isMounted = true;
    setLoadingPurchase(true);

    fetchUserCoursePurchaseStatus(selectedThread.userId, selectedThread.userEmail)
      .then((info) => {
        if (isMounted) {
          setPurchaseInfo(info);
          setLoadingPurchase(false);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch user purchase status:", err);
        if (isMounted) setLoadingPurchase(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedThread?.userId, selectedThread?.userEmail]);

  // Filtered Threads for sidebar search & tabs
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (t.userName && t.userName.toLowerCase().includes(q)) ||
        (t.userEmail && t.userEmail.toLowerCase().includes(q)) ||
        (t.userPhone && t.userPhone.toLowerCase().includes(q)) ||
        (t.specialty && t.specialty.toLowerCase().includes(q)) ||
        (t.lastMessage && t.lastMessage.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;
      if (statusFilter === "pending") return t.status === "pending" || t.unreadAdminCount > 0;
      if (statusFilter === "replied") return t.status === "replied";
      if (statusFilter === "enrolled") return t.hasPurchasedCourses || t.isEnrolledStudent;
      if (statusFilter === "leads") return !t.hasPurchasedCourses && !t.isEnrolledStudent;
      return true;
    });
  }, [threads, searchQuery, statusFilter]);

  // Thread counts for filter chips
  const pendingCount = useMemo(() => {
    return threads.filter((t) => t.status === "pending" || t.unreadAdminCount > 0).length;
  }, [threads]);

  const repliedCount = useMemo(() => {
    return threads.filter((t) => t.status === "replied").length;
  }, [threads]);

  // FILTER OUT AI MESSAGES: Admin only sees actual parent and therapist interaction!
  const displayMessages = useMemo(() => {
    return messages.filter((m) => m.sender !== "ai");
  }, [messages]);

  // Handle Send Reply with text and multimedia attachments
  const handleSendReply = async (textToSend = replyText) => {
    if (isSendingRef.current || sending) return;

    const text = typeof textToSend === "string" ? textToSend.trim() : replyText.trim();
    if ((!text && attachments.length === 0) || !selectedThread?.id) return;

    isSendingRef.current = true;
    setSending(true);
    const activeAttachments = [...attachments];
    setReplyText("");
    setAttachments([]);
    setReplyingTo(null);

    try {
      // 1. Upload files/blobs to ImageKit CDN
      const uploadedAttachments = await Promise.all(
        activeAttachments.map(async (att) => {
          let uploadRes = { url: "", fileId: null };
          if (att.blob) {
            uploadRes = await uploadAttachmentFile(att.blob, "therapist_admin");
          } else if (att.url) {
            uploadRes = { url: att.url, fileId: att.fileId || null };
          }
          const finalUrl = typeof uploadRes === "string" ? uploadRes : (uploadRes?.url || "");
          const finalFileId = typeof uploadRes === "object" ? (uploadRes?.fileId || null) : null;
          return {
            type: att.type,
            name: att.name,
            url: finalUrl,
            fileId: finalFileId,
            duration: att.duration || null,
          };
        })
      );

      // 2. Send via consultation service
      await sendTherapistConsultationReply({
        threadId: selectedThread.id,
        therapistName: therapistName || "Senior Clinical Specialist",
        therapistRole: therapistRole || "Rehablito Clinical Team",
        text: text || (uploadedAttachments.length > 0 ? (uploadedAttachments[0].type === "audio" ? "Voice Note" : "Attachment") : ""),
        attachments: uploadedAttachments,
        replyTo: replyingTo,
      });

      // Auto scroll to bottom
      setTimeout(() => {
        if (chatScrollContainerRef.current) {
          chatScrollContainerRef.current.scrollTop =
            chatScrollContainerRef.current.scrollHeight;
        }
      }, 100);
    } catch (err) {
      console.error("Failed to send therapist reply:", err);
      alert("Failed to send reply. Please check your connection.");
    } finally {
      isSendingRef.current = false;
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedThread?.id) return;
    try {
      await updateConsultationStatus(selectedThread.id, newStatus);
      setSelectedThread((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleSelectReplyTarget = (msg) => {
    setReplyingTo({
      id: msg.id,
      text: msg.text || (msg.attachments?.length ? `[${msg.attachments[0].name}]` : "Message"),
      senderName: msg.senderName || (msg.sender === "user" ? selectedThread?.userName || "Parent" : "Therapist"),
      sender: msg.sender,
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 text-slate-800 overflow-hidden font-sans">
      {/* ================= LIGHT THEME TOP MANAGER HEADER ================= */}
      <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-xs z-20">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="size-9 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-[#0284C7] shadow-2xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Therapist Consultation Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0284C7] border border-sky-200 text-xs font-extrabold">
              {threads.length} Active Cases
            </span>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold animate-pulse flex items-center gap-1">
                <span className="size-2 rounded-full bg-amber-500" />
                {pendingCount} Need Reply
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review parent inquiries, doctor prescriptions/parchis, and respond directly with clinical guidance.
          </p>
        </div>

        {/* Duty Clinical Specialist Badge */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="size-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-black text-sm">
            DR
          </div>
          <div className="text-left">
            <input
              type="text"
              value={therapistName}
              onChange={(e) => setTherapistName(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 border-none focus:outline-none focus:ring-1 focus:ring-[#0284C7] rounded px-1"
              placeholder="Therapist Name"
            />
            <input
              type="text"
              value={therapistRole}
              onChange={(e) => setTherapistRole(e.target.value)}
              className="bg-transparent text-[11px] text-slate-500 block border-none focus:outline-none focus:ring-1 focus:ring-[#0284C7] rounded px-1"
              placeholder="Therapist Title"
            />
          </div>
        </div>
      </div>

      {/* ================= MAIN SPLIT PANE ================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================= LEFT COLUMN: THREAD LIST ================= */}
        <div className="w-full sm:w-84 md:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0">
          {/* Search Bar */}
          <div className="p-3.5 border-b border-slate-200 space-y-2.5 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student, email, phone..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284C7] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills with real counts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scrollbar">
              {[
                { id: "all", label: `All (${threads.length})` },
                { id: "pending", label: `Needs Reply (${pendingCount})`, highlight: pendingCount > 0 },
                { id: "replied", label: `Replied (${repliedCount})` },
                { id: "enrolled", label: "Enrolled" },
                { id: "leads", label: "Leads" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setStatusFilter(pill.id)}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === pill.id
                      ? "bg-[#0284C7] text-white shadow-xs"
                      : pill.highlight
                      ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Threads List Items (Smooth Scrollable) */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar bg-slate-50/50">
            {loadingThreads ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#0284C7] mx-auto"></div>
                <p className="text-xs">Loading patient threads...</p>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No consultation threads found matching filters.
              </div>
            ) : (
              filteredThreads.map((item) => {
                const isSelected = selectedThread?.id === item.id;
                const isPending = item.status === "pending" || item.unreadAdminCount > 0;

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedThread(item)}
                    className={`w-full text-left p-3.5 sm:p-4 transition-all cursor-pointer flex items-start gap-3 border-b border-slate-100 ${
                      isSelected
                        ? "bg-sky-50/80 border-l-4 border-[#0284C7] shadow-xs"
                        : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    {/* User Initial Avatar */}
                    <div className="relative shrink-0">
                      <div className="size-10 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                        {item.userName ? item.userName[0].toUpperCase() : "P"}
                      </div>
                      {isPending && (
                        <span className="absolute -top-1 -right-1 size-3 bg-amber-500 border-2 border-white rounded-full animate-ping" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-xs text-slate-900 truncate">
                          {item.userName || item.userEmail}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isPending
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {isPending ? "Needs Reply" : item.status || "Replied"}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#0284C7] font-semibold truncate mt-0.5">
                        {item.specialty || "Speech / Child Therapy"} • {item.childAge || "Pediatric"}
                      </p>

                      <p className="text-xs text-slate-600 truncate mt-1">
                        {item.lastMessage || "No messages"}
                      </p>

                      {/* Course Purchase Indicator Pill */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {item.hasPurchasedCourses || item.isEnrolledStudent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <GraduationCap className="w-3 h-3 text-emerald-600" />
                            <span>Enrolled Student ({item.enrolledCoursesCount || 1})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium">
                            <ShoppingBag className="w-3 h-3 text-slate-400" />
                            <span>No Courses</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
                        <span className="truncate max-w-[140px]">{item.userPhone || item.userEmail}</span>
                        <span>
                          {item.updatedAt?.toDate
                            ? item.updatedAt.toDate().toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })
                            : "Recent"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ACTIVE THREAD CHAT (LIGHT THEME) ================= */}
        <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
          {selectedThread ? (
            <>
              {/* Active Conversation Top Bar */}
              <div className="p-3.5 sm:p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs z-10">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center font-black text-lg text-[#0284C7] shadow-2xs">
                    {selectedThread.userName ? selectedThread.userName[0].toUpperCase() : "P"}
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      {selectedThread.userName || "Patient Parent"}
                      <span className="text-xs font-normal text-slate-500">
                        ({selectedThread.userEmail})
                      </span>
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                      {selectedThread.userPhone ? (
                        <a
                          href={`tel:${selectedThread.userPhone}`}
                          className="flex items-center gap-1 text-[#0284C7] hover:underline font-semibold"
                        >
                          <Phone className="w-3 h-3" />
                          {selectedThread.userPhone}
                        </a>
                      ) : (
                        <span className="text-slate-400">No Phone</span>
                      )}
                      <span>•</span>
                      <span className="text-[#0284C7] font-semibold">
                        {selectedThread.specialty} ({selectedThread.childAge})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Switcher Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Status:</span>
                  <select
                    value={selectedThread.status || "pending"}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0284C7] shadow-2xs cursor-pointer"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="in_review">In Clinical Review</option>
                    <option value="replied">Replied</option>
                    <option value="closed">Closed / Resolved</option>
                  </select>
                </div>
              </div>

              {/* Student Course Purchase & Enrollment Intelligence Banner */}
              <div className="px-4 py-2 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Course Status:
                  </span>

                  {loadingPurchase ? (
                    <span className="text-slate-500 text-xs flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin text-[#0284C7]" />
                      <span>Checking purchase records...</span>
                    </span>
                  ) : purchaseInfo?.hasPurchasedCourses || selectedThread?.hasPurchasedCourses ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Enrolled Student (
                          {purchaseInfo?.enrolledCoursesCount || selectedThread?.enrolledCoursesCount || 1}{" "}
                          {(purchaseInfo?.enrolledCoursesCount || selectedThread?.enrolledCoursesCount || 1) === 1
                            ? "Course"
                            : "Courses"}{" "}
                          Purchased)
                        </span>
                      </span>

                      {/* View Courses Button */}
                      {purchaseInfo?.enrolledCoursesList?.length > 0 && (
                        <button
                          onClick={() => setShowCourseDetails(!showCourseDetails)}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0284C7] border border-slate-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>{showCourseDetails ? "Hide Courses" : "View Purchased Courses"}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>No Courses Purchased Yet (Free Inquiry / Prospective Lead)</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Total Orders / Spending Stats */}
                {purchaseInfo?.orders?.length > 0 && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>
                      Orders: <strong className="text-slate-800">{purchaseInfo.orders.length}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Total Paid:{" "}
                      <strong className="text-emerald-700 font-mono font-bold">
                        ₹
                        {purchaseInfo.orders
                          .reduce((s, o) => s + (Number(o.price) || 0), 0)
                          .toLocaleString()}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Expandable Purchased Courses Dropdown */}
              {showCourseDetails && purchaseInfo?.enrolledCoursesList?.length > 0 && (
                <div className="p-3 bg-sky-50/90 border-b border-sky-100 text-xs text-slate-800 space-y-1.5 shrink-0">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold uppercase tracking-wider">
                    <span>Purchased Courses by this Parent:</span>
                    <button
                      onClick={() => setShowCourseDetails(false)}
                      className="text-slate-500 hover:text-slate-800 cursor-pointer text-xs"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {purchaseInfo.enrolledCoursesList.map((cName, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white border border-sky-200 flex items-center gap-2 text-xs shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate font-semibold text-slate-800">{cName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= CONVERSATION MESSAGES BODY (NO AI MESSAGES, LIGHT THEME) ================= */}
              <div
                ref={chatScrollContainerRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar bg-[#F4F6F8]"
              >
                {loadingMessages ? (
                  <div className="p-8 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0284C7] mx-auto mb-2"></div>
                    <p className="text-xs">Loading consultation messages...</p>
                  </div>
                ) : displayMessages.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm">
                    No parent inquiries yet in this consultation thread.
                  </div>
                ) : (
                  displayMessages.map((msg, idx) => {
                    const isTherapist = msg.sender === "therapist";
                    const isUser = msg.sender === "user";

                    const currentDateStr = getDateStringForDivider(msg.createdAt);
                    const prevItem = displayMessages[idx - 1];
                    const prevDateStr = prevItem ? getDateStringForDivider(prevItem.createdAt) : null;
                    const showDateDivider = currentDateStr !== prevDateStr;

                    return (
                      <React.Fragment key={msg.id || idx}>
                        {showDateDivider && (
                          <div className="flex justify-center my-3 select-none">
                            <span className="px-3.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-[10px] font-bold shadow-xs uppercase tracking-wider">
                              {currentDateStr}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex flex-col group ${
                            isTherapist ? "items-end" : "items-start"
                          }`}
                        >
                          <div className="relative max-w-[85%] sm:max-w-[78%]">
                            {/* Speech Bubble */}
                            <div
                              className={`rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                                isTherapist
                                  ? "bg-[#071838] text-white rounded-tr-xs"
                                  : "bg-white border border-slate-200 text-slate-900 rounded-tl-xs"
                              }`}
                            >
                              {/* Header inside Bubble */}
                              <div
                                className={`flex items-center justify-between gap-4 mb-1.5 pb-1 text-[11px] border-b ${
                                  isTherapist ? "border-white/15 text-slate-300" : "border-slate-100 text-slate-500"
                                }`}
                              >
                                <span className="font-extrabold text-[#0284C7]">
                                  {isTherapist
                                    ? msg.senderName || "Dr. Rehablito Expert"
                                    : msg.senderName || selectedThread.userName || "Patient Parent"}
                                </span>
                                <span className="text-[10px]">
                                  {msg.createdAt?.toDate
                                    ? msg.createdAt.toDate().toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "Recently"}
                                </span>
                              </div>

                              {/* Quoted Message (When Therapist replies to specific message) */}
                              {msg.replyTo && (
                                <div
                                  className={`mb-2 p-2 rounded-xl border-l-3 text-[11px] ${
                                    isTherapist
                                      ? "bg-white/10 border-[#5edff4] text-slate-200"
                                      : "bg-slate-100 border-[#0284C7] text-slate-700"
                                  }`}
                                >
                                  <div className="font-bold flex items-center gap-1">
                                    <CornerUpLeft className="w-3 h-3 text-[#0284C7]" />
                                    <span>
                                      Quoted from {msg.replyTo.senderName || "Parent"}:
                                    </span>
                                  </div>
                                  <div className="line-clamp-2 italic opacity-90 mt-0.5">
                                    "{msg.replyTo.text ? msg.replyTo.text.replace(/[#*`_~]/g, "") : "Attachment"}"
                                  </div>
                                </div>
                              )}

                              {/* Message Text */}
                              {msg.text && (
                                <FormattedMessageText
                                  text={msg.text}
                                  isUser={isTherapist}
                                />
                              )}

                              {/* Attachments */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div
                                  className={`mt-2.5 pt-2 border-t space-y-2 ${
                                    isTherapist ? "border-white/15" : "border-slate-100"
                                  }`}
                                >
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider block ${
                                      isTherapist ? "text-slate-300" : "text-slate-500"
                                    }`}
                                  >
                                    Attachments ({msg.attachments.length}):
                                  </span>

                                  {msg.attachments.map((att, aIdx) => (
                                    <div key={aIdx} className="w-full">
                                      {/* Doctor Prescription / Medical Image */}
                                      {att.type === "image" && (
                                        <div className="rounded-xl overflow-hidden border border-slate-200 max-w-sm mt-1 bg-white p-1 shadow-2xs">
                                          <img
                                            src={att.url || att.dataUrl}
                                            alt="Prescription or Photo"
                                            onClick={() => setPreviewImage(att.url || att.dataUrl)}
                                            className="w-full h-auto max-h-52 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                          />
                                          <div className="p-1.5 flex items-center justify-between text-[10px] text-slate-600">
                                            <span className="truncate">{att.name}</span>
                                            <button
                                              onClick={() => setPreviewImage(att.url || att.dataUrl)}
                                              className="text-[#0284C7] hover:underline font-bold"
                                            >
                                              🔍 Enlarge
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* Medical PDF Report */}
                                      {att.type === "pdf" && (
                                        <a
                                          href={att.url || att.dataUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 hover:border-[#0284C7] shadow-2xs transition-colors"
                                        >
                                          <FileText className="w-5 h-5 text-[#E6007E]" />
                                          <div>
                                            <span className="font-bold block truncate max-w-[200px]">
                                              {att.name}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                              Click to Open Medical PDF ↗
                                            </span>
                                          </div>
                                        </a>
                                      )}

                                      {/* Audio Note */}
                                      {att.type === "audio" && (
                                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                                          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                                            <Mic className="w-4 h-4" />
                                            <span>Voice Note ({att.name}):</span>
                                          </div>
                                          <audio
                                            src={att.url || att.dataUrl}
                                            controls
                                            className="w-full h-8"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Swipe / Click to Reply Action Button (WhatsApp Style) */}
                            <button
                              onClick={() => handleSelectReplyTarget(msg)}
                              title="Reply to this message"
                              className={`absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white border border-slate-200 shadow-xs hover:bg-sky-50 text-slate-500 hover:text-[#0284C7] cursor-pointer ${
                                isTherapist ? "-left-8" : "-right-8"
                              }`}
                            >
                              <Reply className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ================= COMPOSER & QUICK TEMPLATES (LIGHT THEME) ================= */}
              {/* ================= COMPOSER & QUICK TEMPLATES (LIGHT THEME) ================= */}
              <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 shrink-0 space-y-2.5 shadow-lg">
                {/* Accessible File Input for Image & PDF attachments */}
                <input
                  id="therapist-chat-file-input"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  onClick={(e) => {
                    e.target.value = "";
                  }}
                  multiple
                  accept="image/*,application/pdf,.pdf"
                  className="sr-only"
                  style={{
                    position: "absolute",
                    width: "1px",
                    height: "1px",
                    padding: 0,
                    margin: "-1px",
                    overflow: "hidden",
                    clip: "rect(0, 0, 0, 0)",
                    whiteSpace: "nowrap",
                    border: 0,
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                />

                {/* Quoted Reply Banner (WhatsApp Style) */}
                {replyingTo && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50 border-l-4 border-[#0284C7] text-xs text-slate-800 shadow-2xs animate-fadeIn">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1 font-bold text-[#0284C7]">
                        <CornerUpLeft className="w-3.5 h-3.5" />
                        <span>Replying to {replyingTo.senderName}:</span>
                      </div>
                      <p className="line-clamp-1 text-slate-600 text-[11px] mt-0.5 italic">
                        "{replyingTo.text}"
                      </p>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="p-1 rounded-lg hover:bg-sky-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Cancel Reply"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Attachments Preview Chips */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pb-1.5 border-b border-slate-200">
                    {attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 shadow-2xs"
                      >
                        {att.type === "image" ? (
                          <ImageIcon className="w-3.5 h-3.5 text-[#0284C7]" />
                        ) : att.type === "pdf" ? (
                          <FileText className="w-3.5 h-3.5 text-[#E6007E]" />
                        ) : (
                          <Mic className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span className="max-w-[130px] sm:max-w-[200px] truncate font-semibold">
                          {att.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Remove Attachment"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Live Audio Recording Bar */}
                {isRecording && (
                  <div className="flex items-center justify-between p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-ping" />
                      <span>Recording Voice Guidance... {formatAudioTime(recordingDuration)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={cancelRecording}
                        className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 hover:bg-rose-100 text-rose-600 text-xs cursor-pointer font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs cursor-pointer font-bold"
                      >
                        Attach Audio
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Clinical Templates Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs custom-scrollbar">
                  <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">
                    Templates:
                  </span>
                  {QUICK_TEMPLATES.map((tpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendReply(tpl)}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0"
                    >
                      {tpl.slice(0, 32)}...
                    </button>
                  ))}
                </div>

                {/* Reply Controls: Attach Button, Mic, Textarea, Send Button */}
                <div className="flex items-end gap-2">
                  {/* Media Buttons: File Attachment (Images/PDF) & Mic (Voice Note) */}
                  <div className="flex items-center gap-1.5 pb-1">
                    <label
                      htmlFor={sending || isRecording ? undefined : "therapist-chat-file-input"}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-center select-none shadow-2xs ${
                        sending || isRecording
                          ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-[#0284C7] cursor-pointer active:scale-95"
                      }`}
                      title="Choose Document / Attach Image or Clinical PDF"
                    >
                      <Paperclip className="w-4 h-4" />
                    </label>

                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                        isRecording
                          ? "bg-rose-600 text-white border-rose-600 animate-pulse"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-emerald-600"
                      }`}
                      title={isRecording ? "Stop Recording" : "Record Voice Note"}
                      disabled={sending}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Textarea */}
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      placeholder="Type clinical evaluation, home exercise plan, or prescription advice... (Press Enter to Send)"
                      rows={2}
                      disabled={sending}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0284C7] focus:bg-white transition-all resize-none shadow-2xs"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendReply()}
                    disabled={sending || (!replyText.trim() && attachments.length === 0)}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0284C7] to-[#0ea5e9] hover:from-[#0369a1] hover:to-[#0284C7] text-white font-black text-xs sm:text-sm shadow-md shadow-sky-500/20 transition-all transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-2 p-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-semibold">Select a patient thread from the left to view consultation history.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Enlarge Image */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-slate-900/80 text-white rounded-full p-1.5 hover:bg-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Prescription Enlarge"
              className="w-full h-full max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistChatManager;
