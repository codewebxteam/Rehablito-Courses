import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BookHero from "../components/ebook-details/BookHero";
import BookContent from "../components/ebook-details/BookContent";
import BookPricingCard from "../components/ebook-details/BookPricingCard";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore"; // Write operations hata di
import { db } from "../firebase/config";
import { Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EBookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [dbPurchased, setDbPurchased] = useState(false);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getValidImageUrl = (url) => {
    if (!url) return "https://placehold.co/400x600?text=No+Cover";
    try {
      if (url.includes("drive.google.com")) {
        let id = "";
        if (url.includes("/file/d/"))
          id = url.split("/file/d/")[1].split("/")[0];
        else if (url.includes("id=")) id = url.split("id=")[1].split("&")[0];
        if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
      }
    } catch (e) {
      console.error("URL Error", e);
    }
    return url;
  };

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const docRef = doc(db, "ebooks", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setBook({
            id: docSnap.id,
            ...data,
            cover: getValidImageUrl(data.image),
            title: data.title || "Untitled Book",
            author: data.author || "Unknown Author",
            description: data.description || "No description available.",
            rating: data.rating || 4.5,
            reviews: data.reviews || 78,
            totalPages: data.pages || "Unknown",
            lastUpdated: data.updatedAt
              ? new Date(data.updatedAt).toLocaleDateString()
              : "Recently",
            category: data.category || "General",
            chapters: data.chapters || [
              {
                title: "Complete E-Book Content",
                pages: data.pages || "All",
                topics: ["Full PDF Access"],
              },
            ],
            features: [
              "Instant PDF Access",
              "Mobile Friendly",
              "Lifetime Updates",
            ],
            paymentLink: data.paymentLink || "", // [IMPORTANT] Payment Link Load kiya
          });
        } else {
          setError("Book not found");
        }
      } catch (err) {
        console.error("Error fetching ebook:", err);
        setError("Failed to load details");
      } finally {
        setLoading(false);
      }
    };
    fetchBookDetails();
  }, [id]);

  // Check Database for Purchase (Read Access Check)
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (currentUser && book) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data().purchasedBooks) {
            if (userSnap.data().purchasedBooks.includes(book.id)) {
              setDbPurchased(true);
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    checkPurchaseStatus();
  }, [currentUser, book]);

  const priceStr = book ? String(book.price).toLowerCase() : "";
  const isFree = priceStr === "0" || priceStr === "free";
  const canAccess = dbPurchased || isFree;

  const displayBook = book ? { ...book, purchased: canAccess } : null;

  // [UPDATED] Clean Handler
  // Ab ye function sirf "Read" karne ke liye hai.
  // "Buy" karne ka kaam PricingCard karega (Redirect ke zariye).
  const handleAction = () => {
    if (canAccess) {
      setShowPDFViewer(true);
    } else {
      // Agar user bina kharide yahan click kare (jo button ki wajah se mushkil hai), to login kholo
      if (!currentUser) setIsAuthOpen(true);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="size-10 text-[#5edff4] animate-spin" />
      </div>
    );
  if (error || !displayBook)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Book Not Found
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-slate-50 font-sans pb-20">
        <BookHero book={displayBook} />
        <div className="max-w-7xl mx-auto px-6 mt-10">
          <div className="grid lg:grid-cols-3 gap-12 relative">
            <div className="lg:col-span-2 space-y-10">
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  About this E-Book
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                  <p>{displayBook.description}</p>
                </div>
              </div>
              {displayBook.chapters && displayBook.chapters.length > 0 && (
                <BookContent chapters={displayBook.chapters} />
              )}
            </div>
            <div className="lg:col-span-1 relative">
              {/* Card ab khud payment handle karega */}
              <BookPricingCard book={displayBook} onAction={handleAction} />
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          defaultMode="login"
        />
      </div>
      <AnimatePresence>
        {showPDFViewer && (
          <SecurePDFViewer
            book={displayBook}
            onClose={() => setShowPDFViewer(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// Secure Viewer
const SecurePDFViewer = ({ book, onClose }) => {
  const getEmbedUrl = (url) => {
    if (!url) return "";
    try {
      if (url.includes("drive.google.com")) {
        let id = "";
        if (url.includes("/file/d/"))
          id = url.split("/file/d/")[1].split("/")[0];
        else if (url.includes("id=")) id = url.split("id=")[1].split("&")[0];
        if (id) return `https://drive.google.com/file/d/${id}/preview`;
      }
    } catch (e) {
      console.error("URL Error", e);
    }
    return url;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-900 flex flex-col select-none"
    >
      <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 lg:px-8 z-50 shadow-md">
        <div className="flex items-center gap-4 text-white">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="size-6" />
          </button>
          <div className="flex flex-col">
            <span className="font-bold text-sm lg:text-base line-clamp-1">
              {book.title}
            </span>
            <span className="text-[10px] lg:text-xs text-slate-400">
              Secure Reader
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-slate-950 relative flex flex-col items-center justify-center p-0 lg:p-4">
        <div className="w-full h-full max-w-5xl bg-white lg:rounded-2xl overflow-hidden shadow-2xl relative">
          <iframe
            src={getEmbedUrl(book.driveLink)}
            className="w-full h-full border-0"
            title="PDF Reader"
            allow="autoplay"
          ></iframe>
        </div>
      </div>
    </motion.div>
  );
};

export default EBookDetails;
