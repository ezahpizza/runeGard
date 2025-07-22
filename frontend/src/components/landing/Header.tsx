import { motion } from 'framer-motion';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import { SignUpButton, UserButton, useUser } from '@clerk/clerk-react';

export const Header = () => {
  const { isSignedIn } = useUser();
  
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full px-6 mt-2 py-2 bg-background"
    >
      <div className="max-w-7xl mx-auto flex items-start justify-end">
        
        {/* Right side controls - stacked vertically */}
        <div className="flex flex-col items-end gap-3">
          {/* Auth Button Container - Fixed height to prevent layout shift */}
          <div className="h-11 flex items-center">
            {isSignedIn ? (
              // User Button for signed-in users 
              <UserButton />
            ) : (
              // Join Button for non-signed-in users 
              <SignUpButton mode="modal">
                <Button variant="default" size="lg" className="font-body font-medium text-midBlack">
                  Join
                </Button>
              </SignUpButton>
            )}
          </div>

          {/* Theme Toggle below the button */}
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
};