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
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase/config';
import { uploadToImageKit } from './imagekitService';

const THREADS_COLLECTION = 'consultation_threads';

/**
 * Check whether a user has purchased any courses or ebooks
 */
export const fetchUserCoursePurchaseStatus = async (userId, userEmail) => {
  if (!userId && !userEmail) {
    return {
      hasPurchasedCourses: false,
      enrolledCoursesCount: 0,
      enrolledCoursesList: [],
      isEnrolledStudent: false,
    };
  }

  try {
    const courseTitles = new Set();

    // 1. Check User Document in 'users' collection
    if (userId) {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const uData = userSnap.data();
          if (Array.isArray(uData.enrolledCourses)) {
            uData.enrolledCourses.forEach((c) => {
              if (typeof c === 'string' && c.trim()) {
                courseTitles.add(c);
              } else if (c && typeof c === 'object') {
                courseTitles.add(c.title || c.courseName || c.name || 'Enrolled Course');
              }
            });
          }
        }
      } catch (e) {
        console.warn('Could not read user profile for purchases:', e);
      }

      // Check 'enrolledCourses' standalone collection
      try {
        const enrolledDoc = await getDoc(doc(db, 'enrolledCourses', userId));
        if (enrolledDoc.exists()) {
          const eData = enrolledDoc.data();
          if (Array.isArray(eData.courses)) {
            eData.courses.forEach((c) => {
              if (typeof c === 'string' && c.trim()) {
                courseTitles.add(c);
              } else if (c?.title) {
                courseTitles.add(c.title);
              }
            });
          }
        }
      } catch (e) {}
    }

    const enrolledCoursesList = Array.from(courseTitles);
    const hasPurchasedCourses = enrolledCoursesList.length > 0;

    return {
      hasPurchasedCourses,
      enrolledCoursesCount: enrolledCoursesList.length,
      enrolledCoursesList,
      isEnrolledStudent: hasPurchasedCourses,
    };
  } catch (err) {
    console.warn('fetchUserCoursePurchaseStatus error:', err);
    return {
      hasPurchasedCourses: false,
      enrolledCoursesCount: 0,
      enrolledCoursesList: [],
      isEnrolledStudent: false,
    };
  }
};

/**
 * Upload an attachment to ImageKit CDN with dataURL fallback
 */
export const uploadAttachmentFile = async (base64OrDataUrl, name = 'attachment.jpg', userId = 'mobile_user') => {
  try {
    const result = await uploadToImageKit(base64OrDataUrl, name, `/consultations/${userId}`);
    return result;
  } catch (err) {
    console.warn('uploadAttachmentFile error:', err);
    return {
      url: typeof base64OrDataUrl === 'string' && base64OrDataUrl.startsWith('data:') ? base64OrDataUrl : '',
      fileId: null,
    };
  }
};

const getCacheKey = (userId) => `@rehablito_chat_cache_${userId}`;

export const getCachedConsultationData = async (userId) => {
  if (!userId) return null;
  try {
    const raw = await AsyncStorage.getItem(getCacheKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.thread) {
        const restoredMessages = (parsed.messages || []).map((m) => {
          if (m.createdAt && typeof m.createdAt === 'string') {
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

        return {
          thread: parsed.thread,
          messages: restoredMessages,
          cachedAt: parsed.cachedAt,
        };
      }
    }
  } catch (e) {
    console.warn('Failed to read chat cache from AsyncStorage:', e);
  }
  return null;
};

export const setCachedConsultationData = async (userId, { thread, messages }) => {
  if (!userId) return;
  try {
    const serializableMessages = (messages || []).map((m) => ({
      ...m,
      createdAt: m.createdAt?.toDate
        ? m.createdAt.toDate().toISOString()
        : m.createdAt instanceof Date
        ? m.createdAt.toISOString()
        : typeof m.createdAt === 'string'
        ? m.createdAt
        : new Date().toISOString(),
    }));

    const toStore = {
      thread: thread || null,
      messages: serializableMessages,
      cachedAt: Date.now(),
    };
    await AsyncStorage.setItem(getCacheKey(userId), JSON.stringify(toStore));
  } catch (e) {
    console.warn('Failed to write chat cache to AsyncStorage:', e);
  }
};

export const clearConsultationCache = async (userId) => {
  if (!userId) return;
  try {
    await AsyncStorage.removeItem(getCacheKey(userId));
  } catch (e) {}
};

/**
 * Get or create a unified consultation thread for a user
 * threadId is strictly 'user_${user.uid}'
 */
export const getOrCreateConsultationThread = async (user, initialDetails = {}) => {
  if (!user || !user.uid) return null;
  const threadId = `user_${user.uid}`;
  const threadRef = doc(db, THREADS_COLLECTION, threadId);

  try {
    const threadSnap = await getDoc(threadRef);
    const purchaseInfo = await fetchUserCoursePurchaseStatus(user.uid, user.email);

    if (!threadSnap.exists()) {
      const newThreadData = {
        id: threadId,
        userId: user.uid,
        userName: user.displayName || user.name || 'Patient Parent',
        userEmail: user.email || '',
        userPhone: user.phoneNumber || user.phone || '',
        specialty: initialDetails.specialty || 'Pediatric Rehabilitation & Therapy',
        childAge: initialDetails.childAge || '3-6 Years',
        hasPurchasedCourses: purchaseInfo.hasPurchasedCourses,
        enrolledCoursesCount: purchaseInfo.enrolledCoursesCount,
        enrolledCoursesList: purchaseInfo.enrolledCoursesList,
        isEnrolledStudent: purchaseInfo.isEnrolledStudent,
        status: 'pending',
        lastMessage: 'New consultation started',
        unreadAdminCount: 0,
        unreadUserCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(threadRef, newThreadData);
      setCachedConsultationData(user.uid, { thread: newThreadData, messages: [] });
      return newThreadData;
    }

    const existingData = threadSnap.data();
    let finalThread = { id: threadId, ...existingData };

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
    console.error('Error getOrCreateConsultationThread:', error);
    throw error;
  }
};

/**
 * Real-time listener for messages within a consultation thread
 */
export const listenToThreadMessages = (threadId, callback) => {
  if (!threadId) return () => {};
  const messagesRef = collection(db, THREADS_COLLECTION, threadId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(messages);
  });
};

/**
 * Send a message from the parent/user
 */
export const sendUserConsultationMessage = async ({
  threadId,
  user,
  text,
  attachments = [],
  specialty,
  childAge,
}) => {
  if (!threadId) throw new Error('Thread ID is required');

  const threadRef = doc(db, THREADS_COLLECTION, threadId);
  const messagesRef = collection(db, THREADS_COLLECTION, threadId, 'messages');

  const messageData = {
    sender: 'user',
    senderName: user?.displayName || user?.name || 'Parent',
    senderEmail: user?.email || '',
    text: text || '',
    attachments: attachments.map((a) => ({
      type: a.type,
      name: a.name,
      url: a.url || a.dataUrl || '',
      fileId: a.fileId || null,
      dataUrl: a.dataUrl || a.url || '',
      duration: a.duration || null,
    })),
    createdAt: serverTimestamp(),
  };

  await addDoc(messagesRef, messageData);

  await updateDoc(threadRef, {
    lastMessage: text || (attachments.length > 0 ? `Attachment: ${attachments[0].name}` : 'New query'),
    status: 'pending',
    unreadAdminCount: increment(1),
    updatedAt: serverTimestamp(),
    ...(specialty && { specialty }),
    ...(childAge && { childAge }),
  });
};

/**
 * Save AI analysis to message thread
 */
export const recordAIEvaluationMessage = async ({ threadId, text }) => {
  if (!threadId || !text) return;
  const messagesRef = collection(db, THREADS_COLLECTION, threadId, 'messages');
  try {
    await addDoc(messagesRef, {
      sender: 'ai',
      senderName: 'Rehablito AI Assistant',
      channel: 'ai',
      text,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Could not sync AI message to Firestore:', e);
  }
};

/**
 * Clear all messages in a consultation thread
 */
export const clearConsultationMessages = async (threadId) => {
  if (!threadId) return;
  try {
    const messagesRef = collection(db, THREADS_COLLECTION, threadId, 'messages');
    const snaps = await getDocs(messagesRef);

    const deletePromises = snaps.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    const threadRef = doc(db, THREADS_COLLECTION, threadId);
    await updateDoc(threadRef, {
      lastMessage: 'Chat cleared',
      status: 'pending',
      unreadAdminCount: 0,
      unreadUserCount: 0,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to clear consultation messages:', err);
    throw err;
  }
};
