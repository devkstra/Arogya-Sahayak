import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY!);

  const { searchParams } = new URL(request.url);
  const roomName = searchParams.get("room");

  if (!roomName) {
    return NextResponse.json({ error: "Missing room name" }, { status: 400 });
  }
  
  const live = deepgram.listen.live({
    model: "nova-2",
    smart_format: true,
  });

  const stream = new ReadableStream({
    start(controller) {
      live.on(LiveTranscriptionEvents.Open, () => {
        console.log("Deepgram connection opened.");
      });

      live.on(LiveTranscriptionEvents.Transcript, (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        if (transcript) {
          controller.enqueue(`data: ${JSON.stringify({ transcript })}\n\n`);
        }
      });

      live.on(LiveTranscriptionEvents.Close, () => {
        console.log("Deepgram connection closed.");
        controller.close();
      });

      live.on(LiveTranscriptionEvents.Error, (error) => {
        console.error("Deepgram error:", error);
        controller.error(error);
      });
    },
  });

  // This is a workaround to make the stream work with Next.js
  const response = new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });

  return response;
}