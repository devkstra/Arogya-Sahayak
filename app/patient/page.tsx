"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  Keyboard,
  Send,
  Languages,
  Video,
  MessageSquare,
} from "lucide-react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { SessionManager } from "@/components/session-manager";
import { useTranslation } from "@/hooks/use-translation";

type Screen = "welcome" | "language" | "chat";
type Language =
  | "english"
  | "hindi"
  | "marathi"
  | "gujarati"
  | "tamil"
  | "telugu";

const languages = [
  { code: "english", name: "English", nativeName: "English", apiCode: "en" },
  { code: "hindi", name: "Hindi", nativeName: "हिंदी", apiCode: "hi" },
  { code: "marathi", name: "Marathi", nativeName: "मराठी", apiCode: "mr" },
  { code: "gujarati", name: "Gujarati", nativeName: "ગુજરાતી", apiCode: "gu" },
  { code: "tamil", name: "Tamil", nativeName: "தமிழ்", apiCode: "ta" },
  { code: "telugu", name: "Telugu", nativeName: "తెలుగు", apiCode: "te" },
];

export default function PatientKiosk() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null
  );
  const [isListening, setIsListening] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{
      id: number;
      sender: string;
      message: string;
      translatedMessage?: string;
      timestamp: string;
    }>
  >([]);
  const [token, setToken] = useState("");
  const { translate, isTranslating } = useTranslation();

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
        message:
          "How long have you had this fever? Please tell me more about your symptoms.",
        translatedMessage: "",
        timestamp: "10:32 AM",
      },
    ]);
  }, []);

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
              const languageConfig = languages.find(
                (l) => l.code === selectedLanguage
              );
              if (languageConfig) {
                const translated = await translate(
                  msg.message,
                  "en",
                  languageConfig.apiCode
                );
                return { ...msg, translatedMessage: translated };
              }
            }
            return msg;
          })
        );
        setMessagesCallback(updatedMessages);
      };
      translateDoctorMessages();
    }
  }, [selectedLanguage, messages, translate, setMessagesCallback]);

  const handleLanguageSelect = async (language: Language) => {
    setSelectedLanguage(language);
    const roomName = "arogya-sahayak-room";
    const resp = await fetch(
      `/api/livekit?room=${roomName}&username=patient-${Math.random()
        .toString(36)
        .substring(7)}`
    );
    const data = await resp.json();
    setToken(data.token);
    setCurrentScreen("chat");
  };

  const handleSessionEnd = () => {
    setToken("");
    setCurrentScreen("welcome");
  };

  const handleMicPress = () => {
    setIsListening(true);
    // Simulate voice activity detection
    setTimeout(() => {
      setIsListening(false);
    }, 3000);
  };

  const handleSendText = async () => {
    if (textInput.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "patient",
        message: textInput,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      } as {
        id: number;
        sender: string;
        message: string;
        translatedMessage?: string;
        timestamp: string;
      };

      // If not English, also translate to English for doctor
      if (selectedLanguage && selectedLanguage !== "english") {
        const languageConfig = languages.find(
          (l) => l.code === selectedLanguage
        );
        if (languageConfig) {
          const translatedToEnglish = await translate(
            textInput,
            languageConfig.apiCode,
            "en"
          );
          newMessage.translatedMessage = translatedToEnglish;
        }
      }

      setMessages((prev) => [...prev, newMessage]);
      setTextInput("");
      setShowKeyboard(false);
    }
  };

  const getSelectedLanguageConfig = () => {
    return languages.find((l) => l.code === selectedLanguage);
  };

  // Chat Interface
  if (currentScreen === "chat") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white p-4 lg:p-6 shadow-lg backdrop-blur-sm border-b border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <span className="text-2xl lg:text-3xl font-bold">A</span>
              </div>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Arogya Sahayak
                </h1>
                <p className="text-blue-100 text-sm lg:text-base font-medium">
                  AI Healthcare Assistant
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                className={`${
                  token
                    ? "bg-green-500/90 backdrop-blur-sm"
                    : "bg-yellow-500/90 backdrop-blur-sm"
                } text-white px-4 py-2 font-medium shadow-lg`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full mr-2 shadow-sm ${
                    token ? "bg-white animate-pulse" : "bg-white/70"
                  }`}
                />
                {token ? "Connected" : "Connecting..."}
              </Badge>
              <Badge className="bg-blue-500/90 backdrop-blur-sm text-white px-4 py-2 flex items-center gap-2 font-medium shadow-lg">
                <Languages className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {getSelectedLanguageConfig()?.nativeName}
                </span>
              </Badge>
              <Button
                onClick={handleSessionEnd}
                variant="destructive"
                size="sm"
                className="px-4 py-2 bg-red-600/90 hover:bg-red-700 backdrop-blur-sm shadow-lg font-medium"
              >
                <span className="hidden sm:inline">End Call</span>
                <span className="sm:hidden">End</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Video Conference Section */}
        <div className="p-4 lg:p-6 flex-shrink-0">
          <Card className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            <div className="aspect-video relative">
              {token ? (
                <LiveKitRoom
                  serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                  token={token}
                  connect={true}
                  video={true}
                  audio={true}
                  className="w-full h-full"
                >
                  <VideoConference />
                </LiveKitRoom>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-xl">
                      <Video className="w-10 h-10 lg:w-12 lg:h-12 opacity-60" />
                    </div>
                    <p className="text-xl lg:text-2xl font-semibold mb-2">
                      Video Call Inactive
                    </p>
                    <p className="text-sm lg:text-base opacity-75">
                      Waiting for connection...
                    </p>
                    <div className="flex justify-center space-x-1 mt-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Conversation Panel */}
        <Card className="mx-4 lg:mx-6 mb-4 flex-1 min-h-0 shadow-2xl bg-white/95 backdrop-blur-sm border border-gray-200/60">
          <div className="p-4 lg:p-5 bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 border-b border-gray-200/60 backdrop-blur-sm">
            <h3 className="text-lg lg:text-xl font-semibold text-blue-800 text-center flex items-center justify-center">
              <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-xl bg-blue-600 flex items-center justify-center mr-3 shadow-lg">
                <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              Conversation
            </h3>
          </div>
          <div className="p-4 lg:p-6 flex-1 overflow-y-auto scrollbar-custom space-y-5 min-h-0 max-h-64 lg:max-h-80">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex fade-in ${
                  msg.sender === "doctor" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[85%] lg:max-w-md p-4 lg:p-5 rounded-2xl text-base lg:text-lg shadow-lg transition-all duration-200 hover:shadow-xl ${
                    msg.sender === "doctor"
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tl-md"
                      : "bg-white/95 backdrop-blur-sm border-2 border-blue-200/60 text-gray-800 rounded-tr-md"
                  }`}
                >
                  {msg.sender === "doctor" &&
                  msg.translatedMessage &&
                  selectedLanguage !== "english" ? (
                    <div>
                      <p className="font-medium leading-relaxed">
                        {msg.translatedMessage}
                      </p>
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-sm opacity-75 italic font-medium">
                          Original: {msg.message}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="leading-relaxed font-medium">{msg.message}</p>
                  )}

                  {msg.sender === "patient" && msg.translatedMessage && (
                    <div className="mt-4 pt-4 border-t border-gray-200/60">
                      <p className="text-sm opacity-75 font-medium">
                        Sent to doctor: {msg.translatedMessage}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs opacity-75 font-medium">
                      {msg.timestamp}
                    </span>
                    {isTranslating && msg.id === messages.length && (
                      <div className="flex items-center gap-2">
                        <Languages className="w-3 h-3 animate-spin" />
                        <span className="text-xs font-medium">
                          Translating...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Input Controls */}
        <div className="p-4 lg:p-6 bg-gradient-to-r from-white via-slate-50 to-white border-t-2 border-gray-200/60 backdrop-blur-sm">
          {showKeyboard ? (
            <div className="space-y-4">
              <div className="flex gap-3 lg:gap-4">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={`Type in ${
                    getSelectedLanguageConfig()?.nativeName
                  }...`}
                  className="flex-1 p-4 lg:p-5 text-lg lg:text-xl border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/95 backdrop-blur-sm shadow-lg font-medium"
                  autoFocus
                  onKeyPress={(e) => e.key === "Enter" && handleSendText()}
                />
                <Button
                  onClick={handleSendText}
                  disabled={!textInput.trim() || isTranslating}
                  className="px-6 lg:px-8 py-4 lg:py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {isTranslating ? (
                    <Languages className="w-5 h-5 lg:w-6 lg:h-6 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 lg:w-6 lg:h-6" />
                  )}
                </Button>
              </div>
              <Button
                onClick={() => setShowKeyboard(false)}
                variant="outline"
                className="w-full py-4 lg:py-5 text-lg lg:text-xl rounded-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium backdrop-blur-sm"
              >
                Close Keyboard
              </Button>
            </div>
          ) : (
            <div className="flex gap-4 lg:gap-8 justify-center">
              <Button
                onClick={handleMicPress}
                className={`w-28 h-28 lg:w-36 lg:h-36 rounded-full text-white shadow-2xl transform hover:scale-105 transition-all duration-300 ${
                  isListening
                    ? "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 animate-pulse"
                    : "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                }`}
              >
                <div className="text-center">
                  <Mic className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-2" />
                  <span className="text-sm lg:text-lg font-semibold">
                    {isListening ? "Listening..." : "Speak"}
                  </span>
                </div>
              </Button>
              <Button
                onClick={() => setShowKeyboard(true)}
                className="w-28 h-28 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="text-center">
                  <Keyboard className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-2" />
                  <span className="text-sm lg:text-lg font-semibold">Type</span>
                </div>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Welcome Screen
  if (currentScreen === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 flex items-center justify-center p-4 lg:p-8 overflow-hidden">
        <Card className="w-full max-w-5xl p-8 lg:p-16 text-center shadow-2xl bg-white/95 backdrop-blur-lg border border-gray-200/60">
          <div className="space-y-8 lg:space-y-12">
            <div className="space-y-6 lg:space-y-8">
              <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center shadow-2xl ring-4 ring-blue-100">
                <span className="text-4xl lg:text-6xl font-bold text-white">
                  A
                </span>
              </div>
              <div>
                <h1 className="text-3xl lg:text-6xl font-bold text-blue-800 mb-3 lg:mb-6 slide-up">
                  Welcome to
                </h1>
                <h2 className="text-4xl lg:text-7xl font-bold mb-4 lg:mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent slide-up delay-150">
                  Arogya Sahayak
                </h2>
                <p className="text-xl lg:text-3xl text-slate-600 leading-relaxed font-medium slide-up delay-300">
                  Your AI-Powered Healthcare Assistant
                </p>
                <p className="text-base lg:text-xl text-slate-500 mt-3 font-medium slide-up delay-450">
                  Connecting patients with healthcare professionals through AI
                </p>
              </div>
            </div>

            <div className="py-6 lg:py-10 slide-up delay-600">
              <Button
                onClick={() => setCurrentScreen("language")}
                className="text-2xl lg:text-4xl px-12 lg:px-20 py-6 lg:py-10 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-bold tracking-wide"
              >
                <span className="flex items-center">
                  Tap to Start
                  <svg
                    className="w-6 h-6 lg:w-10 lg:h-10 ml-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </Button>
            </div>

            <div className="space-y-6 slide-up delay-750">
              <p className="text-lg lg:text-2xl text-slate-500 font-medium">
                Touch the button above to begin your consultation
              </p>
              <div className="flex flex-wrap justify-center gap-4 lg:gap-6 text-sm lg:text-base text-slate-400">
                <span className="flex items-center bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2 shadow-sm"></div>
                  Secure & Private
                </span>
                <span className="flex items-center bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 shadow-sm"></div>
                  Multi-language Support
                </span>
                <span className="flex items-center bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2 shadow-sm"></div>
                  AI-Powered
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Language Selection Screen
  if (currentScreen === "language") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-cyan-50 p-4 lg:p-8 overflow-y-auto scrollbar-custom">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 lg:p-12 shadow-2xl bg-white/95 backdrop-blur-lg border border-gray-200/60">
            <div className="text-center mb-8 lg:mb-16">
              <div className="w-20 h-20 lg:w-28 lg:h-28 mx-auto rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-700 flex items-center justify-center shadow-2xl mb-6 lg:mb-8 ring-4 ring-teal-100">
                <Languages className="w-10 h-10 lg:w-14 lg:h-14 text-white" />
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-teal-800 mb-4 lg:mb-6 slide-up">
                Select Your Language
              </h1>
              <h2 className="text-2xl lg:text-4xl font-semibold text-teal-700 mb-4 lg:mb-6 slide-up delay-150">
                अपनी भाषा चुनें
              </h2>
              <p className="text-lg lg:text-2xl text-slate-600 leading-relaxed font-medium slide-up delay-300">
                Choose your preferred language for consultation
              </p>
              <p className="text-sm lg:text-xl text-slate-500 mt-2 lg:mt-4 font-medium slide-up delay-450">
                परामर्श के लिए अपनी पसंदीदा भाषा चुनें
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
              {languages.map((language, index) => (
                <Button
                  key={language.code}
                  onClick={() =>
                    handleLanguageSelect(language.code as Language)
                  }
                  className={`h-24 lg:h-32 text-xl lg:text-2xl font-bold bg-white/95 hover:bg-teal-50 text-teal-800 border-2 border-teal-200/60 hover:border-teal-400 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group backdrop-blur-sm fade-in`}
                  variant="outline"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="text-center space-y-2">
                    <div className="text-2xl lg:text-3xl font-bold group-hover:text-teal-600 transition-colors duration-200">
                      {language.nativeName}
                    </div>
                    <div className="text-base lg:text-xl opacity-75 group-hover:opacity-90 font-semibold">
                      {language.name}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="mt-8 lg:mt-16 text-center slide-up delay-700">
              <p className="text-sm lg:text-lg text-slate-500 mb-6 font-medium">
                Need help? Our system supports voice input and text typing in
                all languages.
              </p>
              <div className="flex flex-wrap justify-center gap-4 lg:gap-6 text-xs lg:text-sm text-slate-400">
                <span className="flex items-center bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <Mic className="w-4 h-4 mr-2" />
                  Voice Input
                </span>
                <span className="flex items-center bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <Keyboard className="w-4 h-4 mr-2" />
                  Text Input
                </span>
                <span className="flex items-center bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <Languages className="w-4 h-4 mr-2" />
                  Real-time Translation
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
