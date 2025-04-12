
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X } from "lucide-react";

type Message = {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
};

type ChatSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  participantName: string;
};

export function ChatSidebar({ isOpen, onClose, participantName }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "System",
      text: "Welcome to the meeting! You can chat with other participants here.",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const message: Message = {
      id: Date.now().toString(),
      sender: participantName,
      text: newMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="w-full md:w-80 h-full border-l flex flex-col bg-card animate-fade-in">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium">Meeting Chat</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.sender === participantName
                  ? "items-end"
                  : message.sender === "System"
                  ? "items-center text-center"
                  : "items-start"
              }`}
            >
              {message.sender !== "System" && (
                <span className="text-xs text-muted-foreground mb-1">
                  {message.sender === participantName ? "You" : message.sender}
                </span>
              )}
              <div
                className={`rounded-lg px-4 py-2 max-w-[85%] ${
                  message.sender === "System"
                    ? "bg-muted text-muted-foreground text-sm"
                    : message.sender === participantName
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {message.text}
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {formatTime(message.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
