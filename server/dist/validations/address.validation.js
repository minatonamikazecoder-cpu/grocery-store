"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressSchema = exports.createAddressSchema = void 0;
const zod_1 = require("zod");
const sanitize_1 = require("../utils/sanitize");
exports.createAddressSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string().uuid("Invalid User ID format"),
        fullName: zod_1.z.string().min(2, "Full name must be at least 2 characters").max(100).transform(sanitize_1.sanitizeHTML),
        phone: zod_1.z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
        address: zod_1.z.string().min(5, "Address must be at least 5 characters").max(200).transform(sanitize_1.sanitizeHTML),
        city: zod_1.z.string().min(2, "City must be at least 2 characters").max(50).transform(sanitize_1.sanitizeHTML),
        state: zod_1.z.string().min(2, "State must be at least 2 characters").max(50).transform(sanitize_1.sanitizeHTML),
        pincode: zod_1.z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
    })
});
exports.updateAddressSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z.string().min(2, "Full name must be at least 2 characters").max(100).transform(sanitize_1.sanitizeHTML).optional(),
        phone: zod_1.z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number').optional(),
        address: zod_1.z.string().min(5, "Address must be at least 5 characters").max(200).transform(sanitize_1.sanitizeHTML).optional(),
        city: zod_1.z.string().min(2, "City must be at least 2 characters").max(50).transform(sanitize_1.sanitizeHTML).optional(),
        state: zod_1.z.string().min(2, "State must be at least 2 characters").max(50).transform(sanitize_1.sanitizeHTML).optional(),
        pincode: zod_1.z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode').optional(),
    })
});
