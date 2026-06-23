"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewSchema = void 0;
const zod_1 = require("zod");
const sanitize_1 = require("../utils/sanitize");
exports.createReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        productId: zod_1.z.string().uuid("Invalid Product ID format"),
        userId: zod_1.z.string().uuid("Invalid User ID format"),
        rating: zod_1.z.number().int("Rating must be an integer").min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
        review: zod_1.z.string().min(10, "Review must be at least 10 characters").max(1000, "Review must be at most 1000 characters").transform(sanitize_1.sanitizeHTML),
    })
});
