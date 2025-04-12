
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type TranslationOptionsProps = {
  isOpen: boolean;
  onClose: () => void;
  onTranslationChange: (enabled: boolean, language: string) => void;
};

export function TranslationOptions({ isOpen, onClose, onTranslationChange }: TranslationOptionsProps) {
  const [enabled, setEnabled] = useState(false);
  const [language, setLanguage] = useState("en");

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese (Simplified)" },
    { code: "hi", name: "Hindi" },
    { code: "ar", name: "Arabic" },
  ];

  const handleToggle = (newValue: boolean) => {
    setEnabled(newValue);
    onTranslationChange(newValue, language);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    onTranslationChange(enabled, newLanguage);
  };

  if (!isOpen) return null;

  return (
    <div className="w-full md:w-80 h-full border-l flex flex-col bg-card animate-fade-in">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium">Translation Options</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="translation-toggle">Enable Real-time Translation</Label>
            <Switch
              id="translation-toggle"
              checked={enabled}
              onCheckedChange={handleToggle}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language-select">Translate to</Label>
            <Select value={language} onValueChange={handleLanguageChange} disabled={!enabled}>
              <SelectTrigger id="language-select" className="w-full">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Translation will appear as subtitles below the video. The speaker's original audio will still be heard.
            </p>
          </div>

          {enabled && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <div className="p-3 bg-black/80 text-white rounded-lg">
                <p className="text-sm">Hello! How are you today?</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
