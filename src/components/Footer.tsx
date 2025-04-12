
import { Link } from "react-router-dom";
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink 
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">TalkConnect</h3>
            <p className="text-muted-foreground">
              A video conferencing application with real-time translation and 
              intuitive features for seamless communication.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/meet" className="text-muted-foreground hover:text-primary transition-colors">
                  Start Meeting
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Linkedin size={18} className="text-primary" />
                <a 
                  href="https://www.linkedin.com/in/noel-regis-aa07081b1/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Github size={18} className="text-primary" />
                <a 
                  href="https://github.com/noelregis18" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Twitter size={18} className="text-primary" />
                <a 
                  href="https://x.com/NoelRegis8" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} className="text-primary" />
                <a 
                  href="mailto:noel.regis04@gmail.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  noel.regis04@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} className="text-primary" />
                <a 
                  href="tel:+917319546900" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  +91 7319546900
                </a>
              </li>
              <li className="flex items-center gap-2">
                <ExternalLink size={18} className="text-primary" />
                <a 
                  href="http://topmate.io/noel_regis" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Topmate
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                <a 
                  href="https://www.google.com/maps/place/Asansol,+West+Bengal,+India" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Asansol, West Bengal, India
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TalkConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
