"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWishlist = exports.removeFromWishlist = exports.addToWishlist = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const data_source_1 = require("../db/data-source");
const Wishlist_1 = require("../models/Wishlist");
const WishlistItem_1 = require("../models/WishlistItem");
const Product_1 = require("../models/Product");
// Helper function to get and map wishlist to match Mongoose schema (containing productIds array)
const getMappedWishlist = async (userId) => {
    const wishlistRepo = data_source_1.AppDataSource.getRepository(Wishlist_1.Wishlist);
    const wishlist = await wishlistRepo.findOne({
        where: { userId },
        relations: {
            items: {
                product: true
            }
        }
    });
    if (!wishlist)
        return null;
    return {
        id: wishlist.id,
        userId: wishlist.userId,
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt,
        productIds: wishlist.items ? wishlist.items.map(item => item.product).filter(Boolean) : []
    };
};
// Add product to the user's wishlist
exports.addToWishlist = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId } = req.body;
    const userId = req.params.userId;
    if (!req.user || (req.user.id !== userId && req.user.role !== 'Admin')) {
        throw new ApiError_1.ApiError(403, "Unauthorized access");
    }
    // Check if the product exists
    const productRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
    const product = await productRepo.findOneBy({ id: productId });
    if (!product) {
        throw new ApiError_1.ApiError(404, "Product not found");
    }
    const wishlistRepo = data_source_1.AppDataSource.getRepository(Wishlist_1.Wishlist);
    const wishlistItemRepo = data_source_1.AppDataSource.getRepository(WishlistItem_1.WishlistItem);
    // Check if the user's wishlist already exists
    let wishlist = await wishlistRepo.findOneBy({ userId });
    if (!wishlist) {
        // If no wishlist exists, create one
        wishlist = wishlistRepo.create({ userId });
        wishlist = await wishlistRepo.save(wishlist);
    }
    // Check if WishlistItem for product exists
    const item = await wishlistItemRepo.findOneBy({ wishlistId: wishlist.id, productId });
    if (item) {
        throw new ApiError_1.ApiError(400, "Product already in wishlist");
    }
    // Insert WishlistItem
    const newItem = wishlistItemRepo.create({
        wishlistId: wishlist.id,
        productId
    });
    await wishlistItemRepo.save(newItem);
    const mappedWishlist = await getMappedWishlist(userId);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, mappedWishlist, "Product added to wishlist").toJSON());
});
// Remove product from the user's wishlist
exports.removeFromWishlist = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId } = req.body;
    const userId = req.params.userId;
    if (!req.user || (req.user.id !== userId && req.user.role !== 'Admin')) {
        throw new ApiError_1.ApiError(403, "Unauthorized access");
    }
    const wishlistRepo = data_source_1.AppDataSource.getRepository(Wishlist_1.Wishlist);
    const wishlistItemRepo = data_source_1.AppDataSource.getRepository(WishlistItem_1.WishlistItem);
    // Find the user's wishlist
    const wishlist = await wishlistRepo.findOneBy({ userId });
    if (!wishlist) {
        throw new ApiError_1.ApiError(404, "Wishlist not found");
    }
    // Find the WishlistItem
    const item = await wishlistItemRepo.findOneBy({ wishlistId: wishlist.id, productId });
    if (!item) {
        throw new ApiError_1.ApiError(400, "Product not in wishlist");
    }
    // Delete WishlistItem row
    await wishlistItemRepo.remove(item);
    const mappedWishlist = await getMappedWishlist(userId);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, mappedWishlist, "Product removed from wishlist").toJSON());
});
// Get the user's wishlist
exports.getWishlist = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.params.userId;
    if (!req.user || (req.user.id !== userId && req.user.role !== 'Admin')) {
        throw new ApiError_1.ApiError(403, "Unauthorized access");
    }
    const mappedWishlist = await getMappedWishlist(userId);
    if (!mappedWishlist) {
        res.status(200).json(new ApiResponse_1.ApiResponse(200, {
            userId,
            productIds: []
        }, "Wishlist fetched successfully").toJSON());
        return;
    }
    res.status(200).json(new ApiResponse_1.ApiResponse(200, mappedWishlist, "Wishlist fetched successfully").toJSON());
});
