const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "testsecret";
process.env.JWT_SECRET = JWT_SECRET;

// Mock AppDataSource
const { AppDataSource } = require("../dist/db/data-source");
jest.mock("../dist/db/data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
    transaction: jest.fn()
  }
}));

const { verifyJWT } = require("../dist/middlewares/auth.middleware");
const orderController = require("../dist/controllers/order.controller");
const { errorHandler } = require("../dist/middlewares/error.middleware");

const app = express();
app.use(express.json());

app.post("/checkout", verifyJWT, orderController.checkout);
app.get("/orders/:orderId", verifyJWT, orderController.getOrderById);
app.use(errorHandler);

describe("Order Controller Integration", () => {
    const mockUser = { id: "11111111-1111-1111-1111-111111111111", role: "User" };
    const token = jwt.sign({ id: mockUser.id }, JWT_SECRET);

    let mockUserRepo;
    let mockCartRepo;
    let mockOrderRepo;
    let mockOrderItemRepo;
    let mockProductRepo;
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
        mockOrderRepo = {
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            save: jest.fn()
        };
        mockOrderItemRepo = {
            insertMany: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn()
        };
        mockProductRepo = {
            findOneBy: jest.fn(),
            save: jest.fn()
        };
        mockCartItemRepo = {
            delete: jest.fn(),
            save: jest.fn()
        };

        AppDataSource.getRepository.mockImplementation((entity) => {
            if (entity.name === "User") return mockUserRepo;
            if (entity.name === "Cart") return mockCartRepo;
            if (entity.name === "Order") return mockOrderRepo;
            if (entity.name === "OrderItem") return mockOrderItemRepo;
            if (entity.name === "Product") return mockProductRepo;
        });

        AppDataSource.transaction.mockImplementation(async (cb) => {
            const mockEntityManager = {
                getRepository: (entity) => {
                    if (entity.name === "Order") return mockOrderRepo;
                    if (entity.name === "OrderItem") return mockOrderItemRepo;
                    if (entity.name === "Product") return mockProductRepo;
                    if (entity.name === "CartItem") return mockCartItemRepo;
                }
            };
            return cb(mockEntityManager);
        });
    });

    it("should successfully checkout a valid cart", async () => {
        const mockProduct = { 
            id: "prod1", 
            salePrice: 100, 
            discount: 10, 
            stock: 10
        };
        const mockCart = {
            userId: mockUser.id,
            items: [{ productId: "prod1", product: mockProduct, quantity: 2 }]
        };

        mockCartRepo.findOne.mockResolvedValue(mockCart);
        mockProductRepo.findOneBy.mockResolvedValue(mockProduct);
        mockOrderRepo.create.mockReturnValue({ id: "order123" });
        mockOrderRepo.save.mockResolvedValue({ id: "order123" });
        mockOrderItemRepo.create.mockReturnValue({});
        mockOrderItemRepo.save.mockResolvedValue({});
        mockCartItemRepo.delete.mockResolvedValue({});

        const res = await request(app)
            .post("/checkout")
            .set("Authorization", `Bearer ${token}`)
            .send({ userId: mockUser.id, addressId: "addr1" });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe("Checkout completed successfully.");
    });

    it("should fail checkout if cart is empty", async () => {
        mockCartRepo.findOne.mockResolvedValue(null);

        const res = await request(app)
            .post("/checkout")
            .set("Authorization", `Bearer ${token}`)
            .send({ userId: mockUser.id, addressId: "addr1" });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Cart is empty or not found.");
    });

    it("should allow a user to get their own order", async () => {
        const mockOrder = { 
            id: "order123", 
            userId: mockUser.id,
            user: mockUser,
            delAddress: { fullName: "John Doe" },
            offer: null
        };
        
        mockOrderRepo.findOne.mockResolvedValue(mockOrder);
        
        const mockOrderItem = {
            product: {
                id: "prod1",
                productName: "Apple",
                productImage: "apple.png",
                salePrice: 10,
                discount: 0
            },
            quantity: 1,
            price: 10
        };
        mockOrderItemRepo.find.mockResolvedValue([mockOrderItem]);

        const res = await request(app)
            .get("/orders/order123")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.order.id).toBe("order123");
    });

    it("should prevent a user from getting another user's order", async () => {
        const mockOrder = { 
            id: "order123", 
            userId: "22222222-2222-2222-2222-222222222222",
            user: { id: "22222222-2222-2222-2222-222222222222" },
            delAddress: { fullName: "John Doe" },
            offer: null
        };
        mockOrderRepo.findOne.mockResolvedValue(mockOrder);

        const res = await request(app)
            .get("/orders/order123")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(403);
    });
});
