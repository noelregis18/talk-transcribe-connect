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

// WebRTC configuration
const configuration = { 
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ] 
};

type Participant = {
  id: string;
  name: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isCurrentUser: boolean;
  stream?: MediaStream | null;
};

const MeetingRoom = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const participantName = searchParams.get("name") || "Anonymous";
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const participantId = useRef(uuidv4()).current;
  
  // WebRTC related state
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

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
  
  // Function to create a simple signaling server connection
  // In a production environment, you would use a proper signaling server
  useEffect(() => {
    if (!id) return;
    
    // Create WebSocket connection for signaling
    // Using a mock local WebSocket for demo - in production use a real signaling server
    const wsUrl = `wss://mock-signaling-server.com/meeting/${id}`;
    const mockSocket = {
      onopen: null as any,
      onmessage: null as any,
      onclose: null as any,
      onerror: null as any,
      send: (data: string) => {
        // Mock sending data - simulate broadcast to all participants
        // In a real implementation, this would go to a server
        console.log("Sending signal:", JSON.parse(data));
        
        // Simulate receiving data from other peers with a delay
        setTimeout(() => {
          const parsedData = JSON.parse(data);
          if (parsedData.type === "join" && parsedData.senderId === participantId) {
            simulateNewParticipantJoining();
          }
        }, 2000);
      },
      close: () => console.log("WebSocket closed")
    };
    
    socketRef.current = mockSocket as unknown as WebSocket;
    
    // Send join message to notify others
    if (socketRef.current) {
      socketRef.current.onopen = () => {
        sendSignal({ 
          type: "join", 
          senderId: participantId, 
          senderName: participantName 
        });
      };
      
      // Simulate connection open immediately for mock
      mockSocket.onopen && mockSocket.onopen();
      
      // Handle incoming messages
      socketRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleSignalingData(message);
      };
    }
    
    return () => {
      // Clean up WebSocket connection
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      
      // Clean up peer connections
      Object.values(peerConnections.current).forEach(connection => {
        connection.close();
      });
      peerConnections.current = {};
    };
  }, [id, participantId, participantName]);
  
  // Helper function to send signals via the WebSocket
  const sendSignal = (message: any) => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify(message));
    }
  };
  
  // Handle incoming WebRTC signaling data
  const handleSignalingData = async (message: any) => {
    // Handle different message types (offer, answer, ice candidate)
    if (message.senderId === participantId) return; // Skip messages from self
    
    const { senderId, senderName, type } = message;
    
    // If this is a new user, create a peer connection for them
    if (!peerConnections.current[senderId]) {
      createPeerConnection(senderId, senderName);
    }
    
    switch (type) {
      case "join":
        // New participant joined, send them an offer
        if (localStreamRef.current) {
          const offer = await peerConnections.current[senderId].createOffer();
          await peerConnections.current[senderId].setLocalDescription(offer);
          sendSignal({
            type: "offer",
            senderId: participantId,
            receiverId: senderId,
            sdp: peerConnections.current[senderId].localDescription
          });
        }
        break;
        
      case "offer":
        // Received an offer, create an answer
        if (message.receiverId === participantId) {
          await peerConnections.current[senderId].setRemoteDescription(new RTCSessionDescription(message.sdp));
          const answer = await peerConnections.current[senderId].createAnswer();
          await peerConnections.current[senderId].setLocalDescription(answer);
          sendSignal({
            type: "answer",
            senderId: participantId,
            receiverId: senderId,
            sdp: peerConnections.current[senderId].localDescription
          });
        }
        break;
        
      case "answer":
        // Received an answer to our offer
        if (message.receiverId === participantId) {
          await peerConnections.current[senderId].setRemoteDescription(new RTCSessionDescription(message.sdp));
        }
        break;
        
      case "ice-candidate":
        // Add ICE candidate received from peer
        if (message.receiverId === participantId) {
          await peerConnections.current[senderId].addIceCandidate(
            new RTCIceCandidate(message.candidate)
          );
        }
        break;
        
      case "leave":
        // Participant left, clean up their connection
        if (peerConnections.current[senderId]) {
          peerConnections.current[senderId].close();
          delete peerConnections.current[senderId];
          
          // Remove participant from list
          setParticipants(prev => prev.filter(p => p.id !== senderId));
          
          toast({
            title: "Participant left",
            description: `${senderName} has left the meeting`
          });
        }
        break;
    }
  };
  
  // Create a new WebRTC peer connection
  const createPeerConnection = (peerId: string, peerName: string) => {
    try {
      const peerConnection = new RTCPeerConnection(configuration);
      
      // Add all local tracks to the peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current!);
        });
      }
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal({
            type: "ice-candidate",
            senderId: participantId,
            receiverId: peerId,
            candidate: event.candidate
          });
        }
      };
      
      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        const remoteStream = new MediaStream();
        event.streams[0].getTracks().forEach(track => {
          remoteStream.addTrack(track);
        });
        
        // Add or update participant in the participants list
        setParticipants(prev => {
          const existingParticipant = prev.find(p => p.id === peerId);
          if (existingParticipant) {
            return prev.map(p => p.id === peerId ? {...p, stream: remoteStream} : p);
          } else {
            return [...prev, {
              id: peerId,
              name: peerName,
              audioEnabled: true, // Assume enabled initially
              videoEnabled: true, // Assume enabled initially
              isCurrentUser: false,
              stream: remoteStream
            }];
          }
        });
      };
      
      peerConnections.current[peerId] = peerConnection;
      return peerConnection;
    } catch (err) {
      console.error("Error creating peer connection:", err);
      toast({
        title: "Connection error",
        description: "Could not connect to other participants",
        variant: "destructive"
      });
      return null;
    }
  };

  // Mock function to simulate new participants joining (for demo purposes)
  // In a real app, this would happen through the signaling server
  const simulateNewParticipantJoining = () => {
    // Create a mock participant with a mock stream
    const mockRemoteStream = new MediaStream();
    const mockId = uuidv4();
    const mockName = "Guest User"; 
    
    // Add participant to the list
    setParticipants(prev => [
      ...prev,
      {
        id: mockId,
        name: mockName,
        audioEnabled: true,
        videoEnabled: true,
        isCurrentUser: false,
        stream: mockRemoteStream
      }
    ]);
    
    toast({
      title: "New participant",
      description: `${mockName} joined the meeting`
    });
  };

  // Set up camera when component mounts
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        localStreamRef.current = mediaStream;
        
        // Update current user in participants list
        setParticipants([{
          id: participantId,
          name: participantName,
          audioEnabled,
          videoEnabled,
          isCurrentUser: true,
          stream: mediaStream
        }]);
        
        // Send join signal to notify others
        sendSignal({ 
          type: "join", 
          senderId: participantId, 
          senderName: participantName 
        });
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast({
          title: "Camera access failed",
          description: "Please check your camera and microphone permissions.",
          variant: "destructive",
        });
        
        // Still add the participant, but without a stream
        setParticipants([{
          id: participantId,
          name: participantName,
          audioEnabled: false,
          videoEnabled: false,
          isCurrentUser: true,
          stream: null
        }]);
      }
    };

    setupCamera();

    // Clean up when component unmounts
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (screenShareStream) {
        screenShareStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [participantId, participantName, toast]);

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
      
      // Broadcast audio state change to peers
      sendSignal({
        type: "media-state-change",
        senderId: participantId,
        audioEnabled: !audioEnabled,
        videoEnabled
      });
    }
  };

  const handleToggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
      
      // Broadcast video state change to peers
      sendSignal({
        type: "media-state-change",
        senderId: participantId,
        audioEnabled,
        videoEnabled: !videoEnabled
      });
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
    // Notify other participants that we're leaving
    sendSignal({
      type: "leave",
      senderId: participantId,
      senderName: participantName
    });
    
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
