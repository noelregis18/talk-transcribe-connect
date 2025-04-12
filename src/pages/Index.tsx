
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Video, MessageSquare, Globe, Monitor, ShieldCheck, Users } from "lucide-react";

const Index = () => {
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
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connect, Collaborate, Communicate
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Video conferencing with real-time translation, chat, and collaborative tools for your meetings, interviews, and gatherings.
            </p>
            
            <div className="max-w-md mx-auto">
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
          </div>
        </section>
        
        {/* Features */}
        <section className="py-16 bg-accent">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose TalkConnect?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Video className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>HD Video & Audio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Crystal clear video and audio quality for professional meetings and personal conversations.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Globe className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Real-time Translation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Break language barriers with real-time subtitle translations like YouTube for global communication.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <MessageSquare className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Integrated Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Share text, links and information with meeting participants without interrupting the flow.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Monitor className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Screen Sharing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Present your ideas, documents and applications with high-quality screen sharing.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <ShieldCheck className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Secure Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Keep your conversations private with our secure meeting technology and custom links.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Participant Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>View and manage participants with ease, monitor who is speaking and control the meeting flow.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to start communicating?</h2>
            <p className="text-xl max-w-2xl mx-auto mb-10">
              Join thousands of teams using TalkConnect for seamless collaboration
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-primary"
              onClick={handleCreateMeeting}
            >
              Start a Meeting Now
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
