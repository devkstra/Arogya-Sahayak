import { type NextRequest, NextResponse } from "next/server"

// Mock translation service - in production, integrate with Google Translate API
const mockTranslations: Record<string, Record<string, string>> = {
  "en-to-hi": {
    "How long have you had this fever?": "आपको यह बुखार कब से है?",
    "Please describe your symptoms": "कृपया अपने लक्षणों का वर्णन करें",
    "Take rest and drink plenty of fluids": "आराम करें और खूब तरल पदार्थ पिएं",
    "I understand your concern": "मैं आपकी चिंता समझता हूं",
  },
  "en-to-mr": {
    "How long have you had this fever?": "तुम्हाला हा ताप किती दिवसांपासून आहे?",
    "Please describe your symptoms": "कृपया तुमची लक्षणे सांगा",
    "Take rest and drink plenty of fluids": "आराम करा आणि भरपूर पाणी प्या",
    "I understand your concern": "मला तुमची चिंता समजते",
  },
  "hi-to-en": {
    "मुझे बुखार है डॉक्टर कृपया मेरी मदद करें": "I have fever Doctor please help me",
    "मेरा सिर दर्द कर रहा है": "My head is hurting",
    "मुझे खांसी है": "I have a cough",
  },
  "mr-to-en": {
    "मला ताप आला आहे डॉक्टर कृपया मला मदत करा": "I have fever Doctor please help me",
    "माझे डोके दुखत आहे": "My head is hurting",
    "मला खोकला आहे": "I have a cough",
  },
}

export async function POST(request: NextRequest) {
  try {
    const { text, fromLang, toLang } = await request.json()

    if (!text || !fromLang || !toLang) {
      return NextResponse.json({ error: "Missing required fields: text, fromLang, toLang" }, { status: 400 })
    }

    // Mock translation logic
    const translationKey = `${fromLang}-to-${toLang}`
    const translations = mockTranslations[translationKey] || {}

    // Check for exact match first
    let translatedText = translations[text]

    // If no exact match, use a simple keyword-based approach for demo
    if (!translatedText) {
      if (toLang === "en") {
        // Translating to English
        if (text.includes("ताप") || text.includes("बुखार")) {
          translatedText = "I have fever Doctor please help me"
        } else if (text.includes("डोके") || text.includes("सिर")) {
          translatedText = "My head is hurting"
        } else if (text.includes("खोकला") || text.includes("खांसी")) {
          translatedText = "I have a cough"
        } else {
          translatedText = `[Translated from ${fromLang}]: ${text}`
        }
      } else {
        // Translating from English
        if (text.toLowerCase().includes("fever")) {
          translatedText = toLang === "hi" ? "आपको बुखार है" : "तुम्हाला ताप आहे"
        } else if (text.toLowerCase().includes("headache") || text.toLowerCase().includes("head")) {
          translatedText = toLang === "hi" ? "आपका सिर दर्द कर रहा है" : "तुमचे डोके दुखत आहे"
        } else if (text.toLowerCase().includes("rest") && text.toLowerCase().includes("fluid")) {
          translatedText = toLang === "hi" ? "आराम करें और खूब तरल पदार्थ पिएं" : "आराम करा आणि भरपूर पाणी प्या"
        } else {
          translatedText = `[Translated to ${toLang}]: ${text}`
        }
      }
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      originalText: text,
      translatedText,
      fromLanguage: fromLang,
      toLanguage: toLang,
      confidence: 0.95,
    })
  } catch (error) {
    console.error("Translation error:", error)
    return NextResponse.json({ error: "Translation service failed" }, { status: 500 })
  }
}
