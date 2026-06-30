import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  collection,
  Timestamp,
  getDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase/config";

// Orders Service
import {
  createOrder,
  updateCourseProgress as updateOrderProgress,
} from "../firebase/orders.service";

const CourseContext = createContext();

export const useCourse = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
  const { currentUser, userData } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const updateTimeoutRef = useRef(null);

  // 1. Smart Fetch Logic (With LIVE Coming Soon Sync)
  useEffect(() => {
    if (!currentUser) {
      setEnrolledCourses([]);
      return;
    }

    const fetchCourses = async () => {
      // A. Old Collection Data
      let oldWayCourses = [];
      try {
        const oldDocRef = doc(db, "enrolledCourses", currentUser.uid);
        const oldSnap = await getDoc(oldDocRef);
        if (oldSnap.exists()) {
          oldWayCourses = oldSnap.data().courses || [];
        }
      } catch (e) {
        console.error("Error fetching old courses", e);
      }

      // B. New Admin Data (Manual Access assigned by Admin)
      let adminGivenCourses = [];
      if (userData && userData.enrolledCourses) {
        const courseIds = userData.enrolledCourses.filter(
          (c) => typeof c === "string",
        );
        const alreadyObjects = userData.enrolledCourses.filter(
          (c) => typeof c !== "string",
        );

        const fetchedDetails = await Promise.all(
          courseIds.map(async (id) => {
            try {
              const courseDoc = await getDoc(doc(db, "courseVideos", id));
              if (courseDoc.exists()) {
                const data = courseDoc.data();
                let safeLectures = [];
                if (data.lectures && Array.isArray(data.lectures)) {
                  safeLectures = data.lectures;
                } else if (data.videoId) {
                  safeLectures = [
                    {
                      id: Date.now(),
                      videoId: data.videoId,
                      title: data.title || "Main Video",
                    },
                  ];
                }

                return {
                  courseId: id,
                  id: id,
                  title: data.title || "Untitled Course",
                  image:
                    data.image ||
                    data.thumbnail ||
                    "https://placehold.co/600x400?text=No+Image",
                  instructor: data.instructor || "Mentor",
                  progress: 0,
                  status: "active",
                  totalDuration: data.duration || "Self Paced",
                  lectures: safeLectures,
                  videoId: data.videoId || "",
                  enrolledAt: new Date().toISOString(),
                  driveLink: data.driveLink || "",
                };
              }
            } catch (err) {
              console.error(`Error fetching details for ${id}`, err);
            }
            return null;
          }),
        );

        const validFetched = fetchedDetails.filter((c) => c !== null);
        adminGivenCourses = [...alreadyObjects, ...validFetched];
      }

      const combined = [...oldWayCourses];
      adminGivenCourses.forEach((adminC) => {
        const exists = combined.some(
          (oldC) => oldC.courseId === (adminC.courseId || adminC.id),
        );
        if (!exists) {
          combined.push(adminC);
        }
      });

      // === [LIVE FIX FOR COMING SOON] ===
      // Ye code user ki saved copy ko ignore karke direct Admin database se current status layega
      const liveSyncedCourses = await Promise.all(
        combined.map(async (course) => {
          const cId = course.courseId || course.id;
          if (!cId) return course;
          try {
            const liveDoc = await getDoc(doc(db, "courseVideos", cId));
            if (liveDoc.exists()) {
              const liveData = liveDoc.data();
              return {
                ...course,
                // Override the local status with live status from admin
                isComingSoon:
                  liveData.isComingSoon === true ||
                  liveData.status === "coming_soon" ||
                  liveData.status === "Coming Soon",
                driveLink: liveData.driveLink || "",
              };
            }
          } catch (e) {
            console.error("Live Sync Error", e);
          }
          return course;
        }),
      );

      setEnrolledCourses(liveSyncedCourses);
    };

    fetchCourses();

    const docRef = doc(db, "enrolledCourses", currentUser.uid);
    const unsubscribe = onSnapshot(docRef, () => {
      fetchCourses();
    });

    return () => unsubscribe();
  }, [currentUser, userData]);

  // 2. Enroll Function (Manual/Payment Enrollment)
  const enrollCourse = async (course) => {
    if (!currentUser) return;
    const courseId = String(course.id || course.courseId || "");

    const alreadyEnrolled = enrolledCourses.some(
      (c) => c.courseId === courseId,
    );
    if (alreadyEnrolled) return;

    let safeLectures = [];
    if (course.lectures && Array.isArray(course.lectures)) {
      safeLectures = course.lectures;
    } else if (course.videoId) {
      safeLectures = [
        { id: Date.now(), videoId: course.videoId, title: course.title },
      ];
    }

    const newCourse = {
      courseId,
      title: String(course.title || "Untitled Course"),
      image: String(course.image || course.thumbnail || ""),
      instructor: String(course.instructor || "Unknown"),
      progress: 0,
      status: "in-progress",
      enrolledAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      totalDuration: String(course.duration || "Self Paced"),
      watchedDuration: 0,
      price: String(course.price || "Free"),
      originalPrice: String(course.originalPrice || course.price || "Free"),
      category: String(course.category || "General"),
      lectures: safeLectures,
      isComingSoon: course.isComingSoon || false, // Enroll karte time bhi Coming soon status save hoga
      driveLink: course.driveLink || "",
    };

    const oldDocRef = doc(db, "enrolledCourses", currentUser.uid);
    const oldSnap = await getDoc(oldDocRef);
    let currentCourses = [];
    if (oldSnap.exists()) currentCourses = oldSnap.data().courses || [];
    await setDoc(
      oldDocRef,
      { courses: [...currentCourses, newCourse] },
      { merge: true },
    );

    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, { enrolledCourses: arrayUnion(newCourse) });

    await createOrder({
      studentName: currentUser.displayName || currentUser.email,
      studentEmail: currentUser.email,
      userId: currentUser.uid,
      assetName: course.title,
      type: "course",
      saleValue: course.price || 0,
      partnerId: "direct",
      courseId: courseId,
    });
  };

  // 3. [SECURED] Update Progress Logic (Cumulative Watch Time)
  const updateCourseProgress = useCallback(
    async (courseId, newCalculatedProgress, secondsToAdd) => {
      if (!currentUser) return;

      const isEnrolled = enrolledCourses.some((c) => (c.courseId || c.id) === courseId);
      if (!isEnrolled) return;

      setEnrolledCourses((prev) =>
        prev.map((c) =>
          (c.courseId || c.id) === courseId
            ? {
                ...c,
                progress: Math.max(
                  Number(c.progress) || 0,
                  newCalculatedProgress,
                ),
                watchedDuration:
                  (Number(c.watchedDuration) || 0) + secondsToAdd,
                lastAccessed: new Date().toISOString(),
              }
            : c,
        ),
      );

      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);

      updateTimeoutRef.current = setTimeout(async () => {
        try {
          const docRef = doc(db, "enrolledCourses", currentUser.uid);
          const docSnap = await getDoc(docRef);

          let currentCourses = [];
          if (docSnap.exists()) {
            currentCourses = docSnap.data().courses || [];
          }

          const existingIndex = currentCourses.findIndex(
            (c) => (c.courseId || c.id) === courseId,
          );

          if (existingIndex !== -1) {
            const existingCourse = currentCourses[existingIndex];
            const finalProgress = Math.max(
              Number(existingCourse.progress) || 0,
              newCalculatedProgress,
            );
            const finalDuration =
              (Number(existingCourse.watchedDuration) || 0) + secondsToAdd;

            currentCourses[existingIndex] = {
              ...existingCourse,
              progress: finalProgress,
              watchedDuration: finalDuration,
              lastAccessed: new Date().toISOString(),
              status: finalProgress >= 100 ? "completed" : "in-progress",
            };

            await setDoc(docRef, { courses: currentCourses }, { merge: true });
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, { enrolledCourses: currentCourses });
          } else {
            // Course was given by Admin but never saved in user's enrolledCourses DB yet
            const memoryCourse = enrolledCourses.find((c) => (c.courseId || c.id) === courseId);
            if (memoryCourse) {
               const newSavedCourse = {
                 ...memoryCourse,
                 progress: newCalculatedProgress,
                 watchedDuration: secondsToAdd,
                 lastAccessed: new Date().toISOString(),
                 status: newCalculatedProgress >= 100 ? "completed" : "in-progress"
               };
               currentCourses.push(newSavedCourse);
               await setDoc(docRef, { courses: currentCourses }, { merge: true });
               const userRef = doc(db, "users", currentUser.uid);
               // Note: We only update the users doc if necessary, but userData.enrolledCourses might be mixed strings/objects.
               // We just update the enrolledCourses sub-collection to keep tracking simple.
            }
          }

          await updateOrderProgress(
            currentUser.uid,
            courseId,
            newCalculatedProgress,
          );
        } catch (error) {
          console.error("Progress update error", error);
        }
      }, 3000);
    },
    [currentUser, enrolledCourses],
  );

  const isEnrolled = useCallback(
    (courseId) => enrolledCourses.some((c) => c.courseId === courseId),
    [enrolledCourses],
  );

  const getCourseProgress = useCallback(
    (courseId) => {
      const course = enrolledCourses.find((c) => c.courseId === courseId);
      return course ? course.progress : 0;
    },
    [enrolledCourses],
  );

  const getEnrolledCourse = useCallback(
    (courseId) => enrolledCourses.find((c) => c.courseId === courseId),
    [enrolledCourses],
  );

  return (
    <CourseContext.Provider
      value={{
        enrolledCourses,
        enrollCourse,
        updateCourseProgress,
        isEnrolled,
        getCourseProgress,
        getEnrolledCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export default CourseContext;
