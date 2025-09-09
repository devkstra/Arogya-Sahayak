"use client"

import { useState, useCallback, useRef } from "react"

interface TextToSpeechOptions {
  language?: string
  voice?: string
  speed?: number
}

interface UseTextToSpeechReturn {
  speak: (text: string, options?: TextToSpeechOptions) => Promise<void>
  stop: () => void
  isSpeaking: boolean
  isLoading: boolean
  error: string | null
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speak = useCallback(async (text: string, options: TextToSpeechOptions = {}) => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          language: options.language || "en",
          voice: options.voice || "default",
          speed: options.speed || 1.0,
        }),
      })

      if (!response.ok) {
        throw new Error("Text-to-speech failed")
      }

      const result = await response.json()

      // In production, this would play the actual audio from result.audioUrl
      // For now, use browser's built-in speech synthesis as fallback
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = options.language || "en-US"
        utterance.rate = options.speed || 1.0

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => {
          setError("Speech synthesis failed")
          setIsSpeaking(false)
        }

        speechSynthesis.speak(utterance)
      }
    } catch (err) {
      setError("Failed to generate speech")
      console.error("Text-to-speech error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const stop = useCallback(() => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsSpeaking(false)
  }, [])

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    error,
  }
}
