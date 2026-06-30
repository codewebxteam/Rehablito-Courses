import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { generateSecureURL } from "../services/bunnyService";

const SecurePDFViewer = ({ book, onClose }) => {
  const [scale, setScale] = useState(1.2);
  const [isFocused, setIsFocused] = useState(true);
  const [securityWarning, setSecurityWarning] = useState(false);
  const [secureUrl, setSecureUrl] = useState(null);

  // Generate secure URL
  useEffect(() => {
    if (book.pdfUrl) {
      const url = generateSecureURL(book.pdfUrl, 3600);
      setSecureUrl(url);
    }
  }, [book.pdfUrl]);

  // Security Logic (Blur on focus loss, prevent screenshots)
  useEffect(() => {
    const handleBlur = () => setIsFocused(false);
    const handleFocus = () => setIsFocused(true);
    const handleKeyDown = (e) => {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey && e.key === "p") ||
        (e.metaKey && e.shiftKey && e.key === "4")
      ) {
        e.preventDefault();
        setSecurityWarning(true);
        setTimeout(() => setSecurityWarning(false), 2000);
      }
    };
    const handleContextMenu = (e) => e.preventDefault();

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-50 flex flex-col"
    >
      {/* Header */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="size-5 text-slate-700" />
          </button>
          <div>
            <span className="font-bold text-slate-900 block">{book.title}</span>
            <span className="text-xs text-slate-500">{book.author}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScale((s) => Math.max(s - 0.1, 0.8))}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
          >
            <ZoomOut className="size-5" />
          </button>
          <span className="text-sm text-slate-600 font-medium min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(s + 0.1, 2.0))}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
          >
            <ZoomIn className="size-5" />
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 relative overflow-hidden bg-slate-100">
        {!isFocused && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center">
            <EyeOff className="size-16 mb-4 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-900">Content Hidden</h2>
            <p className="text-slate-500 text-sm">Click here to continue reading</p>
          </div>
        )}

        {secureUrl ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div 
              className="w-full h-full max-w-5xl bg-white rounded-lg shadow-2xl overflow-hidden"
              style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
            >
              <iframe
                src={`${secureUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                className="w-full h-full border-0"
                title={book.title}
                style={{ pointerEvents: isFocused ? 'auto' : 'none' }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5edff4] mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Loading PDF...</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-14 bg-white border-t border-slate-200 flex items-center justify-center shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>Secure Reading Mode • {book.title}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SecurePDFViewer;