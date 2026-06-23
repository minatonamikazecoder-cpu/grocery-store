const request = require("supertest");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "testsecret";
process.env.JWT_SECRET = JWT_SECRET;

// Mock AppDataSource
const { AppDataSource } = require("../dist/db/data-source");
jest.mock("../dist/db/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

const userController = require("../dist/controllers/user.controller");
const { validate } = require("../dist/middlewares/validate.middleware");
const { loginSchema } = require("../dist/validations/user.validation");
const { errorHandler } = require("../dist/middlewares/error.middleware");

jest.mock("bcryptjs");

const app = express();
app.use(express.json());

app.post("/login", validate(loginSchema), userController.login);
app.use(errorHandler);

describe("User Controller - Login", () => {
    let mockUserRepo;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepo = {
            findOneBy: jest.fn()
        };
        AppDataSource.getRepository.mockReturnValue(mockUserRepo);
    });

    it("should fail login with invalid email format", async () => {
        const res = await request(app)
            .post("/login")
            .send({ email: "not-an-email", password: "password123" });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Validation failed");
    });

    it("should fail login if user not found", async () => {
        mockUserRepo.findOneBy.mockResolvedValue(null);

        const res = await request(app)
            .post("/login")
            .send({ email: "test@test.com", password: "password123" });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("User not found");
    });

    it("should fail login with incorrect password", async () => {
        const mockUser = { id: "user123", email: "test@test.com", password: "hashedpassword", authType: "Email" };
        mockUserRepo.findOneBy.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        const res = await request(app)
            .post("/login")
            .send({ email: "test@test.com", password: "wrongpassword" });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Invalid credentials");
    });

    it("should succeed login with correct credentials", async () => {
        const mockUser = { 
            id: "user123", 
            email: "test@test.com", 
            password: "hashedpassword", 
            authType: "Email",
            status: "Active",
            role: "User"
        };
        mockUserRepo.findOneBy.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);

        const res = await request(app)
            .post("/login")
            .send({ email: "test@test.com", password: "password123" });

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty("token");
        expect(res.body.data.user.email).toBe("test@test.com");
    });
});
