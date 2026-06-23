const request = require("supertest");
const express = require("express");
const { validate } = require("../dist/middlewares/validate.middleware");
const { registerSchema } = require("../dist/validations/user.validation");
const { errorHandler } = require("../dist/middlewares/error.middleware");

const app = express();
app.use(express.json());

app.post("/register", validate(registerSchema), (req, res) => {
    res.status(200).json({ success: true });
});

app.use(errorHandler);

describe("Validation Middleware", () => {
    it("should fail if required fields are missing", async () => {
        const res = await request(app).post("/register").send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Validation failed");
        const firstNameErr = res.body.errors.find(e => e.field === "firstName");
        expect(firstNameErr).toBeDefined();
        expect(firstNameErr.message).toBe("Invalid input: expected string, received undefined");
    });

    it("should fail if email is invalid", async () => {
        const res = await request(app).post("/register").send({
            firstName: "John",
            lastName: "Doe",
            email: "invalid-email",
            mobile: "1234567890",
            password: "password123"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Validation failed");
        const emailErr = res.body.errors.find(e => e.field === "email");
        expect(emailErr).toBeDefined();
        expect(emailErr.message).toBe("Invalid email address");
    });

    it("should succeed with valid data", async () => {
        const res = await request(app).post("/register").send({
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            mobile: "1234567890",
            password: "password123"
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
