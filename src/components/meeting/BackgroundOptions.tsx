
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

type BackgroundOptionsProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectBackground: (type: string, value: string | null) => void;
};

const BackgroundOptions = ({ isOpen, onClose, onSelectBackground }: BackgroundOptionsProps) => {
  const [selectedOption, setSelectedOption] = useState<string>("none");

  const backgrounds = [
    { id: "none", type: "none", label: "None", value: null },
    { id: "blur", type: "blur", label: "Blur", value: "blur" },
    { id: "office", type: "image", label: "Office", value: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=500" },
    { id: "living-room", type: "image", label: "Living Room", value: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=500" },
    { id: "bookshelf", type: "image", label: "Bookshelf", value: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=500" },
    { id: "beach", type: "image", label: "Beach", value: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500" },
    { id: "mountains", type: "image", label: "Mountains", value: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=500" },
  ];

  const handleSelect = (bg: { id: string; type: string; value: string | null }) => {
    setSelectedOption(bg.id);
    onSelectBackground(bg.type, bg.value);
  };

  if (!isOpen) return null;

  return (
    <div className="w-full md:w-80 h-full border-l flex flex-col bg-card animate-fade-in">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium">Background Options</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-4">
          {backgrounds.map((bg) => (
            <div
              key={bg.id}
              className={`
                cursor-pointer rounded-lg overflow-hidden
                ${selectedOption === bg.id ? "ring-2 ring-primary" : ""}
              `}
              onClick={() => handleSelect(bg)}
            >
              {bg.type === "image" ? (
                <div className="aspect-video relative">
                  <img 
                    src={bg.value as string} 
                    alt={bg.label} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                    <span className="text-white text-xs font-medium">{bg.label}</span>
                  </div>
                </div>
              ) : bg.type === "blur" ? (
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-sm">{bg.label}</span>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-sm">{bg.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default BackgroundOptions;
