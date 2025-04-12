
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Share2,
  Users,
  MonitorUp,
  PhoneOff,
  Image,
  Languages,
  X,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type MeetingControlsProps = {
  audioEnabled: boolean;
  videoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onToggleScreenShare: () => void;
  onToggleBackgroundOptions: () => void;
  onToggleTranslation: () => void;
  onEndCall: () => void;
};

export function MeetingControls({
  audioEnabled,
  videoEnabled,
  onToggleAudio,
  onToggleVideo,
  onToggleChat,
  onToggleParticipants,
  onToggleScreenShare,
  onToggleBackgroundOptions,
  onToggleTranslation,
  onEndCall,
}: MeetingControlsProps) {
  return (
    <div className="py-4 px-4 bg-background border-t flex flex-wrap items-center justify-center gap-2 md:gap-4">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={audioEnabled ? "outline" : "destructive"}
              size="icon"
              onClick={onToggleAudio}
              className="rounded-full h-12 w-12"
            >
              {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{audioEnabled ? "Mute" : "Unmute"} microphone</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={videoEnabled ? "outline" : "destructive"}
              size="icon"
              onClick={onToggleVideo}
              className="rounded-full h-12 w-12"
            >
              {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{videoEnabled ? "Turn off" : "Turn on"} camera</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleScreenShare}
              className="rounded-full h-12 w-12"
            >
              <MonitorUp className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share your screen</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleBackgroundOptions}
              className="rounded-full h-12 w-12"
            >
              <Image className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Change background</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleTranslation}
              className="rounded-full h-12 w-12"
            >
              <Languages className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Translation options</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleParticipants}
              className="rounded-full h-12 w-12"
            >
              <Users className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Show participants</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleChat}
              className="rounded-full h-12 w-12"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Open chat</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={onEndCall}
              className="rounded-full h-12 w-12"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>End call</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
