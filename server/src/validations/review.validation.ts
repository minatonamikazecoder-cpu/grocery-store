import { z } from 'zod';
import { sanitizeHTML } from '../utils/sanitize';

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().uuid("Invalid Product ID format"),
    userId:    z.string().uuid("Invalid User ID format"),
    rating:    z.number().int("Rating must be an integer").min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    review:    z.string().min(10, "Review must be at least 10 characters").max(1000, "Review must be at most 1000 characters").transform(sanitizeHTML),
  })
});
