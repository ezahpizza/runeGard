import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { Button } from '@/components/ui/button';
import faqs from '@/data/faqs';
import {FAQBgElements} from '@/components/ui/FAQBgElements';

export const FAQSection = () => {
  return (
    <section className="py-24 px-6 bg-background relative border-t-4 border-foreground overflow-clip">
      {/* background elements */}
      <FAQBgElements />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.h2
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="font-heading font-bold text-4xl md:text-5xl text-foreground text-center mb-12 tracking-wide"
        >
          FAQ
        </motion.h2>

        <div className="space-y-4">
          <Accordion type="multiple" className="w-full space-y-4 ">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-midBlack bg-mint">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="font-body text-muted-foreground text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="font-body text-foreground text-lg mb-6">
            Have more questions? We're here to help!
          </p>
          <Button
            variant="default"
            size="lg"
            className="font-body font-medium text-midBlack bg-rumba"
          >
            Contact Support
          </Button>
        </motion.div>
      </div>
    </section>
  );
};