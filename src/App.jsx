import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { EBookProvider } from "./context/EBookContext";
import { CourseProvider } from "./context/CourseContext";

// --- Components ---
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// --- Public Pages ---
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Programs from "./pages/Programs";
import OurExperts from "./pages/OurExperts";
import EBookDetails from "./pages/EBookDetails";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import VerifyCertificate from "./pages/VerifyCertificate";

// --- Dashboard (Student) ---
import DashboardLayout from "./components/dashboard/DashboardLayout";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import MyCourses from "./pages/dashboard/MyCourses";
import EBookLibrary from "./pages/dashboard/EBookLibrary";
import ProgressReport from "./pages/dashboard/ProgressReport";
import ExploreCourses from "./pages/dashboard/ExploreCourses";
import Certificates from "./pages/dashboard/Certificates";
import Profile from "./pages/dashboard/Profile";

// --- Admin Pages ---
import AdminLayout from "./pages/Admin/AdminLayout";
import IntelligenceHub from "./pages/Admin/IntelligenceHub";
import StudentData from "./pages/Admin/StudentData";
import SalesManager from "./pages/Admin/SalesManager";
import CourseManager from "./pages/Admin/CourseManager";
import EBookManager from "./pages/Admin/EBookManager";
import UserAccessManager from "./pages/Admin/UserAccessManager";

// --- Scroll Helper ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- Protected Route Wrapper (For Students) ---
const ProtectedRoute = ({ children }) => {
  const { currentUser, userData, loading } = useAuth();

  // Loading check for persistence
  if (loading) return null;
  if (!currentUser) return <Navigate to="/" replace />;

  if (userData && userData.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// --- Admin Route Wrapper (FINAL REFRESH FIX) ---
const AdminRoute = ({ children }) => {
  const { currentUser, userData, loading } = useAuth();

  // 1. Jab tak Auth load ho raha hai, null return karo (taki redirect na ho)
  if (loading) return null;

  // 2. Agar auth loading khatam hui aur user session hi nahi mila
  if (!currentUser) return <Navigate to="/" replace />;

  // 3. Sabse important: Agar currentUser hai par userData (role) abhi tak
  // load nahi hua, toh tab bhi null return karo, redirect MAT karo.
  if (!userData) return null;

  // 4. Ab jab loading khatam hai aur userData aa chuka hai, tab role check karo
  if (userData.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppContent = () => {
  const { userData } = useAuth();
  const isAdmin = userData?.role === "admin";

  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          }
        />
        <Route
          path="/courses"
          element={
            <>
              <Navbar />
              <Courses />
              <Footer />
            </>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <>
              <Navbar />
              <CourseDetails />
              <Footer />
            </>
          }
        />
        <Route
          path="/programs"
          element={
            <>
              <Navbar />
              <Programs />
              <Footer />
            </>
          }
        />
        <Route
          path="/experts"
          element={
            <>
              <Navbar />
              <OurExperts />
              <Footer />
            </>
          }
        />

        <Route
          path="/ebooks/:id"
          element={
            <>
              <Navbar />
              <EBookDetails />
              <Footer />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <AboutUs />
              <Footer />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <Navbar />
              <ContactUs />
              <Footer />
            </>
          }
        />
        <Route path="/verify" element={<VerifyCertificate />} />

        {/* --- ADMIN DASHBOARD ROUTES --- */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<IntelligenceHub />} />
          <Route path="students" element={<StudentData />} />
          <Route path="sales" element={<SalesManager />} />
          <Route path="courses" element={<CourseManager />} />
          <Route path="ebooks" element={<EBookManager />} />
          <Route path="users" element={<UserAccessManager />} />
        </Route>

        {/* --- STUDENT DASHBOARD ROUTES --- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="ebooks" element={<EBookLibrary />} />
          <Route path="progress" element={<ProgressReport />} />
          <Route path="explore" element={<ExploreCourses />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* --- 404 CATCH ALL --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CourseProvider>
          <EBookProvider>
            <AppContent />
          </EBookProvider>
        </CourseProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
