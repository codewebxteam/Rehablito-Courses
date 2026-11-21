/**
 * Rehablito Mobile Gemini AI Service
 * Real-Time Conversational Clinical Therapy AI
 * Routed through secure backend proxy: https://rehablito-courses-production.up.railway.app/api/ai/consultation
 */

const BACKEND_URL = 'https://rehablito-courses-production.up.railway.app';

export const analyzeConsultationWithAI = async ({
  text = '',
  attachments = [],
  childSpecialty = 'Pediatric Rehabilitation & Therapy',
  chatHistory = [],
}) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(`${BACKEND_URL}/api/ai/consultation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
        text: result.text || '',
        success: result.success !== false,
        isFallback: result.isFallback || false,
      };
    } else {
      const errData = await response.json().catch(() => ({}));
      return {
        text:
          errData.text ||
          'नमस्ते! वर्तमान में AI सर्वर व्यस्त है। कृपया "Certified Therapist" टैब में हमारे सर्टिफाइड थेरेपिस्ट से सीधा परामर्श प्राप्त करें।',
        success: false,
        isFallback: true,
      };
    }
  } catch (err) {
    const lower = (text || '').toLowerCase();
    const isHindiUser =
      /[\u0900-\u097F]/.test(text) ||
      [
        'mera', 'meri', 'mere', 'bacha', 'bachhe', 'bachha', 'baccha', 'bache',
        'nahi', 'nhi', 'bol', 'bolta', 'kya', 'kaise', 'karo', 'kare', 'hai',
      ].some((w) => lower.includes(w));

    const fallbackNotice = isHindiUser
      ? 'नमस्ते! सर्वर से संपर्क स्थापित नहीं हो सका। कृपया अपना प्रश्न कुछ क्षण बाद पुनः पूछें, या "Certified Therapist" टैब में हमारे थेरेपिस्ट से सीधा परामर्श प्राप्त करें।'
      : 'Hello! Unable to reach the clinical AI server. Please consult our certified therapist in the Certified Therapist tab for immediate guidance.';

    return {
      text: fallbackNotice,
      success: false,
      isFallback: true,
    };
  }
};
