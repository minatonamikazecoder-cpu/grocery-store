"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProducts = exports.getProductsByCategoryId = exports.deleteProduct = exports.updateProduct = exports.getLatestProducts = exports.getTrendingProducts = exports.getAllProducts = exports.createProduct = exports.getProductById = void 0;
const typeorm_1 = require("typeorm");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const cloudinary_1 = require("../utils/cloudinary");
const data_source_1 = require("../db/data-source");
const Product_1 = require("../models/Product");
const Review_1 = require("../models/Review");
const OrderItem_1 = require("../models/OrderItem");
// Get single product by ID with average rating
exports.getProductById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const productRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
    const product = await productRepo.findOne({
        where: { id: req.params.id },
        relations: { category: true },
    });
    if (!product || !product.isActive) {
        throw new ApiError_1.ApiError(404, "Product not found");
    }
    // Calculate average rating for the product
    const reviewStats = await data_source_1.AppDataSource.getRepository(Review_1.Review)
        .createQueryBuilder("review")
        .select("AVG(review.rating)", "averageRating")
        .addSelect("COUNT(review.id)", "reviewCount")
        .where("review.productId = :productId", { productId: product.id })
        .getRawOne();
    const avgRating = parseFloat(reviewStats?.averageRating || "0");
    const totalReviews = parseInt(reviewStats?.reviewCount || "0", 10);
    const productData = {
        ...product,
        _id: product.id,
        categoryId: product.category, // populated Category object
        averageRating: avgRating.toFixed(1),
        totalReviews,
    };
    res.status(200).json(new ApiResponse_1.ApiResponse(200, productData, "Product fetched successfully").toJSON());
});
// Create a new product
exports.createProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productName, description, discount, costPrice, salePrice, stock, categoryId, } = req.body;
    if (!req.file) {
        throw new ApiError_1.ApiError(400, "Product image is required");
    }
    const localPath = req.file.path;
    const imageUrl = await (0, cloudinary_1.uploadImage)(localPath, "products");
    const productRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
    const newProduct = productRepo.create({
        productName,
        description,
        discount: discount ? parseFloat(discount) : 0,
        costPrice: costPrice ? parseFloat(costPrice) : 0,
        salePrice: salePrice ? parseFloat(salePrice) : 0,
        stock: stock ? parseInt(stock, 10) : 0,
        categoryId,
        productImage: imageUrl,
        isActive: true,
    });
    await productRepo.save(newProduct);
    const productData = {
        ...newProduct,
        _id: newProduct.id,
    };
    res.status(201).json(new ApiResponse_1.ApiResponse(201, productData, "Product created successfully").toJSON());
});
// Get all active products with pagination
exports.getAllProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;
    const productRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
    // Step 1: Get active products with pagination
    const [products, total] = await productRepo.findAndCount({
        where: { isActive: true },
        relations: { category: true },
        skip,
        take: limit,
    });
    let enrichedProducts = [];
    if (products.length > 0) {
        const productIds = products.map((p) => p.id);
        // Step 2: Aggregate reviews to get avg rating and total count for each product
        const reviewRepo = data_source_1.AppDataSource.getRepository(Review_1.Review);
        const reviewStats = await reviewRepo
            .createQueryBuilder("review")
            .select("review.productId", "productId")
            .addSelect("AVG(review.rating)", "avgRating")
            .addSelect("COUNT(review.id)", "totalReviews")
            .where("review.productId IN (:...productIds)", { productIds })
            .groupBy("review.productId")
            .getRawMany();
        // Step 3: Convert stats into a lookup map
        const reviewMap = {};
        reviewStats.forEach((stat) => {
            reviewMap[stat.productId] = {
                avgRating: parseFloat(stat.avgRating || "0").toFixed(1),
                totalReviews: parseInt(stat.totalReviews || "0", 10),
            };
        });
        // Step 4: Append stats to each product
        enrichedProducts = products.map((product) => {
            const stats = reviewMap[product.id] || {
                avgRating: "0.0",
                totalReviews: 0,
            };
            return {
                ...product,
                _id: product.id,
                categoryId: product.category, // populated Category object
                averageRating: stats.avgRating,
                totalReviews: stats.totalReviews,
            };
        });
    }
    res.status(200).json(new ApiResponse_1.ApiResponse(200, enrichedProducts, "Products fetched successfully", {
        total,
        page,
        totalPages: Math.ceil(total / limit),
    }).toJSON());
});
exports.getTrendingProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Step 1: Aggregate sales count from OrderItem using QueryBuilder
    const salesStats = await data_source_1.AppDataSource.getRepository(OrderItem_1.OrderItem)
        .createQueryBuilder("orderItem")
        .select("orderItem.productId", "productId")
        .addSelect("SUM(orderItem.quantity)", "salesCount")
        .groupBy("orderItem.productId")
        .orderBy("SUM(orderItem.quantity)", "DESC")
        .limit(8)
        .getRawMany();
    const topProductIds = salesStats.map((item) => item.productId).filter(Boolean);
    let enriched = [];
    if (topProductIds.length > 0) {
        // Step 2: Get product details
        const productRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
        const products = await productRepo.find({
            where: {
                id: (0, typeorm_1.In)(topProductIds),
                isActive: true,
            },
            relations: { category: true },
        });
        // Step 3: Get review stats
        const reviewRepo = data_source_1.AppDataSource.getRepository(Review_1.Review);
        const reviewStats = await reviewRepo
            .createQueryBuilder("review")
            .select("review.productId", "productId")
            .addSelect("AVG(review.rating)", "avgRating")
            .addSelect("COUNT(review.id)", "totalReviews")
            .where("review.productId IN (:...topProductIds)", { topProductIds })
            .groupBy("review.productId")
            .getRawMany();
        const reviewMap = {};
        reviewStats.forEach((stat) => {
            reviewMap[stat.productId] = {
                avgRating: parseFloat(stat.avgRating || "0").toFixed(1),
                totalReviews: parseInt(stat.totalReviews || "0", 10),
            };
        });
        // Step 4: Enrich products
        enriched = products.map((product) => {
            const stats = reviewMap[product.id] || {
                avgRating: "0.0",
                totalReviews: 0,
            };
            return {
                ...product,
                _id: product.id,
                categoryId: product.category, // populated Category object
                averageRating: stats.avgRating,
                totalReviews: stats.totalReviews,
            };
        });
        // Sort to maintain trending rank order
        enriched.sort((a, b) => topProductIds.indexOf(a.id) - topProductIds.indexOf(b.id));
    }
    res.status(200).json(new ApiResponse_1.ApiResponse(200, enriched, "Trending products fetched successfully").toJSON());
});
exports.getLatestProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Step 1: Get latest products
    const productRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
    const products = await productRepo.find({
        where: { isActive: true },
        order: { createdAt: "DESC" },
        take: 8,
        relations: { category: true },
    });
    let enriched = [];
    if (products.length > 0) {
        const productIds = products.map((p) => p.id);
        // Step 2: Get review stats
        const reviewRepo = data_source_1.AppDataSource.getRepository(Review_1.Review);
        const reviewStats = await reviewRepo
            .createQueryBuilder("review")
            .select("review.productId", "productId")
            .addSelect("AVG(review.rating)", "avgRating")
            .addSelect("COUNT(review.id)", "totalReviews")
            .where("review.productId IN (:...productIds)", { productIds })
            .groupBy("review.productId")
            .getRawMany();
        const reviewMap = {};
        reviewStats.forEach((stat) => {
            reviewMap[stat.productId] = {
                avgRating: parseFloat(stat.avgRating || "0").toFixed(1),
                totalReviews: parseInt(stat.totalReviews || "0", 10),
            };
        });
        // Step 3: Enrich products
        enriched = products.map((product) => {
            const stats = reviewMap[product.id] || {
                avgRating: "0.0",
                totalReviews: 0,
            };
            return {
                ...product,
                _id: product.id,
                categoryId: product.category, // populated Category object
                averageRating: stats.avgRating,
                totalReviews: stats.totalReviews,
            };
        });
    }
    res.status(200).json(new ApiResponse_1.ApiResponse(200, enriched, "Latest products fetched successfully").toJSON());
});
// Update product by ID
exports.updateProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productName, description, discount, costPrice, salePrice, stock, categoryId, } = req.body;
    const productRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
    const product = await productRepo.findOneBy({ id: req.params.id });
    if (!product || !product.isActive) {
        throw new ApiError_1.ApiError(404, "Product not found");
    }
    // Handle image replacement if a new file is uploaded
    if (req.file) {
        const localPath = req.file.path;
        // Delete old image if it exists
        if (product.productImage) {
            const matches = product.productImage.match(/\/([^/]+)\.(jpg|jpeg|png|gif)$/i);
            if (matches && matches[1]) {
                const publicId = `products/${matches[1]}`;
                await (0, cloudinary_1.deleteImage)(publicId);
            }
        }
        const newImageUrl = await (0, cloudinary_1.uploadImage)(localPath, "products");
        product.productImage = newImageUrl;
    }
    // Update fields
    if (productName !== undefined)
        product.productName = productName;
    if (description !== undefined)
        product.description = description;
    if (discount !== undefined)
        product.discount = parseFloat(discount);
    if (costPrice !== undefined)
        product.costPrice = parseFloat(costPrice);
    if (salePrice !== undefined)
        product.salePrice = parseFloat(salePrice);
    if (stock !== undefined)
        product.stock = parseInt(stock, 10);
    if (categoryId !== undefined)
        product.categoryId = categoryId;
    await productRepo.save(product);
    const productData = {
        ...product,
        _id: product.id,
    };
    res.status(200).json(new ApiResponse_1.ApiResponse(200, productData, "Product updated successfully").toJSON());
});
// Soft delete (mark as inactive)
exports.deleteProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const productRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
    const product = await productRepo.findOneBy({ id: req.params.id });
    if (!product || !product.isActive) {
        throw new ApiError_1.ApiError(404, "Product not found");
    }
    product.isActive = false;
    await productRepo.save(product);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, null, "Product marked as inactive successfully").toJSON());
});
// Get products by category ID with pagination
exports.getProductsByCategoryId = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const categoryId = req.params.categoryId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;
    const productRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
    // Step 1: Get all active products for the given category
    const [products, total] = await productRepo.findAndCount({
        where: { categoryId, isActive: true },
        relations: { category: true },
        skip,
        take: limit,
    });
    if (products.length === 0) {
        throw new ApiError_1.ApiError(404, "No products found in this category");
    }
    const productIds = products.map((p) => p.id);
    // Step 2: Get aggregated review data
    const reviewRepo = data_source_1.AppDataSource.getRepository(Review_1.Review);
    const reviewStats = await reviewRepo
        .createQueryBuilder("review")
        .select("review.productId", "productId")
        .addSelect("AVG(review.rating)", "avgRating")
        .addSelect("COUNT(review.id)", "totalReviews")
        .where("review.productId IN (:...productIds)", { productIds })
        .groupBy("review.productId")
        .getRawMany();
    const reviewMap = {};
    reviewStats.forEach((stat) => {
        reviewMap[stat.productId] = {
            avgRating: parseFloat(stat.avgRating || "0").toFixed(1),
            totalReviews: parseInt(stat.totalReviews || "0", 10),
        };
    });
    // Step 3: Enrich and respond
    const enriched = products.map((product) => {
        const stats = reviewMap[product.id] || {
            avgRating: "0.0",
            totalReviews: 0,
        };
        return {
            ...product,
            _id: product.id,
            categoryId: product.category, // populated Category object
            averageRating: stats.avgRating,
            totalReviews: stats.totalReviews,
        };
    });
    res.status(200).json(new ApiResponse_1.ApiResponse(200, enriched, "Products by category fetched successfully", {
        total,
        page,
        totalPages: Math.ceil(total / limit),
    }).toJSON());
});
// Search active products by term q
exports.searchProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const q = req.query.q;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;
    if (!q || q.trim().length < 2) {
        throw new ApiError_1.ApiError(400, "Search query must be at least 2 characters");
    }
    const productRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
    const queryTerm = `%${q.trim().toLowerCase()}%`;
    const [products, total] = await productRepo
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.category", "category")
        .where("product.isActive = :isActive", { isActive: true })
        .andWhere("(LOWER(product.productName) LIKE :q OR LOWER(product.description) LIKE :q)", { q: queryTerm })
        .skip(skip)
        .take(limit)
        .getManyAndCount();
    let enrichedProducts = [];
    if (products.length > 0) {
        const productIds = products.map((p) => p.id);
        const reviewRepo = data_source_1.AppDataSource.getRepository(Review_1.Review);
        const reviewStats = await reviewRepo
            .createQueryBuilder("review")
            .select("review.productId", "productId")
            .addSelect("AVG(review.rating)", "avgRating")
            .addSelect("COUNT(review.id)", "totalReviews")
            .where("review.productId IN (:...productIds)", { productIds })
            .groupBy("review.productId")
            .getRawMany();
        const reviewMap = {};
        reviewStats.forEach((stat) => {
            reviewMap[stat.productId] = {
                avgRating: parseFloat(stat.avgRating || "0").toFixed(1),
                totalReviews: parseInt(stat.totalReviews || "0", 10),
            };
        });
        enrichedProducts = products.map((product) => {
            const stats = reviewMap[product.id] || {
                avgRating: "0.0",
                totalReviews: 0,
            };
            return {
                ...product,
                _id: product.id,
                categoryId: product.category,
                averageRating: stats.avgRating,
                totalReviews: stats.totalReviews,
            };
        });
    }
    res.status(200).json(new ApiResponse_1.ApiResponse(200, enrichedProducts, "Products searched successfully", {
        total,
        page,
        totalPages: Math.ceil(total / limit),
    }).toJSON());
});
