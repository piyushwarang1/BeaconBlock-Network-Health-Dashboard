import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Github } from 'lucide-react';
import { Button } from '../ui/Button';

export default function Footer() {
  return (
    <footer className="border-t border-border py-4 px-6 bg-card/50">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BeaconBlock Dashboard
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            as="a" 
            href="https://github.com/polkadot-js/api" 
            target="_blank"
            rel="noopener noreferrer"
            variant="link"
            className="text-sm"
            leftIcon={<Github className="h-4 w-4" />}
          >
            Polkadot-JS API
          </Button>
          
          <Button 
            as={Link} 
            to="/settings" 
            variant="link"
            className="text-sm"
          >
            Settings
          </Button>
          
          <Button 
            as="a" 
            href="https://polkadot.network/" 
            target="_blank"
            rel="noopener noreferrer"
            variant="link"
            className="text-sm"
            rightIcon={<ExternalLink className="h-3 w-3" />}
          >
            Polkadot Network
          </Button>
        </div>
      </div>
    </footer>
  );
}