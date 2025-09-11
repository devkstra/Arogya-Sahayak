"use client"

import { useState, useCallback, useRef } from "react"

interface SpeechRecognitionResult {
  transcription: string
  language: string
  confidence: number
  duration: number
}

interface UseSpeechRecognitionReturn {
  startRemoteTranscription: (stream: MediaStream) => void
  stopRemoteTranscription: () => void
  remoteTranscription: string
  isProcessing: boolean
  error: string | null
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remoteTranscription, setRemoteTranscription] = useState("")

  const remoteMediaRecorderRef = useRef<MediaRecorder | null>(null)

  const startRemoteTranscription = useCallback((stream: MediaStream) => {
    if (remoteMediaRecorderRef.current || stream.getAudioTracks().length === 0) {
      return // Already transcribing or no audio track
    }
    const mediaRecorder = new MediaRecorder(stream)
    remoteMediaRecorderRef.current = mediaRecorder
    console.log("Starting remote transcription...")

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        setIsProcessing(true)
        setError(null)
        const audioBlob = new Blob([event.data], { type: "audio/webm" })
        const formData = new FormData()
        formData.append("audio", audioBlob)
        formData.append("language", "en") // This would come from props if needed

        try {
          const response = await fetch("/api/speech-to-text", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`Speech recognition failed: ${response.statusText}`)
          }

          const result = await response.json()
          if (result.transcription) {
            setRemoteTranscription(result.transcription)
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Speech processing failed"
          setError(errorMessage)
          console.error("Error with remote transcription:", err)
        } finally {
          setIsProcessing(false)
        }
      }
    }

    // Process audio in 3-second chunks
    mediaRecorder.start(3000)
  }, [])

  const stopRemoteTranscription = useCallback(() => {
    if (remoteMediaRecorderRef.current && remoteMediaRecorderRef.current.state === "recording") {
      remoteMediaRecorderRef.current.stop()
      remoteMediaRecorderRef.current = null
      console.log("Stopped remote transcription.")
    }
  }, [])

  return {
    startRemoteTranscription,
    stopRemoteTranscription,
    remoteTranscription,
    isProcessing,
    error,
  }
}