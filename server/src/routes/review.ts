import express from "express";
import * as reviewController from "../controllers/review.controller";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import { createReviewSchema } from "../validations/review.validation";

const router = express.Router();

router.get("/", reviewController.getReviews);
router.get("/:id", reviewController.getReviewById);

router.post("/", verifyJWT, validate(createReviewSchema), reviewController.createReview);

// Admin routes
router.use(verifyJWT, verifyAdmin);

router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);
router.put("/:id/reply", reviewController.replyToReview);

export default router;
