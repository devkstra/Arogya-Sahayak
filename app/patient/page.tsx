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

type Screen = "welcome" | "language" | "patient-info" | "symptoms" | "chat";
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
      isEmergency?: boolean;
      aiGenerated?: boolean;
    }>
  >([]);
  const [token, setToken] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: "",
    age: "",
    gender: "",
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

  const handleLanguageSelect = async (language: Language) => {
    setSelectedLanguage(language);
    setCurrentScreen("patient-info");
  };

  const handlePatientInfoSubmit = async () => {
    setErrors({});

    if (!patientInfo.name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Name is required" }));
      return;
    }

    if (
      !patientInfo.age ||
      parseInt(patientInfo.age) < 1 ||
      parseInt(patientInfo.age) > 120
    ) {
      setErrors((prev) => ({
        ...prev,
        age: "Please enter a valid age (1-120)",
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate validation
      setCurrentScreen("symptoms");
      addAIMessage(
        `Hello ${patientInfo.name}! Let's gather information about your symptoms to help the doctor understand your condition better.`
      );
    } catch (error) {
      console.error("Submission error:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to submit information. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSymptomSubmit = () => {
    if (
      currentSymptom.name &&
      currentSymptom.severity &&
      currentSymptom.duration
    ) {
      const newSymptom: Symptom = {
        id: Date.now().toString(),
        name: currentSymptom.name || "",
        severity: currentSymptom.severity || "mild",
        duration: currentSymptom.duration || "",
        description: currentSymptom.description || "",
      };

      setSymptoms((prev) => [...prev, newSymptom]);
      setCurrentSymptom({});

      addAIMessage(
        `Added: ${newSymptom.name} (${newSymptom.severity}) for ${newSymptom.duration}. Would you like to add more symptoms or proceed to the consultation?`
      );
    }
  };

  const proceedToConsultation = async () => {
    setConnectionStatus("connecting");

    // Assess symptoms with AI
    if (symptoms.length > 0) {
      await assessSymptoms(symptoms);
      await generateMedicalSummary();
    }

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
    setCurrentScreen("welcome");
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

  // Progress Steps Component
  const ProgressSteps = ({ currentStep }: { currentStep: number }) => {
    const steps = [
      { id: 1, name: "Language", icon: Languages },
      { id: 2, name: "Information", icon: User },
      { id: 3, name: "Symptoms", icon: Activity },
      { id: 4, name: "Consultation", icon: Video },
    ];

    return (
      <div className="flex items-center justify-center space-x-2 md:space-x-4 mb-8 px-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full border-2 transition-all duration-200 ${
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isActive
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 md:w-6 md:h-6" />
                ) : (
                  <Icon className="w-3 h-3 md:w-5 md:h-5" />
                )}
              </div>
              <span
                className={`hidden md:block ml-2 text-sm font-medium ${
                  isCompleted || isActive ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 md:w-16 h-0.5 mx-2 md:mx-4 ${
                    isCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Patient Information Screen
  if (currentScreen === "patient-info") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 p-4 lg:p-8 overflow-y-auto scrollbar-custom">
        <div className="max-w-4xl mx-auto">
          <ProgressSteps currentStep={2} />
          <Card className="p-6 lg:p-12 shadow-2xl bg-white/95 backdrop-blur-lg border border-gray-200/60">
            <div className="text-center mb-8 lg:mb-12">
              <div className="w-20 h-20 lg:w-28 lg:h-28 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center shadow-2xl mb-6 lg:mb-8 ring-4 ring-blue-100">
                <User className="w-10 h-10 lg:w-14 lg:h-14 text-white" />
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-blue-800 mb-4 lg:mb-6 slide-up">
                Patient Information
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 leading-relaxed font-medium slide-up delay-150">
                Please provide your basic information to help us serve you
                better
              </p>
            </div>

            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={patientInfo.name}
                      onChange={(e) => {
                        setPatientInfo((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }));
                        if (errors.name) {
                          setErrors((prev) => ({ ...prev, name: "" }));
                        }
                      }}
                      className={`w-full p-4 pr-20 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/95 backdrop-blur-sm shadow-lg ${
                        errors.name
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="Enter your full name"
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleVoiceInput("name", (text) =>
                            setPatientInfo((prev) => ({ ...prev, name: text }))
                          )
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
                          speakText("Please enter your full name", "name-label")
                        }
                        className={`p-2 ${
                          isSpeaking && currentSpeakingField === "name-label"
                            ? "text-blue-500"
                            : "text-gray-500 hover:text-blue-500"
                        }`}
                        disabled={isTTSLoading}
                      >
                        {isSpeaking && currentSpeakingField === "name-label" ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Age *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={patientInfo.age}
                      onChange={(e) => {
                        setPatientInfo((prev) => ({
                          ...prev,
                          age: e.target.value,
                        }));
                        if (errors.age) {
                          setErrors((prev) => ({ ...prev, age: "" }));
                        }
                      }}
                      className={`w-full p-4 pr-20 text-lg border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/95 backdrop-blur-sm shadow-lg ${
                        errors.age
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="Age"
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleVoiceInput("age", (text) =>
                            setPatientInfo((prev) => ({ ...prev, age: text }))
                          )
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
                            patientInfo.age
                              ? `Your age is ${patientInfo.age} years old`
                              : "Please enter your age",
                            "age-label"
                          )
                        }
                        className={`p-2 ${
                          isSpeaking && currentSpeakingField === "age-label"
                            ? "text-blue-500"
                            : "text-gray-500 hover:text-blue-500"
                        }`}
                        disabled={isTTSLoading}
                      >
                        {isSpeaking && currentSpeakingField === "age-label" ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {errors.age && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.age}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Gender
                </label>
                <div className="relative">
                  <select
                    value={patientInfo.gender}
                    onChange={(e) =>
                      setPatientInfo((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="w-full p-4 pr-20 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/95 backdrop-blur-sm shadow-lg"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                  <div className="absolute right-2 top-2 flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        speakText(
                          patientInfo.gender
                            ? `Your gender is ${patientInfo.gender}`
                            : "Please select your gender",
                          "gender-label"
                        )
                      }
                      className={`p-2 ${
                        isSpeaking && currentSpeakingField === "gender-label"
                          ? "text-blue-500"
                          : "text-gray-500 hover:text-blue-500"
                      }`}
                      disabled={isTTSLoading}
                    >
                      {isSpeaking && currentSpeakingField === "gender-label" ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Emergency Contact
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={patientInfo.emergencyContact}
                    onChange={(e) =>
                      setPatientInfo((prev) => ({
                        ...prev,
                        emergencyContact: e.target.value,
                      }))
                    }
                    className="w-full p-4 pr-20 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/95 backdrop-blur-sm shadow-lg"
                    placeholder="Emergency contact number"
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleVoiceInput("emergencyContact", (text) =>
                          setPatientInfo((prev) => ({
                            ...prev,
                            emergencyContact: text,
                          }))
                        )
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
                          patientInfo.emergencyContact ||
                            "Please enter emergency contact number",
                          "emergencyContact-label"
                        )
                      }
                      className={`p-2 ${
                        isSpeaking &&
                        currentSpeakingField === "emergencyContact-label"
                          ? "text-blue-500"
                          : "text-gray-500 hover:text-blue-500"
                      }`}
                      disabled={isTTSLoading}
                    >
                      {isSpeaking &&
                      currentSpeakingField === "emergencyContact-label" ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Known Allergies
                </label>
                <div className="relative">
                  <textarea
                    value={patientInfo.allergies}
                    onChange={(e) =>
                      setPatientInfo((prev) => ({
                        ...prev,
                        allergies: e.target.value,
                      }))
                    }
                    className="w-full p-4 pr-20 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/95 backdrop-blur-sm shadow-lg resize-none"
                    rows={3}
                    placeholder="List any known allergies (medications, food, etc.)"
                  />
                  <div className="absolute right-2 top-2 flex flex-col gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleVoiceInput("allergies", (text) =>
                          setPatientInfo((prev) => ({
                            ...prev,
                            allergies: text,
                          }))
                        )
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
                          patientInfo.allergies || "No allergies listed",
                          "allergies-label"
                        )
                      }
                      className={`p-2 ${
                        isSpeaking && currentSpeakingField === "allergies-label"
                          ? "text-blue-500"
                          : "text-gray-500 hover:text-blue-500"
                      }`}
                      disabled={isTTSLoading}
                    >
                      {isSpeaking &&
                      currentSpeakingField === "allergies-label" ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Current Medications
                </label>
                <div className="relative">
                  <textarea
                    value={patientInfo.currentMedications}
                    onChange={(e) =>
                      setPatientInfo((prev) => ({
                        ...prev,
                        currentMedications: e.target.value,
                      }))
                    }
                    className="w-full p-4 pr-20 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-200 bg-white/95 backdrop-blur-sm shadow-lg resize-none"
                    rows={3}
                    placeholder="List current medications and dosages"
                  />
                  <div className="absolute right-2 top-2 flex flex-col gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleVoiceInput("currentMedications", (text) =>
                          setPatientInfo((prev) => ({
                            ...prev,
                            currentMedications: text,
                          }))
                        )
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
                          patientInfo.currentMedications ||
                            "No medications listed",
                          "medications-label"
                        )
                      }
                      className={`p-2 ${
                        isSpeaking &&
                        currentSpeakingField === "medications-label"
                          ? "text-blue-500"
                          : "text-gray-500 hover:text-blue-500"
                      }`}
                      disabled={isTTSLoading}
                    >
                      {isSpeaking &&
                      currentSpeakingField === "medications-label" ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.submit}
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <Button
                  onClick={() => setCurrentScreen("language")}
                  variant="outline"
                  className="flex-1 py-4 text-lg rounded-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  onClick={handlePatientInfoSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-4 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Symptoms Screen
  if (currentScreen === "symptoms") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 lg:p-8 overflow-y-auto scrollbar-custom">
        <div className="max-w-6xl mx-auto">
          <ProgressSteps currentStep={3} />
          <Card className="p-6 lg:p-12 shadow-2xl bg-white/95 backdrop-blur-lg border border-gray-200/60">
            <div className="text-center mb-8 lg:mb-12">
              <div className="w-20 h-20 lg:w-28 lg:h-28 mx-auto rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center shadow-2xl mb-6 lg:mb-8 ring-4 ring-red-100">
                <Activity className="w-10 h-10 lg:w-14 lg:h-14 text-white" />
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-red-800 mb-4 lg:mb-6 slide-up">
                Symptom Assessment
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 leading-relaxed font-medium slide-up delay-150">
                Tell us about your symptoms to help the doctor prepare for your
                consultation
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Symptom Form */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                  <Thermometer className="w-6 h-6 mr-2 text-red-500" />
                  Add Current Symptom
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Symptom Name *
                  </label>
                  <input
                    type="text"
                    value={currentSymptom.name || ""}
                    onChange={(e) =>
                      setCurrentSymptom((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-200/50 transition-all duration-200 bg-white/95 backdrop-blur-sm shadow-lg"
                    placeholder="e.g., Headache, Fever, Cough"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Severity *
                  </label>
                  <select
                    value={currentSymptom.severity || ""}
                    onChange={(e) =>
                      setCurrentSymptom((prev) => ({
                        ...prev,
                        severity: e.target.value as
                          | "mild"
                          | "moderate"
                          | "severe",
                      }))
                    }
                    className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-200/50 transition-all duration-200 bg-white/95 backdrop-blur-sm shadow-lg"
                  >
                    <option value="">Select severity</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Duration *
                  </label>
                  <select
                    value={currentSymptom.duration || ""}
                    onChange={(e) =>
                      setCurrentSymptom((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-200/50 transition-all duration-200 bg-white/95 backdrop-blur-sm shadow-lg"
                  >
                    <option value="">Select duration</option>
                    <option value="Less than 1 hour">Less than 1 hour</option>
                    <option value="1-6 hours">1-6 hours</option>
                    <option value="6-24 hours">6-24 hours</option>
                    <option value="1-3 days">1-3 days</option>
                    <option value="3-7 days">3-7 days</option>
                    <option value="More than 1 week">More than 1 week</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Additional Details
                  </label>
                  <textarea
                    value={currentSymptom.description || ""}
                    onChange={(e) =>
                      setCurrentSymptom((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-200/50 transition-all duration-200 bg-white/95 backdrop-blur-sm shadow-lg resize-none"
                    rows={4}
                    placeholder="Describe the symptom in more detail..."
                  />
                </div>

                <Button
                  onClick={handleSymptomSubmit}
                  disabled={
                    !currentSymptom.name ||
                    !currentSymptom.severity ||
                    !currentSymptom.duration
                  }
                  className="w-full py-4 text-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  Add Symptom
                </Button>
              </div>

              {/* Current Symptoms List */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                  <Heart className="w-6 h-6 mr-2 text-red-500" />
                  Current Symptoms ({symptoms.length})
                </h3>

                <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-custom">
                  {symptoms.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>
                        No symptoms added yet. Add your first symptom using the
                        form.
                      </p>
                    </div>
                  ) : (
                    symptoms.map((symptom) => (
                      <Card
                        key={symptom.id}
                        className="p-4 bg-white/95 border border-gray-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-slate-800">
                                {symptom.name}
                              </h4>
                              <Badge
                                className={`${
                                  symptom.severity === "severe"
                                    ? "bg-red-500"
                                    : symptom.severity === "moderate"
                                    ? "bg-orange-500"
                                    : "bg-yellow-500"
                                } text-white`}
                              >
                                {symptom.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-1">
                              <Clock className="w-4 h-4 inline mr-1" />
                              Duration: {symptom.duration}
                            </p>
                            {symptom.description && (
                              <p className="text-sm text-slate-600">
                                {symptom.description}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() =>
                              setSymptoms((prev) =>
                                prev.filter((s) => s.id !== symptom.id)
                              )
                            }
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>

                {isEmergency && (
                  <Card className="p-4 bg-red-50 border-2 border-red-200">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="w-6 h-6" />
                      <div>
                        <h4 className="font-semibold">Potential Emergency</h4>
                        <p className="text-sm">
                          Based on your symptoms, you may need immediate
                          attention. Please inform medical staff.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={() => setCurrentScreen("patient-info")}
                    variant="outline"
                    className="flex-1 py-4 text-lg rounded-xl border-2 border-gray-300 hover:bg-gray-50"
                    disabled={aiAssessing}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => proceedToConsultation()}
                    disabled={aiAssessing}
                    variant="outline"
                    className="flex-1 py-4 text-lg rounded-xl border-2 border-blue-300 hover:bg-blue-50 text-blue-700"
                  >
                    {symptoms.length === 0
                      ? "Skip Symptoms"
                      : "Skip & Continue"}
                  </Button>
                  <Button
                    onClick={proceedToConsultation}
                    disabled={aiAssessing}
                    className="flex-1 py-4 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  >
                    {aiAssessing ? (
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 animate-spin" />
                        AI Assessing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Video className="w-5 h-5" />
                        Start Consultation
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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

  // Welcome Screen
  if (currentScreen === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 flex items-center justify-center p-4 lg:p-8 overflow-hidden">
        <Card className="w-full max-w-5xl p-8 lg:p-16 text-center shadow-2xl bg-white/95 backdrop-blur-lg border border-gray-200/60">
          <div className="space-y-8 lg:space-y-12">
            <div className="space-y-6 lg:space-y-8">
              <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center shadow-2xl ring-4 ring-blue-100 animate-pulse">
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-4xl mx-auto">
                <Button
                  onClick={() => setCurrentScreen("language")}
                  className="text-lg lg:text-2xl px-8 lg:px-12 py-6 lg:py-8 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-bold tracking-wide flex-1 sm:flex-none"
                >
                  <span className="flex items-center justify-center">
                    <Video className="w-6 h-6 lg:w-8 lg:h-8 mr-3" />
                    Start Consultation
                  </span>
                </Button>
                <Button
                  onClick={() => (window.location.href = "/book-appointment")}
                  variant="outline"
                  className="text-lg lg:text-2xl px-8 lg:px-12 py-6 lg:py-8 border-3 border-blue-300 hover:border-blue-500 hover:bg-blue-50 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold tracking-wide text-blue-700 flex-1 sm:flex-none"
                >
                  <span className="flex items-center justify-center">
                    <Calendar className="w-6 h-6 lg:w-8 lg:h-8 mr-3" />
                    Book Appointment
                  </span>
                </Button>
              </div>
            </div>

            <div className="space-y-6 slide-up delay-750">
              <p className="text-lg lg:text-xl text-slate-500 font-medium">
                Start an immediate consultation or book an appointment for later
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
                <span className="flex items-center bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2 shadow-sm"></div>
                  Emergency Support
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
          <ProgressSteps currentStep={1} />
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
