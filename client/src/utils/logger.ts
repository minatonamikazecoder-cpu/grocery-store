import api from './api';

interface LogMeta {
  [key: string]: any;
}

const sendLog = async (level: 'info' | 'warn' | 'error', message: string, meta?: LogMeta) => {
  const timestamp = new Date().toISOString();
  
  // Also log to the console in development
  if (import.meta.env.DEV) {
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[${timestamp}] [${level.toUpperCase()}] ${message}`, meta || '');
  }

  try {
    await api.post('/logs', {
      level,
      message,
      timestamp,
      meta: {
        ...meta,
        userAgent: navigator.userAgent,
        url: window.location.href,
      }
    });
  } catch (err) {
    // Fail silently on logging failure to avoid infinite loops or blocking user flows
    // Do not use console.error here to avoid infinite loops if console.error is intercepted
  }
};

export const logger = {
  info: (message: string, meta?: LogMeta) => sendLog('info', message, meta),
  warn: (message: string, meta?: LogMeta) => sendLog('warn', message, meta),
  error: (message: string, meta?: LogMeta) => sendLog('error', message, meta),
};

// Intercept console.error to send to backend
const originalConsoleError = console.error;
console.error = (...args) => {
  originalConsoleError.apply(console, args);
  const message = args.map(arg => 
    typeof arg === 'object' ? (arg instanceof Error ? arg.stack || arg.message : JSON.stringify(arg)) : String(arg)
  ).join(' ');
  logger.error(message);
};
