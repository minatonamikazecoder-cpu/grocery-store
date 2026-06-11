const Razorpay = require("razorpay");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = asyncHandler(async (req, res) => {
    const { amount } = req.body; // Amount in rupees

    const options = {
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    res.status(200).json({ success: true, order });
});
