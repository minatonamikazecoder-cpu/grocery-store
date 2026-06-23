"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.post("/", (req, res) => {
    const { level, message, timestamp, meta } = req.body;
    const logMessage = `${message} ${meta ? JSON.stringify(meta) : ""}`;
    if (level === "error") {
        logger_1.frontendLogger.error(logMessage);
    }
    else if (level === "warn") {
        logger_1.frontendLogger.warn(logMessage);
    }
    else {
        logger_1.frontendLogger.info(logMessage);
    }
    res.status(200).json({ success: true });
});
exports.default = router;
