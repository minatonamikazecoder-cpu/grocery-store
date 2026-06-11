const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { verifyJWT, verifyAdmin } = require("../middlewares/auth.middleware");

router.get("/", reviewController.getReviews);
router.get("/:id", reviewController.getReviewById);

router.post("/", verifyJWT, reviewController.createReview);

// Admin routes
router.use(verifyJWT, verifyAdmin);

router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);
router.put("/:id/reply", reviewController.replyToReview);

module.exports = router;
