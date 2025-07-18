// Utility functions for logging that won't clutter the console in production

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

// Create a logger object that conditionally logs based on environment
export const logger = {
  // Only log in development
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  
  // Warning logs
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  
  // Always log errors, but in production they won't show in the console due to Next.js config
  error: (...args: any[]) => {
    console.error(...args);
  },
  
  // Debug logs for detailed troubleshooting (only in dev)
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },
  
  // Info logs
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  }
};

export default logger; 