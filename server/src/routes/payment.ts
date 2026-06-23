import express from "express";
import * as paymentController from "../controllers/payment.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/create-order", verifyJWT, paymentController.createOrder);

export default router;
