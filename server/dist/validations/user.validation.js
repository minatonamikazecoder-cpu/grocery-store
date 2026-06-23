"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const sanitize_1 = require("../utils/sanitize");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, "First name is required").transform(sanitize_1.sanitizeHTML),
        lastName: zod_1.z.string().min(1, "Last name is required").transform(sanitize_1.sanitizeHTML),
        email: zod_1.z.string().email("Invalid email address"),
        mobile: zod_1.z.string().min(10, "Mobile number must be at least 10 characters"),
        password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
        authType: zod_1.z.enum(["Email", "Google"]).optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z.string().min(1, "Password is required"),
    }),
});
