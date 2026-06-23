import { Request, Response } from "express";
import Razorpay from "razorpay";
import { asyncHandler } from "../utils/asyncHandler";

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
    const { amount } = req.body; // Amount in rupees

    const options = {
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    res.status(200).json({ success: true, order });
});
