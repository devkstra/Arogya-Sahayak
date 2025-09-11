"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Keyboard,
  Send,
  Languages,
  Video,
  MessageSquare,
  Volume2,
  VolumeX,
  Loader2,
  Zap,
  Phone,
  PhoneCall,
  Heart,
  Activity,
  User,
  Clock,
  Settings,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  RotateCcw,
  Home,
} from "lucide-react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { useTranslation } from "@/hooks/use-translation";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";

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

interface Message {
  id: number;
  sender: string;
  message: string;
  translatedMessage?: string;
  timestamp: string;
  confidence?: number;
  duration?: number;
}

export default function PatientKiosk() {
  // State management
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null
  );
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [liveTranscription, setLiveTranscription] = useState("");
  const [isAutoSpeakEnabled, setIsAutoSpeakEnabled] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState<
    "excellent" | "good" | "poor"
  >("excellent");
  const [sessionDuration, setSessionDuration] = useState(0);
  const [currentSpeakingMessage, setCurrentSpeakingMessage] = useState<
    number | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [token, setToken] = useState("");

  // Refs
  const sessionStartTimeRef = useRef<Date | null>(null);

  // Hooks
  const {
    translate,
    isTranslating,
    error: translationError,
  } = useTranslation();
  const {
    startRecording,
    stopRecording,
    isRecording,
    isProcessing,
    error: speechError,
  } = useSpeechRecognition();
  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isLoading: isSpeechLoading,
    error: speechSynthError,
  } = useTextToSpeech();

  // Initialize sample messages
  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: "system",
        message:
          "Welcome to your consultation. Please feel free to speak in your preferred language.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        confidence: 1.0,
      },
    ]);
  }, []);

  // Session duration tracker
  useEffect(() => {
    if (token && !sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date();
      const interval = setInterval(() => {
        if (sessionStartTimeRef.current) {
          const duration = Math.floor(
            (Date.now() - sessionStartTimeRef.current.getTime()) / 1000
          );
          setSessionDuration(duration);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // Connection quality simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const qualities: Array<"excellent" | "good" | "poor"> = [
        "excellent",
        "good",
        "excellent",
      ];
      setConnectionQuality(
        qualities[Math.floor(Math.random() * qualities.length)]
      );
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-translate doctor messages
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
                try {
                  const translated = await translate(
                    msg.message,
                    "en",
                    languageConfig.apiCode
                  );
                  return { ...msg, translatedMessage: translated };
                } catch (error) {
                  console.error("Translation failed:", error);
                  return msg;
                }
              }
            }
            return msg;
          })
        );
        setMessages(updatedMessages);
      };
      translateDoctorMessages();
    }
  }, [selectedLanguage, translate]);

  // Auto-speak doctor messages
  useEffect(() => {
    if (isAutoSpeakEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage.sender === "doctor" &&
        lastMessage.id !== currentSpeakingMessage
      ) {
        const messageToSpeak =
          selectedLanguage &&
          selectedLanguage !== "english" &&
          lastMessage.translatedMessage
            ? lastMessage.translatedMessage
            : lastMessage.message;

        const languageConfig = languages.find(
          (l) => l.code === selectedLanguage
        );
        setCurrentSpeakingMessage(lastMessage.id);

        speak(messageToSpeak, {
          language: languageConfig?.apiCode || "en",
          speed: 0.9,
        }).finally(() => {
          setCurrentSpeakingMessage(null);
        });
      }
    }
  }, [
    messages,
    isAutoSpeakEnabled,
    selectedLanguage,
    speak,
    currentSpeakingMessage,
  ]);

  // Language selection with LiveKit integration
  const handleLanguageSelect = async (language: Language) => {
    try {
      setSelectedLanguage(language);
      const roomName = "arogya-sahayak-room";
      const username = `patient-${language}-${Date.now()}`;

      const resp = await fetch(
        `/api/livekit?room=${roomName}&username=${username}`
      );
      if (!resp.ok) throw new Error("Failed to get session token");

      const data = await resp.json();
      setToken(data.token);
      setCurrentScreen("chat");

      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now(),
        sender: "system",
        message: "Connected successfully! You can now speak with your doctor.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, welcomeMessage]);
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  // Session management
  const handleSessionEnd = () => {
    setToken("");
    setCurrentScreen("welcome");
    setSelectedLanguage(null);
    setMessages([]);
    sessionStartTimeRef.current = null;
    setSessionDuration(0);
    stopSpeaking();
    if (isRecording) {
      stopRecording();
    }
  };

  // Voice input handling
  const handleMicPress = async () => {
    if (isRecording) {
      try {
        const result = await stopRecording();
        if (result && result.transcription) {
          await handleTranscribedText(result.transcription);
        }
      } catch (error) {
        console.error("Recording failed:", error);
      }
      setLiveTranscription("");
    } else {
      setLiveTranscription("Listening...");
      const languageConfig = languages.find((l) => l.code === selectedLanguage);
      try {
        await startRecording(languageConfig?.apiCode || "en");
      } catch (error) {
        console.error("Failed to start recording:", error);
        setLiveTranscription("");
      }
    }
  };

  // Process transcribed text
  const handleTranscribedText = async (transcribedText: string) => {
    const newMessage: Message = {
      id: Date.now(),
      sender: "patient",
      message: transcribedText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Translate to English for doctor if needed
    if (selectedLanguage && selectedLanguage !== "english") {
      const languageConfig = languages.find((l) => l.code === selectedLanguage);
      if (languageConfig) {
        try {
          const translatedToEnglish = await translate(
            transcribedText,
            languageConfig.apiCode,
            "en"
          );
          newMessage.translatedMessage = translatedToEnglish;
        } catch (error) {
          console.error("Translation failed:", error);
        }
      }
    }

    setMessages((prev) => [...prev, newMessage]);
  };

  // Text input handling
  const handleSendText = async () => {
    if (textInput.trim()) {
      await handleTranscribedText(textInput);
      setTextInput("");
      setShowKeyboard(false);
    }
  };

  // Manual message playback
  const handlePlayMessage = (message: Message) => {
    const messageToSpeak =
      selectedLanguage &&
      selectedLanguage !== "english" &&
      message.translatedMessage
        ? message.translatedMessage
        : message.message;

    const languageConfig = languages.find((l) => l.code === selectedLanguage);
    speak(messageToSpeak, {
      language: languageConfig?.apiCode || "en",
      speed: 0.9,
    });
  };

  // Format session duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get language configuration
  const getSelectedLanguageConfig = () => {
    return languages.find((l) => l.code === selectedLanguage);
  };

  // Welcome Screen
  if (currentScreen === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Arogya Sahayak
                </h1>
                <p className="text-lg text-gray-600">
                  AI-Powered Healthcare Assistant
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="space-y-6">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Welcome to Your Virtual Consultation
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Connect with healthcare professionals through our secure
                    platform
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Video className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900">
                      Video Consultation
                    </h3>
                    <p className="text-sm text-gray-600">
                      Face-to-face with doctors
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Languages className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900">
                      Multi-Language
                    </h3>
                    <p className="text-sm text-gray-600">
                      Speak in your language
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Mic className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900">
                      Voice Recognition
                    </h3>
                    <p className="text-sm text-gray-600">
                      Speech-to-text support
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setCurrentScreen("language")}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg font-semibold rounded-xl"
                >
                  Start Consultation
                  <PhoneCall className="w-6 h-6 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Language Selection Screen
  if (currentScreen === "language") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Languages className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Choose Your Preferred Language
            </h1>
            <p className="text-lg text-gray-600">
              अपनी भाषा चुनें / आपली भाषा निवडा / ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆರಿಸಿ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {languages.map((language) => (
              <Card
                key={language.code}
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-blue-300 bg-white"
                onClick={() => handleLanguageSelect(language.code as Language)}
              >
                <div className="text-center space-y-3">
                  <div className="text-2xl font-bold text-gray-900">
                    {language.nativeName}
                  </div>
                  <div className="text-lg text-gray-600">{language.name}</div>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="pointer-events-none"
                    >
                      Select Language
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentScreen("welcome")}
              className="text-gray-600 hover:text-gray-800"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Chat Interface
  if (currentScreen === "chat" && token) {
    const selectedLangConfig = getSelectedLanguageConfig();

    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Dr. Smith</h2>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        connectionQuality === "excellent"
                          ? "bg-green-500"
                          : connectionQuality === "good"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm text-gray-600 capitalize">
                      {connectionQuality} connection
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(sessionDuration)}</span>
              </div>

              <Badge variant="secondary" className="text-xs">
                {selectedLangConfig?.nativeName}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAutoSpeakEnabled(!isAutoSpeakEnabled)}
                className={
                  isAutoSpeakEnabled ? "bg-green-50 border-green-200" : ""
                }
              >
                {isAutoSpeakEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleSessionEnd}
              >
                End Session
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Video Conference */}
          <div className="flex-1 bg-black relative">
            <LiveKitRoom
              token={token}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
              data-lk-theme="default"
              style={{ height: "100%" }}
            >
              <VideoConference />
            </LiveKitRoom>

            {/* Live Transcription Overlay */}
            {liveTranscription && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black bg-opacity-70 text-white p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Listening...</span>
                  </div>
                  <p className="mt-1">{liveTranscription}</p>
                </div>
              </div>
            )}
          </div>

          {/* Chat Panel */}
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "patient"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      message.sender === "patient"
                        ? "bg-blue-600 text-white"
                        : message.sender === "doctor"
                        ? "bg-gray-100 text-gray-900"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    <div className="space-y-2">
                      <p className="text-sm">
                        {selectedLanguage !== "english" &&
                        message.translatedMessage
                          ? message.translatedMessage
                          : message.message}
                      </p>

                      {message.sender === "doctor" &&
                        selectedLanguage !== "english" && (
                          <div className="pt-2 border-t border-gray-200 border-opacity-20">
                            <p className="text-xs opacity-70">
                              {message.message}
                            </p>
                          </div>
                        )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs opacity-70">
                          {message.timestamp}
                        </span>

                        {(message.sender === "doctor" ||
                          message.sender === "system") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePlayMessage(message)}
                            className="h-6 w-6 p-0 hover:bg-white hover:bg-opacity-20"
                            disabled={isSpeaking}
                          >
                            {isSpeaking &&
                            currentSpeakingMessage === message.id ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 space-y-3">
              {/* Voice/Text Toggle */}
              <div className="flex space-x-2">
                <Button
                  onClick={handleMicPress}
                  disabled={isProcessing}
                  className={`flex-1 ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : isRecording ? (
                    <MicOff className="w-4 h-4 mr-2" />
                  ) : (
                    <Mic className="w-4 h-4 mr-2" />
                  )}
                  {isProcessing
                    ? "Processing..."
                    : isRecording
                    ? "Stop"
                    : "Speak"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowKeyboard(!showKeyboard)}
                  className={showKeyboard ? "bg-gray-100" : ""}
                >
                  <Keyboard className="w-4 h-4" />
                </Button>
              </div>

              {/* Text Input */}
              {showKeyboard && (
                <div className="space-y-2">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={`Type your message in ${selectedLangConfig?.name}...`}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendText();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendText}
                    disabled={!textInput.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              )}

              {/* Status Indicators */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  {speechError && (
                    <div className="flex items-center space-x-1 text-red-500">
                      <AlertCircle className="w-3 h-3" />
                      <span>Speech error</span>
                    </div>
                  )}
                  {translationError && (
                    <div className="flex items-center space-x-1 text-red-500">
                      <AlertCircle className="w-3 h-3" />
                      <span>Translation error</span>
                    </div>
                  )}
                  {isTranslating && (
                    <div className="flex items-center space-x-1 text-blue-500">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Translating...</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <Activity className="w-3 h-3" />
                  <span>Live session</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
