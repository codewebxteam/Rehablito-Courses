import React, { useState, useEffect } from "react";
import {
  Award,
  Download,
  Lock,
  PlayCircle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCourse } from "../../context/CourseContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import jsPDF from "jspdf";
import impactLogo from "../../assets/impact-logo.png";

const Certificates = () => {
  const { enrolledCourses } = useCourse();

  return (
    <div className="space-y-8 pb-20 font-sans text-[#0F1B3D]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FCE7F3] text-[#E6007E] text-xs font-extrabold mb-2">
            <Award className="w-3.5 h-3.5 text-[#E6007E]" />
            <span>My Credentials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1B3D]">
            My <span className="text-[#E6007E]">Certificates</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Track your progress and download official Rehablito Academy certificates.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {enrolledCourses && enrolledCourses.length > 0 ? (
          enrolledCourses.map((course) => (
            <CertificateItem
              key={course.courseId || course.id}
              courseData={course}
            />
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm space-y-4">
            <div className="w-16 h-16 bg-[#FCE7F3] text-[#E6007E] rounded-full flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-[#0F1B3D]">
              No Enrollments Found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
              Enroll in a therapy course to start your journey towards certification.
            </p>
            <Link
              to="/dashboard/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F1B3D] text-white rounded-full font-bold text-xs hover:bg-[#1d2e5e] transition-all shadow-md"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// --- CERTIFICATE ITEM COMPONENT ---
const CertificateItem = ({ courseData }) => {
  const { currentUser } = useAuth();
  const [certDetails, setCertDetails] = useState(null);

  const courseId = courseData.courseId || courseData.id;
  const title = courseData.title || "Untitled Course";

  const rawProgress = courseData.progress || 0;
  const progress = Math.round(rawProgress);
  const isEligible = progress >= 100;

  useEffect(() => {
    if (currentUser) {
      checkAndGenerateCertificate();
    }
  }, [courseId, isEligible, currentUser]);

  const checkAndGenerateCertificate = async () => {
    try {
      if (!currentUser) return;

      const fixedDocId = `${currentUser.uid}_${courseId}`;
      const docRef = doc(db, "certificates", fixedDocId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCertDetails(docSnap.data());
      } else if (isEligible) {
        await generateNewCertificate(fixedDocId);
      }
    } catch (error) {
      console.error("Cert Error:", error);
    }
  };

  const generateNewCertificate = async (fixedDocId) => {
    try {
      const studentName =
        currentUser.displayName || currentUser.email.split("@")[0];
      const uniqueCertId = `RHB-${courseId.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const issueDate = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const newCertData = {
        certificateId: uniqueCertId,
        studentName: studentName,
        courseTitle: title,
        userId: currentUser.uid,
        courseId: courseId,
        issueDate: issueDate,
        issuedBy: "Rehablito Academy",
        createdAt: serverTimestamp(),
        status: "Verified",
      };

      setCertDetails(newCertData);
      await setDoc(doc(db, "certificates", fixedDocId), newCertData, {
        merge: true,
      });
    } catch (err) {
      console.error("Save Failed:", err);
    }
  };

  const displayData = {
    courseTitle: title,
    studentName:
      certDetails?.studentName || currentUser?.displayName || "Student",
    issueDate: certDetails?.issueDate || new Date().toLocaleDateString("en-GB"),
    certificateId: certDetails?.certificateId || "Generating ID...",
    progress: progress,
  };

  const isUnlocked = isEligible;
  const [downloading, setDownloading] = useState(false);

  const generatePDF = () => {
    setDownloading(true);
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const centerX = width / 2;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = "https://ik.imagekit.io/5glnyqfxu/Courses/LogoRehab.webp";

    img.onload = () => {
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, width, height, "F");

      doc.setDrawColor(7, 24, 56);
      doc.setLineWidth(1.5);
      doc.rect(10, 10, width - 20, height - 20);
      doc.setDrawColor(230, 0, 126);
      doc.setLineWidth(0.8);
      doc.rect(13, 13, width - 26, height - 26);

      doc.setFillColor(7, 24, 56);
      const cS = 15;
      doc.triangle(10, 10, 10 + cS, 10, 10, 10 + cS, "F");
      doc.triangle(width - 10, 10, width - (10 + cS), 10, width - 10, 10 + cS, "F");
      doc.triangle(10, height - 10, 10 + cS, height - 10, 10, height - (10 + cS), "F");
      doc.triangle(width - 10, height - 10, width - (10 + cS), height - 10, width - 10, height - (10 + cS), "F");

      const logoSize = 30;
      doc.addImage(img, "PNG", centerX - logoSize / 2, 20, logoSize, logoSize, undefined, "FAST");

      doc.setTextColor(100, 110, 120);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("REG NO: UDYAM-BR-35-0048722", width - 25, 18, { align: "right" });

      doc.setTextColor(7, 24, 56);
      doc.setFont("times", "bold");
      doc.setFontSize(40);
      doc.text("CERTIFICATE", centerX, 65, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(230, 0, 126);
      doc.text("OF EXCELLENCE", centerX, 71, { align: "center", charSpace: 4 });

      doc.setTextColor(100, 110, 120);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("This certificate is proudly presented to", centerX, 90, { align: "center" });

      doc.setTextColor(7, 24, 56);
      doc.setFont("times", "bolditalic");
      doc.setFontSize(45);
      doc.text(displayData.studentName, centerX, 110, { align: "center" });
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(centerX - 70, 113, centerX + 70, 113);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(230, 0, 126);
      doc.text(displayData.courseTitle, centerX, 128, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      const longText = `This certifies that the recipient has demonstrated exceptional dedication and has successfully mastered the comprehensive curriculum of the above-mentioned course. This achievement reflects a deep understanding of the subject matter and a commitment to excellence in pediatric rehabilitation, speech therapy, and autism care as verified by the standards of Rehablito Academy.`;
      const splitText = doc.splitTextToSize(longText, width - 60);
      doc.text(splitText, centerX, 142, { align: "center", lineHeightFactor: 1.5 });

      const lineY = 175;
      const leftCenterX = 60;
      const rightCenterX = width - 60;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(displayData.issueDate, leftCenterX, lineY - 3, { align: "center" });
      doc.setDrawColor(7, 24, 56);
      doc.setLineWidth(0.5);
      doc.line(leftCenterX - 30, lineY, leftCenterX + 30, lineY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(7, 24, 56);
      doc.text("DATE ISSUED", leftCenterX, lineY + 6, { align: "center" });

      doc.setFont("times", "bolditalic");
      doc.setFontSize(20);
      doc.setTextColor(7, 24, 56);
      doc.text("Rehablito Academy", rightCenterX, lineY - 3, { align: "center" });
      doc.setLineWidth(0.5);
      doc.line(rightCenterX - 30, lineY, rightCenterX + 30, lineY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("AUTHORIZED SIGNATORY", rightCenterX, lineY + 6, { align: "center" });

      doc.setFillColor(248, 250, 252);
      doc.rect(10, height - 18, width - 20, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(7, 24, 56);
      doc.text(`CERTIFICATE ID: ${displayData.certificateId}`, 15, height - 13);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Verify authenticity at: www.rehablito.com/verify", width - 15, height - 13, { align: "right" });

      doc.save(`Rehablito_Certificate_${displayData.studentName.replace(/\s/g, "_")}.pdf`);
      setDownloading(false);
    };

    img.onerror = () => {
      alert("Logo Error! Please check src/assets/impact-logo.png");
      setDownloading(false);
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md hover:shadow-xl transition-all"
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        
        {/* Certificate Icon Container */}
        <div className="w-full md:w-56 aspect-[4/3] rounded-2xl flex items-center justify-center border border-slate-200 relative overflow-hidden shrink-0 bg-white p-4 shadow-inner">
          {isUnlocked ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <img
                src="https://ik.imagekit.io/5glnyqfxu/Courses/LogoRehab.webp"
                alt="Rehablito Logo"
                className="w-24 h-auto object-contain"
              />
              <span className="px-3 py-1 bg-[#0F1B3D] text-[#FFD60A] text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-xs mt-1">
                Official Credential
              </span>
            </div>
          ) : (
            <Lock className="w-10 h-10 text-slate-400" />
          )}
        </div>

        {/* Info & Action */}
        <div className="flex-1 text-center md:text-left w-full">
          <div className="mb-3 flex justify-center md:justify-start">
            {isUnlocked ? (
              <span className="px-3.5 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-[11px] font-extrabold uppercase tracking-wider border border-[#bbf7d0] flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Earned
              </span>
            ) : (
              <span className="px-3.5 py-1 rounded-full bg-[#FFEDD5] text-[#EA580C] text-[11px] font-extrabold uppercase tracking-wider border border-[#fed7aa]">
                In Progress
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F1B3D] mb-1 leading-snug">
            {displayData.courseTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mb-6">
            Issued to <span className="text-[#0F1B3D] font-extrabold">{displayData.studentName}</span>
          </p>

          {isUnlocked ? (
            <div className="flex flex-col sm:flex-row gap-4 items-center md:items-start pt-4 border-t border-slate-100">
              <button
                onClick={generatePDF}
                disabled={downloading}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0F1B3D] text-white rounded-full text-xs sm:text-sm font-bold hover:bg-[#1d2e5e] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{downloading ? "Generating PDF..." : "Download Official Certificate"}</span>
              </button>

              <div className="text-center sm:text-left w-full sm:w-auto">
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">
                  Credential ID
                </p>
                <p className="font-mono text-xs text-[#0F1B3D] font-extrabold tracking-wide break-all">
                  {displayData.certificateId}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Course Completion Progress</span>
                <span className="text-[#E6007E] font-extrabold">{displayData.progress}%</span>
              </div>

              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${displayData.progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#E6007E] via-[#2499C7] to-[#FFD60A] rounded-full"
                />
              </div>

              <Link
                to="/dashboard/my-courses"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-[#0284C7] hover:underline"
              >
                <PlayCircle className="w-4 h-4" /> Resume Learning to Unlock Certificate
              </Link>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default Certificates;
