const { z } = require("zod");

const registerSchema = z.object({
    body: z.object({
        firstName: z.string({ invalid_type_error: "First name is required", required_error: "First name is required" }).min(1, "First name is required"),
        lastName: z.string({ invalid_type_error: "Last name is required", required_error: "Last name is required" }).min(1, "Last name is required"),
        email: z.string({ invalid_type_error: "Email is required", required_error: "Email is required" }).email("Invalid email address"),
        mobile: z.string({ invalid_type_error: "Mobile number is required", required_error: "Mobile number is required" }).min(10, "Mobile number must be at least 10 characters"),
        password: z.string({ invalid_type_error: "Password is required", required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
        authType: z.enum(["Email", "Google"]).optional(),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
    }),
});

module.exports = {
    registerSchema,
    loginSchema,
};
