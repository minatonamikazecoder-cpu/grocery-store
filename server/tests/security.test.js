const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const { verifyJWT, verifyAdmin } = require("../src/middlewares/auth.middleware");
const ApiError = require("../src/utils/ApiError");
const errorHandler = require("../src/middlewares/error.middleware");

const app = express();
app.use(express.json());

// Mock User model
const User = require("../src/models/User");
jest.mock("../src/models/User");

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
        const mockUser = { _id: "123", email: "test@test.com", role: "User" };
        const token = jwt.sign({ id: mockUser._id }, JWT_SECRET);
        
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });

        const res = await request(app)
            .get("/private")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.user._id).toBe(mockUser._id);
    });

    it("should fail admin route if user is not admin", async () => {
        const mockUser = { _id: "123", email: "test@test.com", role: "User" };
        const token = jwt.sign({ id: mockUser._id }, JWT_SECRET);
        
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });

        const res = await request(app)
            .get("/admin")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe("Forbidden: Admin access required");
    });

    it("should succeed admin route if user is admin", async () => {
        const mockAdmin = { _id: "456", email: "admin@test.com", role: "Admin" };
        const token = jwt.sign({ id: mockAdmin._id }, JWT_SECRET);
        
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockAdmin)
        });

        const res = await request(app)
            .get("/admin")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
