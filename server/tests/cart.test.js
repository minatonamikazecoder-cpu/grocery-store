const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const { verifyJWT } = require("../src/middlewares/auth.middleware");
const cartController = require("../src/controllers/cart.controller");
const errorHandler = require("../src/middlewares/error.middleware");
const Cart = require("../src/models/Cart");
const User = require("../src/models/User");

jest.mock("../src/models/Cart");
jest.mock("../src/models/User");

const app = express();
app.use(express.json());

const JWT_SECRET = "testsecret";
process.env.JWT_SECRET = JWT_SECRET;

app.post("/cart", verifyJWT, cartController.addToCart);
app.get("/cart/:userId", verifyJWT, cartController.getCartByUserId);
app.use(errorHandler);

describe("Cart Controller Integration", () => {
    const mockUser = { _id: "user123", role: "User" };
    const token = jwt.sign({ id: mockUser._id }, JWT_SECRET);

    beforeEach(() => {
        jest.clearAllMocks();
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });
    });

    it("should allow a user to add an item to their own cart", async () => {
        Cart.findOne.mockResolvedValue(null); // No existing cart
        Cart.prototype.save = jest.fn().mockResolvedValue({ userId: "user123", items: [] });

        const res = await request(app)
            .post("/cart")
            .set("Authorization", `Bearer ${token}`)
            .send({ userId: "user123", productId: "prod1", quantity: 2 });

        expect(res.statusCode).toBe(201);
    });

    it("should prevent a user from adding an item to another user's cart", async () => {
        const res = await request(app)
            .post("/cart")
            .set("Authorization", `Bearer ${token}`)
            .send({ userId: "otheruser", productId: "prod1", quantity: 2 });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe("Unauthorized access");
    });

    it("should allow a user to get their own cart", async () => {
        const mockCart = { 
            userId: "user123", 
            items: [{ productId: { productName: "Apple" }, quantity: 1 }] 
        };
        
        Cart.findOne.mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockCart)
        });

        const res = await request(app)
            .get("/cart/user123")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.userId).toBe("user123");
    });

    it("should prevent a user from getting another user's cart", async () => {
        const res = await request(app)
            .get("/cart/otheruser")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(403);
    });
});
