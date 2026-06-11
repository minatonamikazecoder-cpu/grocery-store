const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const Address = require("../models/Address");
const User = require("../models/User");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Offer = require("../models/Offer");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// Check stock availability based on userId
exports.checkStockAvailability = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized access");
    }

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty or not found.");
    }

    for (const item of cart.items) {
        const product = item.productId;
        if (!product || (product.stock || 0) < item.quantity) {
            throw new ApiError(
                400,
                `${product.productName}'s ${item.quantity} quantity is not available in stock.`
            );
        }
    }

    res.status(200).json({
        message: "All products are available in sufficient quantity.",
    });
});

const isActive = (start, end) => {
    const now = new Date();
    return new Date(start) <= now && now <= new Date(end);
};

exports.checkout = asyncHandler(async (req, res) => {
    const {
        userId,
        addressId,
        promoCodeId,
        razorpayOrderId,
        razorpayPaymentId,
    } = req.body;

    if (req.user._id.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized access");
    }

    // 1. Get cart by userId
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty or not found.");
    }

    // 2. Calculate subtotal
    let subtotal = 0;
    cart.items.forEach((item) => {
        subtotal +=
            (item.productId.salePrice -
                (item.productId.salePrice * item.productId.discount) / 100) *
            item.quantity;
    });

    // 3. Get offer and apply discount if applicable
    let discountAmount = 0;
    let discountPerProduct = {};
    if (promoCodeId) {
        const offer = await Offer.findById(promoCodeId);
        if (!offer || !isActive(offer.startDate, offer.endDate)) {
            throw new ApiError(400, "Invalid or inactive promo code.");
        }

        if (subtotal >= offer.minimumOrder) {
            const rawDiscount = subtotal * (offer.discount / 100);
            discountAmount = Math.min(rawDiscount, offer.maxDiscount);

            // Distribute discount proportionally
            let totalBase = subtotal;
            cart.items.forEach((item) => {
                const productTotal =
                    (item.productId.salePrice -
                        (item.productId.salePrice * item.productId.discount) /
                            100) *
                    item.quantity;
                const productDiscount = (productTotal / totalBase) * discountAmount;
                discountPerProduct[item.productId._id.toString()] =
                    productDiscount;
            });
        }
    }

    // 4. Create order
    const shippingCharge = 50;
    const totalAmount = subtotal - discountAmount + shippingCharge;

    const newOrder = new Order({
        userId,
        delAddressId: addressId,
        orderDate: new Date(),
        orderStatus: "Pending",
        shippingCharge,
        total: totalAmount,
        paymentMode: "Online",
        paymentStatus: "Completed",
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        offerId: promoCodeId,
    });

    const savedOrder = await newOrder.save();

    // 5. Create OrderItems
    const orderItems = cart.items.map((item) => {
        const productId = item.productId._id;
        const quantity = item.quantity;
        const price =
            item.productId.salePrice -
            (item.productId.salePrice * item.productId.discount) / 100;
        const discount = discountPerProduct[productId.toString()] || 0;

        return {
            orderId: savedOrder._id,
            productId,
            quantity,
            price,
            discount,
        };
    });

    await OrderItem.insertMany(orderItems);
    for (const item of cart.items) {
        const product = item.productId;
        product.stock = Math.max(0, (product.stock || 0) - item.quantity);
        await product.save();
    }
    // Optional: Clear cart after checkout
    cart.items = [];
    await cart.save();

    res.status(201).json({
        message: "Checkout completed successfully.",
        order: savedOrder,
    });
});

// userid, addressId, promocodeId
// Add a new order with multiple products
exports.addOrder = asyncHandler(async (req, res) => {
    const {
        userId,
        orderDate,
        orderStatus,
        delAddressId,
        shippingCharge,
        products,
        paymentMode,
    } = req.body;

    // Validate if products are provided
    if (!products || products.length === 0) {
        throw new ApiError(400, "At least one product is required.");
    }

    // Calculate the total order price
    let totalAmount = 0;
    for (let product of products) {
        const { productId, quantity } = product;
        const foundProduct = await Product.findById(productId);

        if (!foundProduct) {
            throw new ApiError(400, `Product with id ${productId} not found.`);
        }

        totalAmount +=
            (foundProduct.salePrice -
                (foundProduct.salePrice * foundProduct.discount) / 100) *
            quantity;
    }

    // Create the order
    const newOrder = new Order({
        userId,
        orderDate,
        orderStatus: orderStatus || "Pending",
        delAddressId,
        shippingCharge,
        total: totalAmount + parseFloat(shippingCharge),
        paymentMode: paymentMode || "Cash on Delivery",
        paymentStatus: "Pending",
    });

    // Save the order
    const savedOrder = await newOrder.save();
    console.log(products);
    // Create order items for each product
    const orderItems = await Promise.all(
        products.map(async (product) => {
            const foundProduct = await Product.findById(product.productId);
            return {
                orderId: savedOrder._id,
                productId: product.productId,
                quantity: product.quantity,
                price: foundProduct.salePrice,
            };
        })
    );

    // Save order items
    await OrderItem.insertMany(orderItems);

    res.status(201).json({
        message: "Order created successfully.",
        order: savedOrder,
    });
});

exports.updateOrder = asyncHandler(async (req, res) => {
    const {
        userId,
        orderDate,
        orderStatus,
        delAddressId,
        shippingCharge,
        products,
        paymentMode,
    } = req.body;
    const { orderId } = req.params;

    // Validate order existence
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
        throw new ApiError(404, "Order not found.");
    }

    // Validate products
    if (!products || products.length === 0) {
        throw new ApiError(400, "At least one product is required.");
    }

    // Calculate new total amount
    let totalAmount = 0;
    for (let product of products) {
        const { productId, quantity } = product;
        const foundProduct = await Product.findById(productId);
        if (!foundProduct) {
            throw new ApiError(400, `Product with id ${productId} not found.`);
        }

        totalAmount +=
            (foundProduct.salePrice -
                (foundProduct.salePrice * foundProduct.discount) / 100) *
            quantity;
    }

    // Update order details
    existingOrder.userId = userId;
    existingOrder.orderDate = orderDate;
    existingOrder.orderStatus = orderStatus || existingOrder.orderStatus;
    existingOrder.delAddressId = delAddressId;
    existingOrder.shippingCharge = shippingCharge;
    existingOrder.total = totalAmount + parseFloat(shippingCharge);
    existingOrder.paymentMode = paymentMode || existingOrder.paymentMode;

    const updatedOrder = await existingOrder.save();

    // Delete old order items
    await OrderItem.deleteMany({ orderId });

    // Create new order items
    const orderItems = await Promise.all(
        products.map(async (product) => {
            const foundProduct = await Product.findById(product.productId);
            return {
                orderId: updatedOrder._id,
                productId: product.productId,
                quantity: product.quantity,
                price: foundProduct.salePrice,
                discount: foundProduct.discount || 0,
            };
        })
    );

    await OrderItem.insertMany(orderItems);

    res.status(200).json({
        message: "Order updated successfully.",
        order: updatedOrder,
    });
});

// Fetch multiple orders (supporting filtering by deleted status)
exports.getOrders = asyncHandler(async (req, res) => {
    const { includeDeleted = "false" } = req.query; // Exclude deleted orders by default
    const deletedFilter = includeDeleted === "true" ? {} : { isDeleted: false };

    const orders = await Order.find(deletedFilter)
        .populate("userId", "name email") // Populate user info if needed
        .populate("delAddressId", "street city state zipCode") // Populate address info if needed
        .populate({
            path: "products",
            populate: {
                path: "productId",
                select: "name price",
            },
        })
        .exec();

    res.status(200).json({ orders });
});

// Mark an order as deleted (soft delete)
exports.markOrderAsDeleted = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found.");
    }

    order.isDeleted = true;
    await order.save();

    res.status(200).json({ message: "Order marked as deleted." });
});

// Fetch only non-deleted orders
exports.getActiveOrders = asyncHandler(async (req, res) => {
    const activeOrders = await Order.find({ isDeleted: false })
        .populate("userId")
        .populate("delAddressId", "street city state zipCode")
        .exec();

    res.status(200).json({ orders: activeOrders });
});

// Fetch a single order by ID (include products and address)
exports.getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    // Fetch the order and populate necessary fields
    const order = await Order.findById(orderId)
        .populate("userId") // Populate user details (including name, email, etc.)
        .populate("delAddressId") // Populate delivery address (including street, city, state, etc.)
        .populate("offerId") // Offer applied to the order
        .exec();

    // If the order is not found, return 404
    if (!order) {
        throw new ApiError(404, "Order not found.");
    }

    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        throw new ApiError(403, "Unauthorized access");
    }

    // Fetch all OrderItems related to this order and populate productId for each item
    const orderItems = await OrderItem.find({ orderId: orderId })
        .populate("productId", "productName productImage")
        .select("-orderId -_id") // Populate product details (including name, price, salePrice, etc.)
        .exec();

    // Check if no order items are found
    if (!orderItems || orderItems.length === 0) {
        throw new ApiError(404, "No order items found.");
    }

    // Return the populated order with all related data
    res.status(200).json({ order, orderItems });
});

exports.hasUserPurchasedProduct = asyncHandler(async (req, res) => {
    const { userId, productId } = req.params;

    // Step 1: Find all non-deleted orders by the user
    const userOrders = await Order.find({ userId, isDeleted: false }).select(
        "_id"
    );

    const orderIds = userOrders.map((order) => order._id);

    if (orderIds.length === 0) {
        return res.status(200).json({ purchased: false });
    }

    // Step 2: Check if any order items match the productId and belong to those orders
    const orderItem = await OrderItem.findOne({
        orderId: { $in: orderIds },
        productId: productId,
    });

    const hasPurchased = !!orderItem;

    res.status(200).json({ purchased: hasPurchased });
});

exports.getOrdersByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized access");
    }

    const orders = await Order.find({ userId, isDeleted: false })
        .populate("delAddressId")
        .sort({ orderDate: -1 });

    res.status(200).json({ orders });
});
