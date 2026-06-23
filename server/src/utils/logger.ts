import winston from "winston";
import path from "path";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logDir = path.join(__dirname, "../../logs");

// 1. Backend Logger Instance
export const backendLogger = winston.createLogger({
  level: "info",
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    winston.format.json()
  ),
  transports: [
    // Write all backend errors to backend-error.log
    new winston.transports.File({
      filename: path.join(logDir, "backend-error.log"),
      level: "error",
    }),
    // Write all backend logs (info, warn, error) to backend-combined.log
    new winston.transports.File({
      filename: path.join(logDir, "backend-combined.log"),
      level: "info",
    }),
    // Output to console in development format
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(
          (info) => `[Backend] [${info.timestamp}] ${info.level}: ${info.message}`
        )
      ),
    }),
  ],
});

// 2. Frontend Logger Instance
export const frontendLogger = winston.createLogger({
  level: "info",
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    winston.format.json()
  ),
  transports: [
    // Write all frontend errors to frontend-error.log
    new winston.transports.File({
      filename: path.join(logDir, "frontend-error.log"),
      level: "error",
    }),
    // Write all frontend logs (info, warn, error) to frontend-combined.log
    new winston.transports.File({
      filename: path.join(logDir, "frontend-combined.log"),
      level: "info",
    }),
    // Output to console in development format
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(
          (info) => `[Frontend] [${info.timestamp}] ${info.level}: ${info.message}`
        )
      ),
    }),
  ],
});

// Default export is backendLogger to keep existing imports intact
export default backendLogger;
