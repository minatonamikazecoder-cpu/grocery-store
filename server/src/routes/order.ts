import express from "express";
import * as orderController from "../controllers/order.controller";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import { checkoutSchema } from "../validations/order.validation";

const router = express.Router();

// All routes require JWT authentication
router.use(verifyJWT);

// 1. Static and Specific Routes (Must come before wildcards)
router.post('/checkout', validate(checkoutSchema), orderController.checkout);
router.get("/check-stock/:userId", orderController.checkStockAvailability);
router.get("/has-purchased/:userId/:productId", orderController.hasUserPurchasedProduct);
router.get("/user/:userId", orderController.getOrdersByUserId);

// Active orders (Admin-only, placed before wildcard to avoid interception)
router.get('/active', verifyAdmin, orderController.getActiveOrders);

// Get multiple orders for admin (placed before wildcard to avoid interception)
router.get('/', verifyAdmin, orderController.getOrders);

// 2. Wildcard Routes (Evaluate last)
router.get('/:orderId', orderController.getOrderById);
router.put('/:orderId', orderController.updateOrder);

// Mark order as deleted (Admin-only)
router.patch('/:orderId/delete', verifyAdmin, orderController.markOrderAsDeleted);

export default router;
