"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAIChat } from "@/hooks/use-ai-chat"
import { Send, Bot, User, Stethoscope, FileText, MessageSquare } from "lucide-react"

interface AIChatPanelProps {
  patientMessage?: string
  conversationContext?: string
  onSendToUser?: (message: string) => void
}

export function AIChatPanel({ patientMessage, conversationContext, onSendToUser }: AIChatPanelProps) {
  const [input, setInput] = useState("")
  const [mode, setMode] = useState<"diagnosis" | "summary" | "response">("diagnosis")
  const { messages, isLoading, currentResponse, sendMessage, clearChat } = useAIChat()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    await sendMessage(input, conversationContext, mode)
    setInput("")
  }

  const handleSendPatientMessage = () => {
    if (patientMessage) {
      sendMessage(patientMessage, conversationContext, "diagnosis")
    }
  }

  const handleSendToUser = (content: string) => {
    if (onSendToUser) {
      onSendToUser(content)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-[#e0e0e0] shadow-sm">
      {/* Header */}
      <div className="p-3 border-b border-[#e0e0e0] bg-white">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm flex items-center gap-2 text-[#333333]">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0078d4] to-[#004e8c] flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold">AI Assistant</span>
          </h3>
          <button className="text-[#666666] hover:text-[#333333] hover:bg-[#f5f5f5] p-1 rounded transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-2 mt-3 overflow-x-hidden pb-1">
          <button
            onClick={() => setMode("diagnosis")}
            className={`flex items-center text-xs px-3 py-1.5 rounded-full border ${
              mode === "diagnosis"
                ? 'bg-gradient-to-r from-[#0078d4] to-[#1a9fff] text-white border-transparent shadow-sm'
                : 'bg-white text-[#333333] border-[#e0e0e0] hover:bg-[#f8f9fa] hover:border-[#d0d0d0]'
            } transition-all duration-200 whitespace-nowrap`}
          >
            <Stethoscope className="w-3 h-3 mr-1.5 flex-shrink-0" />
            Diagnosis
          </button>
          <button
            onClick={() => setMode("summary")}
            className={`flex items-center text-xs px-3 py-1.5 rounded-full border ${
              mode === "summary"
                ? 'bg-gradient-to-r from-[#0078d4] to-[#1a9fff] text-white border-transparent shadow-sm'
                : 'bg-white text-[#333333] border-[#e0e0e0] hover:bg-[#f8f9fa] hover:border-[#d0d0d0]'
            } transition-all duration-200 whitespace-nowrap`}
          >
            <FileText className="w-3 h-3 mr-1.5 flex-shrink-0" />
            Summary
          </button>
          <button
            onClick={() => setMode("response")}
            className={`flex items-center text-xs px-3 py-1.5 rounded-full border ${
              mode === "response"
                ? 'bg-gradient-to-r from-[#0078d4] to-[#1a9fff] text-white border-transparent shadow-sm'
                : 'bg-white text-[#333333] border-[#e0e0e0] hover:bg-[#f8f9fa] hover:border-[#d0d0d0]'
            } transition-all duration-200 whitespace-nowrap`}
          >
            <MessageSquare className="w-3 h-3 mr-1.5 flex-shrink-0" />
            Response
          </button>
        </div>
      </div>

      {/* Patient Message Quick Action */}
      {patientMessage && (
        <div className="p-3 border-b border-[#e0e0e0] bg-[#f8f9fa]">
          <div className="flex items-start gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-[#e6f2ff] flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 text-[#0078d4]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#666666] font-medium mb-1">Patient said:</p>
              <div className="bg-white p-3 rounded-lg border border-[#e0e0e0] text-sm shadow-xs">
                {patientMessage}
              </div>
              <div className="mt-2 flex justify-end">
                <button 
                  onClick={handleSendPatientMessage} 
                  className="flex items-center text-xs px-3 py-1.5 bg-gradient-to-r from-[#0078d4] to-[#1a9fff] text-white rounded-full hover:shadow-md transition-all duration-200 text-xs font-medium"
                >
                  <Send className="w-3 h-3 mr-1.5" />
                  Analyze with AI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl ${
              message.role === 'user' 
                ? 'bg-gradient-to-r from-[#0078d4] to-[#1a9fff] text-white rounded-tr-none' 
                : 'bg-white border border-[#e0e0e0] shadow-sm rounded-tl-none'
            }`}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gradient-to-r from-[#f0f7ff] to-[#e0efff] text-[#0078d4]'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-3 h-3" />
                    ) : (
                      <Bot className="w-3 h-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {message.mode && (
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full mb-1.5 ${
                        message.role === 'user'
                          ? 'bg-white/20 text-white/90'
                          : 'bg-[#f0f7ff] text-[#0078d4]'
                      }`}>
                        {message.mode}
                      </span>
                    )}
                    <p className={`text-sm whitespace-pre-wrap ${message.role === 'user' ? 'text-white' : 'text-[#333333]'}`}>
                      {message.content}
                    </p>
                    {message.role === 'assistant' && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => handleSendToUser(message.content)}
                          className={`text-xs px-3 py-1.5 rounded-full flex items-center transition-all ${
                            'bg-white text-[#0078d4] hover:bg-opacity-90 shadow-sm border border-[#e0e0e0] hover:shadow-md'
                          }`}
                        >
                          <Send className="w-3 h-3 mr-1.5" />
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
          <div className="flex justify-start">
            <div className="max-w-[85%] bg-white border border-[#e0e0e0] rounded-2xl rounded-tl-none shadow-sm">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#f0f7ff] to-[#e0efff] text-[#0078d4] flex items-center justify-center">
                    <Bot className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-[#f0f7ff] text-[#0078d4] rounded-full mb-1.5">
                      {mode}
                    </span>
                    <p className="text-sm text-[#333333] whitespace-pre-wrap">{currentResponse}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-[#e0e0e0] bg-white">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask AI for ${mode} assistance...`}
              className="w-full min-h-[56px] max-h-[200px] pr-12 py-3.5 pl-4 text-sm border-[#e0e0e0] hover:border-[#b3b3b3] focus:border-[#0078d4] focus:ring-2 focus:ring-[#0078d4]/20 rounded-xl shadow-sm resize-none transition-all duration-200"
              disabled={isLoading}
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
              }}
            />
            <div className="absolute right-2 bottom-2 flex gap-1.5">
              <button 
                type="button" 
                onClick={clearChat}
                disabled={isLoading && !input.trim()}
                className="w-8 h-8 flex items-center justify-center text-[#666666] hover:text-[#333333] hover:bg-[#f5f5f5] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()} 
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                  input.trim() 
                    ? 'bg-gradient-to-r from-[#0078d4] to-[#1a9fff] text-white hover:shadow-md' 
                    : 'text-[#b3b3b3] cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between px-1">
            <p className="text-xs text-[#999999]">
              {isLoading ? 'AI is thinking...' : 'Press Enter to send, Shift+Enter for new line'}
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
