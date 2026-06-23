"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyToReview = exports.deleteReview = exports.updateReview = exports.getReviewById = exports.getReviews = exports.createReview = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const data_source_1 = require("../db/data-source");
const Review_1 = require("../models/Review");
// CREATE a new review
exports.createReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const reviewRepository = data_source_1.AppDataSource.getRepository(Review_1.Review);
    const newReview = reviewRepository.create(req.body);
    const savedReview = await reviewRepository.save(newReview);
    res.status(201).json(new ApiResponse_1.ApiResponse(201, savedReview, "Review created successfully").toJSON());
});
// READ all reviews or by filters with pagination
exports.getReviews = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId, userId, page = 1, limit = 10 } = req.query;
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.max(1, parseInt(limit) || 10);
    const skip = (parsedPage - 1) * parsedLimit;
    const where = {};
    if (productId)
        where.productId = productId;
    if (userId)
        where.userId = userId;
    const reviewRepository = data_source_1.AppDataSource.getRepository(Review_1.Review);
    const [results, total] = await reviewRepository.findAndCount({
        where,
        relations: {
            product: true,
            user: true
        },
        select: {
            id: true,
            productId: true,
            userId: true,
            rating: true,
            review: true,
            reviewDate: true,
            reply: true,
            replyDate: true,
            createdAt: true,
            updatedAt: true,
            product: {
                id: true,
                productName: true,
                productImage: true
            },
            user: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePicture: true
            }
        },
        skip,
        take: parsedLimit,
        order: {
            createdAt: "DESC"
        }
    });
    res.status(200).json(new ApiResponse_1.ApiResponse(200, results, "Reviews fetched successfully", {
        total,
        page: parsedPage,
        totalPages: Math.ceil(total / parsedLimit)
    }).toJSON());
});
// READ a single review by ID
exports.getReviewById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const reviewRepository = data_source_1.AppDataSource.getRepository(Review_1.Review);
    const review = await reviewRepository.findOne({
        where: { id: req.params.id },
        relations: {
            product: true,
            user: true
        },
        select: {
            id: true,
            productId: true,
            userId: true,
            rating: true,
            review: true,
            reviewDate: true,
            reply: true,
            replyDate: true,
            createdAt: true,
            updatedAt: true,
            product: {
                id: true,
                productName: true,
                productImage: true
            },
            user: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
            }
        }
    });
    if (!review)
        throw new ApiError_1.ApiError(404, "Review not found");
    res.status(200).json(new ApiResponse_1.ApiResponse(200, review, "Review fetched successfully").toJSON());
});
// UPDATE a review (admin can reply or update fields)
exports.updateReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const reviewRepository = data_source_1.AppDataSource.getRepository(Review_1.Review);
    const review = await reviewRepository.findOneBy({ id: req.params.id });
    if (!review)
        throw new ApiError_1.ApiError(404, "Review not found");
    reviewRepository.merge(review, req.body);
    if (req.body.reply) {
        review.replyDate = new Date();
    }
    const updatedReview = await reviewRepository.save(review);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, updatedReview, "Review updated successfully").toJSON());
});
// DELETE a review
exports.deleteReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const reviewRepository = data_source_1.AppDataSource.getRepository(Review_1.Review);
    const review = await reviewRepository.findOneBy({ id: req.params.id });
    if (!review)
        throw new ApiError_1.ApiError(404, "Review not found");
    await reviewRepository.remove(review);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, null, "Review deleted successfully").toJSON());
});
// REPLY to a review (Admin only)
exports.replyToReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { reply } = req.body;
    if (!reply || reply.trim() === "") {
        throw new ApiError_1.ApiError(400, "Reply cannot be empty");
    }
    const reviewRepository = data_source_1.AppDataSource.getRepository(Review_1.Review);
    const review = await reviewRepository.findOneBy({ id: req.params.id });
    if (!review) {
        throw new ApiError_1.ApiError(404, "Review not found");
    }
    review.reply = reply;
    review.replyDate = new Date();
    const updatedReview = await reviewRepository.save(review);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, updatedReview, "Reply added successfully").toJSON());
});
