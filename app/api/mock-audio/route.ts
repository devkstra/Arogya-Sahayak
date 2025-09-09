import { type NextRequest, NextResponse } from "next/server"

// Mock audio endpoint - returns a simple audio file placeholder
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get("text")
  const lang = searchParams.get("lang")

  // In production, this would return actual generated audio
  // For now, return a placeholder response
  return new NextResponse(
    JSON.stringify({
      message: "Mock audio generated",
      text,
      language: lang,
      note: "In production, this would return actual audio data",
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
}
