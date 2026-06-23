"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.frontendLogger = exports.backendLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const logDir = path_1.default.join(__dirname, "../../logs");
// 1. Backend Logger Instance
exports.backendLogger = winston_1.default.createLogger({
    level: "info",
    levels,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }), winston_1.default.format.json()),
    transports: [
        // Write all backend errors to backend-error.log
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, "backend-error.log"),
            level: "error",
        }),
        // Write all backend logs (info, warn, error) to backend-combined.log
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, "backend-combined.log"),
            level: "info",
        }),
        // Output to console in development format
        new winston_1.default.transports.Console({
            level: "info",
            format: winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `[Backend] [${info.timestamp}] ${info.level}: ${info.message}`)),
        }),
    ],
});
// 2. Frontend Logger Instance
exports.frontendLogger = winston_1.default.createLogger({
    level: "info",
    levels,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }), winston_1.default.format.json()),
    transports: [
        // Write all frontend errors to frontend-error.log
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, "frontend-error.log"),
            level: "error",
        }),
        // Write all frontend logs (info, warn, error) to frontend-combined.log
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, "frontend-combined.log"),
            level: "info",
        }),
        // Output to console in development format
        new winston_1.default.transports.Console({
            level: "info",
            format: winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `[Frontend] [${info.timestamp}] ${info.level}: ${info.message}`)),
        }),
    ],
});
// Default export is backendLogger to keep existing imports intact
exports.default = exports.backendLogger;
