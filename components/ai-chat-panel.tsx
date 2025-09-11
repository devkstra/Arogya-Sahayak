"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAIChat } from "@/hooks/use-ai-chat";
import {
  Send,
  Bot,
  User,
  Stethoscope,
  FileText,
  MessageSquare,
} from "lucide-react";

interface AIChatPanelProps {
  patientMessage?: string;
  conversationContext?: string;
  onSendToUser?: (message: string) => void;
}

export function AIChatPanel({
  patientMessage,
  conversationContext,
  onSendToUser,
}: AIChatPanelProps) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"diagnosis" | "summary" | "response">(
    "diagnosis"
  );
  const { messages, isLoading, currentResponse, sendMessage, clearChat } =
    useAIChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage(input, conversationContext, mode);
    setInput("");
  };

  const handleSendPatientMessage = () => {
    if (patientMessage) {
      sendMessage(patientMessage, conversationContext, "diagnosis");
    }
  };

  const handleSendToUser = (content: string) => {
    if (onSendToUser) {
      onSendToUser(content);
    }
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
            <span className="font-semibold">AI Assistant</span>
          </h3>
          <button className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-all duration-200">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
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
        </div>
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
                  className="flex items-center text-xs px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <Send className="w-3.5 h-3.5 mr-2" />
                  Analyze with AI
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
                    {message.mode && (
                      <span
                        className={`inline-block px-3 py-1 text-[10px] font-medium rounded-full mb-2 ${
                          message.role === "user"
                            ? "bg-white/20 text-white/90"
                            : "bg-blue-50 text-blue-600 border border-blue-100"
                        }`}
                      >
                        {message.mode.toUpperCase()}
                      </span>
                    )}
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

        {/* Current streaming response */}
        {currentResponse && (
          <div className="flex justify-start slide-up">
            <div className="max-w-[90%] lg:max-w-[85%] bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-2xl rounded-tl-md shadow-sm">
              <div className="p-4 lg:p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0 w-6 h-6 lg:w-7 lg:h-7 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                    <Bot className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-3 py-1 text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100 rounded-full mb-2">
                      {mode.toUpperCase()}
                    </span>
                    <p className="text-sm lg:text-base text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                      {currentResponse}
                    </p>
                    <div className="flex items-center gap-1 mt-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-300"></div>
                      <span className="text-xs text-slate-500 ml-2 font-medium">
                        AI is typing...
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
              placeholder={`Ask AI for ${mode} assistance...`}
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
                disabled={isLoading && !input.trim()}
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
                  input.trim()
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
                ? "AI is thinking..."
                : "Press Enter to send, Shift+Enter for new line"}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
