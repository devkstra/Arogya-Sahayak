"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export interface WebRTCConnection {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  startCall: () => Promise<void>
  endCall: () => void
  toggleVideo: () => void
  toggleAudio: () => void
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  volume: number
  setVolume: (volume: number) => void
  isRecording: boolean
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null>
  isScreenSharing: boolean
  startScreenShare: () => Promise<void>
  stopScreenShare: () => void
  switchCamera: () => Promise<void>
  availableCameras: MediaDeviceInfo[]
  selectedCameraId: string | null
}

export function useWebRTC(sessionId: string, isDoctor = false): WebRTCConnection {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [volume, setVolumeState] = useState(100)
  const [isRecording, setIsRecording] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)

  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  useEffect(() => {
    const getAvailableCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter((device) => device.kind === "videoinput")
        setAvailableCameras(cameras)
        if (cameras.length > 0 && !selectedCameraId) {
          setSelectedCameraId(cameras[0].deviceId)
        }
      } catch (err) {
        console.error("Failed to get available cameras:", err)
      }
    }
    getAvailableCameras()
  }, [selectedCameraId])

  // Initialize WebRTC connection
  const initializePeerConnection = useCallback(() => {
    const configuration: RTCConfiguration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    }

    peerConnection.current = new RTCPeerConnection(configuration)

    // Handle remote stream
    peerConnection.current.ontrack = (event) => {
      const [remoteStream] = event.streams
      setRemoteStream(remoteStream)
    }

    // Handle connection state changes
    peerConnection.current.onconnectionstatechange = () => {
      const state = peerConnection.current?.connectionState
      setIsConnected(state === "connected")
      setIsConnecting(state === "connecting")

      if (state === "failed" || state === "disconnected") {
        setError("Connection failed or disconnected")
      }
    }

    // Handle ICE candidates (in real implementation, these would be exchanged via signaling server)
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real implementation, send this candidate to the remote peer via signaling server
        console.log("ICE candidate:", event.candidate)
      }
    }

    return peerConnection.current
  }, [])

  // Get user media
  const getUserMedia = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: isVideoEnabled
          ? {
              deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          : false,
        audio: isAudioEnabled
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setLocalStream(stream)
      localStreamRef.current = stream

      if (isAudioEnabled && stream.getAudioTracks().length > 0) {
        audioContextRef.current = new AudioContext()
        const source = audioContextRef.current.createMediaStreamSource(stream)
        gainNodeRef.current = audioContextRef.current.createGain()
        gainNodeRef.current.gain.value = volume / 100
        source.connect(gainNodeRef.current)
      }

      return stream
    } catch (err) {
      setError("Failed to access camera/microphone")
      throw err
    }
  }, [isVideoEnabled, isAudioEnabled, selectedCameraId, volume])

  // Start call
  const startCall = useCallback(async () => {
    try {
      setIsConnecting(true)
      setError(null)

      const stream = await getUserMedia()
      const pc = initializePeerConnection()

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream)
      })

      if (isDoctor) {
        // Doctor creates offer
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        // In real implementation, send offer to patient via signaling server
        console.log("Offer created:", offer)
      }

      // Simulate connection for demo purposes
      setTimeout(() => {
        setIsConnected(true)
        setIsConnecting(false)
      }, 2000)
    } catch (err) {
      setError("Failed to start call")
      setIsConnecting(false)
    }
  }, [getUserMedia, initializePeerConnection, isDoctor])

  // End call
  const endCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (peerConnection.current) {
      peerConnection.current.close()
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }

    setLocalStream(null)
    setRemoteStream(null)
    setIsConnected(false)
    setIsConnecting(false)
    setError(null)
    setIsRecording(false)
    setIsScreenSharing(false)
  }, [isRecording])

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }, [])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }, [])

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume)
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume / 100
    }
  }, [])

  const startRecording = useCallback(async () => {
    if (!localStreamRef.current) return

    try {
      recordedChunksRef.current = []
      mediaRecorderRef.current = new MediaRecorder(localStreamRef.current, {
        mimeType: "video/webm;codecs=vp9",
      })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.start(1000) // Record in 1-second chunks
      setIsRecording(true)
    } catch (err) {
      setError("Failed to start recording")
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve(null)
        return
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" })
        setIsRecording(false)
        resolve(blob)
      }

      mediaRecorderRef.current.stop()
    })
  }, [isRecording])

  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })

      // Replace video track with screen share
      if (peerConnection.current && localStreamRef.current) {
        const videoTrack = screenStream.getVideoTracks()[0]
        const sender = peerConnection.current.getSenders().find((s) => s.track && s.track.kind === "video")

        if (sender) {
          await sender.replaceTrack(videoTrack)
        }

        // Update local stream
        const audioTrack = localStreamRef.current.getAudioTracks()[0]
        const newStream = new MediaStream([videoTrack, audioTrack])
        setLocalStream(newStream)
        localStreamRef.current = newStream
      }

      setIsScreenSharing(true)

      // Handle screen share end
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }
    } catch (err) {
      setError("Failed to start screen sharing")
    }
  }, [])

  const stopScreenShare = useCallback(() => {
    if (isScreenSharing) {
      // Restart camera
      getUserMedia().then((stream) => {
        if (peerConnection.current) {
          const videoTrack = stream.getVideoTracks()[0]
          const sender = peerConnection.current.getSenders().find((s) => s.track && s.track.kind === "video")

          if (sender) {
            sender.replaceTrack(videoTrack)
          }
        }
      })
      setIsScreenSharing(false)
    }
  }, [isScreenSharing, getUserMedia])

  const switchCamera = useCallback(async () => {
    if (availableCameras.length <= 1) return

    const currentIndex = availableCameras.findIndex((cam) => cam.deviceId === selectedCameraId)
    const nextIndex = (currentIndex + 1) % availableCameras.length
    const nextCamera = availableCameras[nextIndex]

    setSelectedCameraId(nextCamera.deviceId)

    // Restart stream with new camera
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      await getUserMedia()
    }
  }, [availableCameras, selectedCameraId, getUserMedia])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall()
    }
  }, [endCall])

  return {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    error,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
    volume,
    setVolume,
    isRecording,
    startRecording,
    stopRecording,
    isScreenSharing,
    startScreenShare,
    stopScreenShare,
    switchCamera,
    availableCameras,
    selectedCameraId,
  }
}
