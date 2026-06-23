import { z } from 'zod';

export const checkoutSchema = z.object({
  body: z.object({
    userId:            z.string().uuid("Invalid User ID format"),
    addressId:         z.string().uuid("Invalid Address ID format"),
    promoCodeId:       z.string().uuid("Invalid Promo Code ID format").optional().nullable(),
    razorpayOrderId:   z.string().optional(),
    razorpayPaymentId: z.string().optional(),
  })
});
