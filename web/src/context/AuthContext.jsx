import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../firebase/config";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Signup Function - Ab ye wait karega jab tak data likha na jaye
  const signup = async (email, password, name, phone) => {
    try {
      // Step A: Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const uid = userCredential.user.uid;

      // [IMPORTANT] Parallel Writes: Ye ensure karta hai ki redirect hone se pehle
      // Auth Profile, Users table aur Dashboard teeno ready ho jayein.
      await Promise.all([
        updateProfile(userCredential.user, { displayName: name }),
        setDoc(doc(db, "users", uid), {
          uid,
          name: name,
          email: email,
          phone: phone || "",
          role: "student",
          photoURL: "",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          enrolledCourses: [],
          purchasedBooks: [],
          registrationSource: "Direct_Signup",
        }),
        setDoc(doc(db, "dashboard", uid), {
          user: {
            name,
            email,
            avatar: "",
          },
          stats: {
            enrolledCourses: 0,
            activeHours: 0,
            certificates: 0,
            ebooks: 0,
          },
          activity: [
            { day: "M", hours: 0 },
            { day: "T", hours: 0 },
            { day: "W", hours: 0 },
            { day: "T", hours: 0 },
            { day: "F", hours: 0 },
            { day: "S", hours: 0 },
            { day: "S", hours: 0 },
          ],
          currentCourse: null,
          gamification: { level: 1, xp: 0, streak: 0 },
          meta: {
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastActive: serverTimestamp(),
          },
        }),
      ]);

      return userCredential;
    } catch (error) {
      console.error("Error in signup process:", error);
      throw error;
    }
  };

  // 2. Login Function
  const login = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: uid,
          name: res.user.displayName || "Student",
          email: res.user.email,
          phone: res.user.phoneNumber || "",
          role: "student",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          enrolledCourses: [],
          purchasedBooks: [],
        });
      } else {
        await updateDoc(userRef, { lastLogin: serverTimestamp() });
      }

      return res;
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUserData(null);
    return signOut(auth);
  };

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const userRef = doc(db, "users", user.uid);

        unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();

            // [FIX] Universal Date Sanitization
            const sanitizeDate = (dateField) => {
              if (!dateField) return new Date();
              if (dateField.toDate) return dateField.toDate();
              const d = new Date(dateField);
              return isNaN(d.getTime()) ? new Date() : d;
            };

            setUserData({
              ...data,
              createdAt: sanitizeDate(data.createdAt),
              lastLogin: sanitizeDate(data.lastLogin),
            });
          } else {
            // Silently wait for the document to be created during signup
            setUserData(null);
          }
        });
      } else {
        setCurrentUser(null);
        setUserData(null);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const value = {
    currentUser,
    userData,
    signup,
    login,
    logout,
    loading,
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5edff4]"></div>
          <p className="text-slate-400 font-bold animate-pulse">
            Loading System...
          </p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
