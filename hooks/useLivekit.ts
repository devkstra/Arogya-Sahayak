"use client";

import { useEffect, useState } from "react";
import { Room, RoomEvent } from "livekit-client";

export function useLivekit(token: string, serverUrl: string, roomName: string) {
  const [room, setRoom] = useState<Room | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newRoom = new Room();

    newRoom.on(RoomEvent.Connected, () => {
      setIsConnected(true);
    });

    newRoom.on(RoomEvent.Disconnected, () => {
      setIsConnected(false);
    });

    const connectToRoom = async () => {
      try {
        await newRoom.connect(serverUrl, token);
        setRoom(newRoom);
      } catch (error) {
        console.error("Failed to connect to LiveKit room", error);
      }
    };

    if (token && serverUrl && roomName) {
      connectToRoom();
    }

    return () => {
      newRoom.disconnect();
    };
  }, [token, serverUrl, roomName]);

  return { room, isConnected };
}