import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from './button';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true); // Default to dark mode
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    // Set initial theme
    if (isDark) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsSpinning(true);
    
    // Change theme after half the animation (when icon is rotated 180deg and hidden)
    setTimeout(() => {
      setIsDark(!isDark);
    }, 150); // Half of the 300ms animation
    
    // Reset spinning state after animation completes
    setTimeout(() => {
      setIsSpinning(false);
    }, 300);
  };

  return (
    <Button
      onClick={toggleTheme}
      variant="default"
      size="icon"
      className="p-3 bg-background"
      disabled={isSpinning}
    >
      <div
        className={`transition-transform duration-300 ease-in-out ${
          isSpinning 
            ? isDark 
              ? 'rotate-180' // Clockwise when going from dark to light
              : '-rotate-180' // Counterclockwise when going from light to dark
            : 'rotate-0'
        }`}
      >
        {isDark ? (
          <Sun className="w-6 h-6 text-foreground" />
        ) : (
          <Moon className="w-6 h-6 text-foreground" />
        )}
      </div>
    </Button>
  );
};