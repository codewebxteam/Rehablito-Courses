import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import AuthModal from '../components/AuthModal';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real-time Auth state listener
  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Sync user profile document in real-time
        const userRef = doc(db, 'users', user.uid);
        unsubscribeProfile = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile({ id: docSnap.id, ...docSnap.data() });
            } else {
              setUserProfile({
                uid: user.uid,
                email: user.email,
                name: user.displayName || 'Rehablito Student',
                role: 'student',
              });
            }
            setLoading(false);
          },
          (err) => {
            console.warn('User profile fetch error:', err);
            setLoading(false);
          }
        );
      } else {
        setUserProfile(null);
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // 1. Login with email & password (matches Website credentials)
  const login = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), password);
      const uid = res.user.uid;

      // Ensure user document exists or update lastLogin
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid,
          name: res.user.displayName || 'Rehablito Student',
          email: res.user.email,
          phone: res.user.phoneNumber || '',
          role: 'student',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          enrolledCourses: [],
          purchasedBooks: [],
        });
      } else {
        await updateDoc(userRef, { lastLogin: serverTimestamp() });
      }

      return res;
    } catch (err) {
      console.error('Mobile Auth Login Error:', err);
      throw err;
    }
  };

  // 2. Signup matching Website schema
  const signup = async (email, password, name, phone = '') => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = res.user.uid;

      await Promise.all([
        updateProfile(res.user, { displayName: name }),
        setDoc(doc(db, 'users', uid), {
          uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          role: 'student',
          photoURL: '',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          enrolledCourses: [],
          purchasedBooks: [],
          registrationSource: 'Mobile_App',
        }),
        setDoc(doc(db, 'dashboard', uid), {
          user: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            avatar: '',
          },
          stats: {
            enrolledCourses: 0,
            activeHours: 0,
            certificates: 0,
            ebooks: 0,
          },
          activity: [
            { day: 'M', hours: 0 },
            { day: 'T', hours: 0 },
            { day: 'W', hours: 0 },
            { day: 'T', hours: 0 },
            { day: 'F', hours: 0 },
            { day: 'S', hours: 0 },
            { day: 'S', hours: 0 },
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

      return res;
    } catch (err) {
      console.error('Mobile Auth Signup Error:', err);
      throw err;
    }
  };

  // 3. Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      setCurrentUser(null);
    } catch (err) {
      console.error('Mobile Auth Logout Error:', err);
      throw err;
    }
  };

  // 4. Password Reset
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err) {
      console.error('Mobile Password Reset Error:', err);
      throw err;
    }
  };

  // 5. Update Profile
  const updateUserProfileData = async (data) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      const profileUpdates = {};
      if (data.name) profileUpdates.displayName = data.name;
      if (data.photoURL) profileUpdates.photoURL = data.photoURL;
      if (Object.keys(profileUpdates).length > 0 && currentUser) {
        await updateProfile(currentUser, profileUpdates);
      }
    } catch (err) {
      console.error('Update Profile Data Error:', err);
      throw err;
    }
  };

  // 6. Change Password (Real Firebase Authentication)
  const changePassword = async (currentPassword, newPassword) => {
    if (!currentUser || !currentUser.email) {
      throw new Error('User is not authenticated.');
    }
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
  };

  // 7. Global Auth Modal Controller
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [authCallbackRef, setAuthCallbackRef] = useState(null);

  const openAuthModal = (mode = 'login', callback = null) => {
    setAuthModalMode(mode);
    setAuthCallbackRef(() => callback);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthCallbackRef(null);
  };

  const handleAuthSuccess = () => {
    if (authCallbackRef && typeof authCallbackRef === 'function') {
      authCallbackRef();
    }
    closeAuthModal();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        login,
        signup,
        logout,
        resetPassword,
        updateUserProfileData,
        changePassword,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
      }}
    >
      {children}
      <AuthModal
        isOpen={isAuthModalOpen}
        defaultMode={authModalMode}
        onClose={closeAuthModal}
        onSuccess={handleAuthSuccess}
        login={login}
        signup={signup}
        resetPassword={resetPassword}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
