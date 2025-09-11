"use client";

import { useState, useEffect, useRef } from "react";
import { Room, RemoteParticipant, RemoteTrack, RemoteTrackPublication } from "livekit-client";

export function useDeepgramTranscription(room: Room | undefined) {
    const [transcript, setTranscript] = useState<string>("");
    const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!room) return;

        const handleTrackSubscribed = (
            track: RemoteTrack,
            publication: RemoteTrackPublication,
            participant: RemoteParticipant
        ) => {
            if (track.kind === "audio") {
                const stream = new MediaStream();
                stream.addTrack(track.mediaStreamTrack!);
                
                const deepgramUrl = `wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&channels=1&model=nova-2-general&language=en-US`;
                
                const ws = new WebSocket(deepgramUrl, ["token", process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY!]);
                wsRef.current = ws;

                ws.onopen = () => {
                    console.log("Deepgram WebSocket connected");
                    setIsTranscribing(true);
                    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

                    mediaRecorder.ondataavailable = async (event) => {
                        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
                            ws.send(event.data);
                        }
                    };
                    mediaRecorder.start(250);
                };
                
                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    const newTranscript = data.channel.alternatives[0].transcript;
                    if (newTranscript) {
                        setTranscript((prev) => prev + " " + newTranscript);
                    }
                };

                ws.onclose = () => {
                    console.log("Deepgram WebSocket closed");
                    setIsTranscribing(false);
                };

                ws.onerror = (error) => {
                    console.error("Deepgram WebSocket error:", error);
                    setIsTranscribing(false);
                };
            }
        };

        room.on("trackSubscribed", handleTrackSubscribed);

        return () => {
            room.off("trackSubscribed", handleTrackSubscribed);
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [room]);

    return { transcript, isTranscribing };
}