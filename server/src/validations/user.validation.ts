import { z } from "zod";
import { sanitizeHTML } from "../utils/sanitize";

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required").transform(sanitizeHTML),
    lastName: z.string().min(1, "Last name is required").transform(sanitizeHTML),
    email: z.string().email("Invalid email address"),
    mobile: z.string().min(10, "Mobile number must be at least 10 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    authType: z.enum(["Email", "Google"]).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});
