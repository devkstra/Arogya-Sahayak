"use client"

import { useState, useCallback } from "react"

interface AIMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  mode?: "diagnosis" | "summary" | "response"
}

export function useAIChat() {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentResponse, setCurrentResponse] = useState("")

  const sendMessage = useCallback(
    async (message: string, context?: string, mode: "diagnosis" | "summary" | "response" = "diagnosis") => {
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        content: message,
        role: "user",
        timestamp: new Date(),
        mode,
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)
      setCurrentResponse("")

      try {
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, context, mode }),
        })

        if (!response.ok) {
          throw new Error("Failed to get AI response")
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let fullResponse = ""

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            fullResponse += chunk
            setCurrentResponse(fullResponse)
          }
        }

        const aiMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          content: fullResponse,
          role: "assistant",
          timestamp: new Date(),
          mode,
        }

        setMessages((prev) => [...prev, aiMessage])
        setCurrentResponse("")
      } catch (error) {
        console.error("Error sending message:", error)
        const errorMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          content: "Sorry, I encountered an error. Please try again.",
          role: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const clearChat = useCallback(() => {
    setMessages([])
    setCurrentResponse("")
  }, [])

  return {
    messages,
    isLoading,
    currentResponse,
    sendMessage,
    clearChat,
  }
}
