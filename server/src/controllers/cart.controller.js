const Cart = require("../models/Cart");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const addToCart = asyncHandler(async (req, res) => {
    const { userId, productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = new Cart({ userId, items: [{ productId, quantity }] });
        await cart.save();
    } else {
        const itemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );
        if (itemIndex >= 0) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }
        await cart.save();
    }

    res.status(201).json(cart);
});

const getCartByUserId = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate(
        "items.productId"
    );
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }
    res.status(200).json(cart);
});

const updateCartItem = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.params.userId });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
    );
    if (itemIndex >= 0) {
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        res.status(200).json(cart);
    } else {
        throw new ApiError(404, "Product not in cart");
    }
});

const removeCartItem = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const cart = await Cart.findOne({ userId: req.params.userId });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
    );
    if (itemIndex >= 0) {
        cart.items.splice(itemIndex, 1);
        await cart.save();
        res.status(200).json(cart);
    } else {
        throw new ApiError(404, "Product not in cart");
    }
});

const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ userId: req.params.userId });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.items = [];
    await cart.save();
    res.status(200).json({ message: "Cart cleared successfully" });
});

module.exports = {
    addToCart,
    getCartByUserId,
    updateCartItem,
    removeCartItem,
    clearCart,
};
