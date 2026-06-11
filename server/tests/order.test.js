const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const { verifyJWT } = require("../src/middlewares/auth.middleware");
const orderController = require("../src/controllers/order.controller");
const errorHandler = require("../src/middlewares/error.middleware");
const Order = require("../src/models/Order");
const OrderItem = require("../src/models/OrderItem");
const Cart = require("../src/models/Cart");
const User = require("../src/models/User");
const Product = require("../src/models/Product");

jest.mock("../src/models/Order");
jest.mock("../src/models/OrderItem");
jest.mock("../src/models/Cart");
jest.mock("../src/models/User");
jest.mock("../src/models/Product");

const app = express();
app.use(express.json());

const JWT_SECRET = "testsecret";
process.env.JWT_SECRET = JWT_SECRET;

app.post("/checkout", verifyJWT, orderController.checkout);
app.get("/orders/:orderId", verifyJWT, orderController.getOrderById);
app.use(errorHandler);

describe("Order Controller Integration", () => {
    const mockUser = { _id: "user123", role: "User" };
    const token = jwt.sign({ id: mockUser._id }, JWT_SECRET);

    beforeEach(() => {
        jest.clearAllMocks();
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });
    });

    it("should successfully checkout a valid cart", async () => {
        const mockProduct = { 
            _id: "prod1", 
            salePrice: 100, 
            discount: 10, 
            stock: 10,
            save: jest.fn().mockResolvedValue(true)
        };
        const mockCart = {
            userId: "user123",
            items: [{ productId: mockProduct, quantity: 2 }],
            save: jest.fn().mockResolvedValue(true)
        };

        Cart.findOne.mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockCart)
        });
        
        Order.prototype.save = jest.fn().mockResolvedValue({ _id: "order123" });
        OrderItem.insertMany.mockResolvedValue([]);

        const res = await request(app)
            .post("/checkout")
            .set("Authorization", `Bearer ${token}`)
            .send({ userId: "user123", addressId: "addr1" });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe("Checkout completed successfully.");
    });

    it("should fail checkout if cart is empty", async () => {
        Cart.findOne.mockReturnValue({
            populate: jest.fn().mockResolvedValue(null)
        });

        const res = await request(app)
            .post("/checkout")
            .set("Authorization", `Bearer ${token}`)
            .send({ userId: "user123", addressId: "addr1" });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Cart is empty or not found.");
    });

    it("should allow a user to get their own order", async () => {
        const mockOrder = { 
            _id: "order123", 
            userId: { _id: "user123" },
            save: jest.fn()
        };
        Order.findById.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockOrder)
        });
        OrderItem.find.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([{ productId: "prod1", quantity: 1 }])
        });

        const res = await request(app)
            .get("/orders/order123")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.order._id).toBe("order123");
    });

    it("should prevent a user from getting another user's order", async () => {
        const mockOrder = { 
            _id: "order123", 
            userId: { _id: "otheruser" } 
        };
        Order.findById.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockOrder)
        });

        const res = await request(app)
            .get("/orders/order123")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(403);
    });
});
