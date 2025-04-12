
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Video, VideoOff, X } from "lucide-react";

type Participant = {
  id: string;
  name: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isCurrentUser: boolean;
};

type ParticipantsSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
};

export function ParticipantsSidebar({
  isOpen,
  onClose,
  participants,
}: ParticipantsSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="w-full md:w-80 h-full border-l flex flex-col bg-card animate-fade-in">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium">Participants ({participants.length})</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {participants.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No other participants have joined yet
          </div>
        ) : (
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-medium text-sm">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span>
                    {participant.name}{" "}
                    {participant.isCurrentUser && <span className="text-xs">(You)</span>}
                  </span>
                </div>
                <div className="flex gap-2">
                  {participant.audioEnabled ? (
                    <Mic className="h-4 w-4 text-green-500" />
                  ) : (
                    <MicOff className="h-4 w-4 text-red-500" />
                  )}
                  {participant.videoEnabled ? (
                    <Video className="h-4 w-4 text-green-500" />
                  ) : (
                    <VideoOff className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
