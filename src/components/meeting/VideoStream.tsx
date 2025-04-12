
import { useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

type VideoStreamProps = {
  stream?: MediaStream | null;
  name: string;
  muted?: boolean;
  audioEnabled: boolean;
  backgroundType?: string;
  backgroundValue?: string | null;
  isScreenShare?: boolean;
};

export function VideoStream({
  stream,
  name,
  muted = false,
  audioEnabled,
  backgroundType = "none",
  backgroundValue = null,
  isScreenShare = false,
}: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    // Apply background effects to video
    if (videoRef.current && stream && backgroundType !== "none") {
      // Additional canvas-based processing could be added here for more advanced background effects
      console.log(`Applying background effect: ${backgroundType}`);
    }
  }, [stream, backgroundType, backgroundValue]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg bg-black">
      {stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={muted}
            className={`w-full h-full object-cover ${
              backgroundType !== "none" ? "bg-black" : ""
            }`}
            style={{
              filter: backgroundType === "blur" ? "blur(8px)" : "none",
              backgroundImage: backgroundType === "image" && backgroundValue 
                ? `url(${backgroundValue})` 
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {isScreenShare && (
            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded-md">
              My personal app
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-accent">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-medium">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
        <div className="bg-black/50 px-3 py-1 rounded-full text-white text-sm flex items-center">
          {name}{" "}
          {!audioEnabled && (
            <MicOff className="h-3 w-3 ml-1 text-red-500" />
          )}
        </div>
      </div>
    </div>
  );
}
