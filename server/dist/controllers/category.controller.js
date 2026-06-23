"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.softDeleteCategory = exports.updateCategory = exports.getCategoryById = exports.getAllCategories = exports.createCategory = void 0;
const Category_1 = require("../models/Category");
const cloudinary_1 = require("../utils/cloudinary");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const data_source_1 = require("../db/data-source");
exports.createCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw new ApiError_1.ApiError(400, "Image is required");
    }
    const imageUrl = await (0, cloudinary_1.uploadImage)(req.file.path, "categories");
    const categoryRepository = data_source_1.AppDataSource.getRepository(Category_1.Category);
    const category = categoryRepository.create({
        name: req.body.name,
        color: req.body.color,
        image: imageUrl,
    });
    const savedCategory = await categoryRepository.save(category);
    res.status(201).json(new ApiResponse_1.ApiResponse(201, savedCategory, "Category created successfully").toJSON());
});
// Get all categories
exports.getAllCategories = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const categoryRepository = data_source_1.AppDataSource.getRepository(Category_1.Category);
    const categories = await categoryRepository.find({ where: { isDeleted: false } });
    res.status(200).json(new ApiResponse_1.ApiResponse(200, categories, "Categories fetched successfully").toJSON());
});
// Get a single category by ID
exports.getCategoryById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const categoryRepository = data_source_1.AppDataSource.getRepository(Category_1.Category);
    const category = await categoryRepository.findOneBy({ id: req.params.id });
    if (!category || category.isDeleted) {
        throw new ApiError_1.ApiError(404, "Category not found");
    }
    res.status(200).json(new ApiResponse_1.ApiResponse(200, category, "Category fetched successfully").toJSON());
});
exports.updateCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, color } = req.body;
    const categoryRepository = data_source_1.AppDataSource.getRepository(Category_1.Category);
    const category = await categoryRepository.findOneBy({ id: req.params.id });
    if (!category || category.isDeleted) {
        throw new ApiError_1.ApiError(404, "Category not found");
    }
    let imageUrl = category.image;
    // If new image is uploaded
    if (req.file) {
        // Delete old image from Cloudinary
        if (category.image) {
            await (0, cloudinary_1.deleteImage)(category.image);
        }
        // Upload new image
        imageUrl = await (0, cloudinary_1.uploadImage)(req.file.path, "categories");
    }
    // Update fields
    category.name = name || category.name;
    category.color = color || category.color;
    category.image = imageUrl;
    const updatedCategory = await categoryRepository.save(category);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, updatedCategory, "Category updated successfully").toJSON());
});
// Soft delete a category
exports.softDeleteCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const categoryRepository = data_source_1.AppDataSource.getRepository(Category_1.Category);
    const category = await categoryRepository.findOneBy({ id: req.params.id });
    if (!category) {
        throw new ApiError_1.ApiError(404, "Category not found");
    }
    // Delete the image from Cloudinary if it exists
    if (category.image) {
        await (0, cloudinary_1.deleteImage)(category.image);
    }
    // Soft delete category
    category.isDeleted = true;
    const saved = await categoryRepository.save(category);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, saved, "Category soft deleted successfully").toJSON());
});
