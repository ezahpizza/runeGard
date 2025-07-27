import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import AdaptiveLogo from "@/components/ui/AdaptiveLogo"
import Star8 from "@/components/ui/Star8"

export const HeroSection = () => {
  return (
    <section className="min-h-screen bg-background relative overflow-hidden px-6 pb-24">
      {/* Grid background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left grid */}
        <img 
          src="/assets/layout/grid.svg" 
          alt="" 
          className="absolute top-36 -left-96 w-[65%] h-[70%] opacity-80  transform -rotate-12" 
        />
        {/* Bottom-right grid */}
        <img 
          src="/assets/layout/grid.svg" 
          alt="" 
          className="absolute -bottom-20 -right-56 w-[70%] h-[70%] opacity-80 transform rotate-12" 
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* runeGard logo - Top Left */}
        <motion.div 
          className="flex justify-start"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <AdaptiveLogo className="h-40 md:h-84" />
        </motion.div>

        {/* Hero card - Below logo, sticking to the right */}
        <motion.div 
          className="flex justify-end pb-12 relative pt-10 md:pt-0"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <div className="w-full max-w-2xl relative">
            {/* Star8 decoration - Positioned on top of the card */}
            <div className="absolute -top-16 left-1/5 transform -translate-x-1/2 z-10">
              <Star8 color="#ACFFAE" size={120} stroke="black" strokeWidth={2} />
            </div>
            <Card className="w-full bg-nightBlue relative z-0">
              <CardHeader>
                <CardTitle className='font-heading font-bold text-4xl md:text-6xl text-boneWhite tracking-wide leading-tight'> Don't Be Last Minute</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-body text-secondary-foreground text-lg leading-relaxed">
                  Hackathons, capstones, projects — you don't need to be worrying about the wrong MVPs anymore.
                </p>
                <p className="font-body text-secondary-foreground text-lg leading-relaxed mt-3">
                  Find and explore people you'd like to work with, or projects you think you can contribute to. All in one place.
                </p>
              </CardContent>
              <CardFooter className="flex-col md:flex-row md:justify-end md:gap-2">
                <Button asChild variant="neutral" className="w-[20%] bg-mint text-midBlack">
                  <Link to="/explore">
                    Explore
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </motion.div>

        {/* Audience card - Bottom, centered */}
        <motion.div 
          className="flex justify-center pt-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
        >
          <div className="w-full max-w-3xl">
            <Card className="w-full bg-apricot text-midBlack">
              <CardHeader>
                <CardTitle className='text-center font-heading font-bold text-4xl tracking-wide leading-tight'> Who is this for?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-body text-lg leading-relaxed">
                  Final-year students who want to showcase their amazing projects and connect with like-minded creators.
                </p>
                <p className="font-body text-lg leading-relaxed">
                  Whether you're looking for collaborators for your capstone project, want to join an exciting hackathon team, or simply want to discover what your peers are building — runeGard is your platform.
                </p>
                <p className="font-body text-lg leading-relaxed">
                  Stop scrambling at the last minute. Start building meaningful connections and projects today.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  );
};