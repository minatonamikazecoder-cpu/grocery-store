import { z } from 'zod';
import { sanitizeHTML } from '../utils/sanitize';

export const createAddressSchema = z.object({
  body: z.object({
    userId:    z.string().uuid("Invalid User ID format"),
    fullName:  z.string().min(2, "Full name must be at least 2 characters").max(100).transform(sanitizeHTML),
    phone:     z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    address:   z.string().min(5, "Address must be at least 5 characters").max(200).transform(sanitizeHTML),
    city:      z.string().min(2, "City must be at least 2 characters").max(50).transform(sanitizeHTML),
    state:     z.string().min(2, "State must be at least 2 characters").max(50).transform(sanitizeHTML),
    pincode:   z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  })
});

export const updateAddressSchema = z.object({
  body: z.object({
    fullName:  z.string().min(2, "Full name must be at least 2 characters").max(100).transform(sanitizeHTML).optional(),
    phone:     z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number').optional(),
    address:   z.string().min(5, "Address must be at least 5 characters").max(200).transform(sanitizeHTML).optional(),
    city:      z.string().min(2, "City must be at least 2 characters").max(50).transform(sanitizeHTML).optional(),
    state:     z.string().min(2, "State must be at least 2 characters").max(50).transform(sanitizeHTML).optional(),
    pincode:   z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode').optional(),
  })
});
