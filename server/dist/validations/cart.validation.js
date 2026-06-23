"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToCartSchema = void 0;
const zod_1 = require("zod");
exports.addToCartSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string().uuid("Invalid User ID format"),
        productId: zod_1.z.string().uuid("Invalid Product ID format"),
        quantity: zod_1.z.number().int("Quantity must be an integer").positive("Quantity must be greater than 0").max(100, "Maximum quantity allowed is 100"),
    })
});
