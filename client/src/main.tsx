import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { logger } from "./utils/logger";

// Capture all uncaught runtime javascript exceptions
window.addEventListener("error", (event) => {
  logger.error(event.message, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
  });
});

// Capture all unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  logger.error(`Unhandled Promise Rejection: ${event.reason?.message || event.reason}`, {
    stack: event.reason?.stack,
  });
});

// Fire initial startup log
logger.info("PureBite Frontend Application Initialized");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
