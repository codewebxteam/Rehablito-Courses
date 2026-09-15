import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Stethoscope,
  Send,
  Paperclip,
  Mic,
  Square,
  Trash2,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Clock,
  ShieldCheck,
  User,
  Brain,
  Maximize2,
  Minimize2,
  Columns,
  CheckCheck,
  X,
  CornerUpLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import { analyzeConsultationWithAI } from "../services/geminiService";
import {
  getOrCreateConsultationThread,
  listenToThreadMessages,
  sendUserConsultationMessage,
  uploadAttachmentFile,
  recordAIEvaluationMessage,
  clearConsultationMessages,
  getCachedConsultationData,
  setCachedConsultationData,
  clearConsultationCache,
  autoCleanupExpiredConsultations,
} from "../services/consultationService";
import FormattedMessageText from "../components/chat/FormattedMessageText";

/**
 * WhatsApp-style date divider helper
 * Returns "Today", "Yesterday", or formatted date like "14 Sep 2026"
 */
export const getDateStringForDivider = (timestamp) => {
  if (!timestamp) return "Today";
  let date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (typeof timestamp === "number" || typeof timestamp === "string") {
    date = new Date(timestamp);
  } else {
    return "Today";
  }

  if (isNaN(date.getTime())) return "Today";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const timeDiff = today.getTime() - target.getTime();
  const dayDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));

  if (dayDiff === 0) {
    return "Today";
  } else if (dayDiff === 1) {
    return "Yesterday";
  } else {
    return target.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
};

/**
 * WhatsApp-style message timestamp (e.g. "04:15 PM")
 */
export const formatMessageTime = (timestamp) => {
  if (!timestamp) return "Just now";
  let date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (typeof timestamp === "number" || typeof timestamp === "string") {
    date = new Date(timestamp);
  } else {
    return "Just now";
  }
  if (isNaN(date.getTime())) return "Just now";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ConsultationChat = ({ isDashboard = false }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Firestore Thread & Messages initialized from Memory / LocalStorage Cache
  const [thread, setThread] = useState(() => {
    const cached = currentUser?.uid ? getCachedConsultationData(currentUser.uid) : null;
    return cached?.thread || null;
  });

  const [messages, setMessages] = useState(() => {
    const cached = currentUser?.uid ? getCachedConsultationData(currentUser.uid) : null;
    return cached?.messages || [];
  });

  // If cached thread exists, loadingThread is FALSE immediately (0ms instant render, no spinner)
  const [loadingThread, setLoadingThread] = useState(() => {
    const cached = currentUser?.uid ? getCachedConsultationData(currentUser.uid) : null;
    return !cached?.thread;
  });

  // Local in-flight queue for instant optimistic display before Firestore writes confirm
  const [localAiQueue, setLocalAiQueue] = useState([]);
  const [aiThinking, setAiThinking] = useState(false);

  // User input & attachments
  const [inputText, setInputText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);

  // Voice Note Recorder
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);

  // View Mode: 'split' | 'ai-full' | 'therapist-full'
  const [viewMode, setViewMode] = useState("split");

  // Mobile Tab: 'ai' or 'therapist'
  const [mobileTab, setMobileTab] = useState("ai");

  // Lightbox Modal for viewing photos enlarged
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Clear Chat Confirmation Modal State
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [clearingChat, setClearingChat] = useState(false);

  // Scroll & DOM Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const isSendingRef = useRef(false);

  const aiScrollContainerRef = useRef(null);
  const therapistScrollContainerRef = useRef(null);
  const aiBottomAnchorRef = useRef(null);
  const therapistBottomAnchorRef = useRef(null);

  // Scroll Helper Functions (Snaps to absolute bottom like WhatsApp)
  const scrollToBottomInstant = (containerRef, anchorRef) => {
    if (containerRef?.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    if (anchorRef?.current) {
      anchorRef.current.scrollIntoView({ behavior: "auto", block: "end" });
    }
  };

  const scrollToBottomSmooth = (containerRef, anchorRef) => {
    if (containerRef?.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
    if (anchorRef?.current) {
      anchorRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  // Instant scroll on initial mount if cached messages exist
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottomInstant(therapistScrollContainerRef, therapistBottomAnchorRef);
      scrollToBottomInstant(aiScrollContainerRef, aiBottomAnchorRef);
    }
  }, []);

  // 1. Thread Initialization & Real-time Messages with Cache-First Strategy
  useEffect(() => {
    if (!currentUser) {
      if (!authLoading) {
        setLoadingThread(false);
      }
      return;
    }

    let unsubscribe = () => {};

    const initThread = async () => {
      try {
        // Fast-path: Check memory or localStorage cache first
        const cached = getCachedConsultationData(currentUser.uid);
        let activeThread = thread || cached?.thread;

        if (cached?.thread) {
          if (!thread) setThread(cached.thread);
          if (cached.messages?.length > 0 && messages.length === 0) {
            setMessages(cached.messages);
          }
          // Zero loading spinner! Instant UI display
          setLoadingThread(false);
        }

        // If no cached thread exists at all, fetch or create once from Firestore
        if (!activeThread) {
          setLoadingThread(true);
          activeThread = await getOrCreateConsultationThread(currentUser, {
            specialty: "Child Rehabilitation & Therapy",
          });
          setThread(activeThread);
          setCachedConsultationData(currentUser.uid, { thread: activeThread });
        }

        // Attach real-time listener to keep cache and state fresh
        if (activeThread?.id) {
          unsubscribe = listenToThreadMessages(activeThread.id, (msgs) => {
            setMessages(msgs);
            // Save fresh messages in cache memory & localStorage
            setCachedConsultationData(currentUser.uid, {
              thread: activeThread,
              messages: msgs,
            });

            // Instant scroll to bottom when new messages arrive from Firestore
            setTimeout(() => {
              scrollToBottomInstant(therapistScrollContainerRef, therapistBottomAnchorRef);
              scrollToBottomInstant(aiScrollContainerRef, aiBottomAnchorRef);
            }, 50);
          });
        }
        // Auto-cleanup consultation chats older than 7 days (runs once daily in background)
        const lastCleanup = localStorage.getItem("last_consultation_cleanup_timestamp");
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (!lastCleanup || Date.now() - Number(lastCleanup) > oneDayMs) {
          localStorage.setItem("last_consultation_cleanup_timestamp", String(Date.now()));
          autoCleanupExpiredConsultations(7).catch((err) =>
            console.warn("[Cleanup] Auto-cleanup background notice:", err)
          );
        }
      } catch (err) {
        console.error("Failed to initialize consultation thread:", err);
      } finally {
        setLoadingThread(false);
      }
    };

    initThread();

    return () => unsubscribe();
  }, [currentUser, authLoading]);

  // 2. Derive AI Column Messages (User queries + AI answers)
  const aiColumnMessages = useMemo(() => {
    // 1. From Firestore: all user queries and all AI responses
    const firestoreItems = messages.filter(
      (m) => m.sender === "user" || m.sender === "ai"
    );

    // 2. Add local optimistic items if not already stored in Firestore
    const combined = [...firestoreItems];
    localAiQueue.forEach((local) => {
      const exists = combined.some((m) => {
        if (local.id && m.id === local.id) return true;
        // Compare text if both have text
        if (
          local.text &&
          m.text &&
          local.text.trim() === m.text.trim() &&
          m.sender === local.sender
        ) {
          return true;
        }
        // Compare attachments if text is empty or matches
        if (
          m.sender === local.sender &&
          local.attachments?.length &&
          m.attachments?.length &&
          local.attachments[0]?.name === m.attachments[0]?.name
        ) {
          return true;
        }
        return false;
      });
      if (!exists) {
        combined.push(local);
      }
    });

    // 3. Sort chronologically (oldest at top, newest at bottom)
    return combined.sort((a, b) => {
      const timeA = a.createdAt?.toDate
        ? a.createdAt.toDate().getTime()
        : new Date(a.createdAt || 0).getTime();
      const timeB = b.createdAt?.toDate
        ? b.createdAt.toDate().getTime()
        : new Date(b.createdAt || 0).getTime();
      return timeA - timeB;
    });
  }, [messages, localAiQueue]);

  // 3. Derive Human Therapist Column Messages (User queries + Therapist replies)
  const therapistThreadMessages = useMemo(() => {
    return messages
      .filter((m) => m.channel !== "ai" && (m.sender === "user" || m.sender === "therapist"))
      .sort((a, b) => {
        const timeA = a.createdAt?.toDate
          ? a.createdAt.toDate().getTime()
          : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toDate
          ? b.createdAt.toDate().getTime()
          : new Date(b.createdAt || 0).getTime();
        return timeA - timeB;
      });
  }, [messages]);

  const hasTherapistReplied = therapistThreadMessages.some(
    (m) => m.sender === "therapist"
  );

  // Read receipt check: 2 grey ticks (delivered) vs 2 blue ticks (seen/replied by therapist)
  const isMessageSeenOrReplied = (msg) => {
    if (thread?.status === "replied") return true;
    if (msg.readByAdmin || msg.status === "read") return true;

    const msgTime = msg.createdAt?.toDate
      ? msg.createdAt.toDate().getTime()
      : new Date(msg.createdAt || 0).getTime();

    // Has a therapist message arrived after this user query?
    const hasLaterTherapistMsg = therapistThreadMessages.some((m) => {
      if (m.sender !== "therapist") return false;
      const tTime = m.createdAt?.toDate
        ? m.createdAt.toDate().getTime()
        : new Date(m.createdAt || 0).getTime();
      return tTime >= msgTime;
    });
    if (hasLaterTherapistMsg) return true;

    // Has admin seen this thread after this message was posted?
    if (thread?.adminSeenAt) {
      const seenTime = thread.adminSeenAt.toDate
        ? thread.adminSeenAt.toDate().getTime()
        : new Date(thread.adminSeenAt).getTime();
      if (seenTime >= msgTime) return true;
    }

    return false;
  };

  // 4. WhatsApp-style: Initial Mount & Data Loaded Scroll to Bottom
  useLayoutEffect(() => {
    if (!loadingThread) {
      scrollToBottomInstant(aiScrollContainerRef, aiBottomAnchorRef);
      scrollToBottomInstant(therapistScrollContainerRef, therapistBottomAnchorRef);

      const t1 = setTimeout(() => {
        scrollToBottomInstant(aiScrollContainerRef, aiBottomAnchorRef);
        scrollToBottomInstant(therapistScrollContainerRef, therapistBottomAnchorRef);
      }, 80);

      const t2 = setTimeout(() => {
        scrollToBottomInstant(aiScrollContainerRef, aiBottomAnchorRef);
        scrollToBottomInstant(therapistScrollContainerRef, therapistBottomAnchorRef);
      }, 250);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [loadingThread]);

  // 5. WhatsApp-style: Auto-scroll when new messages arrive or AI is thinking
  useEffect(() => {
    scrollToBottomSmooth(aiScrollContainerRef, aiBottomAnchorRef);
  }, [aiColumnMessages.length, aiThinking]);

  useEffect(() => {
    scrollToBottomSmooth(therapistScrollContainerRef, therapistBottomAnchorRef);
  }, [therapistThreadMessages.length]);

  // 6. View Mode / Tab change scroll adjustment
  useEffect(() => {
    const t = setTimeout(() => {
      scrollToBottomInstant(aiScrollContainerRef, aiBottomAnchorRef);
      scrollToBottomInstant(therapistScrollContainerRef, therapistBottomAnchorRef);
    }, 50);
    return () => clearTimeout(t);
  }, [viewMode, mobileTab]);

  // 7. Voice Note Recording Handlers
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
        setAudioBlob(audioBlobObj);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlobObj);
        reader.onloadend = () => {
          const base64Data = reader.result;
          setAttachments((prev) => [
            ...prev,
            {
              type: "audio",
              name: `Voice Note (${recordingDuration}s).webm`,
              dataUrl: base64Data,
              blob: audioBlobObj,
              duration: recordingDuration,
            },
          ]);
        };

        // Stop all tracks
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
      alert("Unable to access microphone. Please check browser permissions.");
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
      setAudioBlob(null);
    }
  };

  // 8. File Upload (Doctor Parchi, Medical PDF reports, Photos)
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
        alert("Please upload only Images (Doctor Parchi / Prescriptions) or PDF clinical reports.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit. Please upload an image or document under 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const originalDataUrl = event.target.result;

        if (isImg) {
          // Downscale high-res photos for lightning-fast Gemini AI analysis (~100KB)
          const img = new Image();
          img.onload = () => {
            const maxDim = 1280;
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.78);

            setAttachments((prev) => [
              ...prev,
              {
                type: "image",
                name: file.name,
                dataUrl: optimizedDataUrl, // Lightweight base64 for instant Gemini AI OCR
                blob: file, // 100% full original file for ImageKit CDN upload
              },
            ]);
          };
          img.onerror = () => {
            setAttachments((prev) => [
              ...prev,
              {
                type: "image",
                name: file.name,
                dataUrl: originalDataUrl,
                blob: file,
              },
            ]);
          };
          img.src = originalDataUrl;
        } else {
          // PDF clinical document
          setAttachments((prev) => [
            ...prev,
            {
              type: "pdf",
              name: file.name,
              dataUrl: originalDataUrl,
              blob: file,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // 9. Send Consultation Message (Multimodal -> AI + Therapist Queue)
  const handleSendMessage = async () => {
    if (isSendingRef.current || sending) return;

    const trimmed = inputText.trim();
    if (!trimmed && attachments.length === 0) return;

    isSendingRef.current = true;
    setSending(true);
    const activeAttachments = [...attachments];
    setInputText("");
    setAttachments([]);
    setAudioBlob(null);

    const now = new Date();
    const tempId = "local-user-" + Date.now();

    // Optimistic user item in AI queue
    const userQueryItem = {
      id: tempId,
      sender: "user",
      text: trimmed,
      attachments: activeAttachments,
      createdAt: now,
    };
    setLocalAiQueue((prev) => [...prev, userQueryItem]);
    setAiThinking(true);

    // Call Gemini AI (With strict Hindi language instruction & multi-turn history)
    analyzeConsultationWithAI({
      text: trimmed,
      attachments: activeAttachments,
      childSpecialty: "Pediatric Rehabilitation & Therapy",
      chatHistory: aiColumnMessages.slice(-6),
    })
      .then(async (aiResult) => {
        const aiReplyItem = {
          id: "local-ai-" + (Date.now() + 1),
          sender: "ai",
          text: aiResult.text,
          createdAt: new Date(),
          isFallback: aiResult.isFallback,
        };
        setLocalAiQueue((prev) => [...prev, aiReplyItem]);

        if (thread?.id) {
          await recordAIEvaluationMessage({
            threadId: thread.id,
            text: aiResult.text,
          });
          setLocalAiQueue((prev) => prev.filter((item) => item.id !== aiReplyItem.id));
        }
      })
      .catch((err) => {
        console.error("AI Analysis error:", err);
      })
      .finally(() => {
        setAiThinking(false);
      });

    // Send to Human Therapist Firestore Queue
    try {
      const uploadedAttachments = await Promise.all(
        activeAttachments.map(async (att) => {
          let uploadRes = { url: "", fileId: null };
          if (att.blob) {
            uploadRes = await uploadAttachmentFile(att.blob, currentUser.uid);
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

      if (thread?.id) {
        await sendUserConsultationMessage({
          threadId: thread.id,
          user: currentUser,
          text: trimmed,
          attachments: uploadedAttachments,
        });
        setLocalAiQueue((prev) => prev.filter((item) => item.id !== tempId));
      }
    } catch (err) {
      console.error("Failed to send message to therapist queue:", err);
    } finally {
      isSendingRef.current = false;
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatAudioTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Clear chat handler with Firebase deletion and optimistic state reset
  const handleConfirmClearChat = async () => {
    if (!thread?.id) {
      setLocalAiQueue([]);
      setShowClearConfirmModal(false);
      return;
    }
    setClearingChat(true);
    try {
      await clearConsultationMessages(thread.id);
      if (currentUser?.uid) {
        clearConsultationCache(currentUser.uid);
      }
      setMessages([]);
      setLocalAiQueue([]);
      setShowClearConfirmModal(false);
    } catch (err) {
      console.error("Failed to clear chat:", err);
      alert("Chat clear karne me samasya aayi. Kripya punah prayas karein.");
    } finally {
      setClearingChat(false);
    }
  };

  if (authLoading && !thread) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E6007E]"></div>
          <p className="text-slate-500 text-sm font-semibold">Loading Consultation Hub...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 pt-28 sm:pt-36 pb-12">
        <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 text-center shadow-xl space-y-6">
          <div className="size-16 mx-auto bg-gradient-to-tr from-[#E6007E] to-[#5edff4] rounded-2xl flex items-center justify-center shadow-md">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-[#0F1B3D]">
              Chat with <span className="text-[#E6007E]">Rehablito Experts</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
              Connect directly with certified therapists and our AI therapy assistant. Send text, voice notes, photos, and PDF reports.
            </p>
          </div>

          <button
            onClick={() => setIsAuthOpen(true)}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#071838] hover:bg-[#0F1B3D] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4 text-[#5edff4]" />
            <span>Login to Start Consultation</span>
          </button>
        </div>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          defaultView="login"
        />
      </div>
    );
  }

  return (
    <div
      className={`font-sans text-[#0F1B3D] overflow-hidden flex flex-col select-text ${
        isDashboard
          ? "h-full flex-1 max-h-full"
          : "fixed inset-x-0 top-[98px] sm:top-[122px] lg:top-[114px] bottom-0 bg-slate-50"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 flex flex-col flex-1 h-full overflow-hidden min-h-0 pt-3.5 sm:pt-4.5 pb-2.5 sm:pb-3">
        
        {/* ================= HEADER BAR (Clean, Light Theme) ================= */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs mb-2 sm:mb-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#FCE7F3] border border-[#fbcfe8] flex items-center justify-center text-[#E6007E] shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-[#0F1B3D] leading-tight">
                  Consultation Hub
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Dual Stream: Instant AI Evaluation & Certified Therapist Review
              </p>
            </div>
          </div>

          {/* Right Controls: Status Pills, Clear Chat & Dual View Toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                AI Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Therapist Standby
              </span>
            </div>

            {/* Clear Chat Button (With Confirmation) */}
            <button
              onClick={() => setShowClearConfirmModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50/80 hover:bg-red-100 text-red-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Clear consultation chat history"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>

            {viewMode !== "split" && (
              <button
                onClick={() => setViewMode("split")}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Restore 50/50 Dual Column View"
              >
                <Columns className="w-3.5 h-3.5 text-[#E6007E]" />
                <span>Show Both Columns</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile View Switcher (Visible on small screens) */}
        <div className="lg:hidden flex items-center mb-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs shrink-0">
          <button
            onClick={() => setMobileTab("ai")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === "ai"
                ? "bg-[#E6007E] text-white shadow-xs"
                : "text-slate-600 hover:text-[#0F1B3D]"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Evaluation</span>
            {aiThinking && <span className="size-2 rounded-full bg-white animate-ping"></span>}
          </button>
          <button
            onClick={() => setMobileTab("therapist")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === "therapist"
                ? "bg-[#071838] text-white shadow-xs"
                : "text-slate-600 hover:text-[#0F1B3D]"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Certified Therapist</span>
            {hasTherapistReplied && <span className="size-2 rounded-full bg-emerald-400"></span>}
          </button>
        </div>

        {/* ================= FIXED-HEIGHT SCROLLABLE CHAT CONTAINER (WHATSAPP-STYLE) ================= */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-hidden min-h-0">
          
          {/* ================= COLUMN 1: AI ASSISTANT ================= */}
          {(viewMode === "split" || viewMode === "ai-full") && (
            <div
              className={`flex flex-col bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs min-h-0 ${
                viewMode === "ai-full" ? "lg:col-span-2" : ""
              } ${mobileTab !== "ai" ? "hidden lg:flex" : "flex"}`}
            >
              {/* Header */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-[#FCE7F3] border border-[#fbcfe8] flex items-center justify-center text-[#E6007E]">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-extrabold text-[#0F1B3D] flex items-center gap-1">
                      AI Therapy Assistant
                      <Sparkles className="w-3 h-3 text-[#E6007E]" />
                    </h2>
                    <p className="text-[10px] text-slate-500">
                      Instant Clinical Guidance
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">
                    Instant
                  </span>
                  <button
                    onClick={() => setViewMode(viewMode === "ai-full" ? "split" : "ai-full")}
                    className="hidden lg:flex p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title={viewMode === "ai-full" ? "Restore Split View" : "Full Screen AI View"}
                  >
                    {viewMode === "ai-full" ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Message Stream Body (Fixed Scroll, Starts at Bottom) */}
              <div
                ref={aiScrollContainerRef}
                className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0 custom-scrollbar bg-slate-50/50"
              >
                {aiColumnMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
                    <div className="size-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#E6007E]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="max-w-xs">
                      <h3 className="text-xs sm:text-sm font-bold text-[#0F1B3D]">
                        Instant Clinical Evaluation
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Send child symptoms, audio notes, or upload reports below. AI will respond immediately in your language.
                      </p>
                      <div className="mt-3.5 flex flex-col items-center gap-1.5">
                        <label
                          htmlFor="user-consultation-file-input"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#E6007E] border border-pink-200 font-bold text-xs transition-all shadow-2xs cursor-pointer active:scale-95"
                          title="Click to Choose Document, Doctor's Parchi or PDF Report"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-[#E6007E]" />
                          <span>Choose Document / पर्ची व रिपोर्ट अपलोड करें</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Supports: Doctor's Prescription (Parchi), Assessment PDF, Photos
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  aiColumnMessages.map((item, index) => {
                    const currentDateStr = getDateStringForDivider(item.createdAt);
                    const prevItem = aiColumnMessages[index - 1];
                    const prevDateStr = prevItem ? getDateStringForDivider(prevItem.createdAt) : null;
                    const showDateDivider = currentDateStr !== prevDateStr;

                    return (
                      <React.Fragment key={item.id || index}>
                        {/* WhatsApp-style Date Divider */}
                        {showDateDivider && (
                          <div className="flex justify-center my-3 select-none">
                            <span className="px-3.5 py-1 rounded-full bg-slate-200/90 border border-slate-300/60 text-slate-700 text-[10px] font-bold shadow-xs uppercase tracking-wider">
                              {currentDateStr}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex flex-col ${
                            item.sender === "user" ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                              item.sender === "user"
                                ? "bg-[#071838] text-white rounded-tr-xs"
                                : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-xs"
                            }`}
                          >
                            {item.sender === "ai" && (
                              <div className="flex items-center gap-1.5 text-[#E6007E] font-bold text-xs mb-1.5">
                                <Bot className="w-3.5 h-3.5" />
                                <span>Rehablito AI Evaluation:</span>
                              </div>
                            )}

                            <FormattedMessageText
                              text={item.text}
                              isUser={item.sender === "user"}
                            />

                            {/* Attachments rendering */}
                            {item.attachments && item.attachments.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-200/60 space-y-1.5">
                                {item.attachments.map((att, aIdx) => (
                                  <div key={aIdx}>
                                    {att.type === "image" && (
                                      <div className="rounded-xl overflow-hidden border border-slate-200 max-w-xs mt-1 bg-white p-1">
                                        <img
                                          src={att.url || att.dataUrl}
                                          alt="Uploaded Attachment"
                                          onLoad={() =>
                                            scrollToBottomInstant(
                                              aiScrollContainerRef,
                                              aiBottomAnchorRef
                                            )
                                          }
                                          onClick={() =>
                                            setPreviewPhoto(att.url || att.dataUrl)
                                          }
                                          className="w-full h-auto max-h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        />
                                      </div>
                                    )}

                                    {att.type === "pdf" && (
                                      <a
                                        href={att.url || att.dataUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 hover:border-[#E6007E] transition-colors"
                                      >
                                        <FileText className="w-4 h-4 text-[#E6007E]" />
                                        <span className="truncate max-w-[130px] font-semibold">
                                          {att.name}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-bold">
                                          (PDF)
                                        </span>
                                      </a>
                                    )}

                                    {att.type === "audio" && (
                                      <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2 mt-1">
                                        <audio
                                          src={att.url || att.dataUrl}
                                          controls
                                          className="w-full h-7"
                                        />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Timestamp with WhatsApp checkmark */}
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                item.sender === "user" ? "text-slate-300" : "text-slate-400"
                              }`}
                            >
                              <span>{formatMessageTime(item.createdAt)}</span>
                              {item.sender === "user" && (
                                <CheckCheck className="w-3.5 h-3.5 text-[#5edff4] shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}

                {aiThinking && (
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 w-fit shadow-xs">
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-[#E6007E]"></div>
                    <span className="font-medium animate-pulse text-[11px]">
                      AI is evaluating developmental parameters...
                    </span>
                  </div>
                )}

                {/* Bottom Anchor for auto-scroll */}
                <div ref={aiBottomAnchorRef} className="h-1" />
              </div>
            </div>
          )}

          {/* ================= COLUMN 2: HUMAN THERAPIST ================= */}
          {(viewMode === "split" || viewMode === "therapist-full") && (
            <div
              className={`flex flex-col bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs min-h-0 ${
                viewMode === "therapist-full" ? "lg:col-span-2" : ""
              } ${mobileTab !== "therapist" ? "hidden lg:flex" : "flex"}`}
            >
              {/* Header */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-[#E0F2FE] border border-[#bae6fd] flex items-center justify-center text-[#0284C7]">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-extrabold text-[#0F1B3D] flex items-center gap-1">
                      Certified Clinical Specialist
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </h2>
                    <p className="text-[10px] text-slate-500">
                      Rehabilitation Team Review
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      hasTherapistReplied
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {hasTherapistReplied ? "Replied" : "Pending Review"}
                  </span>
                  <button
                    onClick={() =>
                      setViewMode(viewMode === "therapist-full" ? "split" : "therapist-full")
                    }
                    className="hidden lg:flex p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title={viewMode === "therapist-full" ? "Restore Split View" : "Full Screen Therapist View"}
                  >
                    {viewMode === "therapist-full" ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Message Stream Body (Fixed Scroll, Starts at Bottom) */}
              <div
                ref={therapistScrollContainerRef}
                className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0 custom-scrollbar bg-slate-50/50"
              >
                {/* Neutral Waiting Card */}
                {!hasTherapistReplied && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800">
                      <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                      <span>Please wait, Therapist will reply soon</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Your query, case details, and attachments have been queued for our certified rehabilitation specialist on duty. You will receive an official clinical evaluation in this column shortly.
                    </p>
                    <div className="pt-1 border-t border-amber-200/60 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Status: <strong>In Clinical Queue</strong></span>
                      <span className="font-mono">Case #{thread?.id?.slice(-6) || "0487"}</span>
                    </div>
                  </div>
                )}

                {/* Render Message Thread with WhatsApp Date Dividers */}
                {therapistThreadMessages.map((msg, index) => {
                  const currentDateStr = getDateStringForDivider(msg.createdAt);
                  const prevItem = therapistThreadMessages[index - 1];
                  const prevDateStr = prevItem ? getDateStringForDivider(prevItem.createdAt) : null;
                  const showDateDivider = currentDateStr !== prevDateStr;

                  return (
                    <React.Fragment key={msg.id || index}>
                      {showDateDivider && (
                        <div className="flex justify-center my-3 select-none">
                          <span className="px-3.5 py-1 rounded-full bg-slate-200/90 border border-slate-300/60 text-slate-700 text-[10px] font-bold shadow-xs uppercase tracking-wider">
                            {currentDateStr}
                          </span>
                        </div>
                      )}

                      <div
                        className={`flex flex-col ${
                          msg.sender === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                            msg.sender === "user"
                              ? "bg-[#071838] text-white rounded-tr-xs"
                              : "bg-[#E0F2FE] border border-[#38BDF8]/40 text-[#0F1B3D] rounded-tl-xs shadow-sm"
                          }`}
                        >
                          {msg.sender === "therapist" && (
                            <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-sky-200">
                              <div className="size-4 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-[8px]">
                                DR
                              </div>
                              <span className="font-bold text-xs text-[#0284C7] block">
                                {msg.senderName || msg.therapistName || "Clinical Specialist"}
                              </span>
                            </div>
                          )}

                          {/* Quoted Message (When Therapist replies to specific message) */}
                          {msg.replyTo && (
                            <div className="mb-2 p-2 rounded-xl bg-white/70 border-l-3 border-[#0284C7] text-[11px] text-slate-700 shadow-2xs">
                              <div className="font-bold text-[#0284C7] flex items-center gap-1">
                                <CornerUpLeft className="w-3 h-3 text-[#0284C7]" />
                                <span>Replying to {msg.replyTo.senderName || "Parent"}:</span>
                              </div>
                              <div className="line-clamp-2 italic text-slate-600 mt-0.5">
                                "{msg.replyTo.text ? msg.replyTo.text.replace(/[#*`_~]/g, "") : "Attached files / query"}"
                              </div>
                            </div>
                          )}

                          <FormattedMessageText
                            text={msg.text}
                            isUser={msg.sender === "user"}
                          />

                          {/* Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 pt-1.5 border-t border-slate-200/60 space-y-1.5">
                              {msg.attachments.map((att, aIdx) => (
                                <div key={aIdx}>
                                  {att.type === "image" && (
                                    <div className="rounded-xl overflow-hidden border border-slate-200 max-w-xs mt-1 bg-white p-1">
                                      <img
                                        src={att.url || att.dataUrl}
                                        alt="Uploaded Attachment"
                                        onLoad={() =>
                                          scrollToBottomInstant(
                                            therapistScrollContainerRef,
                                            therapistBottomAnchorRef
                                          )
                                        }
                                        onClick={() =>
                                          setPreviewPhoto(att.url || att.dataUrl)
                                        }
                                        className="w-full h-auto max-h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                      />
                                    </div>
                                  )}

                                  {att.type === "pdf" && (
                                    <a
                                      href={att.url || att.dataUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 hover:border-[#E6007E] transition-colors"
                                    >
                                      <FileText className="w-4 h-4 text-[#E6007E]" />
                                      <span className="truncate max-w-[130px] font-semibold">
                                        {att.name}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-bold">
                                        (PDF)
                                      </span>
                                    </a>
                                  )}

                                  {att.type === "audio" && (
                                    <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2 mt-1">
                                      <audio
                                        src={att.url || att.dataUrl}
                                        controls
                                        className="w-full h-7"
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Timestamp with WhatsApp checkmark (2 Grey Ticks = Delivered, 2 Blue Ticks = Reviewed/Replied) */}
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              msg.sender === "user" ? "text-slate-300" : "text-slate-500"
                            }`}
                          >
                            <span>{formatMessageTime(msg.createdAt)}</span>
                            {msg.sender === "user" && (
                              <CheckCheck
                                className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                                  isMessageSeenOrReplied(msg)
                                    ? "text-cyan-400" // 2 Blue Ticks!
                                    : "text-slate-400" // 2 Grey Ticks!
                                }`}
                                title={
                                  isMessageSeenOrReplied(msg)
                                    ? "Reviewed / Replied by Doctor"
                                    : "Delivered to Doctor Queue"
                                }
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* Bottom Anchor for auto-scroll */}
                <div ref={therapistBottomAnchorRef} className="h-1" />
              </div>
            </div>
          )}
        </div>

        {/* ================= 3. MULTIMODAL UNIFIED INPUT BAR (Fixed at bottom) ================= */}
        <div className="mt-2 shrink-0">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 shadow-sm space-y-2">
            
            {/* Attachments Preview Chips */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pb-1.5 border-b border-slate-200">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800"
                  >
                    {att.type === "image" ? (
                      <ImageIcon className="w-3.5 h-3.5 text-[#0284C7]" />
                    ) : att.type === "pdf" ? (
                      <FileText className="w-3.5 h-3.5 text-[#E6007E]" />
                    ) : (
                      <Mic className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span className="max-w-[120px] sm:max-w-[200px] truncate font-semibold">
                      {att.name}
                    </span>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="p-1 hover:bg-slate-200 rounded-full text-slate-500 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Live Audio Recording Bar */}
            {isRecording && (
              <div className="flex items-center justify-between p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span>Recording voice note... ({formatAudioTime(recordingDuration)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelRecording}
                    className="px-2.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs cursor-pointer font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={stopRecording}
                    className="px-3 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Square className="w-3 h-3 fill-white" />
                    <span>Done</span>
                  </button>
                </div>
              </div>
            )}

            {/* Controls Input Row */}
            <div className="flex items-end gap-2">
              <input
                id="user-consultation-file-input"
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                onClick={(e) => {
                  e.target.value = "";
                }}
                accept="image/*,application/pdf,.pdf"
                multiple
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

              <label
                htmlFor={sending || isRecording ? undefined : "user-consultation-file-input"}
                className={`p-2.5 rounded-xl border transition-all shrink-0 flex items-center justify-center select-none ${
                  sending || isRecording
                    ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#0284C7] border-slate-200 cursor-pointer active:scale-95"
                }`}
                title="Choose Document / Attach Doctor's Parchi & PDF Report"
              >
                <Paperclip className="w-4 h-4" />
              </label>

              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={sending}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                  isRecording
                    ? "bg-rose-600 text-white border-rose-600 animate-pulse"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-emerald-600 border-slate-200"
                }`}
                title={isRecording ? "Stop Recording" : "Record Voice Note"}
              >
                <Mic className="w-4 h-4" />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question, or attach files... (Press Enter to send)"
                  rows={1}
                  disabled={sending}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E6007E] focus:ring-1 focus:ring-[#E6007E] transition-all resize-none max-h-28 min-h-[40px]"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={sending || (!inputText.trim() && attachments.length === 0)}
                className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#071838] hover:bg-[#0F1B3D] text-white font-bold transition-all transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-4 h-4 text-[#5edff4]" />
                <span className="hidden sm:inline text-xs font-extrabold">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            className="max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-white p-2 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewPhoto}
              alt="Enlarged preview"
              className="w-full h-full object-contain rounded-xl max-h-[80vh]"
            />
          </div>
        </div>
      )}

      {/* Clear Chat Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Clear Chat History?
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    चैट हिस्ट्री साफ़ करें?
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                क्या आप वाकई इस चैट को साफ़ करना चाहते हैं? आपकी सभी पुरानी बातचीत, AI एनालिसिस और डॉक्टर को भेजे गए मैसेज हट जाएंगे और आप एक नई बातचीत शुरू कर सकेंगे।
              </p>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
                <span className="font-bold block">नोट:</span>
                <span>
                  साफ़ करने के बाद आप नया सवाल पूछ सकते हैं या डॉक्टर की नई पर्ची/रिपोर्ट अपलोड कर सकते हैं।
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirmModal(false)}
                  disabled={clearingChat}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel / रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClearChat}
                  disabled={clearingChat}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md shadow-red-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {clearingChat ? (
                    <>
                      <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Clearing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Clear Chat / हाँ, साफ़ करें</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConsultationChat;
