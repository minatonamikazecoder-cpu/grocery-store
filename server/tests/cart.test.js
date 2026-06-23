const request = require("supertest");
const express = require("express");
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

const { verifyJWT } = require("../dist/middlewares/auth.middleware");
const cartController = require("../dist/controllers/cart.controller");
const { errorHandler } = require("../dist/middlewares/error.middleware");

const app = express();
app.use(express.json());

app.post("/cart", verifyJWT, cartController.addToCart);
app.get("/cart/:userId", verifyJWT, cartController.getCartByUserId);
app.use(errorHandler);

describe("Cart Controller Integration", () => {
    const mockUser = { id: "11111111-1111-1111-1111-111111111111", role: "User" };
    const token = jwt.sign({ id: mockUser.id }, JWT_SECRET);

    let mockUserRepo;
    let mockCartRepo;
    let mockCartItemRepo;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockUserRepo = {
            findOne: jest.fn().mockResolvedValue(mockUser)
        };
        mockCartRepo = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn()
        };
        mockCartItemRepo = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn()
        };

        AppDataSource.getRepository.mockImplementation((entity) => {
            if (entity.name === "User") return mockUserRepo;
            if (entity.name === "Cart") return mockCartRepo;
            if (entity.name === "CartItem") return mockCartItemRepo;
        });
    });

    it("should allow a user to add an item to their own cart", async () => {
        const cartObj = { id: "cart123", userId: mockUser.id, items: [] };
        mockCartRepo.findOne
            .mockResolvedValueOnce(null) // first check
            .mockResolvedValueOnce({ ...cartObj, items: [{ productId: { id: "prod1", productName: "Apple", salePrice: 10, discount: 0 }, quantity: 2 }] }); // update check

        mockCartRepo.create.mockReturnValue(cartObj);
        mockCartRepo.save.mockResolvedValue(cartObj);
        mockCartItemRepo.findOne.mockResolvedValue(null);
        mockCartItemRepo.create.mockReturnValue({});
        mockCartItemRepo.save.mockResolvedValue({});

        const res = await request(app)
            .post("/cart")
            .set("Authorization", `Bearer ${token}`)
            .send({ userId: mockUser.id, productId: "prod1", quantity: 2 });

        expect(res.statusCode).toBe(201);
    });

    it("should prevent a user from adding an item to another user's cart", async () => {
        const res = await request(app)
            .post("/cart")
            .set("Authorization", `Bearer ${token}`)
            .send({ userId: "22222222-2222-2222-2222-222222222222", productId: "prod1", quantity: 2 });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe("Unauthorized access");
    });

    it("should allow a user to get their own cart", async () => {
        const mockCart = { 
            id: "cart123",
            userId: mockUser.id, 
            items: [{ product: { id: "prod1", productName: "Apple", salePrice: 10, discount: 0 }, quantity: 1 }] 
        };
        
        mockCartRepo.findOne.mockResolvedValue(mockCart);

        const res = await request(app)
            .get(`/cart/${mockUser.id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.userId).toBe(mockUser.id);
    });

    it("should prevent a user from getting another user's cart", async () => {
        const res = await request(app)
            .get("/cart/22222222-2222-2222-2222-222222222222")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(403);
    });
});
