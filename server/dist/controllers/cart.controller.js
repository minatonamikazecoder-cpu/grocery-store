"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.getCartByUserId = exports.addToCart = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const data_source_1 = require("../db/data-source");
const Cart_1 = require("../models/Cart");
const CartItem_1 = require("../models/CartItem");
const formatCart = (cart) => {
    return {
        id: cart.id,
        userId: cart.userId,
        items: (cart.items || []).map((item) => ({
            productId: item.product,
            quantity: item.quantity,
        })),
    };
};
exports.addToCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, productId, quantity } = req.body;
    const customReq = req;
    if (customReq.user.id !== userId && customReq.user.role !== "Admin") {
        throw new ApiError_1.ApiError(403, "Unauthorized access");
    }
    const cartRepository = data_source_1.AppDataSource.getRepository(Cart_1.Cart);
    const cartItemRepository = data_source_1.AppDataSource.getRepository(CartItem_1.CartItem);
    let cart = await cartRepository.findOne({
        where: { userId },
        relations: { items: { product: true } },
    });
    if (!cart) {
        cart = cartRepository.create({ userId });
        cart = await cartRepository.save(cart);
    }
    let cartItem = await cartItemRepository.findOne({
        where: { cartId: cart.id, productId },
    });
    if (cartItem) {
        cartItem.quantity += quantity;
        await cartItemRepository.save(cartItem);
    }
    else {
        cartItem = cartItemRepository.create({
            cartId: cart.id,
            productId,
            quantity,
        });
        await cartItemRepository.save(cartItem);
    }
    const updatedCart = await cartRepository.findOne({
        where: { userId },
        relations: { items: { product: true } },
    });
    res.status(201).json(new ApiResponse_1.ApiResponse(201, formatCart(updatedCart), "Item added to cart successfully").toJSON());
});
exports.getCartByUserId = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const customReq = req;
    if (customReq.user.id !== req.params.userId && customReq.user.role !== "Admin") {
        throw new ApiError_1.ApiError(403, "Unauthorized access");
    }
    const cartRepository = data_source_1.AppDataSource.getRepository(Cart_1.Cart);
    const cart = await cartRepository.findOne({
        where: { userId: req.params.userId },
        relations: { items: { product: true } },
    });
    if (!cart) {
        throw new ApiError_1.ApiError(404, "Cart not found");
    }
    res.status(200).json(new ApiResponse_1.ApiResponse(200, formatCart(cart), "Cart fetched successfully").toJSON());
});
exports.updateCartItem = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const customReq = req;
    if (customReq.user.id !== req.params.userId && customReq.user.role !== "Admin") {
        throw new ApiError_1.ApiError(403, "Unauthorized access");
    }
    const { productId, quantity } = req.body;
    const cartRepository = data_source_1.AppDataSource.getRepository(Cart_1.Cart);
    const cart = await cartRepository.findOne({
        where: { userId: req.params.userId },
    });
    if (!cart) {
        throw new ApiError_1.ApiError(404, "Cart not found");
    }
    const cartItemRepository = data_source_1.AppDataSource.getRepository(CartItem_1.CartItem);
    const cartItem = await cartItemRepository.findOne({
        where: { cartId: cart.id, productId },
    });
    if (cartItem) {
        cartItem.quantity = quantity;
        await cartItemRepository.save(cartItem);
        const updatedCart = await cartRepository.findOne({
            where: { userId: req.params.userId },
            relations: { items: { product: true } },
        });
        res.status(200).json(new ApiResponse_1.ApiResponse(200, formatCart(updatedCart), "Cart item updated successfully").toJSON());
    }
    else {
        throw new ApiError_1.ApiError(404, "Product not in cart");
    }
});
exports.removeCartItem = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const customReq = req;
    if (customReq.user.id !== req.params.userId && customReq.user.role !== "Admin") {
        throw new ApiError_1.ApiError(403, "Unauthorized access");
    }
    const { productId } = req.body;
    const cartRepository = data_source_1.AppDataSource.getRepository(Cart_1.Cart);
    const cart = await cartRepository.findOne({
        where: { userId: req.params.userId },
    });
    if (!cart) {
        throw new ApiError_1.ApiError(404, "Cart not found");
    }
    const cartItemRepository = data_source_1.AppDataSource.getRepository(CartItem_1.CartItem);
    const cartItem = await cartItemRepository.findOne({
        where: { cartId: cart.id, productId },
    });
    if (cartItem) {
        await cartItemRepository.remove(cartItem);
        const updatedCart = await cartRepository.findOne({
            where: { userId: req.params.userId },
            relations: { items: { product: true } },
        });
        res.status(200).json(new ApiResponse_1.ApiResponse(200, formatCart(updatedCart), "Cart item removed successfully").toJSON());
    }
    else {
        throw new ApiError_1.ApiError(404, "Product not in cart");
    }
});
exports.clearCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const customReq = req;
    if (customReq.user.id !== req.params.userId && customReq.user.role !== "Admin") {
        throw new ApiError_1.ApiError(403, "Unauthorized access");
    }
    const cartRepository = data_source_1.AppDataSource.getRepository(Cart_1.Cart);
    const cart = await cartRepository.findOne({
        where: { userId: req.params.userId },
    });
    if (!cart) {
        throw new ApiError_1.ApiError(404, "Cart not found");
    }
    const cartItemRepository = data_source_1.AppDataSource.getRepository(CartItem_1.CartItem);
    await cartItemRepository.delete({ cartId: cart.id });
    res.status(200).json(new ApiResponse_1.ApiResponse(200, null, "Cart cleared successfully").toJSON());
});
