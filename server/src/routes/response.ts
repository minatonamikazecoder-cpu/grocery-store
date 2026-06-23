import express from "express";
import * as responseController from "../controllers/response.controller";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", responseController.createResponse);

// Admin routes
router.use(verifyJWT, verifyAdmin);

router.get("/", responseController.getAllResponses);
router.get("/:id", responseController.getResponseById);
router.put("/:id/reply", responseController.updateReply);
router.delete("/:id", responseController.deleteResponse);

export default router;
