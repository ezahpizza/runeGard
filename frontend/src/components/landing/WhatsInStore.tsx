import { motion } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import features from '@/data/features';
import bgText from '@/data/bgText';
import { FeatureCard } from '../ui/FeatureCard';


export const WhatsInStore = () => {

  return (
    <section className="py-24 px-6 bg-mint border-t-4 border-foreground relative">
      {/* Background text with low opacity */}
      <div className="absolute inset-0 flex pointer-events-none overflow-hidden">
        <div className="text-md opacity-35 text-midBlack font-heading select-none">
          {bgText} {bgText} {bgText} {bgText}
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.h2
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="font-heading font-bold text-4xl md:text-5xl text-midBlack text-center mb-12 tracking-wide"
        >
          What's in store?
        </motion.h2>

        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="md:hidden w-full flex-col items-center gap-4 flex"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <Carousel className="w-[80%] h-90">
            <CarouselContent className="h-full">
              {features.map((feature, index) => (
                <CarouselItem key={index} className="h-full">
                  <div className="p-[10px] h-full">
                    <FeatureCard
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
};