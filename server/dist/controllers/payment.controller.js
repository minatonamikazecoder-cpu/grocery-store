"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const asyncHandler_1 = require("../utils/asyncHandler");
const instance = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});
exports.createOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { amount } = req.body; // Amount in rupees
    const options = {
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    };
    const order = await instance.orders.create(options);
    res.status(200).json({ success: true, order });
});
