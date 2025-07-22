import { motion } from 'framer-motion';
import { SignUpButton, useUser } from '@clerk/clerk-react';

import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import rules from '@/data/rules';

export const RulesSection = () => {
    const { isSignedIn } = useUser();

    return (
        <section className="py-24 px-6 md:h-[110vh] bg-lavenda relative border-t-4 border-foreground">
            {/* Background image*/}
            <div className="absolute pt-12 top-1/2 right-1/4 transform -translate-y-1/2 w-full h-full pointer-events-none">
                <img 
                    src="/assets/layout/sparkles.svg" 
                    alt="" 
                    className="w-full h-[90%] object-contain object-right opacity-40"
                    style={{ zIndex: -1 }}
                />
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative" style={{ zIndex: 1 }}>
                {/* left section with note */}
                <div className="w-full md:w-1/2 mt-8 space-y-6">
                    <motion.h1
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="font-heading font-bold text-4xl md:text-5xl text-midBlack text-center md:text-left mb-12 tracking-wide"
                    >
                        The rules are simple
                    </motion.h1>

                    <motion.h2
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="font-heading font-bold text-xl text-midBlack text-center md:text-left mb-12 tracking-wide"
                    >
                        Every great open-source project has a README. It sets the project's standards and ensures everyone is aligned. Here are the core principles for collaborating on runeGard.
                    </motion.h2>

                    <div className={`w-full md:w-[80%] bg-rumba mt-6 border-2 border-midBlack p-6 rounded-lg`}>
                            <p className={`font-body text-lg leading-relaxed text-midBlack`}>
                                Note: Think of these rules as our linter for community conduct. Following them helps us all build better projects and stronger teams. Let's keep the codebase clean.
                            </p>
                    </div>
                </div>

                {/* right section with rules */}
                <div className="w-full md:w-1/2 space-y-6 md:mt-12 relative">
                
                    {rules.map((rule, index) => (
                        <motion.div
                            key={index}
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Card className={`w-full bg-${rule.bg}`}>
                                <CardContent>
                                    <p className={`font-body ${rule.text} text-lg leading-relaxed`}>
                                        <span className="font-semibold">{index + 1}.</span> {rule.content}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            <motion.div 
                className="text-center mt-4 md:mt-20 relative" 
                style={{ zIndex: 1 }}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                viewport={{ once: true }}
            >
                {/* Button Container - Fixed height to prevent layout shift */}
                <div className="h-11 flex justify-center items-center">
                    {!isSignedIn ? (
                        <SignUpButton mode="modal">
                            <Button variant="default" size="lg" className="font-body font-medium text-midBlack">
                                Join the Community
                            </Button>
                        </SignUpButton>
                    ) : (
                        <Button variant="default" size="lg" className="font-body font-medium text-midBlack bg-mint">
                            Explore Projects
                        </Button>
                    )}
                </div>
            </motion.div>
        </section>
    );
};