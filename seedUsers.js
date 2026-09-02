import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAKmxDKv3pU45sldBILap3B2wjl-azJznk",
  authDomain: "rehablito-courses.firebaseapp.com",
  projectId: "rehablito-courses",
  storageBucket: "rehablito-courses.firebasestorage.app",
  messagingSenderId: "648294540827",
  appId: "1:648294540827:web:e70c7ed668df1159937abe",
  measurementId: "G-1GTV0QNYZB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function seed() {
  const users = [
    { email: "admin@gmail.com", pass: "@Admin00", name: "Admin User", role: "admin" },
    { email: "student@gmail.com", pass: "@Student00", name: "Student User", role: "student" }
  ];

  for (const u of users) {
    try {
      console.log(`Creating ${u.email}...`);
      const cred = await createUserWithEmailAndPassword(auth, u.email, u.pass);
      const user = cred.user;
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: u.name,
        role: u.role,
        createdAt: serverTimestamp(),
        progress: 0,
        enrolledCourses: []
      });
      console.log(`Success: ${u.email}`);
    } catch(err) {
      console.error(`Failed ${u.email}:`, err.message);
    }
  }
  process.exit(0);
}

seed();
