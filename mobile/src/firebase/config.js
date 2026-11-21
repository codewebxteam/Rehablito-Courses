import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAKmxDKv3pU45sldBILap3B2wjl-azJznk',
  authDomain: 'rehablito-courses.firebaseapp.com',
  projectId: 'rehablito-courses',
  storageBucket: 'rehablito-courses.firebasestorage.app',
  messagingSenderId: '648294540827',
  appId: '1:648294540827:web:e70c7ed668df1159937abe',
  measurementId: 'G-1GTV0QNYZB',
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence for React Native
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

export const db = getFirestore(app);
export { auth };
export default app;
