import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { COURSES_DATABASE } from '../constants/coursesData';

const EnrollmentContext = createContext();

export const EnrollmentProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedLessons, setCompletedLessons] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const firestoreSyncTimeout = useRef(null);

  // Clean legacy dummy cache keys once
  useEffect(() => {
    AsyncStorage.removeItem('@rehablito_enrolled_courses').catch(() => {});
    AsyncStorage.removeItem('@rehablito_completed_lessons').catch(() => {});
  }, []);

  // When currentUser changes: Load user-specific cache and establish real-time sync with Firestore
  useEffect(() => {
    if (!currentUser) {
      // Guest: strictly NO enrolled courses and NO completed lessons
      setEnrolledCourseIds([]);
      setEnrolledCourses([]);
      setCompletedLessons({});
      setIsLoaded(true);
      return;
    }

    const userKeyEnrolled = `@rehablito_enrolled_${currentUser.uid}`;
    const userKeyCourses = `@rehablito_enrolled_courses_${currentUser.uid}`;
    const userKeyLessons = `@rehablito_lessons_${currentUser.uid}`;

    // 1. Load user cached data
    const loadUserCachedData = async () => {
      try {
        const storedEnrolled = await AsyncStorage.getItem(userKeyEnrolled);
        const storedCourses = await AsyncStorage.getItem(userKeyCourses);
        const storedLessons = await AsyncStorage.getItem(userKeyLessons);

        if (storedEnrolled !== null) {
          try {
            const parsed = JSON.parse(storedEnrolled);
            if (Array.isArray(parsed)) {
              setEnrolledCourseIds(parsed);
            }
          } catch (e) {}
        }

        if (storedCourses !== null) {
          try {
            const parsedCourses = JSON.parse(storedCourses);
            if (Array.isArray(parsedCourses)) {
              setEnrolledCourses(parsedCourses);
            }
          } catch (e) {}
        }

        if (storedLessons !== null) {
          try {
            const parsedLessons = JSON.parse(storedLessons);
            if (parsedLessons && typeof parsedLessons === 'object') {
              setCompletedLessons(parsedLessons);
            }
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Error loading user cache from AsyncStorage:', err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadUserCachedData();

    // 2. Real-time Two-Way Sync with Firebase Firestore for this specific authenticated user
    const enrolledDocRef = doc(db, 'enrolledCourses', currentUser.uid);
    const unsubscribeEnrolled = onSnapshot(
      enrolledDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const courses = data.courses || [];

          if (Array.isArray(courses)) {
            setEnrolledCourses(courses);
            AsyncStorage.setItem(userKeyCourses, JSON.stringify(courses)).catch(() => {});

            const remoteIds = courses
              .map((c) => c.courseId || c.id)
              .filter(Boolean);

            setEnrolledCourseIds((prev) => {
              const combined = Array.from(new Set([...prev, ...remoteIds]));
              AsyncStorage.setItem(userKeyEnrolled, JSON.stringify(combined)).catch(() => {});
              return combined;
            });

            // Reconcile lesson progress from cloud if course is marked completed
            courses.forEach((c) => {
              const cId = c.courseId || c.id;
              if (cId && c.progress >= 100) {
                const allLessonIds = getAllLessonIdsForCourse(cId, c);
                if (allLessonIds.length > 0) {
                  setCompletedLessons((prev) => {
                    const currentDone = prev[cId] || [];
                    if (currentDone.length < allLessonIds.length) {
                      const updated = { ...prev, [cId]: allLessonIds };
                      AsyncStorage.setItem(userKeyLessons, JSON.stringify(updated)).catch(() => {});
                      return updated;
                    }
                    return prev;
                  });
                }
              }
            });
          }
        }
      },
      (err) => {
        console.warn('Firestore enrolledCourses listener error:', err);
      }
    );

    // Also listen to users collection doc to capture courses assigned by admin or web checkout
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribeUser = onSnapshot(
      userDocRef,
      (userSnap) => {
        if (userSnap.exists()) {
          const uData = userSnap.data();
          if (Array.isArray(uData.enrolledCourses) && uData.enrolledCourses.length > 0) {
            const extraIds = uData.enrolledCourses
              .map((item) => (typeof item === 'string' ? item : item.courseId || item.id))
              .filter(Boolean);

            if (extraIds.length > 0) {
              setEnrolledCourseIds((prev) => {
                const combined = Array.from(new Set([...prev, ...extraIds]));
                AsyncStorage.setItem(userKeyEnrolled, JSON.stringify(combined)).catch(() => {});
                return combined;
              });
            }
          }
        }
      },
      (err) => {
        console.warn('Firestore users listener error:', err);
      }
    );

    return () => {
      unsubscribeEnrolled();
      unsubscribeUser();
    };
  }, [currentUser]);

  // Helper to get all lesson IDs in a course
  const getAllLessonIdsForCourse = (courseId, courseData = null) => {
    const course =
      courseData ||
      enrolledCourses.find((c) => (c.courseId || c.id) === courseId) ||
      COURSES_DATABASE[courseId];
    if (course?.lectures && Array.isArray(course.lectures)) {
      return course.lectures.map((l) => String(l.id || l.videoId));
    }
    if (!course || !course.curriculum) return [];
    return course.curriculum.flatMap((mod) =>
      Array.isArray(mod.lessons) ? mod.lessons.map((l) => l.id) : []
    );
  };

  // Helper to count total lessons in course
  const getTotalLessonsCount = (courseId, courseData = null) => {
    const course =
      courseData ||
      enrolledCourses.find((c) => (c.courseId || c.id) === courseId) ||
      COURSES_DATABASE[courseId];
    if (course?.lectures && Array.isArray(course.lectures)) {
      return course.lectures.length;
    }
    if (!course || !course.curriculum) return 0;
    return course.curriculum.reduce(
      (acc, mod) => acc + (Array.isArray(mod.lessons) ? mod.lessons.length : 0),
      0
    );
  };

  // Check if course is enrolled (strictly false for guest users)
  const isCourseEnrolled = (courseId) => {
    if (!currentUser) return false;
    return enrolledCourseIds.includes(courseId);
  };

  // 3. Enroll in a course (Saves locally + Syncs to Firestore for logged in user)
  const enrollInCourse = async (courseId, courseDataOverride = null) => {
    if (!currentUser) return false;
    if (enrolledCourseIds.includes(courseId)) return true;

    const userKeyEnrolled = `@rehablito_enrolled_${currentUser.uid}`;
    const updated = [...enrolledCourseIds, courseId];
    setEnrolledCourseIds(updated);

    try {
      await AsyncStorage.setItem(userKeyEnrolled, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving enrolled courses to AsyncStorage:', e);
    }

    // Sync enrollment to Firestore
    try {
      let courseData = courseDataOverride || COURSES_DATABASE[courseId];
      if (!courseData) {
        try {
          const cSnap = await getDoc(doc(db, 'courseVideos', courseId));
          if (cSnap.exists()) {
            courseData = { id: cSnap.id, ...cSnap.data() };
          }
        } catch (e) {}
      }

      const lecturesList =
        (courseData?.lectures && Array.isArray(courseData.lectures)
          ? courseData.lectures
          : (courseData?.curriculum || []).flatMap((m) => m.lessons || []));

      const newCourseItem = {
        courseId,
        id: courseId,
        title: courseData?.title || 'Rehablito Course',
        image: courseData?.image || '',
        instructor: typeof courseData?.instructor === 'string' ? courseData.instructor : courseData?.instructor?.name || 'Rehablito Clinical Team',
        progress: 0,
        status: 'in-progress',
        enrolledAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        totalDuration: courseData?.duration || 'Self Paced',
        watchedDuration: 0,
        price: courseData?.price || 'Free',
        category: courseData?.category || 'General',
        lectures: lecturesList,
      };

      const enrolledDocRef = doc(db, 'enrolledCourses', currentUser.uid);
      const docSnap = await getDoc(enrolledDocRef);
      let currentCourses = [];
      if (docSnap.exists()) {
        currentCourses = docSnap.data().courses || [];
      }

      const alreadyInCloud = currentCourses.some(
        (c) => (c.courseId || c.id) === courseId
      );
      if (!alreadyInCloud) {
        const updatedCourses = [...currentCourses, newCourseItem];
        await setDoc(enrolledDocRef, { courses: updatedCourses }, { merge: true });

        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { enrolledCourses: updatedCourses });
      }
    } catch (err) {
      console.warn('Firestore enrollment sync error:', err);
    }

    return true;
  };

  // Check if a specific lesson is completed
  const isLessonCompleted = (courseId, lessonId) => {
    if (!currentUser) return false;
    const courseLessons = completedLessons[courseId] || [];
    return courseLessons.includes(lessonId);
  };

  // 4. Toggle lesson completed status & sync progress to Firestore
  const toggleLessonCompleted = async (courseId, lessonId) => {
    if (!currentUser) return false;

    const currentList = completedLessons[courseId] || [];
    let updatedList;

    if (currentList.includes(lessonId)) {
      updatedList = currentList.filter((id) => id !== lessonId);
    } else {
      updatedList = [...currentList, lessonId];
    }

    const updatedMap = {
      ...completedLessons,
      [courseId]: updatedList,
    };

    setCompletedLessons(updatedMap);
    const userKeyLessons = `@rehablito_lessons_${currentUser.uid}`;
    try {
      await AsyncStorage.setItem(userKeyLessons, JSON.stringify(updatedMap));
    } catch (e) {
      console.warn('Error saving completed lessons:', e);
    }

    // Calculate percentage
    const total = getTotalLessonsCount(courseId);
    const completedCount = updatedList.length;
    const percentage = total > 0 ? Math.min(100, Math.round((completedCount / total) * 100)) : 0;
    const isCompleted = percentage >= 100;

    // Sync with Firestore (debounced to avoid rate limits)
    if (firestoreSyncTimeout.current) {
      clearTimeout(firestoreSyncTimeout.current);
    }

    firestoreSyncTimeout.current = setTimeout(async () => {
      try {
        const enrolledDocRef = doc(db, 'enrolledCourses', currentUser.uid);
        const docSnap = await getDoc(enrolledDocRef);
        let currentCourses = [];
        if (docSnap.exists()) {
          currentCourses = docSnap.data().courses || [];
        }

        const existingIndex = currentCourses.findIndex(
          (c) => (c.courseId || c.id) === courseId
        );

        const courseData = COURSES_DATABASE[courseId];
        const courseTitle = courseData?.title || 'Rehablito Course';

        if (existingIndex !== -1) {
          const existing = currentCourses[existingIndex];
          currentCourses[existingIndex] = {
            ...existing,
            progress: percentage,
            status: isCompleted ? 'completed' : 'in-progress',
            lastAccessed: new Date().toISOString(),
            watchedDuration: completedCount * 600,
          };
        } else {
          currentCourses.push({
            courseId,
            id: courseId,
            title: courseTitle,
            image: courseData?.image || '',
            instructor: courseData?.instructor?.name || 'Rehablito Clinical Team',
            progress: percentage,
            status: isCompleted ? 'completed' : 'in-progress',
            lastAccessed: new Date().toISOString(),
            totalDuration: courseData?.duration || 'Self Paced',
            watchedDuration: completedCount * 600,
            lectures: (courseData?.curriculum || []).flatMap((m) => m.lessons || []),
          });
        }

        // 1. Write to enrolledCourses collection
        await setDoc(enrolledDocRef, { courses: currentCourses }, { merge: true });

        // 2. Write to users collection
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { enrolledCourses: currentCourses });

        // 3. When 100% completed, prepare certificate record in Firestore for website retrieval
        if (isCompleted) {
          const fixedDocId = `${currentUser.uid}_${courseId}`;
          const certRef = doc(db, 'certificates', fixedDocId);
          const certSnap = await getDoc(certRef);

          if (!certSnap.exists()) {
            const studentName =
              currentUser.displayName || currentUser.email?.split('@')[0] || 'Student';
            const uniqueCertId = `RHB-${courseId.substring(0, 3).toUpperCase()}-${Math.floor(
              100000 + Math.random() * 900000
            )}`;
            const issueDate = new Date().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            await setDoc(certRef, {
              certificateId: uniqueCertId,
              studentName: studentName,
              courseTitle: courseTitle,
              userId: currentUser.uid,
              courseId: courseId,
              issueDate: issueDate,
              issuedBy: 'Rehablito Academy',
              createdAt: serverTimestamp(),
              status: 'Verified',
            });
          }

          // Also update dashboard certificate count for student dashboard
          try {
            const dashRef = doc(db, 'dashboard', currentUser.uid);
            const dashSnap = await getDoc(dashRef);
            if (dashSnap.exists()) {
              const certsCount = currentCourses.filter((c) => (c.progress || 0) >= 100).length;
              await updateDoc(dashRef, {
                'stats.certificates': certsCount,
                'meta.lastActive': serverTimestamp(),
              });
            }
          } catch (dErr) {
            // Non-critical dashboard update
          }
        }
      } catch (syncErr) {
        console.error('Error syncing course progress to Firestore:', syncErr);
      }
    }, 1500);

    return !currentList.includes(lessonId);
  };

  // Get progress for a course: { completedCount, totalCount, percentage, isCompleted }
  const getCourseProgress = (courseId) => {
    if (!currentUser) {
      return { completedCount: 0, totalCount: 0, percentage: 0, isCompleted: false };
    }

    const total = getTotalLessonsCount(courseId);
    if (total === 0) return { completedCount: 0, totalCount: 0, percentage: 0, isCompleted: false };

    const completed = (completedLessons[courseId] || []).length;
    const pct = Math.min(100, Math.round((completed / total) * 100));
    return {
      completedCount: completed,
      totalCount: total,
      percentage: pct,
      isCompleted: pct === 100,
    };
  };

  return (
    <EnrollmentContext.Provider
      value={{
        isLoaded,
        enrolledCourseIds,
        enrolledCourses,
        isCourseEnrolled,
        enrollInCourse,
        isLessonCompleted,
        toggleLessonCompleted,
        getCourseProgress,
        getTotalLessonsCount,
        getAllLessonIdsForCourse,
      }}
    >
      {children}
    </EnrollmentContext.Provider>
  );
};

export const useEnrollment = () => {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error('useEnrollment must be used within an EnrollmentProvider');
  }
  return context;
};
