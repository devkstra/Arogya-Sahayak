// app/doctor/page.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  MessageSquare,
  Video,
  Users,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { AIChatPanel } from "@/components/ai-chat-panel";
import { MobileNav } from "@/components/mobile-nav";

export default function DoctorDashboard() {
  const [doctorMessage, setDoctorMessage] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState(
    "arogya-sahayak-room"
  ); // Hardcoded room name
  const [selectedPatientMessage, setSelectedPatientMessage] =
    useState<string>("");
  const [conversationContext, setConversationContext] = useState<string>("");
  const [currentPatientMessage, setCurrentPatientMessage] = useState("");
  const [token, setToken] = useState("");
  const [showAIPanel, setShowAIPanel] = useState(false); // For mobile AI panel toggle

  // Mock data
  const caseDetails = {
    patientId: "P-2024-001",
    patientName: "राज पटेल",
    age: 45,
    language: "Marathi",
    startTime: "10:30 AM",
  };

  const [conversation, setConversation] = useState<
    Array<{ id: number; sender: string; message: string; timestamp: string }>
  >([]);

  const handleSessionStart = async () => {
    const resp = await fetch(
      `/api/livekit?room=${currentSessionId}&username=doctor`
    );
    const data = await resp.json();
    setToken(data.token);
  };

  const handleSessionEnd = () => {
    setCurrentSessionId("arogya-sahayak-room");
    setToken("");
  };

  const handleSendToAI = (message: string) => {
    setSelectedPatientMessage(message);
    const context = conversation
      .slice(-5)
      .map((msg) => `${msg.sender}: ${msg.message}`)
      .join("\n");
    setConversationContext(context);
  };

  const handleSendToUser = (aiResponse: string) => {
    setDoctorMessage(aiResponse);
    console.log("[v0] AI response sent to user input:", aiResponse);
  };

  const handlePatientMessageSelect = (message: string) => {
    setCurrentPatientMessage(message);
    handleSendToAI(message);
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col overflow-hidden">
      {/* Mobile Navigation */}
      <MobileNav
        isConnected={!!token}
        patientName={caseDetails.patientName}
        patientId={caseDetails.patientId}
        language={caseDetails.language}
        age={caseDetails.age}
        startTime={caseDetails.startTime}
        onSessionToggle={token ? handleSessionEnd : handleSessionStart}
        sessionActive={!!token}
      />

      {/* Desktop Header */}
      <header className="hidden md:flex bg-white/95 backdrop-blur-sm text-slate-800 h-14 items-center justify-between border-b border-slate-200/60 select-none shadow-sm">
        <div className="flex items-center h-full">
          <div className="px-6 h-full flex items-center hover:bg-slate-50 cursor-pointer transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-700 to-slate-700 bg-clip-text text-transparent">
                Arogya Sahayak
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-slate-50 rounded-full px-4 py-2 border border-slate-200">
            <span className="text-sm text-slate-600 font-medium">
              Case: {caseDetails.patientName} - {caseDetails.patientId}
            </span>
          </div>
        </div>
        <div className="flex items-center h-full space-x-4 px-6">
          <div className="flex items-center bg-slate-50 rounded-full px-3 py-1.5 border border-slate-200">
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                token ? "bg-green-500 animate-pulse" : "bg-amber-500"
              }`}
            ></div>
            <span className="text-xs text-slate-600 font-medium">
              {token ? "Connected" : "Disconnected"}
            </span>
          </div>
          <Button
            onClick={() => window.open("/patient", "_blank")}
            size="sm"
            variant="outline"
            className="px-4 py-2 font-medium transition-all duration-200 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Patient View
          </Button>
          <Button
            onClick={token ? handleSessionEnd : handleSessionStart}
            size="sm"
            variant={token ? "destructive" : "default"}
            className={`px-6 py-2 font-medium transition-all duration-200 ${
              token
                ? "bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
            }`}
          >
            {token ? "End Session" : "Start Session"}
          </Button>
        </div>
      </header>

      {/* Desktop Status Bar */}
      <div className="hidden md:flex bg-white/80 backdrop-blur-sm text-slate-600 text-sm h-10 items-center px-6 justify-between border-b border-slate-200/60">
        <div className="flex items-center space-x-6">
          <span className="flex items-center text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            {caseDetails.patientName} • {caseDetails.patientId}
          </span>
          <Badge
            variant="outline"
            className="text-xs border-slate-300 text-slate-600"
          >
            {caseDetails.language}
          </Badge>
          <Badge
            variant="outline"
            className="text-xs border-slate-300 text-slate-600"
          >
            Age: {caseDetails.age}
          </Badge>
        </div>
        <div className="flex items-center">
          <span className="text-slate-500 text-xs font-medium">
            {caseDetails.startTime}
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
          {/* Chat and Video Container */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile Session Controls */}
            <div className="md:hidden p-4 bg-white/95 backdrop-blur-sm border-b border-slate-200/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      token ? "bg-green-500 animate-pulse" : "bg-amber-500"
                    }`}
                  ></div>
                  <span className="text-sm font-medium text-slate-700">
                    {token ? "Session Active" : "Session Inactive"}
                  </span>
                </div>
                <Button
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  size="sm"
                  variant="outline"
                  className="xl:hidden border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  AI Assistant
                </Button>
              </div>
            </div>

            <div className="flex-1 flex flex-col xl:flex-row gap-6 p-6 overflow-hidden">
              {/* Conversation Panel */}
              <Card className="flex-1 bg-white/95 backdrop-blur-sm border-slate-200/60 shadow-xl flex flex-col min-h-0 rounded-xl">
                <div className="p-5 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-700 tracking-wide flex items-center">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Users className="w-3 h-3 text-blue-600" />
                      </div>
                      CONVERSATION
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-xs border-green-200 text-green-700 bg-green-50"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
                      Live Chat
                    </Badge>
                  </div>
                </div>
                <div className="flex-1 p-5 overflow-y-auto scrollbar-custom space-y-4 min-h-0 max-h-96">
                  {conversation.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "doctor"
                          ? "justify-end"
                          : "justify-start"
                      } fade-in`}
                    >
                      <div
                        className={`max-w-[75%] xl:max-w-sm p-4 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                          msg.sender === "doctor"
                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md"
                            : "bg-white border border-slate-200 text-slate-800 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed font-medium">
                          {msg.message}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span
                            className={`text-xs ${
                              msg.sender === "doctor"
                                ? "text-blue-100"
                                : "text-slate-500"
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                          {msg.sender === "patient" && (
                            <button
                              onClick={() =>
                                handlePatientMessageSelect(msg.message)
                              }
                              className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-full flex items-center transition-all duration-200 font-medium border border-blue-200 hover:border-blue-300 hover:shadow-sm"
                            >
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

              {/* Video Conference Panel */}
              <div className="flex-1 xl:max-w-lg">
                <Card className="h-full bg-white/95 backdrop-blur-sm border-slate-200/60 shadow-xl flex flex-col rounded-xl">
                  <div className="p-5 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-700 tracking-wide flex items-center">
                        <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                          <Video className="w-3 h-3 text-purple-600" />
                        </div>
                        VIDEO CONFERENCE
                      </h3>
                      <Badge
                        variant={token ? "default" : "secondary"}
                        className={`text-xs ${
                          token
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        <Video className="w-3 h-3 mr-1" />
                        {token ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-1 p-5 min-h-0">
                    {token ? (
                      <div className="h-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 shadow-inner">
                        <LiveKitRoom
                          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                          token={token}
                          connect={true}
                          video={true}
                          audio={true}
                          className="h-full w-full"
                        >
                          <VideoConference />
                        </LiveKitRoom>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border-2 border-dashed border-slate-300">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4">
                            <Video className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-600 text-sm font-medium mb-1">
                            Session not started
                          </p>
                          <p className="text-slate-400 text-xs">
                            Click "Start Session" to begin video call
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop AI Panel */}
        <div className="hidden xl:flex w-96 bg-gradient-to-b from-purple-50 to-purple-100/50 border-l border-purple-200/60 flex-col backdrop-blur-sm">
          <div className="bg-gradient-to-r from-purple-100 to-purple-200/80 p-5 border-b border-purple-300/60 backdrop-blur-sm">
            <h3 className="font-semibold text-purple-900 text-sm flex items-center">
              <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center mr-3">
                <MessageSquare className="w-3 h-3 text-purple-700" />
              </div>
              AI ASSISTANT
            </h3>
          </div>
          <div className="flex-1 overflow-hidden">
            <AIChatPanel
              patientMessage={selectedPatientMessage}
              conversationContext={conversationContext}
              onSendToUser={handleSendToUser}
            />
          </div>
        </div>

        {/* Mobile AI Panel Overlay */}
        {showAIPanel && (
          <div
            className="xl:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAIPanel(false)}
          >
            <div
              className="absolute bottom-0 left-0 right-0 h-4/5 bg-white/95 backdrop-blur-sm rounded-t-3xl shadow-2xl border-t border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-purple-900 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center mr-3">
                      <MessageSquare className="w-3 h-3 text-purple-700" />
                    </div>
                    AI Assistant
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAIPanel(false)}
                    className="p-2 hover:bg-purple-100 rounded-full"
                  >
                    <MoreVertical className="h-4 w-4 text-purple-700" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 h-full overflow-hidden">
                <AIChatPanel
                  patientMessage={selectedPatientMessage}
                  conversationContext={conversationContext}
                  onSendToUser={handleSendToUser}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}