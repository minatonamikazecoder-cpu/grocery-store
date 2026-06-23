"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductSchema = void 0;
const zod_1 = require("zod");
const sanitize_1 = require("../utils/sanitize");
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryId: zod_1.z.string().min(1, "Category ID is required"),
        productName: zod_1.z.string().min(1, "Product name is required").transform(sanitize_1.sanitizeHTML),
        description: zod_1.z.string().min(1, "Description is required").transform(sanitize_1.sanitizeHTML),
        salePrice: zod_1.z.string().or(zod_1.z.number()).transform((val) => Number(val)),
        costPrice: zod_1.z.string().or(zod_1.z.number()).transform((val) => Number(val)),
        discount: zod_1.z.string().or(zod_1.z.number()).transform((val) => Number(val)).optional().default(0),
        stock: zod_1.z.string().or(zod_1.z.number()).transform((val) => Number(val)).optional().default(0),
        isActive: zod_1.z
            .string()
            .or(zod_1.z.boolean())
            .transform((val) => val === "true" || val === true)
            .optional()
            .default(true),
    }),
});
