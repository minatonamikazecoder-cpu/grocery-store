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

---
*Updated by Gemini CLI on 2026-06-11*
