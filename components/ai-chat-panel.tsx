"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Stethoscope,
  FileText,
  MessageSquare,
  AlertTriangle,
  Heart,
  Brain,
  Activity,
} from "lucide-react";

interface AIChatPanelProps {
  patientMessage?: string;
  conversationContext?: string;
  onSendToUser?: (message: string) => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: string;
  timestamp: Date;
  urgencyLevel?: "low" | "medium" | "high" | "critical";
}

interface MedicalSummary {
  symptoms: string[];
  possibleDiagnosis: string[];
  recommendations: string[];
  followUpActions: string[];
  urgencyLevel: "low" | "medium" | "high" | "critical";
  confidence: number;
}

export function AIChatPanel({
  patientMessage,
  conversationContext,
  onSendToUser,
}: AIChatPanelProps) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<
    "diagnosis" | "summary" | "response" | "education"
  >("diagnosis");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<MedicalSummary | null>(
    null
  );

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case "critical":
        return <AlertTriangle className="w-3 h-3" />;
      case "high":
        return <Heart className="w-3 h-3" />;
      case "medium":
        return <Activity className="w-3 h-3" />;
      default:
        return <Brain className="w-3 h-3" />;
    }
  };

  const sendGeminiRequest = async (action: string, data: any) => {
    try {
      const response = await fetch("/api/gemini-medical", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      return await response.json();
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      mode,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let response;
      const conversationHistory =
        messages
          .slice(-5)
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join("\n") + (conversationContext ? `\n${conversationContext}` : "");

      switch (mode) {
        case "diagnosis":
        case "summary":
          response = await sendGeminiRequest("generateSummary", {
            patientMessage: input.trim(),
            conversationHistory,
            medicalContext: {
              patientLanguage: "English", // Could be dynamic
            },
          });
          setCurrentSummary(response);
          break;

        case "response":
          response = await sendGeminiRequest("generateResponse", {
            patientMessage: input.trim(),
            conversationHistory,
            medicalContext: {
              patientLanguage: "English",
            },
          });
          break;

        case "education":
          response = await sendGeminiRequest("generateEducation", {
            topic: input.trim(),
            language: "English",
          });
          break;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          mode === "summary" || mode === "diagnosis"
            ? formatMedicalSummary(response as MedicalSummary)
            : response.response || response.content || "No response generated",
        mode,
        timestamp: new Date(),
        urgencyLevel: response.urgencyLevel,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, but I'm having trouble processing your request right now. Please try again or consult with a healthcare provider directly.",
        mode,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMedicalSummary = (summary: MedicalSummary): string => {
    return `📋 **Medical Analysis Summary**

🔍 **Identified Symptoms:**
${summary.symptoms.map((s) => `• ${s}`).join("\n")}

🏥 **Possible Diagnoses:**
${summary.possibleDiagnosis.map((d) => `• ${d}`).join("\n")}

💊 **Recommendations:**
${summary.recommendations.map((r) => `• ${r}`).join("\n")}

📅 **Follow-up Actions:**
${summary.followUpActions.map((a) => `• ${a}`).join("\n")}

⚠️ **Urgency Level:** ${summary.urgencyLevel.toUpperCase()}
🎯 **Confidence:** ${(summary.confidence * 100).toFixed(1)}%

*This is an AI-generated analysis and should not replace professional medical consultation.*`;
  };

  const handleSendPatientMessage = async () => {
    if (patientMessage) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: patientMessage,
        mode: "diagnosis",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await sendGeminiRequest("generateSummary", {
          patientMessage,
          conversationHistory: conversationContext || "",
          medicalContext: {
            patientLanguage: "English",
          },
        });

        setCurrentSummary(response);

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: formatMedicalSummary(response),
          mode: "diagnosis",
          timestamp: new Date(),
          urgencyLevel: response.urgencyLevel,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I apologize, but I'm having trouble analyzing this message right now. Please try again.",
          mode: "diagnosis",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendToUser = (content: string) => {
    if (onSendToUser) {
      onSendToUser(content);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentSummary(null);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-white to-slate-50 border-l border-slate-200/60 shadow-lg">
      {/* Header */}
      <div className="p-4 lg:p-5 border-b border-slate-200/60 bg-gradient-to-r from-white to-slate-50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm lg:text-base flex items-center gap-3 text-slate-700">
            <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
              <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <span className="font-semibold">Gemini AI Assistant</span>
          </h3>
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Powered by Google Gemini
          </Badge>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setMode("diagnosis")}
            className={`flex items-center text-xs px-4 py-2 rounded-full border flex-shrink-0 font-medium transition-all duration-200 ${
              mode === "diagnosis"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-transparent shadow-lg"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
            } whitespace-nowrap`}
          >
            <Stethoscope className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
            Diagnosis
          </button>
          <button
            onClick={() => setMode("summary")}
            className={`flex items-center text-xs px-4 py-2 rounded-full border flex-shrink-0 font-medium transition-all duration-200 ${
              mode === "summary"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-transparent shadow-lg"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
            } whitespace-nowrap`}
          >
            <FileText className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
            Summary
          </button>
          <button
            onClick={() => setMode("response")}
            className={`flex items-center text-xs px-4 py-2 rounded-full border flex-shrink-0 font-medium transition-all duration-200 ${
              mode === "response"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-transparent shadow-lg"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
            } whitespace-nowrap`}
          >
            <MessageSquare className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
            Response
          </button>
          <button
            onClick={() => setMode("education")}
            className={`flex items-center text-xs px-4 py-2 rounded-full border flex-shrink-0 font-medium transition-all duration-200 ${
              mode === "education"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-transparent shadow-lg"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
            } whitespace-nowrap`}
          >
            <Brain className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
            Education
          </button>
        </div>

        {/* Current Summary Display */}
        {currentSummary && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-700">
                Latest Analysis
              </span>
              <Badge
                className={`${getUrgencyColor(
                  currentSummary.urgencyLevel
                )} text-xs flex items-center gap-1`}
              >
                {getUrgencyIcon(currentSummary.urgencyLevel)}
                {currentSummary.urgencyLevel.toUpperCase()}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium text-slate-600">Symptoms:</span>
                <span className="text-slate-800 ml-1">
                  {currentSummary.symptoms.length}
                </span>
              </div>
              <div>
                <span className="font-medium text-slate-600">Confidence:</span>
                <span className="text-slate-800 ml-1">
                  {(currentSummary.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Message Quick Action */}
      {patientMessage && (
        <div className="p-4 lg:p-5 border-b border-slate-200/60 bg-gradient-to-r from-blue-50 to-slate-50">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 shadow-sm">
              <User className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium mb-2">
                Patient message:
              </p>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 text-sm shadow-sm">
                {patientMessage}
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleSendPatientMessage}
                  disabled={isLoading}
                  className="flex items-center text-xs px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 mr-2" />
                  Analyze with Gemini AI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4 lg:p-5 space-y-5 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            } fade-in`}
          >
            <div
              className={`max-w-[90%] lg:max-w-[85%] rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                message.role === "user"
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-md"
                  : "bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-tl-md"
              }`}
            >
              <div className="p-4 lg:p-5">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex-shrink-0 w-6 h-6 lg:w-7 lg:h-7 rounded-xl flex items-center justify-center shadow-sm ${
                      message.role === "user"
                        ? "bg-white/20 text-white"
                        : "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                    ) : (
                      <Bot className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {message.mode && (
                        <span
                          className={`inline-block px-3 py-1 text-[10px] font-medium rounded-full ${
                            message.role === "user"
                              ? "bg-white/20 text-white/90"
                              : "bg-blue-50 text-blue-600 border border-blue-100"
                          }`}
                        >
                          {message.mode.toUpperCase()}
                        </span>
                      )}
                      {message.urgencyLevel && message.role === "assistant" && (
                        <Badge
                          className={`${getUrgencyColor(
                            message.urgencyLevel
                          )} text-[10px] px-2 py-0.5 flex items-center gap-1`}
                        >
                          {getUrgencyIcon(message.urgencyLevel)}
                          {message.urgencyLevel.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <p
                      className={`text-sm lg:text-base whitespace-pre-wrap leading-relaxed font-medium ${
                        message.role === "user"
                          ? "text-white"
                          : "text-slate-700"
                      }`}
                    >
                      {message.content}
                    </p>
                    {message.role === "assistant" && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleSendToUser(message.content)}
                          className="text-xs px-4 py-2 rounded-full flex items-center transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg font-medium"
                        >
                          <Send className="w-3 h-3 mr-2" />
                          Send to User
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start slide-up">
            <div className="max-w-[90%] lg:max-w-[85%] bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-2xl rounded-tl-md shadow-sm">
              <div className="p-4 lg:p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0 w-6 h-6 lg:w-7 lg:h-7 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                    <Bot className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-3 py-1 text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100 rounded-full mb-3">
                      GEMINI AI PROCESSING
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-300"></div>
                      <span className="text-xs text-slate-500 ml-2 font-medium">
                        Gemini AI is analyzing...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 lg:p-5 border-t border-slate-200/60 bg-gradient-to-r from-white to-slate-50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask Gemini AI for ${mode} assistance...`}
              className="w-full min-h-[52px] lg:min-h-[60px] max-h-[160px] lg:max-h-[200px] pr-16 lg:pr-18 py-4 lg:py-4 pl-4 lg:pl-5 text-sm lg:text-base border-slate-200/60 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm resize-none transition-all duration-200 bg-white/95 backdrop-blur-sm scrollbar-thin"
              disabled={isLoading}
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(
                  target.scrollHeight,
                  window.innerWidth < 1024 ? 160 : 200
                )}px`;
              }}
            />
            <div className="absolute right-3 bottom-3 flex gap-2">
              <button
                type="button"
                onClick={clearChat}
                disabled={isLoading}
                className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear chat"
              >
                <svg
                  width="16"
                  height="16"
                  className="lg:w-[18px] lg:h-[18px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
                  input.trim() && !isLoading
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg scale-in"
                    : "text-slate-400 cursor-not-allowed bg-slate-100"
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between px-1">
            <p className="text-xs text-slate-500 font-medium">
              {isLoading
                ? "Gemini AI is thinking..."
                : "Press Enter to send, Shift+Enter for new line"}
            </p>
            <Badge
              variant="outline"
              className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
            >
              Powered by Google Gemini
            </Badge>
          </div>
        </form>
      </div>
    </div>
  );
}
