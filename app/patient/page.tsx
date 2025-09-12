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
  AlertTriangle,
  User,
  Calendar,
  Clock,
  Heart,
  Activity,
  Thermometer,
  Brain,
  Shield,
  CheckCircle,
  X,
  Phone,
  Volume2,
  VolumeX,
  MicOff,
  Play,
  Pause,
} from "lucide-react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { SessionManager } from "@/components/session-manager";
import { useTranslation } from "@/hooks/use-translation";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";

type Screen = "chat";
type Language =
  | "english"
  | "hindi"
  | "marathi"
  | "gujarati"
  | "tamil"
  | "telugu";

interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  emergencyContact: string;
  allergies: string;
  currentMedications: string;
}

interface Symptom {
  id: string;
  name: string;
  severity: "mild" | "moderate" | "severe";
  duration: string;
  description: string;
}

const languages = [
  { code: "english", name: "English", nativeName: "English", apiCode: "en" },
  { code: "hindi", name: "Hindi", nativeName: "हिंदी", apiCode: "hi" },
  { code: "marathi", name: "Marathi", nativeName: "मराठी", apiCode: "mr" },
  { code: "gujarati", name: "Gujarati", nativeName: "ગુજરાતી", apiCode: "gu" },
  { code: "tamil", name: "Tamil", nativeName: "தமிழ்", apiCode: "ta" },
  { code: "telugu", name: "Telugu", nativeName: "తెలుగు", apiCode: "te" },
];

export default function PatientKioskWithEmergency() {
  return (
    <div className="relative">
      <PatientKiosk />
      <EmergencyFAB />
    </div>
  );
}

function PatientKiosk() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("chat");
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    "english"
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
      isEmergency?: boolean;
      aiGenerated?: boolean;
    }>
  >([]);
  const [token, setToken] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: "Guest",
    age: "N/A",
    gender: "N/A",
    emergencyContact: "",
    allergies: "",
    currentMedications: "",
  });
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState<Partial<Symptom>>({});
  const [isEmergency, setIsEmergency] = useState(false);
  const [aiAssessing, setAiAssessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [voiceInput, setVoiceInput] = useState("");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [currentSpeakingField, setCurrentSpeakingField] = useState<
    string | null
  >(null);
  const { translate, isTranslating } = useTranslation();
  const { startRecording, stopRecording, isRecording, isProcessing } =
    useSpeechRecognition();
  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isLoading: isTTSLoading,
  } = useTextToSpeech();

  useEffect(() => {
    // Initialize with AI welcome message
    setMessages([
      {
        id: 1,
        sender: "ai",
        message:
          "Hello! I'm your AI Health Assistant. I'm here to help you prepare for your consultation with the doctor. How are you feeling today?",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        aiGenerated: true,
      },
    ]);
    proceedToConsultation();
  }, []);

  // AI Assessment Function
  const assessSymptoms = async (symptomData: Symptom[]) => {
    setAiAssessing(true);
    try {
      const response = await fetch("/api/gemini-medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assessUrgency",
          symptoms: symptomData.map((s) => ({
            name: s.name,
            severity: s.severity,
            duration: s.duration,
            description: s.description,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.risk === "high" || data.urgency === "high") {
        setIsEmergency(true);
        addAIMessage(
          `⚠️ URGENT: Based on your symptoms, you may need immediate medical attention. Please inform the medical staff immediately or call emergency services if symptoms worsen.`,
          true
        );
      } else {
        const assessmentText =
          data.assessment ||
          data.explanation ||
          "Your symptoms have been recorded.";
        addAIMessage(
          `Assessment: ${assessmentText} The doctor will review your symptoms shortly. In the meantime, try to stay comfortable and drink water if possible.`
        );
      }
    } catch (error) {
      console.error("AI assessment failed:", error);
      addAIMessage(
        "I'm unable to assess your symptoms right now, but the doctor will review everything with you shortly."
      );
    } finally {
      setAiAssessing(false);
    }
  };

  const addAIMessage = (message: string, emergency = false) => {
    const newMessage = {
      id: messages.length + 1,
      sender: "ai",
      message,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      aiGenerated: true,
      isEmergency: emergency,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const generateMedicalSummary = async () => {
    if (symptoms.length === 0) return;

    try {
      const response = await fetch("/api/gemini-medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateSummary",
          patientMessage: `Patient ${patientInfo.name} has reported the following symptoms.`,
          conversationHistory: messages
            .filter((m) => m.sender === "patient")
            .map((m) => m.message),
          medicalContext: {
            patientInfo,
            symptoms,
            currentCondition: symptoms
              .map((s) => `${s.name} (${s.severity}) - ${s.duration}`)
              .join("; "),
            medications: patientInfo.currentMedications || "None reported",
            allergies: patientInfo.allergies || "None reported",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const summaryText =
        data.summary || data.content || "Medical summary generated.";
      addAIMessage(`Medical Summary for Doctor: ${summaryText}`);
    } catch (error) {
      console.error("Failed to generate summary:", error);
      addAIMessage(
        "Summary generation is temporarily unavailable, but your information has been recorded for the doctor."
      );
    }
  };

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

  // Voice and Speech Functions
  const handleVoiceInput = async (
    fieldName: string,
    callback: (text: string) => void
  ) => {
    if (isRecording) {
      const result = await stopRecording();
      if (result && result.transcription) {
        callback(result.transcription);
        setVoiceInput("");
      }
    } else {
      const languageConfig = getSelectedLanguageConfig();
      await startRecording(languageConfig?.apiCode || "en");
    }
  };

  const speakText = async (text: string, field?: string) => {
    if (isSpeaking && currentSpeakingField === field) {
      stopSpeaking();
      setCurrentSpeakingField(null);
    } else {
      const languageConfig = getSelectedLanguageConfig();
      setCurrentSpeakingField(field || null);
      await speak(text, {
        language: languageConfig?.apiCode || "en",
        speed: 0.9,
      });
      setCurrentSpeakingField(null);
    }
  };

  const toggleVoiceGuidance = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (isSpeaking) {
      stopSpeaking();
      setCurrentSpeakingField(null);
    }
  };

  // Keyboard shortcuts for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only activate shortcuts when not typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl/Cmd + M: Toggle microphone
      if ((e.ctrlKey || e.metaKey) && e.key === "m") {
        e.preventDefault();
        if (currentScreen === "chat") {
          handleMicPress();
        }
      }

      // Ctrl/Cmd + V: Toggle voice guidance
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        toggleVoiceGuidance();
      }

      // Escape: Stop recording/speaking
      if (e.key === "Escape") {
        if (isRecording) {
          handleMicPress(); // Stop recording
        }
        if (isSpeaking) {
          stopSpeaking();
          setCurrentSpeakingField(null);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentScreen, isRecording, isSpeaking]);

  // Auto-speak important messages
  useEffect(() => {
    if (isVoiceEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === "ai" || lastMessage.sender === "doctor") {
        speakText(lastMessage.message, `message-${lastMessage.id}`);
      }
    }
  }, [messages, isVoiceEnabled]);

  const proceedToConsultation = async () => {
    setConnectionStatus("connecting");
    // Connect to video call
    const roomName = "arogya-sahayak-room";
    try {
      const resp = await fetch(
        `/api/livekit?room=${roomName}&username=patient-${Math.random()
          .toString(36)
          .substring(7)}`
      );
      const data = await resp.json();
      setToken(data.token);
      setConnectionStatus("connected");
      setCurrentScreen("chat");

      addAIMessage(
        "You're now connected with medical staff. Your symptoms and information have been shared with the doctor."
      );
    } catch (error) {
      setConnectionStatus("disconnected");
      addAIMessage("Connection failed. Please try again or contact support.");
    }
  };

  const handleSessionEnd = () => {
    // Reset all state
    setToken("");
    setConnectionStatus("disconnected");
    setPatientInfo({
      name: "",
      age: "",
      gender: "",
      emergencyContact: "",
      allergies: "",
      currentMedications: "",
    });
    setSymptoms([]);
    setCurrentSymptom({});
    setMessages([]);
    setIsEmergency(false);
    setSelectedLanguage(null);
    setShowKeyboard(false);
    setTextInput("");
    setIsListening(false);
    setIsSubmitting(false);
    setAiAssessing(false);
    setErrors({});

    // Show a brief goodbye message
    console.log("Session ended - returning to welcome screen");
  };

  const handleMicPress = async () => {
    if (isRecording) {
      const result = await stopRecording();
      if (result && result.transcription) {
        setTextInput(result.transcription);
      }
    } else {
      const languageConfig = getSelectedLanguageConfig();
      await startRecording(languageConfig?.apiCode || "en");
    }
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
        {/* Floating Voice Controls */}
        {isVoiceEnabled && (
          <div className="fixed top-4 right-4 z-40 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isRecording
                    ? "bg-red-500 animate-pulse"
                    : isSpeaking
                    ? "bg-blue-500 animate-pulse"
                    : "bg-green-500"
                }`}
              ></div>
              <span className="text-xs font-medium text-gray-700">
                {isRecording
                  ? "Recording"
                  : isSpeaking
                  ? "Speaking"
                  : "Voice Ready"}
              </span>
            </div>
          </div>
        )}

        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white p-4 lg:p-6 shadow-lg backdrop-blur-sm border-b border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <span className="text-2xl lg:text-3xl font-bold">A</span>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Arogya Sahayak
                </h1>
                <p className="text-blue-100 text-sm lg:text-base font-medium">
                  Patient: {patientInfo.name}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                className={`${
                  connectionStatus === "connected"
                    ? "bg-green-500/90 backdrop-blur-sm"
                    : connectionStatus === "connecting"
                    ? "bg-yellow-500/90 backdrop-blur-sm"
                    : "bg-red-500/90 backdrop-blur-sm"
                } text-white px-4 py-2 font-medium shadow-lg`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full mr-2 shadow-sm ${
                    connectionStatus === "connected"
                      ? "bg-white animate-pulse"
                      : connectionStatus === "connecting"
                      ? "bg-white/70 animate-spin"
                      : "bg-white/50"
                  }`}
                />
                {connectionStatus === "connected"
                  ? "Connected"
                  : connectionStatus === "connecting"
                  ? "Connecting..."
                  : "Disconnected"}
              </Badge>
              <Button
                onClick={toggleVoiceGuidance}
                size="sm"
                variant="ghost"
                className={`px-3 py-2 text-white hover:bg-white/20 rounded-lg ${
                  isVoiceEnabled ? "bg-white/20" : "bg-white/10"
                }`}
              >
                {isVoiceEnabled ? (
                  <Volume2 className="w-4 h-4 mr-1" />
                ) : (
                  <VolumeX className="w-4 h-4 mr-1" />
                )}
                <span className="hidden sm:inline">
                  {isVoiceEnabled ? "Voice On" : "Voice Off"}
                </span>
              </Button>
              {isEmergency && (
                <Badge className="bg-red-600/90 backdrop-blur-sm text-white px-4 py-2 flex items-center gap-2 font-medium shadow-lg animate-pulse">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="hidden sm:inline">URGENT</span>
                </Badge>
              )}
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

          {/* Voice Status Indicator */}
          {(isRecording || isProcessing || isSpeaking) && (
            <div className="mt-3 p-3 bg-blue-500/10 backdrop-blur-sm rounded-lg border border-blue-300/30">
              <div className="flex items-center justify-center gap-3 text-blue-700">
                {isRecording && (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">
                      Recording your voice...
                    </span>
                  </>
                )}
                {isProcessing && (
                  <>
                    <Brain className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">
                      Processing speech...
                    </span>
                  </>
                )}
                {isSpeaking && (
                  <>
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-medium">Speaking...</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Patient Summary Bar */}
          <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Age: {patientInfo.age}
              </span>
              {symptoms.length > 0 && (
                <span className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  {symptoms.length} symptom{symptoms.length !== 1 ? "s" : ""}
                </span>
              )}
              {patientInfo.allergies && (
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Allergies noted
                </span>
              )}
              {patientInfo.currentMedications && (
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  On medication
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Video Conference Section */}
        <div className="p-2 lg:p-4 flex-shrink-0">
          <Card className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 max-w-5xl mx-auto">
            <div className="aspect-video relative max-h-[50vh]">
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
                  msg.sender === "doctor" || msg.sender === "ai"
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[85%] lg:max-w-md p-4 lg:p-5 rounded-2xl text-base lg:text-lg shadow-lg transition-all duration-200 hover:shadow-xl ${
                    msg.sender === "doctor"
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tl-md"
                      : msg.sender === "ai"
                      ? `${
                          msg.isEmergency
                            ? "bg-gradient-to-br from-red-600 to-red-700 border-2 border-red-300"
                            : "bg-gradient-to-br from-purple-600 to-purple-700"
                        } text-white rounded-tl-md`
                      : "bg-white/95 backdrop-blur-sm border-2 border-blue-200/60 text-gray-800 rounded-tr-md"
                  }`}
                >
                  {/* Message Header for AI */}
                  {msg.sender === "ai" && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20">
                      {msg.isEmergency ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Brain className="w-4 h-4" />
                      )}
                      <span className="text-xs font-semibold opacity-90">
                        {msg.isEmergency
                          ? "EMERGENCY ALERT"
                          : "AI Health Assistant"}
                      </span>
                    </div>
                  )}

                  {/* Doctor message with translation */}
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

                  {/* Patient message with translation */}
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
                    <div className="flex items-center gap-2">
                      {/* Voice Control for Messages */}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const messageText =
                            msg.translatedMessage &&
                            selectedLanguage !== "english"
                              ? msg.translatedMessage
                              : msg.message;
                          speakText(messageText, `message-${msg.id}`);
                        }}
                        className={`p-1 text-xs ${
                          isSpeaking &&
                          currentSpeakingField === `message-${msg.id}`
                            ? "text-yellow-300"
                            : msg.sender === "patient"
                            ? "text-gray-500 hover:text-blue-500"
                            : "text-white/70 hover:text-white"
                        }`}
                        disabled={isTTSLoading}
                      >
                        {isSpeaking &&
                        currentSpeakingField === `message-${msg.id}` ? (
                          <VolumeX className="w-3 h-3" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </Button>

                      {isTranslating && msg.id === messages.length && (
                        <div className="flex items-center gap-2">
                          <Languages className="w-3 h-3 animate-spin" />
                          <span className="text-xs font-medium">
                            Translating...
                          </span>
                        </div>
                      )}
                      {msg.aiGenerated && !msg.isEmergency && (
                        <Badge className="bg-white/20 text-white text-xs px-2 py-1">
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Emergency Contact Info */}
            {isEmergency && (
              <Card className="mx-4 p-4 bg-red-50 border-2 border-red-200">
                <div className="flex items-center gap-3 text-red-700">
                  <Phone className="w-6 h-6" />
                  <div>
                    <h4 className="font-semibold">Emergency Contacts</h4>
                    <p className="text-sm">
                      Emergency Services: 102 | Hospital: +91-XXX-XXX-XXXX
                    </p>
                    {patientInfo.emergencyContact && (
                      <p className="text-sm">
                        Your Emergency Contact: {patientInfo.emergencyContact}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </Card>

        {/* Input Controls */}
        <div className="p-4 lg:p-6 bg-gradient-to-r from-white via-slate-50 to-white border-t-2 border-gray-200/60 backdrop-blur-sm">
          {showKeyboard ? (
            <div className="space-y-4">
              <div className="flex gap-3 lg:gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={`Type in ${
                      getSelectedLanguageConfig()?.nativeName
                    }...`}
                    className="w-full p-4 pr-20 lg:p-5 lg:pr-24 text-lg lg:text-xl border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/95 backdrop-blur-sm shadow-lg font-medium"
                    autoFocus
                    onKeyPress={(e) => e.key === "Enter" && handleSendText()}
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleVoiceInput("chat", (text) => setTextInput(text))
                      }
                      className={`p-2 ${
                        isRecording
                          ? "text-red-500 animate-pulse"
                          : "text-gray-500 hover:text-blue-500"
                      }`}
                      disabled={isProcessing}
                    >
                      {isRecording ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        speakText(
                          textInput || "Text input is empty",
                          "chat-input"
                        )
                      }
                      className={`p-2 ${
                        isSpeaking && currentSpeakingField === "chat-input"
                          ? "text-blue-500"
                          : "text-gray-500 hover:text-blue-500"
                      }`}
                      disabled={isTTSLoading}
                    >
                      {isSpeaking && currentSpeakingField === "chat-input" ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
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
                disabled={isProcessing}
                className={`w-28 h-28 lg:w-36 lg:h-36 rounded-full text-white shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden ${
                  isRecording
                    ? "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 animate-pulse"
                    : isProcessing
                    ? "bg-gradient-to-br from-yellow-600 to-orange-600"
                    : "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                }`}
              >
                {/* Ripple effect for recording */}
                {isRecording && (
                  <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
                )}

                <div className="text-center relative z-10">
                  {isProcessing ? (
                    <Brain className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-2 animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-2" />
                  ) : (
                    <Mic className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-2" />
                  )}
                  <span className="text-sm lg:text-lg font-semibold">
                    {isProcessing
                      ? "Processing..."
                      : isRecording
                      ? "Stop Recording"
                      : "Speak"}
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

          {/* Voice Commands Guide */}
          {isVoiceEnabled && (
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-sm text-blue-700 font-medium mb-2">
                  🎤 Voice Controls Active
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-blue-600 mb-2">
                  <span className="bg-white/80 px-2 py-1 rounded-full">
                    Press mic to record
                  </span>
                  <span className="bg-white/80 px-2 py-1 rounded-full">
                    Speaker icon to hear
                  </span>
                  <span className="bg-white/80 px-2 py-1 rounded-full">
                    Voice feedback available
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-blue-500 opacity-75">
                  <span className="bg-white/60 px-2 py-1 rounded-full">
                    Ctrl+M: Mic
                  </span>
                  <span className="bg-white/60 px-2 py-1 rounded-full">
                    Ctrl+V: Voice toggle
                  </span>
                  <span className="bg-white/60 px-2 py-1 rounded-full">
                    Esc: Stop
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// Emergency FAB Component
const EmergencyFAB = () => {
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowEmergencyPanel(true)}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-110"
        >
          <Phone className="w-8 h-8" />
        </Button>
      </div>

      {showEmergencyPanel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <Phone className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Emergency Contacts
              </h3>
              <p className="text-gray-600 mb-6">Choose an emergency service</p>

              <div className="space-y-3">
                <Button
                  onClick={() => window.open("tel:102")}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Emergency Services - 102
                </Button>
                <Button
                  onClick={() => window.open("tel:108")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Ambulance - 108
                </Button>
                <Button
                  onClick={() => setShowEmergencyPanel(false)}
                  variant="outline"
                  className="w-full py-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};