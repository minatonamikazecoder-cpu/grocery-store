import express from "express";
import { frontendLogger } from "../utils/logger";

const router = express.Router();

router.post("/", (req, res) => {
  const { level, message, timestamp, meta } = req.body;
  const logMessage = `${message} ${meta ? JSON.stringify(meta) : ""}`;

  if (level === "error") {
    frontendLogger.error(logMessage);
  } else if (level === "warn") {
    frontendLogger.warn(logMessage);
  } else {
    frontendLogger.info(logMessage);
  }

  res.status(200).json({ success: true });
});

export default router;
