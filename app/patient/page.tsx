"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Keyboard, Send, Languages } from "lucide-react"
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { SessionManager } from "@/components/session-manager"
import { useTranslation } from "@/hooks/use-translation"

type Screen = "welcome" | "language" | "chat"
type Language = "english" | "hindi" | "marathi" | "gujarati" | "tamil" | "telugu"

const languages = [
  { code: "english", name: "English", nativeName: "English", apiCode: "en" },
  { code: "hindi", name: "Hindi", nativeName: "हिंदी", apiCode: "hi" },
  { code: "marathi", name: "Marathi", nativeName: "मराठी", apiCode: "mr" },
  { code: "gujarati", name: "Gujarati", nativeName: "ગુજરાતી", apiCode: "gu" },
  { code: "tamil", name: "Tamil", nativeName: "தமிழ்", apiCode: "ta" },
  { code: "telugu", name: "Telugu", nativeName: "తెలుగు", apiCode: "te" },
]

export default function PatientKiosk() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome")
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [messages, setMessages] = useState<
    Array<{ id: number; sender: string; message: string; translatedMessage?: string; timestamp: string }>
  >([])
  const [token, setToken] = useState("");
  const { translate, isTranslating } = useTranslation()

  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: "patient",
        message: "I have Fever Doctor please help me",
        timestamp: "10:31 AM",
      },
      {
        id: 2,
        sender: "doctor",
        message: "How long have you had this fever? Please tell me more about your symptoms.",
        translatedMessage: "",
        timestamp: "10:32 AM",
      },
    ])
  }, [])
  
  // This useCallback is for the dependency array of the useEffect
  const setMessagesCallback = useCallback((newMessages: any) => {
    setMessages(newMessages);
  }, []);

  useEffect(() => {
    if (selectedLanguage && selectedLanguage !== "english") {
      const translateDoctorMessages = async () => {
        const updatedMessages = await Promise.all(
          messages.map(async (msg) => {
            if (msg.sender === "doctor" && !msg.translatedMessage) {
              const languageConfig = languages.find((l) => l.code === selectedLanguage)
              if (languageConfig) {
                const translated = await translate(msg.message, "en", languageConfig.apiCode)
                return { ...msg, translatedMessage: translated }
              }
            }
            return msg
          }),
        )
        setMessagesCallback(updatedMessages)
      }
      translateDoctorMessages()
    }
  }, [selectedLanguage, messages, translate, setMessagesCallback])

  const handleLanguageSelect = async (language: Language) => {
    setSelectedLanguage(language)
    const roomName = "arogya-sahayak-room";
    const resp = await fetch(
      `/api/livekit?room=${roomName}&username=patient-${Math.random().toString(36).substring(7)}`
    );
    const data = await resp.json();
    setToken(data.token);
    setCurrentScreen("chat")
  }

  const handleSessionEnd = () => {
    setToken("")
    setCurrentScreen("welcome")
  }

  const handleMicPress = () => {
    setIsListening(true)
    // Simulate voice activity detection
    setTimeout(() => {
      setIsListening(false)
    }, 3000)
  }

  const handleSendText = async () => {
    if (textInput.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "patient",
        message: textInput,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      } as { id: number; sender: string; message: string; translatedMessage?: string; timestamp: string };

      // If not English, also translate to English for doctor
      if (selectedLanguage && selectedLanguage !== "english") {
        const languageConfig = languages.find((l) => l.code === selectedLanguage)
        if (languageConfig) {
          const translatedToEnglish = await translate(textInput, languageConfig.apiCode, "en")
          newMessage.translatedMessage = translatedToEnglish
        }
      }

      setMessages((prev) => [...prev, newMessage])
      setTextInput("")
      setShowKeyboard(false)
    }
  }

  const getSelectedLanguageConfig = () => {
    return languages.find((l) => l.code === selectedLanguage)
  }

  // Chat Interface
  if (currentScreen === "chat") {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col">
            <div className="bg-blue-700 text-white p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Arogya Sahayak</h1>
                    <div className="flex items-center gap-4">
                        <Badge className={token ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
                            {token ? "Connected" : "Disconnected"}
                        </Badge>
                        <Badge className="bg-blue-500 text-white text-lg px-4 py-2 flex items-center gap-2">
                            <Languages className="w-4 h-4" />
                            {getSelectedLanguageConfig()?.nativeName}
                        </Badge>
                        <Button onClick={handleSessionEnd} variant="destructive" size="sm">
                            End Call
                        </Button>
                    </div>
                </div>
            </div>
            <div className="m-6 mb-4">
                {token && (
                    <LiveKitRoom
                        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                        token={token}
                        connect={true}
                        video={true}
                        audio={true}
                    >
                        <VideoConference />
                    </LiveKitRoom>
                )}
            </div>
            <Card className="mx-6 mb-4 flex-1">
                <div className="p-4 bg-blue-100 border-b">
                    <h3 className="text-xl font-semibold text-blue-800 text-center">Conversation</h3>
                </div>
                <div className="p-6 h-64 overflow-y-auto space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === "doctor" ? "justify-start" : "justify-end"}`}>
                            <div className={`max-w-xs lg:max-w-md p-4 rounded-2xl text-lg ${msg.sender === "doctor" ? "bg-blue-600 text-white" : "bg-white border-2 border-blue-200 text-gray-800"}`}>
                                {msg.sender === "doctor" && msg.translatedMessage && selectedLanguage !== "english" ? (
                                    <div>
                                        <p className="font-medium">{msg.translatedMessage}</p>
                                        <p className="text-sm opacity-75 mt-2 italic">Original: {msg.message}</p>
                                    </div>
                                ) : (
                                    <p>{msg.message}</p>
                                )}

                                {msg.sender === "patient" && msg.translatedMessage && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <p className="text-sm opacity-75">Sent to doctor: {msg.translatedMessage}</p>
                                    </div>
                                )}
                                <span className="text-sm opacity-75 block mt-2">{msg.timestamp}</span>
                                {isTranslating && msg.id === messages.length && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Languages className="w-3 h-3 animate-spin" />
                                        <span className="text-xs">Translating...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            <div className="p-6 bg-white border-t-2 border-gray-200">
                {showKeyboard ? (
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder={`Type in ${getSelectedLanguageConfig()?.nativeName}...`}
                                className="flex-1 p-4 text-xl border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                                autoFocus
                                onKeyPress={(e) => e.key === "Enter" && handleSendText()}
                            />
                            <Button onClick={handleSendText} disabled={!textInput.trim() || isTranslating} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl">
                                {isTranslating ? <Languages className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                            </Button>
                        </div>
                        <Button onClick={() => setShowKeyboard(false)} variant="outline" className="w-full py-4 text-xl rounded-xl">
                            Close Keyboard
                        </Button>
                    </div>
                ) : (
                    <div className="flex gap-6 justify-center">
                        <Button onClick={handleMicPress} className={`w-32 h-32 rounded-full text-white shadow-2xl transform hover:scale-105 transition-all duration-200 ${isListening ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-blue-600 hover:bg-blue-700"}`}>
                            <div className="text-center">
                                <Mic className="w-12 h-12 mx-auto mb-2" />
                                <span className="text-lg font-semibold">{isListening ? "Listening..." : "Speak"}</span>
                            </div>
                        </Button>
                        <Button onClick={() => setShowKeyboard(true)} className="w-32 h-32 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-2xl transform hover:scale-105 transition-all duration-200">
                            <div className="text-center">
                                <Keyboard className="w-12 h-12 mx-auto mb-2" />
                                <span className="text-lg font-semibold">Type</span>
                            </div>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
  }

  // Welcome Screen
  if (currentScreen === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl p-12 text-center shadow-2xl">
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-blue-800 mb-4">Welcome to</h1>
              <h2 className="text-6xl font-bold text-blue-900 mb-6">Arogya Sahayak</h2>
              <p className="text-2xl text-gray-600">Your AI-Powered Healthcare Assistant</p>
            </div>
            <div className="py-8">
              <Button onClick={() => setCurrentScreen("language")} className="text-3xl px-16 py-8 bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200">
                Tap to Start
              </Button>
            </div>
            <p className="text-lg text-gray-500">Touch the button above to begin your consultation</p>
          </div>
        </Card>
      </div>
    )
  }

  // Language Selection Screen
  if (currentScreen === "language") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-teal-800 mb-4">Select Your Language</h1>
              <h2 className="text-3xl font-semibold text-teal-700">अपनी भाषा चुनें</h2>
              <p className="text-xl text-gray-600 mt-4">Choose your preferred language for consultation</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {languages.map((language) => (
                <Button key={language.code} onClick={() => handleLanguageSelect(language.code as Language)} className="h-24 text-2xl font-semibold bg-white hover:bg-teal-50 text-teal-800 border-2 border-teal-200 hover:border-teal-400 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200" variant="outline">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{language.nativeName}</div>
                    <div className="text-lg opacity-75">{language.name}</div>
                  </div>
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return null
}