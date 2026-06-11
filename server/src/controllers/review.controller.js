const Review = require("../models/Review");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// CREATE a new review
const createReview = asyncHandler(async (req, res) => {
    const newReview = new Review(req.body);
    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
});

// READ all reviews or by filters (optional: productId/userId)
const getReviews = asyncHandler(async (req, res) => {
    const { productId, userId } = req.query;
    const filter = {};
    if (productId) filter.productId = productId;
    if (userId) filter.userId = userId;

    const reviews = await Review.find(filter)
        .populate("productId", "productName productImage")
        .populate("userId", "firstName lastName email profilePicture");

    res.status(200).json(reviews);
});

// READ a single review by ID
const getReviewById = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id)
        .populate("productId", "productName productImage")
        .populate("userId", "firstName lastName email");

    if (!review) throw new ApiError(404, "Review not found");

    res.status(200).json(review);
});

// UPDATE a review (admin can reply or update fields)
const updateReview = asyncHandler(async (req, res) => {
    const updatedReview = await Review.findByIdAndUpdate(
        req.params.id,
        {
            $set: req.body,
            ...(req.body.reply && { replyDate: new Date() })
        },
        { new: true }
    );

    if (!updatedReview) throw new ApiError(404, "Review not found");

    res.status(200).json(updatedReview);
});

// DELETE a review
const deleteReview = asyncHandler(async (req, res) => {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) throw new ApiError(404, "Review not found");

    res.status(200).json({ message: "Review deleted successfully" });
});

// REPLY to a review (Admin only)
const replyToReview = asyncHandler(async (req, res) => {
    const { reply } = req.body;

    if (!reply || reply.trim() === "") {
        throw new ApiError(400, "Reply cannot be empty");
    }

    const updatedReview = await Review.findByIdAndUpdate(
        req.params.id,
        {
            $set: { reply, replyDate: new Date() },
        },
        { new: true }
    );

    if (!updatedReview) {
        throw new ApiError(404, "Review not found");
    }

    res.status(200).json(updatedReview);
});

module.exports = {
    createReview,
    getReviews,
    getReviewById,
    updateReview,
    deleteReview,
    replyToReview
};
