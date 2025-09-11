// app/page.tsx

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Send } from "lucide-react"
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { SessionManager } from "@/components/session-manager"
import { AIChatPanel } from "@/components/ai-chat-panel"
import { TranslationPanel } from "@/components/translation-panel"

export default function DoctorDashboard() {
  const [isDirectTalkActive, setIsDirectTalkActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [doctorMessage, setDoctorMessage] = useState("")
  const [currentSessionId, setCurrentSessionId] = useState("arogya-sahayak-room") // Hardcoded room name
  const [selectedPatientMessage, setSelectedPatientMessage] = useState<string>("")
  const [conversationContext, setConversationContext] = useState<string>("")
  const [currentPatientMessage, setCurrentPatientMessage] = useState("")
  const [translatedPatientMessage, setTranslatedPatientMessage] = useState("")
  const [token, setToken] = useState("");
  const [conversation, setConversation] = useState<
    Array<{ id: number; sender: string; message: string; timestamp: string }>
  >([]);

  // Mock data
  const caseDetails = {
    patientId: "P-2024-001",
    patientName: "राज पटेल",
    age: 45,
    language: "Marathi",
    startTime: "10:30 AM",
  }

  const handleSessionStart = async () => {
    const resp = await fetch(
      `/api/livekit?room=${currentSessionId}&username=doctor`
    );
    const data = await resp.json();
    setToken(data.token);
  }

  const handleSessionEnd = () => {
    setCurrentSessionId("arogya-sahayak-room")
    setToken("")
  }

  const handleSendToAI = (message: string) => {
    setSelectedPatientMessage(message)
    const context = conversation
      .slice(-5)
      .map((msg) => `${msg.sender}: ${msg.message}`)
      .join("\n")
    setConversationContext(context)
  }

  const handleSendToUser = (aiResponse: string) => {
    setDoctorMessage(aiResponse)
    console.log("[v0] AI response sent to user input:", aiResponse)
  }

  const handlePatientMessageSelect = (message: string) => {
    setCurrentPatientMessage(message)
    handleSendToAI(message)
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white text-[#333333] h-8 flex items-center justify-between border-b border-[#e0e0e0] select-none">
        <div className="flex items-center h-full">
          <div className="px-4 h-full flex items-center hover:bg-[#f5f5f5] cursor-pointer">
            <span className="text-sm font-medium">Arogya Sahayak</span>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-sm text-[#333333] font-medium">Case: {caseDetails.patientName} - {caseDetails.patientId}</span>
        </div>
        <div className="flex items-center h-full">
          <div className="flex items-center px-4 h-full">
            <div className={`w-2 h-2 rounded-full mr-2 ${token ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-xs text-[#666666]">
              {token ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>
      {/* Status Bar */}
      <div className="bg-[#f5f5f5] text-[#333333] text-xs h-6 flex items-center px-4 justify-between border-t border-b border-[#e0e0e0]">
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-[#333333]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
            {caseDetails.patientName} • {caseDetails.patientId}
          </span>
          <span className="text-[#666666]">{caseDetails.language}</span>
          <span className="text-[#666666]">Age: {caseDetails.age}</span>
        </div>
        <div className="flex items-center">
          <span className="text-[#666666]">{caseDetails.startTime}</span>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <Button onClick={token ? handleSessionEnd : handleSessionStart}>
            {token ? "End Session" : "Start Session"}
          </Button>

          <div className="flex-1 flex gap-4 p-4 overflow-auto">
            <Card className="flex-1 bg-white border-gray-200">
              <div className="p-3 border-b bg-gray-50">
                <h3 className="font-mono text-xs font-medium text-gray-700 tracking-wider">USER INPUT</h3>
              </div>
              <div className="p-4 h-96 overflow-y-auto space-y-3">
                {conversation.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "doctor" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs p-3 rounded-md ${msg.sender === "doctor" ? "bg-blue-600 text-white" : "bg-gray-50 border border-gray-200"}`}>
                      <p className="text-sm font-mono">{msg.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{msg.timestamp}</span>
                        {msg.sender === "patient" && (
                          <button onClick={() => handlePatientMessageSelect(msg.message)} className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded flex items-center transition-colors font-mono">
                            <Send className="w-3 h-3 mr-1.5" />
                            <span className="text-xs">TO AI</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex-1 space-y-4">
              {token ? (
                <LiveKitRoom serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} token={token} connect={true} video={true} audio={true}>
                  <VideoConference />
                </LiveKitRoom>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                  <p className="text-gray-500">Session not started</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-80 bg-purple-100 border-l border-purple-200 flex flex-col">
          <div className="bg-purple-200 p-2 border-b border-purple-300">
            <h3 className="font-medium text-purple-900 text-sm">AI ASSISTANT</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <AIChatPanel patientMessage={selectedPatientMessage} conversationContext={conversationContext} onSendToUser={handleSendToUser} />
          </div>
        </div>
      </div>
    </div>
  )
}