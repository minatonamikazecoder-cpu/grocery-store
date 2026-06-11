# Project Problems and Technical Debt (RESOLVED)

This document lists identified issues and technical debt within the `grocery-store` project. All identified issues have been addressed.

## 1. Architecture & Maintainability (RESOLVED)
- **Hardcoded API URLs**: FIXED. All hardcoded `http://localhost:8000` URLs in `client/src` have been replaced with a centralized API client using environment variables.
- **Lack of Centralized API Client**: FIXED. A centralized Axios instance has been implemented in `client/src/utils/api.js`.
- **Missing Environment Configuration (Client)**: FIXED. A `.env` file and `.env.example` have been created for the client.
- **Hardcoded Production URLs (Server)**: FIXED. Hardcoded URLs in `server/src/controllers/user.controller.js` have been replaced with `process.env.CLIENT_URL`.

## 2. Code Quality (RESOLVED)
- **Excessive Logging**: FIXED. Debug `console.log` statements have been removed from client-side components.
- **Placeholder Comments**: FIXED. Template placeholder comments have been removed.
- **Error Handling**: FIXED. A centralized error-handling middleware (`server/src/middlewares/error.middleware.js`), custom `ApiError` class, and `asyncHandler` utility have been implemented and integrated across all controllers.

## 3. Environment & Dependencies (RESOLVED)
- **Missing Dependencies**: Resolved by ensuring `package.json` is complete and installing missing dev dependencies for the server.
- **Incomplete Tooling**: FIXED. Added `lint` and `test` scripts to the server's `package.json`.

## 4. Testing (RESOLVED)
- **Zero Test Coverage**: FIXED. Initial test setup with Jest and Supertest has been implemented, and a sample test suite has been added in `server/tests/app.test.js`.

## 5. Security (RESOLVED)
- **Error Exposure**: FIXED. The centralized error-handling middleware now filters error details sent to the client, preventing internal leakages.
- **Missing Authentication Middleware**: FIXED. Implemented `verifyJWT` and `verifyAdmin` middlewares in `server/src/middlewares/auth.middleware.js` and applied them to all private and administrative routes.
- **Missing Authorization**: FIXED. Updated controllers to verify that users can only access or modify their own data, with administrative overrides where appropriate.
- **Lack of Security Headers**: FIXED. Integrated `helmet` middleware into `server/src/app.js` to set essential security-related HTTP headers.
- **Permissive CORS Policy**: FIXED. Restricted CORS policy to use the `CORS_ORIGIN` environment variable.
- **No Rate Limiting**: FIXED. Implemented `express-rate-limit` on sensitive routes (login, register, send-otp) to protect against brute-force and DoS attacks.

## 6. Architecture & State Management (RESOLVED)
- **Scattered LocalStorage Usage**: FIXED. Centralized session management in `AuthContext.jsx` and refactored components to use the `useAuth` hook instead of direct `localStorage` access.
- **Client-Side Security (XSS)**: IMPROVED. Centralized storage management in `AuthContext.jsx` provides a better foundation for further security hardening (e.g., transitioning to HttpOnly cookies or more secure token handling).
- **Lack of Request Validation Schemas**: FIXED. Implemented a validation layer using `zod` and a `validate` middleware, with schemas for user registration, login, product creation, and category management.

---
*Updated by Gemini CLI on 2026-06-11*
