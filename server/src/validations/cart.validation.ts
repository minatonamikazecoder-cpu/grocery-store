import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    userId:    z.string().uuid("Invalid User ID format"),
    productId: z.string().uuid("Invalid Product ID format"),
    quantity:  z.number().int("Quantity must be an integer").positive("Quantity must be greater than 0").max(100, "Maximum quantity allowed is 100"),
  })
});
