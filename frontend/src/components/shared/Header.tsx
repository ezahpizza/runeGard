import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import { SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import AdaptiveLogo from '../ui/AdaptiveLogo';

export const Header = () => {
  const { isSignedIn } = useUser();
  const { pathname } = useLocation();
  const isLandingPage = pathname === '/';
  
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full px-6 mt-2 py-2 bg-background"
    >
      <div className="max-w-7xl mx-auto flex items-start justify-between">
        
        {!isLandingPage && (
          <div className="flex items-center">
            <AdaptiveLogo className="h-24 w-auto" />
          </div>
        )}
        
        <div className={`flex flex-col items-end gap-3 ${isLandingPage ? 'w-full justify-end' : ''}`}>
          <div className="h-11 flex items-center">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignUpButton mode="modal">
                <Button variant="default" size="lg" className="font-body font-medium text-midBlack">
                  Join
                </Button>
              </SignUpButton>
            )}
          </div>

          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
};