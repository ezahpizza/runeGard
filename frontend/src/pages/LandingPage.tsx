import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { SignInButton, SignOutButton, useUser } from '@clerk/clerk-react';
import { PacmanLoader } from "react-spinners";

import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { WhatsInStore } from '@/components/landing/WhatsInStore';
import { RulesSection } from '@/components/landing/RulesSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';
import DockNav from '@/components/shared/DockNav';
import Star8 from "@/components/ui/Star8"
import Star14 from "@/components/ui/Star14"
import Star40 from "@/components/ui/Star40"
import Star19 from '@/components/ui/Star19';


export const LandingPage = () => {

  const { pathname } = useLocation();
  const { isSignedIn, isLoaded } = useUser();

  const signInRef = useRef<HTMLButtonElement>(null);
  const signOutRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <PacmanLoader color='#D1D4FD'/>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background font-body overflow-hidden"
    >
      <Header />
      <main className="relative">
        {/* Hidden Clerk buttons */}
        <div style={{ display: 'none' }}>
          <SignInButton mode="modal">
            <button ref={signInRef} />
          </SignInButton>
          <SignOutButton>
            <button ref={signOutRef} />
          </SignOutButton>
        </div>

        {/* Dock Navigation Bar */}
        <DockNav
          isSignedIn={isSignedIn}
          signInRef={signInRef}
          signOutRef={signOutRef}
        />
        
        <div className="relative">
          <HeroSection />
          
          <div className="absolute bottom-0 left-1/5 transform -translate-x-1/2 translate-y-1/2 z-30">
            <Star14 color="#ffeb6c" size={160} stroke="black" strokeWidth={2} />
          </div>
        </div>
        
        <div className="relative">
          <WhatsInStore />
          
          <div className="absolute bottom-0 left-1/3 transform -translate-x-1/2 translate-y-1/2 z-30">
            <Star40 color="#4f46ff" size={160} stroke="black" strokeWidth={2} />
          </div>
        </div>
        
        <div className="relative">
          <RulesSection />
          
          <div className="absolute bottom-0 left-2/3 transform -translate-x-1/2 translate-y-1/2 z-30">
            <Star19 color="#00ff50" size={160} stroke="black" strokeWidth={2} />
          </div>
        </div>
        
        <FAQSection />
      </main>
      <Footer />
    </motion.div>
  );
};

export default LandingPage;
