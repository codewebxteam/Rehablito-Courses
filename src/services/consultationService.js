import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  where,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  increment,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
import {
  uploadToImageKit,
  deleteFromImageKit,
  deleteMultipleFromImageKit,
} from "./imagekitService";

const THREADS_COLLECTION = "consultation_threads";

/**
 * Check whether a user has purchased any courses or ebooks
 * Queries users/{userId} for enrolledCourses & purchasedBooks,
 * and queries the orders collection for verified purchases.
 */
export const fetchUserCoursePurchaseStatus = async (userId, userEmail) => {
  if (!userId && !userEmail) {
    return {
      hasPurchasedCourses: false,
      enrolledCoursesCount: 0,
      enrolledCoursesList: [],
      purchasedBooksCount: 0,
      purchasedBooksList: [],
      orders: [],
      isEnrolledStudent: false,
    };
  }

  try {
    const courseTitles = new Set();
    const bookTitles = new Set();

    // 1. Check User Document in 'users' collection
    if (userId) {
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const uData = userSnap.data();
          if (Array.isArray(uData.enrolledCourses)) {
            uData.enrolledCourses.forEach((c) => {
              if (typeof c === "string" && c.trim()) {
                courseTitles.add(c);
              } else if (c && typeof c === "object") {
                courseTitles.add(c.title || c.courseName || c.name || "Enrolled Course");
              }
            });
          }
          if (Array.isArray(uData.purchasedBooks)) {
            uData.purchasedBooks.forEach((b) => {
              if (typeof b === "string" && b.trim()) {
                bookTitles.add(b);
              } else if (b && typeof b === "object") {
                bookTitles.add(b.title || b.name || "Purchased E-Book");
              }
            });
          }
        }
      } catch (e) {
        console.warn("Could not read user profile for purchases:", e);
      }

      // Also check 'enrolledCourses' standalone collection
      try {
        const enrolledDoc = await getDoc(doc(db, "enrolledCourses", userId));
        if (enrolledDoc.exists()) {
          const eData = enrolledDoc.data();
          if (Array.isArray(eData.courses)) {
            eData.courses.forEach((c) => {
              if (typeof c === "string" && c.trim()) {
                courseTitles.add(c);
              } else if (c?.title) {
                courseTitles.add(c.title);
              }
            });
          }
        }
      } catch (e) {
        // non-critical
      }
    }

    // 2. Check 'orders' collection
    const orderQueries = [];
    if (userId) {
      orderQueries.push(query(collection(db, "orders"), where("userId", "==", userId)));
      orderQueries.push(query(collection(db, "orders"), where("studentId", "==", userId)));
    }
    if (userEmail) {
      orderQueries.push(query(collection(db, "orders"), where("studentEmail", "==", userEmail)));
    }

    const orderSnaps = await Promise.all(orderQueries.map((q) => getDocs(q).catch(() => ({ forEach: () => {} }))));
    const verifiedOrders = [];
    const seenOrderIds = new Set();

    orderSnaps.forEach((snap) => {
      snap.forEach((d) => {
        if (!seenOrderIds.has(d.id)) {
          seenOrderIds.add(d.id);
          const order = d.data();
          verifiedOrders.push({ id: d.id, ...order });
          const pName = order.productName || order.assetName || order.title || order.courseName;
          const pType = order.productType || order.type;
          if (pName) {
            if (pType === "ebook" || order.ebookId) {
              bookTitles.add(pName);
            } else {
              courseTitles.add(pName);
            }
          }
        }
      });
    });

    const enrolledCoursesList = Array.from(courseTitles);
    const purchasedBooksList = Array.from(bookTitles);
    const hasPurchasedCourses = enrolledCoursesList.length > 0;
    const isEnrolledStudent = hasPurchasedCourses || purchasedBooksList.length > 0;

    return {
      hasPurchasedCourses,
      enrolledCoursesCount: enrolledCoursesList.length,
      enrolledCoursesList,
      purchasedBooksCount: purchasedBooksList.length,
      purchasedBooksList,
      orders: verifiedOrders,
      isEnrolledStudent,
    };
  } catch (err) {
    console.warn("fetchUserCoursePurchaseStatus failed:", err);
    return {
      hasPurchasedCourses: false,
      enrolledCoursesCount: 0,
      enrolledCoursesList: [],
      purchasedBooksCount: 0,
      purchasedBooksList: [],
      orders: [],
      isEnrolledStudent: false,
    };
  }
};

/**
 * Upload an attachment (image, parchi, pdf report, or voice note) directly to ImageKit CDN
 * Gracefully falls back to Firebase Storage if ImageKit is unreachable,
 * and falls back to dataURL if both are offline.
 */
export const uploadAttachmentFile = async (file, userId = "anonymous") => {
  const cleanName = (file.name || "attachment").replace(/[^a-zA-Z0-9._-]/g, "_");
  const uploadTarget = file.blob || file;

  // 1. Primary: High-speed ImageKit CDN upload
  try {
    const ikResult = await uploadToImageKit(
      uploadTarget,
      cleanName,
      `/consultations/${userId}`
    );
    if (ikResult && ikResult.url) {
      console.log("ImageKit upload successful:", ikResult.url, "fileId:", ikResult.fileId);
      return {
        url: ikResult.url,
        fileId: ikResult.fileId || null,
      };
    }
  } catch (ikErr) {
    console.warn("ImageKit upload failed, trying Firebase Storage fallback:", ikErr);
  }

  // 2. Secondary fallback: Firebase Storage
  try {
    if (storage) {
      const timestamp = Date.now();
      const storageRef = ref(storage, `consultations/${userId}/${timestamp}_${cleanName}`);
      const snapshot = await uploadBytes(storageRef, uploadTarget);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return {
        url: downloadUrl,
        fileId: null,
      };
    }
  } catch (fbErr) {
    console.warn("Firebase storage fallback failed:", fbErr);
  }

  // 3. Graceful fallback to dataUrl
  return {
    url: file.dataUrl || "",
    fileId: null,
  };
};

// Module-level in-memory cache for instant SPA page switching
const chatMemoryCache = new Map();

// LocalStorage cache key
const getCacheKey = (userId) => `rehablito_chat_cache_${userId}`;

/**
 * Retrieve cached consultation data (thread + messages)
 * Checks in-memory cache first, then localStorage with timestamp restoration.
 */
export const getCachedConsultationData = (userId) => {
  if (!userId) return null;

  // 1. Fast in-memory cache hit (zero overhead, keeps live instances)
  if (chatMemoryCache.has(userId)) {
    return chatMemoryCache.get(userId);
  }

  // 2. Persistent localStorage fallback (survives page refreshes)
  try {
    const raw = localStorage.getItem(getCacheKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.thread) {
        // Restore toDate() helper on message timestamps
        const restoredMessages = (parsed.messages || []).map((m) => {
          if (m.createdAt && typeof m.createdAt === "string") {
            const d = new Date(m.createdAt);
            return {
              ...m,
              createdAt: {
                toDate: () => d,
                seconds: Math.floor(d.getTime() / 1000),
              },
            };
          }
          return m;
        });

        const data = {
          thread: parsed.thread,
          messages: restoredMessages,
          cachedAt: parsed.cachedAt,
        };
        chatMemoryCache.set(userId, data);
        return data;
      }
    }
  } catch (e) {
    console.warn("Failed to read chat cache from localStorage:", e);
  }

  return null;
};

/**
 * Store consultation data (thread + messages) into memory and localStorage
 */
export const setCachedConsultationData = (userId, { thread, messages }) => {
  if (!userId) return;
  try {
    const currentMemory = chatMemoryCache.get(userId) || {};
    const updatedThread = thread || currentMemory.thread || null;
    const updatedMessages = messages !== undefined ? messages : (currentMemory.messages || []);

    const cacheObj = {
      thread: updatedThread,
      messages: updatedMessages,
      cachedAt: Date.now(),
    };
    chatMemoryCache.set(userId, cacheObj);

    // Save safely to localStorage (convert timestamps to ISO strings)
    const serializableMessages = updatedMessages.map((m) => ({
      ...m,
      createdAt: m.createdAt?.toDate
        ? m.createdAt.toDate().toISOString()
        : m.createdAt instanceof Date
        ? m.createdAt.toISOString()
        : typeof m.createdAt === "string"
        ? m.createdAt
        : new Date().toISOString(),
    }));

    const toStore = {
      thread: updatedThread,
      messages: serializableMessages,
      cachedAt: Date.now(),
    };
    localStorage.setItem(getCacheKey(userId), JSON.stringify(toStore));
  } catch (e) {
    console.warn("Failed to write chat cache to localStorage:", e);
  }
};

/**
 * Evict consultation data from cache
 */
export const clearConsultationCache = (userId) => {
  if (!userId) return;
  chatMemoryCache.delete(userId);
  try {
    localStorage.removeItem(getCacheKey(userId));
  } catch (e) {
    // ignore
  }
};

/**
 * Get or create a unified consultation thread for a user
 * Note: threadId is strictly derived from user.uid ('user_${user.uid}')
 * ensuring complete isolation between users.
 */
export const getOrCreateConsultationThread = async (user, initialDetails = {}) => {
  if (!user || !user.uid) return null;
  const threadId = `user_${user.uid}`;
  const threadRef = doc(db, THREADS_COLLECTION, threadId);

  // 1. Check cache first - if cached, return instantly without querying DB
  const cached = getCachedConsultationData(user.uid);
  if (cached?.thread) {
    return cached.thread;
  }

  try {
    const threadSnap = await getDoc(threadRef);
    const purchaseInfo = await fetchUserCoursePurchaseStatus(user.uid, user.email);

    if (!threadSnap.exists()) {
      const newThreadData = {
        id: threadId,
        userId: user.uid,
        userName: user.displayName || user.name || "Patient Parent",
        userEmail: user.email || "",
        userPhone: user.phoneNumber || user.phone || "",
        specialty: initialDetails.specialty || "General Development",
        childAge: initialDetails.childAge || "3-6 Years",
        hasPurchasedCourses: purchaseInfo.hasPurchasedCourses,
        enrolledCoursesCount: purchaseInfo.enrolledCoursesCount,
        enrolledCoursesList: purchaseInfo.enrolledCoursesList,
        isEnrolledStudent: purchaseInfo.isEnrolledStudent,
        status: "pending",
        lastMessage: "New consultation created",
        unreadAdminCount: 0,
        unreadUserCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(threadRef, newThreadData);
      setCachedConsultationData(user.uid, { thread: newThreadData });
      return newThreadData;
    }

    const existingData = threadSnap.data();
    let finalThread = { id: threadId, ...existingData };

    // Update purchase info if it wasn't recorded yet
    if (existingData.hasPurchasedCourses === undefined) {
      await updateDoc(threadRef, {
        hasPurchasedCourses: purchaseInfo.hasPurchasedCourses,
        enrolledCoursesCount: purchaseInfo.enrolledCoursesCount,
        enrolledCoursesList: purchaseInfo.enrolledCoursesList,
        isEnrolledStudent: purchaseInfo.isEnrolledStudent,
      });
      finalThread = { id: threadId, ...existingData, ...purchaseInfo };
    }

    setCachedConsultationData(user.uid, { thread: finalThread });
    return finalThread;
  } catch (error) {
    console.error("Error getOrCreateConsultationThread:", error);
    throw error;
  }
};

/**
 * Real-time listener for messages within a consultation thread
 */
export const listenToThreadMessages = (threadId, callback) => {
  if (!threadId) return () => {};
  const messagesRef = collection(db, THREADS_COLLECTION, threadId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(messages);
  });
};

/**
 * Send a message from the student/parent
 */
export const sendUserConsultationMessage = async ({
  threadId,
  user,
  text,
  attachments = [],
  specialty,
  childAge,
}) => {
  if (!threadId) throw new Error("Thread ID is required");

  const threadRef = doc(db, THREADS_COLLECTION, threadId);
  const messagesRef = collection(db, THREADS_COLLECTION, threadId, "messages");

  // Add message to Firestore
  const messageData = {
    sender: "user",
    senderName: user?.displayName || user?.name || "Parent",
    senderEmail: user?.email || "",
    text: text || "",
    attachments: attachments.map((a) => ({
      type: a.type, // 'image', 'pdf', 'audio'
      name: a.name,
      url: a.url || a.dataUrl || "",
      fileId: a.fileId || null,
      dataUrl: a.dataUrl || a.url || "",
      duration: a.duration || null,
    })),
    createdAt: serverTimestamp(),
  };

  await addDoc(messagesRef, messageData);

  // Update thread meta
  await updateDoc(threadRef, {
    lastMessage: text || (attachments.length > 0 ? `Attachment: ${attachments[0].name}` : "New query"),
    status: "pending",
    unreadAdminCount: increment(1),
    updatedAt: serverTimestamp(),
    ...(specialty && { specialty }),
    ...(childAge && { childAge }),
  });
};

/**
 * Send therapist reply from Admin panel
 */
export const sendTherapistConsultationReply = async ({
  threadId,
  therapistName = "Dr. Rehablito Expert",
  therapistRole = "Lead Clinical Specialist",
  text,
  attachments = [],
  replyTo = null,
}) => {
  if (!threadId) throw new Error("Thread ID is required");

  const threadRef = doc(db, THREADS_COLLECTION, threadId);
  const messagesRef = collection(db, THREADS_COLLECTION, threadId, "messages");

  const messageData = {
    sender: "therapist",
    senderName: therapistName,
    therapistRole: therapistRole,
    text: text || "",
    attachments: attachments.map((a) => ({
      type: a.type,
      name: a.name,
      url: a.url || a.dataUrl || "",
      fileId: a.fileId || null,
      dataUrl: a.dataUrl || a.url || "",
      duration: a.duration || null,
    })),
    ...(replyTo && {
      replyTo: {
        id: replyTo.id || null,
        text: (replyTo.text || "").slice(0, 150),
        senderName: replyTo.senderName || (replyTo.sender === "user" ? "Parent" : "Therapist"),
        sender: replyTo.sender || "user",
      },
    }),
    createdAt: serverTimestamp(),
  };

  await addDoc(messagesRef, messageData);

  // Mark thread as replied
  await updateDoc(threadRef, {
    lastMessage: `Therapist: ${text.slice(0, 60)}...`,
    status: "replied",
    unreadUserCount: increment(1),
    unreadAdminCount: 0,
    adminSeenAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Mark thread as seen / read by therapist admin
 */
export const markThreadAsSeenByAdmin = async (threadId) => {
  if (!threadId) return;
  try {
    const threadRef = doc(db, THREADS_COLLECTION, threadId);
    await updateDoc(threadRef, {
      unreadAdminCount: 0,
      adminSeenAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("markThreadAsSeenByAdmin error:", err);
  }
};

/**
 * Save AI analysis to message thread (optional sync so therapist sees AI suggestions)
 */
export const recordAIEvaluationMessage = async ({ threadId, text }) => {
  if (!threadId || !text) return;
  const messagesRef = collection(db, THREADS_COLLECTION, threadId, "messages");
  try {
    await addDoc(messagesRef, {
      sender: "ai",
      senderName: "Rehablito AI Assistant",
      channel: "ai",
      text,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("Could not sync AI message to Firestore (offline/optional):", e);
  }
};

/**
 * Admin: Listen to all consultation threads in real-time
 */
export const listenToAllConsultations = (callback) => {
  const q = query(collection(db, THREADS_COLLECTION), orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const threads = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(threads);
  });
};

/**
 * Update consultation status (e.g. 'in_review', 'closed', 'resolved')
 */
export const updateConsultationStatus = async (threadId, status) => {
  if (!threadId) return;
  const threadRef = doc(db, THREADS_COLLECTION, threadId);
  await updateDoc(threadRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Clear all messages in a consultation thread (with confirmation)
 * Permanently deletes all media files from ImageKit and records from Firestore
 */
export const clearConsultationMessages = async (threadId) => {
  if (!threadId) return;
  try {
    const messagesRef = collection(db, THREADS_COLLECTION, threadId, "messages");
    const snaps = await getDocs(messagesRef);

    // 1. Collect all ImageKit fileIds from attachments to permanently delete them
    const fileIdsToDelete = [];
    snaps.docs.forEach((d) => {
      const data = d.data();
      if (Array.isArray(data.attachments)) {
        data.attachments.forEach((att) => {
          if (att.fileId) fileIdsToDelete.push(att.fileId);
        });
      }
    });

    // 2. Permanently delete media from ImageKit
    if (fileIdsToDelete.length > 0) {
      console.log(`[ClearChat] Permanently deleting ${fileIdsToDelete.length} files from ImageKit...`);
      await deleteMultipleFromImageKit(fileIdsToDelete);
    }

    // 3. Permanently delete Firestore message documents
    const deletePromises = snaps.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    const threadRef = doc(db, THREADS_COLLECTION, threadId);
    await updateDoc(threadRef, {
      lastMessage: "Chat cleared",
      status: "pending",
      unreadAdminCount: 0,
      unreadUserCount: 0,
      updatedAt: serverTimestamp(),
    });

    // Clear local & memory cache for this user
    if (threadId.startsWith("user_")) {
      const uid = threadId.replace("user_", "");
      clearConsultationCache(uid);
    }
  } catch (err) {
    console.error("clearConsultationMessages error:", err);
    throw err;
  }
};

/**
 * 7-Day Auto-Cleanup: Automatically deletes consultation messages and attachments
 * older than 7 days (1 week) permanently from:
 * 1. ImageKit CDN storage (photos, parchi, pdfs)
 * 2. Firestore database (messages collection)
 * @param {number} retentionDays - Number of days to retain (default: 7)
 * @returns {Promise<{ deletedMessages: number, deletedFiles: number }>}
 */
export const autoCleanupExpiredConsultations = async (retentionDays = 7) => {
  try {
    const now = Date.now();
    const cutoffDate = new Date(now - retentionDays * 24 * 60 * 60 * 1000);
    console.log(`[AutoCleanup] Checking for consultation messages older than ${retentionDays} days (before ${cutoffDate.toISOString()})...`);

    const threadsSnap = await getDocs(collection(db, THREADS_COLLECTION));
    let totalDeletedMessages = 0;
    const allFileIdsToDelete = [];

    for (const threadDoc of threadsSnap.docs) {
      const threadId = threadDoc.id;
      const messagesRef = collection(db, THREADS_COLLECTION, threadId, "messages");

      const expiredQuery = query(
        messagesRef,
        where("createdAt", "<=", cutoffDate)
      );
      const expiredSnap = await getDocs(expiredQuery);

      if (!expiredSnap.empty) {
        console.log(`[AutoCleanup] Thread ${threadId} has ${expiredSnap.size} expired messages.`);
        const deleteDocPromises = [];

        expiredSnap.forEach((msgDoc) => {
          const msgData = msgDoc.data();
          if (Array.isArray(msgData.attachments)) {
            msgData.attachments.forEach((att) => {
              if (att.fileId) {
                allFileIdsToDelete.push(att.fileId);
              }
            });
          }
          deleteDocPromises.push(deleteDoc(msgDoc.ref));
        });

        await Promise.all(deleteDocPromises);
        totalDeletedMessages += expiredSnap.size;

        // If thread has no remaining messages, update thread summary
        const remainingSnap = await getDocs(messagesRef);
        if (remainingSnap.empty) {
          await updateDoc(threadDoc.ref, {
            lastMessage: "Messages older than 7 days were automatically cleared.",
            status: "pending",
            unreadAdminCount: 0,
            unreadUserCount: 0,
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    // Permanently delete from ImageKit
    let deletedFiles = 0;
    if (allFileIdsToDelete.length > 0) {
      console.log(`[AutoCleanup] Permanently deleting ${allFileIdsToDelete.length} expired files from ImageKit...`);
      const res = await deleteMultipleFromImageKit(allFileIdsToDelete);
      deletedFiles = res.deleted;
    }

    console.log(`[AutoCleanup] Completed: ${totalDeletedMessages} messages and ${deletedFiles} ImageKit files purged.`);
    return { deletedMessages: totalDeletedMessages, deletedFiles };
  } catch (err) {
    console.error("[AutoCleanup] Error running consultation auto-cleanup:", err);
    return { deletedMessages: 0, deletedFiles: 0, error: err.message };
  }
};

