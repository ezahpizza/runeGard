import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';


export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const links = [
    { name: "About Us", href: "/about" },
    { name: "About the Dev", href: "/developer" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Code of Conduct", href: "/code-of-conduct" }
  ];

  return (
    <footer className="bg-nightBlue px-6 pt-2 md:pt-12 py-28 md:py-0 border-t-4 border-foreground">
      <motion.div 
      initial={{ y: 100, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="max-w-full mx-auto">
        {/* Main Content */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-8">
          {/* Left Side - Logo */}
          <div className="space-y-4 text-center md:text-left">
            <div className="flex justify-center md:justify-start">
              <img 
                src="/assets/images/text-logo-white.svg"
                alt="runeGard" 
                className="h-36"
              />
            </div>
          </div>

          {/* Vertical Separator - Only visible on md+ screens */}
          <div className="hidden md:block w-px h-56 bg-apricot"></div>

          {/* Right Side - Links */}
          <div className="flex flex-col gap-4 items-center md:items-start">
            {links.map((link, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Button
                  asChild
                  variant="neutral"
                  className="text-midBlack bg-apricot border-boneWhite hover:bg-boneWhite hover:text-nightBlue justify-center md:justify-start w-40"
                >
                  <Link to={link.href}>
                    {link.name}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Copyright - Stuck to bottom */}
        <div className="border-t border-apricot pt-6">
          <p className="font-body text-boneWhite opacity-80 text-center md:text-left">
            © {currentYear} runeGard. All rights reserved.
          </p>
        </div>
      </motion.div>
    </footer>
  );
};