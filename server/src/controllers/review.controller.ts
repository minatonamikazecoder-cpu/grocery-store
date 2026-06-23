import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { AppDataSource } from "../db/data-source";
import { Review } from "../models/Review";

// CREATE a new review
export const createReview = asyncHandler(async (req: Request, res: Response) => {
    const reviewRepository = AppDataSource.getRepository(Review);
    const newReview = reviewRepository.create(req.body);
    const savedReview = await reviewRepository.save(newReview);
    res.status(201).json(new ApiResponse(201, savedReview, "Review created successfully").toJSON());
});

// READ all reviews or by filters with pagination
export const getReviews = asyncHandler(async (req: Request, res: Response) => {
    const { productId, userId, page = 1, limit = 10 } = req.query;
    
    const parsedPage = Math.max(1, parseInt(page as string) || 1);
    const parsedLimit = Math.max(1, parseInt(limit as string) || 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const where: any = {};
    if (productId) where.productId = productId as string;
    if (userId) where.userId = userId as string;

    const reviewRepository = AppDataSource.getRepository(Review);
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

    res.status(200).json(
        new ApiResponse(200, results, "Reviews fetched successfully", {
            total,
            page: parsedPage,
            totalPages: Math.ceil(total / parsedLimit)
        }).toJSON()
    );
});

// READ a single review by ID
export const getReviewById = asyncHandler(async (req: Request, res: Response) => {
    const reviewRepository = AppDataSource.getRepository(Review);
    const review = await reviewRepository.findOne({
        where: { id: req.params.id as string },
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

    if (!review) throw new ApiError(404, "Review not found");

    res.status(200).json(new ApiResponse(200, review, "Review fetched successfully").toJSON());
});

// UPDATE a review (admin can reply or update fields)
export const updateReview = asyncHandler(async (req: Request, res: Response) => {
    const reviewRepository = AppDataSource.getRepository(Review);
    const review = await reviewRepository.findOneBy({ id: req.params.id as string });

    if (!review) throw new ApiError(404, "Review not found");

    reviewRepository.merge(review, req.body);
    if (req.body.reply) {
        review.replyDate = new Date();
    }

    const updatedReview = await reviewRepository.save(review);
    res.status(200).json(new ApiResponse(200, updatedReview, "Review updated successfully").toJSON());
});

// DELETE a review
export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
    const reviewRepository = AppDataSource.getRepository(Review);
    const review = await reviewRepository.findOneBy({ id: req.params.id as string });

    if (!review) throw new ApiError(404, "Review not found");

    await reviewRepository.remove(review);
    res.status(200).json(new ApiResponse(200, null, "Review deleted successfully").toJSON());
});

// REPLY to a review (Admin only)
export const replyToReview = asyncHandler(async (req: Request, res: Response) => {
    const { reply } = req.body;

    if (!reply || reply.trim() === "") {
        throw new ApiError(400, "Reply cannot be empty");
    }

    const reviewRepository = AppDataSource.getRepository(Review);
    const review = await reviewRepository.findOneBy({ id: req.params.id as string });

    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    review.reply = reply;
    review.replyDate = new Date();

    const updatedReview = await reviewRepository.save(review);
    res.status(200).json(new ApiResponse(200, updatedReview, "Reply added successfully").toJSON());
});
