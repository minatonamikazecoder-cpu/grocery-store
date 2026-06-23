"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutSchema = void 0;
const zod_1 = require("zod");
exports.checkoutSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string().uuid("Invalid User ID format"),
        addressId: zod_1.z.string().uuid("Invalid Address ID format"),
        promoCodeId: zod_1.z.string().uuid("Invalid Promo Code ID format").optional().nullable(),
        razorpayOrderId: zod_1.z.string().optional(),
        razorpayPaymentId: zod_1.z.string().optional(),
    })
});
