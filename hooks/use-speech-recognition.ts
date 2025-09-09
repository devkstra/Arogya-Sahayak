"use client"

import { useState, useCallback, useRef } from "react"

interface SpeechRecognitionResult {
  transcription: string
  language: string
  confidence: number
  duration: number
}

interface UseSpeechRecognitionReturn {
  startRecording: (language?: string) => Promise<void>
  stopRecording: () => Promise<SpeechRecognitionResult | null>
  isRecording: boolean
  isProcessing: boolean
  error: string | null
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async (language = "en") => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      audioChunksRef.current = []
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.start(1000) // Collect data every second
      setIsRecording(true)
    } catch (err) {
      setError("Failed to start recording")
      console.error("Recording error:", err)
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<SpeechRecognitionResult | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve(null)
        return
      }

      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false)
        setIsProcessing(true)

        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
          const formData = new FormData()
          formData.append("audio", audioBlob)
          formData.append("language", "en") // Default to English

          const response = await fetch("/api/speech-to-text", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Speech recognition failed")
          }

          const result = await response.json()
          resolve(result)
        } catch (err) {
          setError("Failed to process speech")
          console.error("Speech processing error:", err)
          resolve(null)
        } finally {
          setIsProcessing(false)
        }
      }

      mediaRecorderRef.current.stop()

      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      }
    })
  }, [isRecording])

  return {
    startRecording,
    stopRecording,
    isRecording,
    isProcessing,
    error,
  }
}
