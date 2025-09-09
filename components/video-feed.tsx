"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Monitor,
  MonitorOff,
  RotateCcw,
  Circle,
  Square,
} from "lucide-react"

interface VideoFeedProps {
  stream: MediaStream | null
  title: string
  isLocal?: boolean
  isVideoEnabled?: boolean
  isAudioEnabled?: boolean
  onToggleVideo?: () => void
  onToggleAudio?: () => void
  className?: string
  volume?: number
  onVolumeChange?: (volume: number) => void
  isRecording?: boolean
  onStartRecording?: () => void
  onStopRecording?: () => void
  isScreenSharing?: boolean
  onStartScreenShare?: () => void
  onStopScreenShare?: () => void
  onSwitchCamera?: () => void
  availableCameras?: number
}

export function VideoFeed({
  stream,
  title,
  isLocal = false,
  isVideoEnabled = true,
  isAudioEnabled = true,
  onToggleVideo,
  onToggleAudio,
  className = "",
  volume = 100,
  onVolumeChange,
  isRecording = false,
  onStartRecording,
  onStopRecording,
  isScreenSharing = false,
  onStartScreenShare,
  onStopScreenShare,
  onSwitchCamera,
  availableCameras = 1,
}: VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showControls, setShowControls] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      if (!isLocal) {
        videoRef.current.volume = volume / 100
      }
    }
  }, [stream, volume, isLocal])

  const handleMuteToggle = () => {
    if (videoRef.current) {
      const newMuted = !isMuted
      videoRef.current.muted = newMuted
      setIsMuted(newMuted)
    }
  }

  return (
    <Card className={`bg-teal-50 border-teal-200 ${className}`}>
      <div className="p-3 border-b bg-teal-100 flex items-center justify-between">
        <h3 className="font-semibold text-teal-900 text-sm">{title}</h3>
        <div className="flex gap-1">
          {isLocal && onToggleVideo && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleVideo}
              className={`p-1 h-auto ${!isVideoEnabled ? "text-red-600" : "text-teal-700"}`}
              title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>
          )}
          {isLocal && onToggleAudio && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleAudio}
              className={`p-1 h-auto ${!isAudioEnabled ? "text-red-600" : "text-teal-700"}`}
              title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
          )}

          {isLocal && onStartScreenShare && onStopScreenShare && (
            <Button
              size="sm"
              variant="ghost"
              onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
              className={`p-1 h-auto ${isScreenSharing ? "text-blue-600" : "text-teal-700"}`}
              title={isScreenSharing ? "Stop screen sharing" : "Start screen sharing"}
            >
              {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            </Button>
          )}

          {isLocal && onSwitchCamera && availableCameras > 1 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onSwitchCamera}
              className="p-1 h-auto text-teal-700"
              title="Switch camera"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}

          {isLocal && onStartRecording && onStopRecording && (
            <Button
              size="sm"
              variant="ghost"
              onClick={isRecording ? onStopRecording : onStartRecording}
              className={`p-1 h-auto ${isRecording ? "text-red-600 animate-pulse" : "text-teal-700"}`}
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            </Button>
          )}

          {!isLocal && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMuteToggle}
              className={`p-1 h-auto ${isMuted ? "text-red-600" : "text-teal-700"}`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowControls(!showControls)}
            className="p-1 h-auto text-teal-700"
            title="Show/hide controls"
          >
            ⚙️
          </Button>
        </div>
      </div>

      <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
        {stream && isVideoEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal || isMuted}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <VideoOff className="w-8 h-8 mb-2" />
            <span className="text-sm">{!stream ? "No video stream" : "Video disabled"}</span>
          </div>
        )}

        {isRecording && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Circle className="w-3 h-3 fill-current animate-pulse" />
            REC
          </div>
        )}

        {isScreenSharing && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Monitor className="w-3 h-3" />
            Screen
          </div>
        )}
      </div>

      {showControls && !isLocal && onVolumeChange && (
        <div className="p-3 border-t bg-teal-50">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-teal-700" />
            <Slider
              value={[volume]}
              onValueChange={(value) => onVolumeChange(value[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-teal-700 w-8">{volume}%</span>
          </div>
        </div>
      )}
    </Card>
  )
}
