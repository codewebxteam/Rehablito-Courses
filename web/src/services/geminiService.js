/**
 * Rehablito Gemini AI Service (Secure Backend Proxy Client)
 * Real-Time Conversational Clinical Therapy AI (Speech, Autism, OT, Child Development)
 *
 * All AI requests are securely routed through the Rehablito Backend Server (/api/ai/consultation).
 * The Google Gemini API key is stored securely in environment variables on the server
 * and is NEVER exposed to the client browser bundle or network query parameters.
 */

import { BACKEND_URL as RAZORPAY_BACKEND_URL } from "../utils/razorpay";

const BACKEND_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BACKEND_URL) ||
  RAZORPAY_BACKEND_URL ||
  "https://rehablito-courses-production.up.railway.app";

// Helper: Convert base64 data URL to raw base64 string and mimeType
export const parseDataUrl = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
    return null;
  }
  try {
    const [header, base64] = dataUrl.split(",");
    const mimeMatch = header.match(/data:([^;]+);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    return { mimeType, data: base64 };
  } catch (err) {
    return null;
  }
};

/**
 * Sends multimodal consultation request to the secure backend proxy
 */
export const analyzeConsultationWithAI = async ({
  text = "",
  attachments = [],
  childSpecialty = "General",
  chatHistory = [],
}) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s safety timeout

    const response = await fetch(`${BACKEND_URL}/api/ai/consultation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        attachments,
        childSpecialty,
        chatHistory,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      return {
        text: result.text || "",
        success: result.success !== false,
        isFallback: result.isFallback || false,
      };
    } else {
      const errData = await response.json().catch(() => ({}));
      return {
        text:
          errData.text ||
          "नमस्ते! वर्तमान में AI सर्वर व्यस्त है। कृपया Column 2 में हमारे सर्टिफाइड थेरेपिस्ट से सीधा परामर्श प्राप्त करें।",
        success: false,
        isFallback: true,
      };
    }
  } catch (err) {
    // Graceful fallback for network interruptions
    const lower = (text || "").toLowerCase();
    const isHindiUser =
      /[\u0900-\u097F]/.test(text) ||
      [
        "mera", "meri", "mere", "bacha", "bachhe", "bachha", "baccha", "bache",
        "nahi", "nhi", "bol", "bolta", "kya", "kaise", "karo", "kare", "hai",
      ].some((w) => lower.includes(w));

    const fallbackNotice = isHindiUser
      ? "नमस्ते! सर्वर से संपर्क स्थापित नहीं हो सका। कृपया अपना प्रश्न कुछ क्षण बाद पुनः पूछें, या Column 2 में हमारे थेरेपिस्ट से सीधा परामर्श प्राप्त करें।"
      : "Hello! Unable to reach the clinical AI server. Please consult our certified therapist in Column 2 for immediate guidance.";

    return {
      text: fallbackNotice,
      success: false,
      isFallback: true,
    };
  }
};

