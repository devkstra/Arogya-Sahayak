import { streamText } from "ai"
import { xai } from "@ai-sdk/xai"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, context, mode } = await request.json()

    if (!message) {
      return new Response("Message is required", { status: 400 })
    }

    // Different system prompts based on mode
    const systemPrompts = {
      diagnosis: `You are an AI medical assistant helping doctors with preliminary diagnosis. 
        Analyze the patient's symptoms and provide:
        1. Possible conditions to consider
        2. Recommended questions to ask
        3. Suggested examinations or tests
        Always emphasize that this is for assistance only and final diagnosis requires doctor's judgment.`,

      summary: `You are an AI assistant that creates concise medical consultation summaries.
        Summarize the key points from the conversation including:
        1. Chief complaint
        2. Key symptoms mentioned
        3. Important patient responses
        4. Any red flags or urgent concerns`,

      response: `You are an AI assistant helping doctors formulate clear, empathetic responses to patients.
        Based on the context, suggest a professional and caring response that:
        1. Addresses the patient's concerns
        2. Provides appropriate medical guidance
        3. Maintains professional boundaries
        4. Shows empathy and understanding`,
    }

    const systemPrompt = systemPrompts[mode as keyof typeof systemPrompts] || systemPrompts.diagnosis

    const result = streamText({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      prompt: `Context: ${context || "No previous context"}\n\nPatient message: ${message}`,
      system: systemPrompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Error generating AI response:", error)
    return new Response("Failed to generate AI response", { status: 500 })
  }
}
