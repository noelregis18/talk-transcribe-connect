
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const CreateMeeting = () => {
  const [meetingId, setMeetingId] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateMeeting = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue",
        variant: "destructive"
      });
      return;
    }
    
    // Generate a random meeting ID
    const newMeetingId = Math.random().toString(36).substring(2, 12);
    navigate(`/meet/${newMeetingId}?name=${encodeURIComponent(name)}`);
  };

  const handleJoinMeeting = () => {
    if (!meetingId.trim()) {
      toast({
        title: "Meeting ID required",
        description: "Please enter a meeting ID to join",
        variant: "destructive"
      });
      return;
    }
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue",
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/meet/${meetingId}?name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 py-20 px-6">
        <div className="container mx-auto max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8">
            Start or Join a Meeting
          </h1>
          
          <Tabs defaultValue="join" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="join">Join Meeting</TabsTrigger>
              <TabsTrigger value="create">Create Meeting</TabsTrigger>
            </TabsList>
            
            <TabsContent value="join">
              <Card>
                <CardHeader>
                  <CardTitle>Join an existing meeting</CardTitle>
                  <CardDescription>
                    Enter the meeting ID and your name to join
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="meeting-id" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block text-left">
                      Meeting ID
                    </label>
                    <Input
                      id="meeting-id"
                      placeholder="Enter meeting ID"
                      value={meetingId}
                      onChange={(e) => setMeetingId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block text-left">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleJoinMeeting}>
                    Join Now
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Create a new meeting</CardTitle>
                  <CardDescription>
                    Start a new meeting and invite others
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="your-name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block text-left">
                      Your Name
                    </label>
                    <Input
                      id="your-name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleCreateMeeting}>
                    Create Meeting
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateMeeting;
