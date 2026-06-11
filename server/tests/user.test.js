const request = require("supertest");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "testsecret";
process.env.JWT_SECRET = JWT_SECRET;

const userController = require("../src/controllers/user.controller");
const validate = require("../src/middlewares/validate.middleware");
const { loginSchema } = require("../src/validations/user.validation");
const errorHandler = require("../src/middlewares/error.middleware");
const User = require("../src/models/User");

jest.mock("../src/models/User");
jest.mock("bcryptjs");

const app = express();
app.use(express.json());

app.post("/login", validate(loginSchema), userController.login);
app.use(errorHandler);

describe("User Controller - Login", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fail login with invalid email format", async () => {
        const res = await request(app)
            .post("/login")
            .send({ email: "not-an-email", password: "password123" });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Invalid email address");
    });

    it("should fail login if user not found", async () => {
        User.findOne.mockResolvedValue(null);

        const res = await request(app)
            .post("/login")
            .send({ email: "test@test.com", password: "password123" });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("User not found");
    });

    it("should fail login with incorrect password", async () => {
        const mockUser = { email: "test@test.com", password: "hashedpassword", authType: "Email" };
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        const res = await request(app)
            .post("/login")
            .send({ email: "test@test.com", password: "wrongpassword" });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Invalid credentials");
    });

    it("should succeed login with correct credentials", async () => {
        const mockUser = { 
            _id: "user123", 
            email: "test@test.com", 
            password: "hashedpassword", 
            authType: "Email",
            status: "Active",
            role: "User"
        };
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);

        const res = await request(app)
            .post("/login")
            .send({ email: "test@test.com", password: "password123" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user.email).toBe("test@test.com");
    });
});
