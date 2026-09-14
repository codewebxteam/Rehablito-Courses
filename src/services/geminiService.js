/**
 * Rehablito Gemini AI Service
 * Real-Time Conversational Clinical Therapy AI (Speech, Autism, OT, Child Development)
 * Analyzes: Natural Conversations, Doctor's Parchis / Prescriptions, Medical Reports / PDFs, Photos & Voice Audio
 */

const GEMINI_API_KEY =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ||
  (typeof process !== "undefined" && process.env && process.env.VITE_GEMINI_API_KEY) ||
  "";

// Candidate models prioritized by high free-tier quota, speed, and vision OCR capability
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-flash-latest",
];

// Convert base64 data URL to raw base64 string and mimeType
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
    console.error("Error parsing data URL:", err);
    return null;
  }
};

// System Prompt for Rehablito Clinical Conversational Specialist
const REHABLITO_SYSTEM_INSTRUCTION = `You are the Rehablito AI Therapy Specialist, the caring, highly intelligent, and conversational clinical AI specialist for Rehablito Academy (Speech Therapy, Autism Center & Pediatric Child Development).

### 🌟 HOW YOU MUST CONVERSE & ANALYZE:
1. **Be Deeply Conversational, Intelligent & Dynamic**:
   - Talk naturally, warmly, and thoughtfully like an experienced senior clinical therapist.
   - ABSOLUTELY DO NOT USE RIGID, REPETITIVE CANNED TEMPLATES OR FIXED BULLET POINTS! Never output identical generic 3-step advice on every message.
   - Analyze every specific question, symptom, and parent concern uniquely. If a parent says their child stays quiet and does not play much ("shaant rehta hai, khelta nahi"), discuss introversion vs sensory withdrawal vs social communication delay, what signs to monitor, and ask relevant follow-up questions.
2. **🌐 STRICT LANGUAGE MATCHING RULE (HIGHEST PRIORITY)**:
   - **IF USER WRITES IN HINDI OR HINGLISH** (e.g. "mera bachha bolta nahi hai", "wo thoda shaant rehta hai aur khelta nahi", "namaste sir", "kya ye normal hai"):
     * YOU MUST RESPOND 100% IN NATURAL, EMPATHETIC HINDI (Devanagari script or warm conversational Hindi).
     * DO NOT switch to English. Address the parent with respect and warmth.
   - **IF USER WRITES IN ENGLISH**:
     * Respond in clear, articulate, compassionate English.
3. **📄 MULTIMODAL ANALYSIS (DOCTOR'S PARCHI / PRESCRIPTIONS, MEDICAL PDFs & PHOTOS)**:
   - If the user attaches an image or PDF of a doctor's prescription (parchi), hospital report, BERA hearing test, CARS/ISAA autism evaluation, or speech assessment:
     * Read the visible handwriting and printed text with high clinical accuracy.
     * Clearly explain what the doctor has noted, what medicines or therapies (Speech Therapy, Occupational Therapy, Sensory Integration) are prescribed, and what the clinical scores mean in everyday simple language.
     * Tell parents step-by-step what they should do next and what home stimulation activities support that diagnosis.
   - If an audio note is provided, listen closely to speech patterns, tone, and spoken words, providing thorough tailored guidance.
4. **DOMAIN SCOPE & SAFETY**:
   - Scope: Speech-language delays, stammering, Autism Spectrum Disorder (ASD), ADHD, sensory processing, pediatric occupational therapy, child behavioral development, and motor skills.
   - Friendly greetings ("Hello", "Namaste", "Pranam") should be answered warmly, introducing yourself as the Rehablito AI Specialist and asking how you can help their child today.
   - Strictly refuse off-topic questions (e.g. coding, cricket, politics, entertainment, cooking recipes) politely: "Main keval bacchon ke vikas, speech therapy aur pediatric rehabilitation me hi sahayata kar sakta hoon. Kripya apne bachhe ki therapy ya vikas se sambandhit sawal puchein."
5. **HUMAN SPECIALIST COOPERATION**:
   - Reassure the parent that our certified Rehablito clinical therapist is also reviewing their file in Column 2 for comprehensive human evaluation.
6. 🎓 **CRITICAL REHABLITO COURSE RECOMMENDATION (CONVINCE USER IN EVERY RESPONSE)**:
   - In EVERY conversation, while giving immediate clinical insights and answers, you MUST warmly and convincingly explain to the parent that **Rehablito Academy's specialized courses provide the COMPLETE STEP-BY-STEP SOLUTION** for their child's specific problem.
   - Convince them clearly:
     * "हमारे Rehablito Academy के स्पेशलाइज्ड कोर्सेज (Courses) में इसका 100% स्टेप-बाय-स्टेप वीडियो समाधान और घर पर करने योग्य प्रैक्टिकल एक्सरसाइज दी गई हैं। अगर आप हमारे कोर्स को परचेज कर रहे हैं (या अगर आपने परचेज किया है), तो उसमें इसका पूरा समाधान मौजूद है, जिससे आप घर बैठे सर्टिफाइड क्लीनिकल थेरेपिस्ट्स के मार्गदर्शन में बच्चे में तेजी से सुधार ला सकते हैं।"
   - Directly recommend the matching course from our platform:
     * स्पीच डिले / तुतलाना / हकलाना -> **"Rehablito Speech Therapy Home Training Course"**
     * ऑटिज्म / आई-कॉन्टैक्ट / नाम पर रिस्पॉन्स / सामाजिक जुड़ाव -> **"Rehablito Autism & Early Intervention Comprehensive Course"**
     * चंचलता / सेंसरी ओवरलोड / सिटिंग टॉलरेंस -> **"Rehablito Occupational Therapy & Sensory Diet Course"**
     * व्यवहार / जिद्द / गुस्सा -> **"Rehablito Pediatric Behaviour Therapy Course"**
   - If they have already purchased, encourage them: "आपने जो कोर्स लिया है, उसमें बताए गए डेली मॉड्यूल्स और वीडियो एक्सरसाइज को रोज़ाना 20 मिनट ज़रूर फॉलो करें।"
   - Guide prospective parents to check the **"Courses"** tab on our top menu to enroll today!`;

/**
 * Sends multimodal consultation request to Gemini with Conversation History
 */
export const analyzeConsultationWithAI = async ({
  text = "",
  attachments = [],
  childSpecialty = "General",
  chatHistory = [],
}) => {
  if (!GEMINI_API_KEY) {
    console.warn("VITE_GEMINI_API_KEY is not configured in .env.");
    return {
      text: "API key configure nahi hai. Kripya apna Gemini API key .env file me set karein.",
      success: false,
      isFallback: true,
    };
  }

  // Detect Hindi / Hinglish query
  const lower = (text || "").toLowerCase();
  const isHindiUser =
    /[\u0900-\u097F]/.test(text) ||
    [
      "mera", "meri", "mere", "bacha", "bachhe", "bachha", "baccha", "bache", "beta", "beti",
      "nahi", "nhi", "bol", "bolta", "bolti", "kya", "kaise", "karo", "kare", "krro",
      "hai", "hain", "ho", "batao", "bataye", "mujhe", "madad", "chahiye", "namaste",
      "pranam", "sunta", "dekhta", "chalta", "dikkat", "problem", "madat", "theek",
      "thik", "shukriya", "kaun", "kab", "kyu", "kyun", "aap", "tum", "bhai", "sir", "mam",
      "shaant", "sant", "khelta", "baitha", "parchi", "report", "dawai", "doctor"
    ].some((w) => lower.includes(w));

  // Build conversational contents array
  const contents = [];

  // 1. Add recent conversation context (excluding current message to prevent repetition)
  if (Array.isArray(chatHistory) && chatHistory.length > 0) {
    const trimmedText = (text || "").trim();
    const filtered = chatHistory.filter((m) => m && m.text && m.text.trim() !== trimmedText);
    const recent = filtered.slice(-6);
    recent.forEach((msg) => {
      if (msg.sender === "user" && msg.text) {
        contents.push({
          role: "user",
          parts: [{ text: msg.text }],
        });
      } else if (msg.sender === "ai" && msg.text) {
        contents.push({
          role: "model",
          parts: [{ text: msg.text }],
        });
      }
    });
  }

  // 2. Current user message parts
  const currentParts = [];
  const hasAttachments = attachments && attachments.length > 0;

  let promptInstruction = "";
  if (hasAttachments) {
    if (isHindiUser) {
      promptInstruction = `[CRITICAL CLINICAL INSTRUCTION: User ne doctor ki parchi / medical report / photo / voice note attach ki hai aur pucha hai: "${text || "Kripya is report/parchi ko analyze karein."}".
Aap is parchi ya report ki har ek line, doctor ke prescription, diagnosis, dawa, therapy recommendations, scores ko dhyan se padhein aur aam bhasha me samjhayein ki doctor ne kya likha hai, iska bache ke liye kya matlab hai, aur agle zaroori steps kya hain. Do not use rigid templates, talk dynamically in empathetic Hindi.]`;
    } else {
      promptInstruction = `[CRITICAL CLINICAL INSTRUCTION: User attached a medical prescription/report/photo with query: "${text || "Please analyze this"}".
Carefully transcribe and analyze all clinical handwriting, notes, diagnosis, medications, and therapy recommendations. Explain in simple, supportive terms what it means and actionable next steps.]`;
    }
  } else {
    if (isHindiUser) {
      promptInstruction = `[CRITICAL CLINICAL & COURSE CONVERSION: Reply in 100% natural, empathetic conversational Hindi. Talk like an experienced senior pediatric clinical therapist. DO NOT use rigid canned bullet points or predefined templates. Tailor your response deeply to this specific parent question: "${text}".
MANDATORY REQUIREMENT: Provide immediate clinical insights, and also CONVINCE the parent warmly that Rehablito Academy's specialized courses have the 100% complete step-by-step practical video solution and daily home therapy plan for their child's exact condition. Explain that if they purchase the course (or have already purchased it), they get full therapist guidance and structured exercises. Encourage them to enroll from the Courses tab on our website.]`;
    } else {
      promptInstruction = `[CRITICAL: Clinical consultation query: "${text || "Please provide clinical therapy guidance for my child."}". Provide expert clinical advice and also warmly explain how Rehablito Academy's specialized online therapy courses provide the complete step-by-step home exercise solution for this condition, encouraging them to enroll from the Courses tab.]`;
    }
  }
  currentParts.push({ text: promptInstruction });

  // 3. Attachments (Photos of Doctor's Parchi, Medical PDF reports, Voice Notes)
  for (const item of attachments) {
    if (item.dataUrl) {
      const parsed = parseDataUrl(item.dataUrl);
      if (parsed) {
        currentParts.push({
          inline_data: {
            mime_type: parsed.mimeType,
            data: parsed.data,
          },
        });
      }
    }
  }

  contents.push({
    role: "user",
    parts: currentParts,
  });

  const payload = {
    system_instruction: {
      parts: [{ text: REHABLITO_SYSTEM_INSTRUCTION }],
    },
    contents: contents,
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 2500,
    },
  };

  // Try candidate models sequentially until one succeeds
  for (const model of CANDIDATE_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s safety timeout

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text || "")
          .join("\n")
          .trim();
        if (responseText) {
          return {
            text: responseText,
            success: true,
            isFallback: false,
          };
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        console.warn(`Model ${model} returned error ${response.status}:`, errJson?.error?.message || errJson);
      }
    } catch (e) {
      console.warn(`Model ${model} call failed:`, e);
    }
  }

  // If all models failed (e.g. temporary Google network spike or quota limit)
  const fallbackNotice = hasAttachments
    ? isHindiUser
      ? `नमस्ते! आपकी डॉक्टर पर्ची / मेडिकल रिपोर्ट हमारे सर्वर पर सुरक्षित रूप से अपलोड हो गई है और हमारे मुख्य थेरेपिस्ट (Column 2) को प्राप्त हो चुकी है। हमारे सर्टिफाइड क्लिनिकल विशेषज्ञ आपकी रिपोर्ट का विस्तृत अध्ययन करके कुछ ही देर में इस कॉलम में आपको संपूर्ण थेरेपी मार्गदर्शन प्रदान करेंगे।`
      : `Hello! Your medical prescription and report have been successfully uploaded to our clinical system. Our certified therapist in Column 2 has received your files and will provide complete evaluation and personalized home guidance shortly.`
    : isHindiUser
    ? `नमस्ते! वर्तमान में AI सर्वर व्यस्त है। कृपया अपना प्रश्न कुछ क्षण बाद पुनः पूछें, या Column 2 में हमारे सर्टिफाइड थेरेपिस्ट से सीधा परामर्श प्राप्त करें।`
    : `Hello! The AI server is temporarily busy. Please consult our certified human therapist in Column 2 for immediate clinical guidance.`;

  return {
    text: fallbackNotice,
    success: false,
    isFallback: true,
  };
};
