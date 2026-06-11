const UserWishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// Add product to the user's wishlist
const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const { userId } = req.params;

    if (req.user._id.toString() !== userId.toString() && req.user.role !== 'Admin') {
        throw new ApiError(403, "Unauthorized access");
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Check if the user's wishlist already exists
    let wishlist = await UserWishlist.findOne({ userId });

    if (!wishlist) {
        // If no wishlist exists, create one with the productId
        wishlist = new UserWishlist({
            userId,
            productIds: [productId],
        });
    } else {
        // If wishlist exists, add productId to the wishlist if it's not already there
        if (!wishlist.productIds.includes(productId)) {
            wishlist.productIds.push(productId);
        } else {
            throw new ApiError(400, "Product already in wishlist");
        }
    }

    // Save the wishlist to the database
    await wishlist.save();
    return res.status(200).json({ message: "Product added to wishlist", wishlist });
});

// Remove product from the user's wishlist
const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const { userId } = req.params;

    if (req.user._id.toString() !== userId.toString() && req.user.role !== 'Admin') {
        throw new ApiError(403, "Unauthorized access");
    }

    // Find the user's wishlist
    const wishlist = await UserWishlist.findOne({ userId });

    if (!wishlist) {
        throw new ApiError(404, "Wishlist not found");
    }

    // Remove the productId from the wishlist
    const productIndex = wishlist.productIds.indexOf(productId);
    if (productIndex > -1) {
        wishlist.productIds.splice(productIndex, 1); // Remove the productId
        await wishlist.save();
        return res.status(200).json({ message: "Product removed from wishlist", wishlist });
    } else {
        throw new ApiError(400, "Product not in wishlist");
    }
});

// Get the user's wishlist
const getWishlist = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId.toString() && req.user.role !== 'Admin') {
        throw new ApiError(403, "Unauthorized access");
    }

    // Find the user's wishlist
    const wishlist = await UserWishlist.findOne({ userId }).populate('productIds');

    if (!wishlist) {
        throw new ApiError(404, "Wishlist not found");
    }

    return res.status(200).json({ wishlist });
});

module.exports = {
    addToWishlist,
    removeFromWishlist,
    getWishlist
};
