import { useState, useEffect } from 'react';

const AdaptiveLogo = ({ className }: { className?: string }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    // Initial check
    checkTheme();

    // Create observer to watch for class changes on html element
    const observer = new MutationObserver(() => {
      checkTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);


    return (
    <img 
      src={isDark ? "/assets/images/text-logo-white.svg" : "/assets/images/text-logo.svg"} 
      alt="runeGard" 
      className={className}
    />
  );
};

export default AdaptiveLogo;