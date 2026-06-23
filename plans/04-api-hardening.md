# Plan 04 — API Hardening & Design

**Priority:** 🟡 High | **Estimated effort:** 3-4 days

---

## 🎯 Goal

Standardize API responses, fix inconsistent patterns between controllers, add missing validation schemas, improve error messages, and add critical missing endpoints.

---

## 🔧 Part A: API Response Standardization

### PROBLEM: Inconsistent response shapes across controllers

Currently, different controllers return data in different formats:

```typescript
// product.controller.ts (paginated)
res.json({ success: true, data: enrichedProducts, total, page, totalPages });

// user.controller.ts (single)
res.json({ ...userWithoutPassword, _id: user.id });

// order.controller.ts (list)
res.json({ orders: activeOrders });

// wishlist.controller.ts
res.json({ wishlist: ... });
```

The client has to handle all these differently, making the code brittle.

### FIX: Create a standard `ApiResponse` wrapper

**File (new):** `server/src/utils/ApiResponse.ts`

```typescript
export class ApiResponse<T> {
  constructor(
    public statusCode: number,
    public data: T,
    public message: string = 'Success',
    public meta?: {
      total?: number;
      page?: number;
      totalPages?: number;
      limit?: number;
    }
  ) {}
  
  toJSON() {
    return {
      success: this.statusCode >= 200 && this.statusCode < 300,
      message: this.message,
      data: this.data,
      ...(this.meta && { meta: this.meta }),
    };
  }
}
```

**Usage in controllers:**
```typescript
// Single item
res.status(200).json(new ApiResponse(200, user, 'User fetched').toJSON());

// Paginated list
res.status(200).json(
  new ApiResponse(200, products, 'Products fetched', { total, page, totalPages }).toJSON()
);
```

**Rollout plan:** Apply to all controllers one by one. Start with `user.controller.ts`, then `product.controller.ts`.

---

## 🛡️ Part B: Missing Validation Schemas

The project uses Zod validation. Check which controllers have schemas in `server/src/validations/` and which are missing.

**Files to check:**
```
server/src/validations/
├── user.validation.ts    (exists)
├── product.validation.ts (exists — need to verify)
├── category.validation.ts (exists)
└── ??? (missing schemas)
```

### MISSING-01: `address.controller.ts` — No validation

The address creation endpoint accepts fields without validation:
```typescript
// Add to server/src/validations/address.validation.ts (new file)
import { z } from 'zod';

export const createAddressSchema = z.object({
  body: z.object({
    fullName:  z.string().min(2).max(100),
    phone:     z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    address:   z.string().min(5).max(200),
    city:      z.string().min(2).max(50),
    state:     z.string().min(2).max(50),
    pincode:   z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  })
});
```

### MISSING-02: `review.controller.ts` — No validation

```typescript
// server/src/validations/review.validation.ts (new file)
export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    userId:    z.string().uuid(),
    rating:    z.number().int().min(1).max(5),
    review:    z.string().min(10).max(1000),
  })
});
```

### MISSING-03: `cart.controller.ts` — No validation

```typescript
// server/src/validations/cart.validation.ts (new file)
export const addToCartSchema = z.object({
  body: z.object({
    userId:    z.string().uuid(),
    productId: z.string().uuid(),
    quantity:  z.number().int().positive().max(100),
  })
});
```

### MISSING-04: `order.controller.ts` — Partial validation only

The `checkout` endpoint should validate:
```typescript
export const checkoutSchema = z.object({
  body: z.object({
    userId:            z.string().uuid(),
    addressId:         z.string().uuid(),
    promoCodeId:       z.string().uuid().optional().nullable(),
    razorpayOrderId:   z.string().optional(),
    razorpayPaymentId: z.string().optional(),
  })
});
```

---

## 🔌 Part C: Missing API Endpoints

### MISSING-API-01: `POST /users/resend-verification`

**Needed by:** Plan 01 (Auth) — resend email verification.

```typescript
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ email });
  
  if (!user) throw new ApiError(404, 'User not found');
  if (user.status === 'Active') throw new ApiError(400, 'Email already verified');
  
  const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });
  const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  
  await transporter.sendMail({ ... });
  res.json({ message: 'Verification email sent' });
});
```

### MISSING-API-02: `POST /users/logout`

**Needed by:** Plan 01 — Server-side logout.

For now (no refresh tokens): simply acknowledge and let the client clear storage.

```typescript
export const logout = asyncHandler(async (req, res) => {
  // Future: add token to a blacklist / revoke refresh token
  res.json({ message: 'Logged out successfully' });
});
```

### MISSING-API-03: `GET /products/search?q=term`

**Needed by:** The search functionality is client-side (filters `products` array). For large catalogs this is inefficient.

```typescript
export const searchProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 12 } = req.query;
  
  if (!q || String(q).trim().length < 2) {
    throw new ApiError(400, 'Search query must be at least 2 characters');
  }
  
  const productRepo = AppDataSource.getRepository(Product);
  
  const [products, total] = await productRepo
    .createQueryBuilder('product')
    .where('product.isActive = :isActive', { isActive: true })
    .andWhere(
      '(LOWER(product.productName) LIKE :q OR LOWER(product.description) LIKE :q)',
      { q: `%${String(q).toLowerCase()}%` }
    )
    .skip((Number(page) - 1) * Number(limit))
    .take(Number(limit))
    .getManyAndCount();
  
  res.json({ success: true, data: products, total, page, totalPages: Math.ceil(total / Number(limit)) });
});
```

### MISSING-API-04: `GET /users/:id/orders` — Order history endpoint

This exists as `getOrdersByUserId` in `order.controller.ts`. Verify it's properly registered and returns items + product details.

---

## 🔒 Part D: Security Improvements

### SEC-01: Rate limiting scope

**Current:** Rate limiting only on `/users/login`, `/users/register`, `/users/send-otp`

**Missing rate limits:**
- Password reset endpoint
- Review submission (prevent spam)
- Contact form endpoint

**Fix in `app.ts`:**
```typescript
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

app.use('/users/reset-password', authLimiter);
app.use('/reviews', rateLimit({ windowMs: 60 * 60 * 1000, max: 5 })); // 5 reviews/hour
app.use('/contact', rateLimit({ windowMs: 60 * 60 * 1000, max: 3 })); // 3 contacts/hour
```

### SEC-02: CORS configuration verification

**File:** `server/src/app.ts`

**Current:**
```typescript
origin: process.env.CORS_ORIGIN === "*" ? "*" : process.env.CORS_ORIGIN?.split(",")
```

**Missing:** The CORS config doesn't set `methods` or `allowedHeaders`. Add:
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN === '*' ? '*' : process.env.CORS_ORIGIN?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### SEC-03: Input sanitization

The API receives user-controlled strings (product name, review text, address). These should be sanitized to prevent stored XSS.

**Add:** `express-validator`'s `escape()` or `DOMPurify` (server-side via `isomorphic-dompurify`) to sanitize text inputs.

### SEC-04: File upload security

**File:** `server/src/middlewares/multer.middleware.ts`

**Check:** Ensure uploaded file types are validated (only images: jpg, jpeg, png, webp). The current middleware may not validate MIME type.

```typescript
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only JPG, PNG, and WebP images are allowed'), false);
  }
};
```

---

## 📊 Part E: Error Response Improvements

### IMPROVE-01: Better error messages for validation failures

**Current:** Zod validation errors return a raw array of ZodIssue objects.

**Fix in `validate.middleware.ts`:**
```typescript
const errors = zodError.errors.map(e => ({
  field: e.path.join('.'),
  message: e.message,
}));

res.status(400).json({
  success: false,
  message: 'Validation failed',
  errors,
});
```

### IMPROVE-02: 404 handler should distinguish API routes from page routes

**Current:** All unmatched routes return `{ message: "Route not found" }`.

**Fix:** Add `/api/` prefix awareness or return proper JSON for all unmatched routes.

---

## 📁 Files to Modify

| File | Change | Priority |
|------|--------|----------|
| `server/src/utils/ApiResponse.ts` | **New** | Standardized response class | High |
| `server/src/validations/address.validation.ts` | **New** | Address validation schema | High |
| `server/src/validations/review.validation.ts` | **New** | Review validation schema | High |
| `server/src/validations/cart.validation.ts` | **New** | Cart validation schema | High |
| `server/src/controllers/user.controller.ts` | Update | Add resend-verification, logout | High |
| `server/src/controllers/product.controller.ts` | Update | Add search endpoint | Medium |
| `server/src/middlewares/validate.middleware.ts` | Update | Better error format | Medium |
| `server/src/middlewares/multer.middleware.ts` | Update | File type validation | High |
| `server/src/app.ts` | Update | Extended CORS config, more rate limits | Medium |

---

## ✅ Acceptance Criteria

- [ ] All controllers return consistent `{ success, message, data, meta? }` shape
- [ ] Address creation fails gracefully with field-level error messages
- [ ] Review submission validates rating (1-5) and review length
- [ ] Cart add validates quantity (positive integer, max 100)
- [ ] File uploads reject non-image MIME types with a clear error
- [ ] Password reset and review endpoints are rate-limited
- [ ] Server-side product search works with at least 2-character queries
- [ ] Validation errors return `{ errors: [{ field, message }] }` format
