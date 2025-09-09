"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Phone, PhoneOff, Loader2 } from "lucide-react"

// Light theme colors matching the UI
const colors = {
  background: '#ffffff',
  border: '#e0e0e0',
  primary: '#0078d4',
  primaryHover: '#106ebe',
  text: '#333333',
  textSecondary: '#666666',
  buttonHover: '#f5f5f5',
  buttonActive: '#ebebeb',
  success: '#107c10',
  warning: '#d83b01',
  error: '#e81123',
  badgeBg: '#f5f5f5',
  badgeText: '#666666',
  inputBorder: '#e0e0e0',
  inputFocus: '#0078d4',
  statusBar: '#f5f5f5',
  statusBarBorder: '#e0e0e0'
}

interface SessionManagerProps {
  isDoctor?: boolean
  onSessionStart?: (sessionId: string) => void
  onSessionEnd?: () => void
  isConnected?: boolean
  isConnecting?: boolean
}

export function SessionManager({
  isDoctor = false,
  onSessionStart,
  onSessionEnd,
  isConnected = false,
  isConnecting = false,
}: SessionManagerProps) {
  const [sessionId, setSessionId] = useState("")
  const [generatedSessionId, setGeneratedSessionId] = useState("")

  const generateSessionId = () => {
    const id = Math.random().toString(36).substring(2, 15)
    setGeneratedSessionId(id)
    return id
  }

  const handleStartSession = () => {
    if (isDoctor) {
      const id = generateSessionId()
      onSessionStart?.(id)
    } else {
      if (sessionId.trim()) {
        onSessionStart?.(sessionId.trim())
      }
    }
  }

  const copySessionId = () => {
    navigator.clipboard.writeText(generatedSessionId)
  }

  if (isConnected) {
    return (
      <div className="flex items-center h-8 px-3 border-b border-[#e0e0e0] bg-white">
        <div className="flex items-center text-[#333333] text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
          <span>SESSION ACTIVE</span>
        </div>
        <div className="h-4 w-px bg-[#e0e0e0] mx-3"></div>
        <button
          onClick={onSessionEnd}
          disabled={isConnecting}
          className="text-xs text-[#666666] hover:text-[#333333] hover:bg-[#f5f5f5] px-2 h-6 rounded flex items-center gap-1 transition-colors"
        >
          <PhoneOff className="w-3.5 h-3.5" />
          End Session
        </button>
      </div>
    )
  }

  if (isConnecting) {
    return (
      <div className="flex items-center h-8 px-3 border-b border-[#e0e0e0] bg-white">
        <div className="flex items-center text-xs text-[#666666]">
          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
          <span>CONNECTING...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-[#e0e0e0] bg-white">
      <div className="flex items-center justify-between px-3 pt-2">
        <div className="text-xs font-medium text-[#333333]">
          {isDoctor ? 'Start New Session' : 'Join Session'}
        </div>
        <div className="text-[10px] font-medium bg-[#f5f5f5] text-[#666666] px-2 py-0.5 rounded-sm">
          {isDoctor ? 'DOCTOR' : 'PATIENT'}
        </div>
      </div>

      {isDoctor ? (
        <div className="p-3 pt-2">
          <button
            onClick={handleStartSession}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-2 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs h-8 px-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#0078d4] disabled:opacity-50 transition-colors"
          >
            {isConnecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Phone className="w-3.5 h-3.5" />
            )}
            <span>Generate Session & Start Call</span>
          </button>
          
          {generatedSessionId && (
            <div className="mt-3 text-xs">
              <div className="text-[#666666] mb-1">Session ID:</div>
              <div className="flex items-center gap-2 bg-[#f5f5f5] p-2 rounded-sm border border-[#e0e0e0]">
                <code className="flex-1 font-mono text-[#0078d4] text-xs">
                  {generatedSessionId}
                </code>
                <button
                  onClick={copySessionId}
                  className="text-[#666666] hover:text-[#0078d4] p-1 rounded hover:bg-[#ebebeb] transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 pt-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Enter Session ID"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="h-8 text-xs px-2 border-[#e0e0e0] hover:border-[#b3b3b3] focus:border-[#0078d4] focus:ring-1 focus:ring-[#0078d4] rounded-sm"
              />
            </div>
            <Button
              onClick={handleStartSession}
              disabled={!sessionId.trim() || isConnecting}
              className="h-8 px-3 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs rounded-sm gap-1 focus:ring-1 focus:ring-[#0078d4] focus:ring-offset-1"
            >
              {isConnecting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Phone className="w-3.5 h-3.5" />
              )}
              <span>Join</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
