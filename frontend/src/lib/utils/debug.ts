/**
 * Debug utility for conditional logging based on environment
 * Only logs in development environment when VITE_DEBUG is enabled
 */

const isDevelopment = import.meta.env.MODE === 'development';
const isDebugEnabled = import.meta.env.VITE_DEBUG === 'true' || import.meta.env.VITE_DEBUG === '1';

// Only enable debug logging in development when explicitly enabled
const shouldLog = isDevelopment && isDebugEnabled;

export const debug = {
  log: (...args: unknown[]) => {
    if (shouldLog) {
      console.log(...args);
    }
  },
  
  warn: (...args: unknown[]) => {
    if (shouldLog) {
      console.warn(...args);
    }
  },
  
  error: (...args: unknown[]) => {
    // Always log errors, regardless of environment
    console.error(...args);
  },
  
  info: (...args: unknown[]) => {
    if (shouldLog) {
      console.info(...args);
    }
  },
  
  group: (label?: string) => {
    if (shouldLog) {
      console.group(label);
    }
  },
  
  groupEnd: () => {
    if (shouldLog) {
      console.groupEnd();
    }
  }
};

// Export a simpler interface for common use
export const debugLog = debug.log;
export const debugWarn = debug.warn;
export const debugError = debug.error;
export const debugInfo = debug.info;
