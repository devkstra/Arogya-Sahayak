import { type NextRequest, NextResponse } from "next/server"

// Mock Deepgram API integration
// In production, replace with actual Deepgram API calls
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const language = (formData.get("language") as string) || "en"

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    // Mock transcription based on language
    const mockTranscriptions: Record<string, string> = {
      en: "I have been having a fever for the past two days and I feel very weak.",
      hi: "मुझे पिछले दो दिनों से बुखार है और मैं बहुत कमजोर महसूस कर रहा हूं।",
      mr: "मला गेल्या दोन दिवसांपासून ताप आहे आणि मला खूप अशक्त वाटत आहे।",
      gu: "મને છેલ્લા બે દિવસથી તાવ છે અને હું ખૂબ નબળો લાગું છું.",
      ta: "கடந்த இரண்டு நாட்களாக எனக்கு காய்ச்சல் இருக்கிறது மற்றும் நான் மிகவும் பலவீனமாக உணர்கிறேன்.",
      te: "గత రెండు రోజులుగా నాకు జ్వరం వచ్చింది మరియు నేను చాలా బలహీనంగా అనిపిస్తున్నాను।",
    }

    // Simulate API processing time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const transcription = mockTranscriptions[language] || mockTranscriptions["en"]

    return NextResponse.json({
      transcription,
      language,
      confidence: 0.92,
      duration: 3.5,
      words: transcription.split(" ").map((word, index) => ({
        word,
        start: index * 0.5,
        end: (index + 1) * 0.5,
        confidence: 0.9 + Math.random() * 0.1,
      })),
    })
  } catch (error) {
    console.error("Speech-to-text error:", error)
    return NextResponse.json({ error: "Speech-to-text processing failed" }, { status: 500 })
  }
}
