import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { AppDataSource } from "../db/data-source";
import { Wishlist } from "../models/Wishlist";
import { WishlistItem } from "../models/WishlistItem";
import { Product } from "../models/Product";

// Helper function to get and map wishlist to match Mongoose schema (containing productIds array)
const getMappedWishlist = async (userId: string) => {
    const wishlistRepo = AppDataSource.getRepository(Wishlist);
    const wishlist = await wishlistRepo.findOne({
        where: { userId },
        relations: {
            items: {
                product: true
            }
        }
    });
    if (!wishlist) return null;
    return {
        id: wishlist.id,
        userId: wishlist.userId,
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt,
        productIds: wishlist.items ? wishlist.items.map(item => item.product).filter(Boolean) : []
    };
};

// Add product to the user's wishlist
export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.body;
    const userId = req.params.userId as string;

    if (!req.user || (req.user.id !== userId && req.user.role !== 'Admin')) {
        throw new ApiError(403, "Unauthorized access");
    }

    // Check if the product exists
    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOneBy({ id: productId });
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const wishlistRepo = AppDataSource.getRepository(Wishlist);
    const wishlistItemRepo = AppDataSource.getRepository(WishlistItem);

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
        throw new ApiError(400, "Product already in wishlist");
    }

    // Insert WishlistItem
    const newItem = wishlistItemRepo.create({
        wishlistId: wishlist.id,
        productId
    });
    await wishlistItemRepo.save(newItem);

    const mappedWishlist = await getMappedWishlist(userId);
    res.status(200).json(new ApiResponse(200, mappedWishlist, "Product added to wishlist").toJSON());
});

// Remove product from the user's wishlist
export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.body;
    const userId = req.params.userId as string;

    if (!req.user || (req.user.id !== userId && req.user.role !== 'Admin')) {
        throw new ApiError(403, "Unauthorized access");
    }

    const wishlistRepo = AppDataSource.getRepository(Wishlist);
    const wishlistItemRepo = AppDataSource.getRepository(WishlistItem);

    // Find the user's wishlist
    const wishlist = await wishlistRepo.findOneBy({ userId });

    if (!wishlist) {
        throw new ApiError(404, "Wishlist not found");
    }

    // Find the WishlistItem
    const item = await wishlistItemRepo.findOneBy({ wishlistId: wishlist.id, productId });
    if (!item) {
        throw new ApiError(400, "Product not in wishlist");
    }

    // Delete WishlistItem row
    await wishlistItemRepo.remove(item);

    const mappedWishlist = await getMappedWishlist(userId);
    res.status(200).json(new ApiResponse(200, mappedWishlist, "Product removed from wishlist").toJSON());
});

// Get the user's wishlist
export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId as string;

    if (!req.user || (req.user.id !== userId && req.user.role !== 'Admin')) {
        throw new ApiError(403, "Unauthorized access");
    }

    const mappedWishlist = await getMappedWishlist(userId);

    if (!mappedWishlist) {
        res.status(200).json(new ApiResponse(200, {
            userId,
            productIds: []
        }, "Wishlist fetched successfully").toJSON());
        return;
    }

    res.status(200).json(new ApiResponse(200, mappedWishlist, "Wishlist fetched successfully").toJSON());
});
