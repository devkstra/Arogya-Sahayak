"use client"

import { useState, useCallback } from "react"

interface TranslationResult {
  originalText: string
  translatedText: string
  fromLanguage: string
  toLanguage: string
  confidence: number
}

interface UseTranslationReturn {
  translate: (text: string, fromLang: string, toLang: string) => Promise<string>
  isTranslating: boolean
  lastTranslation: TranslationResult | null
  error: string | null
}

export function useTranslation(): UseTranslationReturn {
  const [isTranslating, setIsTranslating] = useState(false)
  const [lastTranslation, setLastTranslation] = useState<TranslationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const translate = useCallback(async (text: string, fromLang: string, toLang: string): Promise<string> => {
    if (!text.trim()) return text

    setIsTranslating(true)
    setError(null)

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          fromLang,
          toLang,
        }),
      })

      if (!response.ok) {
        throw new Error("Translation failed")
      }

      const result: TranslationResult = await response.json()
      setLastTranslation(result)
      return result.translatedText
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Translation failed"
      setError(errorMessage)
      console.error("Translation error:", err)
      return text // Return original text on error
    } finally {
      setIsTranslating(false)
    }
  }, [])

  return {
    translate,
    isTranslating,
    lastTranslation,
    error,
  }
}
