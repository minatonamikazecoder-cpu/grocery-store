const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const ApiError = require("../dist/utils/ApiError");
const { errorHandler } = require("../dist/middlewares/error.middleware");

// Mock AppDataSource
const { AppDataSource } = require("../dist/db/data-source");
jest.mock("../dist/db/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

const { verifyJWT, verifyAdmin } = require("../dist/middlewares/auth.middleware");

const app = express();
app.use(express.json());

app.get("/private", verifyJWT, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

app.get("/admin", verifyJWT, verifyAdmin, (req, res) => {
    res.status(200).json({ success: true });
});

app.use(errorHandler);

describe("Security Middleware", () => {
    const JWT_SECRET = "testsecret";
    process.env.JWT_SECRET = JWT_SECRET;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fail if no token is provided", async () => {
        const res = await request(app).get("/private");
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Unauthorized request");
    });

    it("should fail if invalid token is provided", async () => {
        const res = await request(app)
            .get("/private")
            .set("Authorization", "Bearer invalidtoken");
        expect(res.statusCode).toBe(401);
    });

    it("should succeed with a valid token", async () => {
        const mockUser = { id: "11111111-1111-1111-1111-111111111111", email: "test@test.com", role: "User" };
        const token = jwt.sign({ id: mockUser.id }, JWT_SECRET);
        
        const mockUserRepo = {
            findOne: jest.fn().mockResolvedValue(mockUser)
        };
        AppDataSource.getRepository.mockReturnValue(mockUserRepo);

        const res = await request(app)
            .get("/private")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.user.id).toBe(mockUser.id);
    });

    it("should fail admin route if user is not admin", async () => {
        const mockUser = { id: "11111111-1111-1111-1111-111111111111", email: "test@test.com", role: "User" };
        const token = jwt.sign({ id: mockUser.id }, JWT_SECRET);
        
        const mockUserRepo = {
            findOne: jest.fn().mockResolvedValue(mockUser)
        };
        AppDataSource.getRepository.mockReturnValue(mockUserRepo);

        const res = await request(app)
            .get("/admin")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe("Forbidden: Admin access required");
    });

    it("should succeed admin route if user is admin", async () => {
        const mockAdmin = { id: "22222222-2222-2222-2222-222222222222", email: "admin@test.com", role: "Admin" };
        const token = jwt.sign({ id: mockAdmin.id }, JWT_SECRET);
        
        const mockUserRepo = {
            findOne: jest.fn().mockResolvedValue(mockAdmin)
        };
        AppDataSource.getRepository.mockReturnValue(mockUserRepo);

        const res = await request(app)
            .get("/admin")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
