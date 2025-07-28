import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { HeroSection } from '@/components/landing/HeroSection';
import { WhatsInStore } from '@/components/landing/WhatsInStore';
import { RulesSection } from '@/components/landing/RulesSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';
import Loading from '@/components/ui/Loading';
import Star8 from "@/components/ui/Star8"
import Star14 from "@/components/ui/Star14"
import Star40 from "@/components/ui/Star40"
import Star19 from '@/components/ui/Star19'

export const LandingPage = () => {
  const { isLoaded } = useUser();

  // Only block on Clerk loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading message="Loading RuneGard..." />
      </div>
    );
  }

  // Always show landing page, regardless of user state
  // If you want to prompt for missing details, do it in the dashboard/profile page, not here

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden"
    >
      <main className="relative">
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
            <Star8 color="#ACFFAE" size={160} stroke="black" strokeWidth={2} />
          </div>
        </div>
        <div className="relative">
          <FAQSection />
          <div className="absolute bottom-0 left-3/4 transform -translate-x-1/2 translate-y-1/2 z-30">
            <Star19 color="#00ff50" size={160} stroke="black" strokeWidth={2} />
          </div>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default LandingPage;