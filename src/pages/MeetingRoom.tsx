import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { MeetingControls } from "@/components/meeting/MeetingControls";
import { ChatSidebar } from "@/components/meeting/ChatSidebar";
import { ParticipantsSidebar } from "@/components/meeting/ParticipantsSidebar";
import { VideoStream } from "@/components/meeting/VideoStream";
import BackgroundOptions from "@/components/meeting/BackgroundOptions";
import { TranslationOptions } from "@/components/meeting/TranslationOptions";
import { Copy, Check } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type Participant = {
  id: string;
  name: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isCurrentUser: boolean;
  stream?: MediaStream | null;
};

const MOCK_PARTICIPANTS: Record<string, string[]> = {};

// Mock participant names for demo purposes
const mockNames = [
  "Alex Johnson", 
  "Jamie Smith", 
  "Taylor Rodriguez", 
  "Casey Williams", 
  "Jordan Brown"
];

const MeetingRoom = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const participantName = searchParams.get("name") || "Anonymous";
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const participantId = useRef(uuidv4()).current;

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isBackgroundOptionsOpen, setIsBackgroundOptionsOpen] = useState(false);
  const [isTranslationOptionsOpen, setIsTranslationOptionsOpen] = useState(false);
  const [backgroundType, setBackgroundType] = useState("none");
  const [backgroundValue, setBackgroundValue] = useState<string | null>(null);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [translationLanguage, setTranslationLanguage] = useState("en");
  const [copied, setCopied] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>([]);

  // Initialize MOCK_PARTICIPANTS for this meeting if it doesn't exist
  useEffect(() => {
    if (!MOCK_PARTICIPANTS[id || ""]) {
      MOCK_PARTICIPANTS[id || ""] = [];
    }
  }, [id]);

  // Register current user in the meeting
  useEffect(() => {
    if (id) {
      // Add participant to meeting if they're not already in
      if (!MOCK_PARTICIPANTS[id].includes(participantId)) {
        MOCK_PARTICIPANTS[id].push(participantId);
        
        // Simulate a join notification
        toast({
          title: "You joined the meeting",
          description: `Welcome to meeting room: ${id}`,
        });
      }

      return () => {
        // Remove participant when they leave
        if (id && MOCK_PARTICIPANTS[id]) {
          const index = MOCK_PARTICIPANTS[id].indexOf(participantId);
          if (index > -1) {
            MOCK_PARTICIPANTS[id].splice(index, 1);
          }
        }
      };
    }
  }, [id, participantId, toast]);

  // Set up camera and update participants list
  useEffect(() => {
    // Set up camera when component mounts
    const setupCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        
        // Update current user in participants list with stream
        updateCurrentUserInParticipants(mediaStream);
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast({
          title: "Camera access failed",
          description: "Please check your camera and microphone permissions.",
          variant: "destructive",
        });
        // Still add the participant, but without a stream
        updateCurrentUserInParticipants(null);
      }
    };

    setupCamera();

    // Simulate other participants joining with a delay
    const simulateOtherParticipants = setTimeout(() => {
      if (id) {
        const totalParticipants = Math.floor(Math.random() * 3) + 1; // 1 to 3 other participants
        const otherParticipants = Array.from({ length: totalParticipants }).map((_, index) => ({
          id: uuidv4(),
          name: mockNames[index % mockNames.length],
          audioEnabled: Math.random() > 0.2, // 80% chance audio is enabled
          videoEnabled: Math.random() > 0.3, // 70% chance video is enabled
          isCurrentUser: false,
          stream: null // In a real app, this would be their actual stream
        }));
        
        setParticipants(current => {
          const currentUser = current.find(p => p.isCurrentUser);
          return currentUser ? [...otherParticipants, currentUser] : [...otherParticipants];
        });
        
        toast({
          title: "New participants joined",
          description: `${totalParticipants} participant${totalParticipants > 1 ? 's' : ''} joined the meeting`,
        });
      }
    }, 3000);

    // Clean up when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (screenShareStream) {
        screenShareStream.getTracks().forEach((track) => track.stop());
      }
      clearTimeout(simulateOtherParticipants);
    };
  }, [id, toast]);

  const updateCurrentUserInParticipants = (userStream: MediaStream | null) => {
    setParticipants(current => {
      // Check if the current user is already in the list
      const currentUserIndex = current.findIndex(p => p.isCurrentUser);
      
      const updatedCurrentUser = {
        id: participantId,
        name: participantName,
        audioEnabled,
        videoEnabled,
        isCurrentUser: true,
        stream: userStream
      };
      
      if (currentUserIndex >= 0) {
        // Update the existing current user
        const updatedParticipants = [...current];
        updatedParticipants[currentUserIndex] = updatedCurrentUser;
        return updatedParticipants;
      } else {
        // Add the current user to the list
        return [...current, updatedCurrentUser];
      }
    });
  };

  // Update the current user's audio/video state in participants list
  useEffect(() => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.isCurrentUser ? { ...p, audioEnabled, videoEnabled } : p
      )
    );
  }, [audioEnabled, videoEnabled]);

  const handleToggleAudio = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const handleToggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenShareStream) {
        screenShareStream.getTracks().forEach((track) => track.stop());
        setScreenShareStream(null);
      }
      setIsScreenSharing(false);
      return;
    }

    try {
      // @ts-ignore - TypeScript doesn't recognize getDisplayMedia
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      setScreenShareStream(displayStream);
      setIsScreenSharing(true);

      // Auto-stop screen sharing when the user ends it via the browser UI
      displayStream.getVideoTracks()[0].onended = () => {
        setScreenShareStream(null);
        setIsScreenSharing(false);
      };
    } catch (error) {
      console.error("Error sharing screen:", error);
      toast({
        title: "Screen sharing failed",
        description: "Unable to share your screen.",
        variant: "destructive",
      });
    }
  };

  const handleBackgroundChange = (type: string, value: string | null) => {
    setBackgroundType(type);
    setBackgroundValue(value);
    
    // Notify the user that the background has changed
    toast({
      title: "Background changed",
      description: type === "none" ? "Background removed" : `Background set to ${type}`,
    });
  };

  const handleTranslationChange = (enabled: boolean, language: string) => {
    setTranslationEnabled(enabled);
    setTranslationLanguage(language);
    
    if (enabled) {
      toast({
        title: "Translation enabled",
        description: `Subtitles will appear in ${getLanguageName(language)}`,
      });
    }
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
      hi: "Hindi",
      ar: "Arabic",
    };
    return languages[code] || code;
  };

  const handleEndCall = () => {
    // Stop all streams and navigate to home
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (screenShareStream) {
      screenShareStream.getTracks().forEach((track) => track.stop());
    }
    navigate("/");
  };

  const copyMeetingLink = () => {
    const meetingLink = `${window.location.origin}/meet/${id}`;
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    toast({
      title: "Meeting link copied",
      description: "Share this link with others to join the meeting",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle sidebar states to ensure only one is open at a time on mobile
  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setIsParticipantsOpen(false);
      setIsBackgroundOptionsOpen(false);
      setIsTranslationOptionsOpen(false);
    }
  };

  const handleToggleParticipants = () => {
    setIsParticipantsOpen(!isParticipantsOpen);
    if (!isParticipantsOpen) {
      setIsChatOpen(false);
      setIsBackgroundOptionsOpen(false);
      setIsTranslationOptionsOpen(false);
    }
  };

  const handleToggleBackgroundOptions = () => {
    setIsBackgroundOptionsOpen(!isBackgroundOptionsOpen);
    if (!isBackgroundOptionsOpen) {
      setIsChatOpen(false);
      setIsParticipantsOpen(false);
      setIsTranslationOptionsOpen(false);
    }
  };

  const handleToggleTranslationOptions = () => {
    setIsTranslationOptionsOpen(!isTranslationOptionsOpen);
    if (!isTranslationOptionsOpen) {
      setIsChatOpen(false);
      setIsParticipantsOpen(false);
      setIsBackgroundOptionsOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Meeting header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold">Meeting: {id}</h1>
          <Button variant="outline" size="sm" onClick={copyMeetingLink} className="flex items-center gap-1">
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy link</span>
              </>
            )}
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {participants.length} participant{participants.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className={`grid gap-4 ${participants.length > 1 ? 'grid-cols-1 md:grid-cols-2' : ''}`}>
            {/* Current user's video (or screen share) */}
            <div className={`${participants.length > 1 ? 'aspect-video' : 'aspect-video w-full h-full max-h-[500px]'}`}>
              {isScreenSharing ? (
                <VideoStream
                  stream={screenShareStream}
                  name={`${participantName}'s screen`}
                  muted={true}
                  audioEnabled={audioEnabled}
                  isScreenShare={true}
                />
              ) : (
                <VideoStream
                  stream={stream}
                  name={participantName}
                  muted={true}
                  audioEnabled={audioEnabled}
                  backgroundType={backgroundType}
                  backgroundValue={backgroundValue}
                />
              )}
            </div>

            {/* Other participants' videos */}
            {participants.filter(p => !p.isCurrentUser).map(participant => (
              <div key={participant.id} className="aspect-video">
                <VideoStream
                  stream={participant.stream}
                  name={participant.name}
                  audioEnabled={participant.audioEnabled}
                  backgroundType="none"
                />
              </div>
            ))}
          </div>
          
          {/* Translation subtitles */}
          {translationEnabled && (
            <div className="mt-4 p-3 bg-black/80 text-white rounded-lg text-center">
              <p className="text-sm">Hello! How are you today?</p>
            </div>
          )}
        </div>

        {/* Sidebars */}
        {isChatOpen && (
          <ChatSidebar
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            participantName={participantName}
          />
        )}
        
        {isParticipantsOpen && (
          <ParticipantsSidebar
            isOpen={isParticipantsOpen}
            onClose={() => setIsParticipantsOpen(false)}
            participants={participants}
          />
        )}
        
        {isBackgroundOptionsOpen && (
          <BackgroundOptions
            isOpen={isBackgroundOptionsOpen}
            onClose={() => setIsBackgroundOptionsOpen(false)}
            onSelectBackground={handleBackgroundChange}
          />
        )}
        
        {isTranslationOptionsOpen && (
          <TranslationOptions
            isOpen={isTranslationOptionsOpen}
            onClose={() => setIsTranslationOptionsOpen(false)}
            onTranslationChange={handleTranslationChange}
          />
        )}
      </div>

      {/* Meeting controls */}
      <MeetingControls
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onToggleChat={handleToggleChat}
        onToggleParticipants={handleToggleParticipants}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleBackgroundOptions={handleToggleBackgroundOptions}
        onToggleTranslation={handleToggleTranslationOptions}
        onEndCall={handleEndCall}
      />
    </div>
  );
};

export default MeetingRoom;
