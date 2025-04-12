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

// Socket.io server URL (would connect to your real WebRTC signaling server)
const SIGNALING_SERVER_URL = "https://your-signaling-server.com";

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
  
  // Function to initialize WebSocket connection to the signaling server
  useEffect(() => {
    if (!id) return;
    
    // Create WebSocket connection for signaling
    // In a real app, replace with actual WebSocket or Socket.IO connection
    const webSocketUrl = `${SIGNALING_SERVER_URL}/${id}`;
    console.log(`Attempting to connect to signaling server: ${webSocketUrl}`);
    
    try {
      // Create a dummy WebSocket implementation for local development
      // In production, this would be a real WebSocket connection to your signaling server
      const mockSocket = {
        send: (data: string) => {
          console.log("Mock WebSocket - Sending data:", JSON.parse(data));
        },
        close: () => {
          console.log("Mock WebSocket - Connection closed");
        },
        onopen: null as any,
        onmessage: null as any,
        onclose: null as any,
        onerror: null as any
      };

      // In a real implementation, uncomment this:
      // const realSocket = new WebSocket(webSocketUrl);
      // socketRef.current = realSocket;
      
      // For now, use the mock socket
      socketRef.current = mockSocket as unknown as WebSocket;
      
      // Setup event handlers
      if (socketRef.current) {
        // Handle connection open
        socketRef.current.onopen = () => {
          console.log("WebSocket connection established");
          // Announce yourself to the room
          sendSignal({
            type: "join",
            roomId: id,
            senderId: participantId,
            senderName: participantName,
            audioEnabled,
            videoEnabled
          });
        };
        
        // Handle incoming messages
        socketRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            handleSignalingData(message);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };
        
        // Handle connection close
        socketRef.current.onclose = () => {
          console.log("WebSocket connection closed");
          toast({
            title: "Connection lost",
            description: "You've been disconnected from the meeting",
            variant: "destructive"
          });
        };
        
        // Handle connection error
        socketRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          toast({
            title: "Connection error",
            description: "Failed to connect to the meeting",
            variant: "destructive"
          });
        };
      }
      
      // Simulate connection open for development
      if (mockSocket && mockSocket.onopen) {
        setTimeout(() => {
          mockSocket.onopen();
        }, 1000);
      }
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
      toast({
        title: "Connection error",
        description: "Failed to connect to the meeting server",
        variant: "destructive"
      });
    }
    
    return () => {
      // Clean up WebSocket connection
      console.log("Cleaning up WebSocket connection");
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
  }, [id, participantId, participantName, audioEnabled, videoEnabled, toast]);
  
  // Helper function to send signals via the WebSocket
  const sendSignal = (message: any) => {
    if (socketRef.current) {
      try {
        const messageString = JSON.stringify(message);
        socketRef.current.send(messageString);
        console.log("Signal sent:", message);
      } catch (error) {
        console.error("Error sending signal:", error);
      }
    } else {
      console.warn("Cannot send signal: WebSocket not connected");
    }
  };
  
  // Handle incoming WebRTC signaling data
  const handleSignalingData = async (message: any) => {
    console.log("Received signal:", message);
    
    // Skip messages from self
    if (message.senderId === participantId) {
      console.log("Skipping message from self");
      return;
    }
    
    const { senderId, senderName, type } = message;
    
    try {
      switch (type) {
        case "join":
          console.log(`${senderName} has joined the meeting`);
          
          // If new user, create peer connection and send an offer
          if (!peerConnections.current[senderId]) {
            console.log("Creating new peer connection for", senderName);
            const peerConnection = createPeerConnection(senderId, senderName);
            
            if (peerConnection && localStreamRef.current) {
              // Create and send an offer
              const offer = await peerConnection.createOffer();
              await peerConnection.setLocalDescription(offer);
              
              sendSignal({
                type: "offer",
                roomId: id,
                senderId: participantId,
                receiverId: senderId,
                senderName: participantName,
                sdp: peerConnection.localDescription
              });
            }
          }
          
          // Show a toast notification
          toast({
            title: "New participant",
            description: `${senderName} joined the meeting`
          });
          break;
          
        case "offer":
          // Only process if this offer is for us
          if (message.receiverId === participantId) {
            console.log("Received offer from", senderName);
            
            // Create a peer connection if one doesn't exist
            if (!peerConnections.current[senderId]) {
              createPeerConnection(senderId, senderName);
            }
            
            const peerConnection = peerConnections.current[senderId];
            if (peerConnection) {
              // Set the remote description from the offer
              await peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
              
              // Create and send an answer
              const answer = await peerConnection.createAnswer();
              await peerConnection.setLocalDescription(answer);
              
              sendSignal({
                type: "answer",
                roomId: id,
                senderId: participantId,
                receiverId: senderId,
                senderName: participantName,
                sdp: peerConnection.localDescription
              });
            }
          }
          break;
          
        case "answer":
          // Only process if this answer is for us
          if (message.receiverId === participantId) {
            console.log("Received answer from", senderName);
            
            const peerConnection = peerConnections.current[senderId];
            if (peerConnection) {
              // Set the remote description from the answer
              await peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
            }
          }
          break;
          
        case "ice-candidate":
          // Only process if this ICE candidate is for us
          if (message.receiverId === participantId) {
            console.log("Received ICE candidate from", senderName);
            
            const peerConnection = peerConnections.current[senderId];
            if (peerConnection) {
              // Add the ICE candidate
              await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
            }
          }
          break;
          
        case "leave":
          console.log(`${senderName} has left the meeting`);
          
          // Clean up the peer connection
          if (peerConnections.current[senderId]) {
            peerConnections.current[senderId].close();
            delete peerConnections.current[senderId];
            
            // Remove the participant from our list
            setParticipants(prev => prev.filter(p => p.id !== senderId));
            
            // Show a toast notification
            toast({
              title: "Participant left",
              description: `${senderName} has left the meeting`
            });
          }
          break;
          
        case "media-state-change":
          console.log(`${senderName} changed media state:`, message);
          
          // Update the participant's media state in our list
          setParticipants(prev => prev.map(p => {
            if (p.id === senderId) {
              return {
                ...p,
                audioEnabled: message.audioEnabled,
                videoEnabled: message.videoEnabled
              };
            }
            return p;
          }));
          break;
      }
    } catch (error) {
      console.error("Error handling signaling data:", error);
    }
  };
  
  // Create a new WebRTC peer connection
  const createPeerConnection = (peerId: string, peerName: string) => {
    try {
      console.log("Creating new peer connection for", peerName, peerId);
      
      // Create the connection with the ICE servers
      const peerConnection = new RTCPeerConnection(configuration);
      
      // Add all local tracks to the peer connection
      if (localStreamRef.current) {
        console.log("Adding local tracks to peer connection");
        localStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current!);
        });
      } else {
        console.warn("No local stream available to add tracks");
      }
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Generated ICE candidate for", peerName);
          
          // Send the ICE candidate to the peer
          sendSignal({
            type: "ice-candidate",
            roomId: id,
            senderId: participantId,
            receiverId: peerId,
            senderName: participantName,
            candidate: event.candidate
          });
        }
      };
      
      // Log ICE connection state changes
      peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE connection state changed to:", peerConnection.iceConnectionState);
      };
      
      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        console.log("Received remote track from", peerName);
        
        // Create a new MediaStream to add the tracks to
        const remoteStream = new MediaStream();
        
        // Add each track to the stream
        event.streams[0].getTracks().forEach(track => {
          console.log("Adding remote track to stream:", track.kind);
          remoteStream.addTrack(track);
        });
        
        // Add or update the participant in our list
        setParticipants(prev => {
          // Check if we already have this participant
          const existingParticipant = prev.find(p => p.id === peerId);
          
          if (existingParticipant) {
            // Update existing participant
            return prev.map(p => {
              if (p.id === peerId) {
                return { ...p, stream: remoteStream };
              }
              return p;
            });
          } else {
            // Add new participant
            console.log("Adding new participant:", peerName);
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
      
      // Store the connection in our map
      peerConnections.current[peerId] = peerConnection;
      
      return peerConnection;
    } catch (error) {
      console.error("Error creating peer connection:", error);
      toast({
        title: "Connection error",
        description: "Could not connect to other participants",
        variant: "destructive"
      });
      return null;
    }
  };

  // Set up camera when component mounts
  useEffect(() => {
    console.log("Setting up camera");
    
    const setupCamera = async () => {
      try {
        // Request access to media devices
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        console.log("Camera access granted", mediaStream);
        setStream(mediaStream);
        localStreamRef.current = mediaStream;
        
        // Add ourselves to the participants list
        setParticipants([{
          id: participantId,
          name: participantName,
          audioEnabled,
          videoEnabled,
          isCurrentUser: true,
          stream: mediaStream
        }]);
        
        // If WebSocket is already connected, announce join
        // Otherwise the open handler will do it
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          sendSignal({ 
            type: "join", 
            roomId: id,
            senderId: participantId, 
            senderName: participantName,
            audioEnabled,
            videoEnabled
          });
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast({
          title: "Camera access failed",
          description: "Please check your camera and microphone permissions.",
          variant: "destructive",
        });
        
        // Still add ourselves to the participants list, just without a stream
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
      console.log("Cleaning up camera and streams");
      
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
  }, [participantId, participantName, audioEnabled, videoEnabled, id, toast]);

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
        roomId: id,
        senderId: participantId,
        senderName: participantName,
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
        roomId: id,
        senderId: participantId,
        senderName: participantName,
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
      roomId: id,
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

  // Filter out participants who are not current user and have no stream
  const activeParticipants = participants.filter(p => 
    p.isCurrentUser || (p.stream && p.stream.getTracks().length > 0)
  );

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
          {activeParticipants.length} participant{activeParticipants.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className={`grid gap-4 ${activeParticipants.length > 1 ? 'grid-cols-1 md:grid-cols-2' : ''}`}>
            {/* Current user's video (or screen share) */}
            <div className={`${activeParticipants.length > 1 ? 'aspect-video' : 'aspect-video w-full h-full max-h-[500px]'}`}>
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
            {activeParticipants.filter(p => !p.isCurrentUser).map(participant => (
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
            participants={activeParticipants}
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
