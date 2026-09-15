import React, { useEffect, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { EBookProvider } from "./context/EBookContext";
import { CourseProvider } from "./context/CourseContext";

// --- Components (Always loaded — used on every page) ---
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingChatButton from "./components/FloatingChatButton";

// --- Lazy-loaded Public Pages ---
const Home = React.lazy(() => import("./pages/Home"));
const Courses = React.lazy(() => import("./pages/Courses"));
const CourseDetails = React.lazy(() => import("./pages/CourseDetails"));
const Programs = React.lazy(() => import("./pages/Programs"));
const OurExperts = React.lazy(() => import("./pages/OurExperts"));
const EBookDetails = React.lazy(() => import("./pages/EBookDetails"));
const AboutUs = React.lazy(() => import("./pages/AboutUs"));
const ContactUs = React.lazy(() => import("./pages/ContactUs"));
const VerifyCertificate = React.lazy(() => import("./pages/VerifyCertificate"));
const ConsultationChat = React.lazy(() => import("./pages/ConsultationChat"));

// --- Lazy-loaded Dashboard (Student) ---
const DashboardLayout = React.lazy(() => import("./components/dashboard/DashboardLayout"));
const StudentDashboard = React.lazy(() => import("./pages/dashboard/StudentDashboard"));
const MyCourses = React.lazy(() => import("./pages/dashboard/MyCourses"));
const EBookLibrary = React.lazy(() => import("./pages/dashboard/EBookLibrary"));
const ProgressReport = React.lazy(() => import("./pages/dashboard/ProgressReport"));
const ExploreCourses = React.lazy(() => import("./pages/dashboard/ExploreCourses"));
const Certificates = React.lazy(() => import("./pages/dashboard/Certificates"));
const Profile = React.lazy(() => import("./pages/dashboard/Profile"));

// --- Lazy-loaded Admin Pages ---
const AdminLayout = React.lazy(() => import("./pages/Admin/AdminLayout"));
const IntelligenceHub = React.lazy(() => import("./pages/Admin/IntelligenceHub"));
const StudentData = React.lazy(() => import("./pages/Admin/StudentData"));
const SalesManager = React.lazy(() => import("./pages/Admin/SalesManager"));
const CourseManager = React.lazy(() => import("./pages/Admin/CourseManager"));
const EBookManager = React.lazy(() => import("./pages/Admin/EBookManager"));
const UserAccessManager = React.lazy(() => import("./pages/Admin/UserAccessManager"));
const TherapistChatManager = React.lazy(() => import("./pages/Admin/TherapistChatManager"));

// --- Suspense Fallback Loader ---
const PageLoader = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#5edff4]"></div>
      <p className="text-slate-400 text-sm font-bold animate-pulse">Loading...</p>
    </div>
  </div>
);

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
      <FloatingChatButton />

      <Suspense fallback={<PageLoader />}>
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
        <Route
          path="/chat"
          element={
            <>
              <Navbar />
              <ConsultationChat />
            </>
          }
        />

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
          <Route path="chat" element={<TherapistChatManager />} />
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
          <Route path="chat" element={<ConsultationChat isDashboard={true} />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* --- 404 CATCH ALL --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <CourseProvider>
        <EBookProvider>
          <AppContent />
        </EBookProvider>
      </CourseProvider>
    </Router>
  );
};

export default App;
