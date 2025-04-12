
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Video, Users } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">TalkConnect</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link 
            to="/meet" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Meet
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/meet">
            <Button className="hidden sm:flex">
              <Users className="mr-2 h-4 w-4" />
              Start Meeting
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
