import { Request, Response } from "express";
import { Category } from "../models/Category";
import { uploadImage, deleteImage } from "../utils/cloudinary";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { AppDataSource } from "../db/data-source";

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new ApiError(400, "Image is required");
    }

    const imageUrl = await uploadImage(req.file.path, "categories");

    const categoryRepository = AppDataSource.getRepository(Category);
    const category = categoryRepository.create({
        name: req.body.name,
        color: req.body.color,
        image: imageUrl,
    });

    const savedCategory = await categoryRepository.save(category);
    res.status(201).json(new ApiResponse(201, savedCategory, "Category created successfully").toJSON());
});

// Get all categories
export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
    const categoryRepository = AppDataSource.getRepository(Category);
    const categories = await categoryRepository.find({ where: { isDeleted: false } });
    res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully").toJSON());
});

// Get a single category by ID
export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const categoryRepository = AppDataSource.getRepository(Category);
    const category = await categoryRepository.findOneBy({ id: req.params.id as string });
    if (!category || category.isDeleted) {
        throw new ApiError(404, "Category not found");
    }
    res.status(200).json(new ApiResponse(200, category, "Category fetched successfully").toJSON());
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const { name, color } = req.body;

    const categoryRepository = AppDataSource.getRepository(Category);
    const category = await categoryRepository.findOneBy({ id: req.params.id as string });
    if (!category || category.isDeleted) {
        throw new ApiError(404, "Category not found");
    }

    let imageUrl = category.image;

    // If new image is uploaded
    if (req.file) {
        // Delete old image from Cloudinary
        if (category.image) {
            await deleteImage(category.image);
        }

        // Upload new image
        imageUrl = await uploadImage(req.file.path, "categories");
    }

    // Update fields
    category.name = name || category.name;
    category.color = color || category.color;
    category.image = imageUrl;

    const updatedCategory = await categoryRepository.save(category);

    res.status(200).json(new ApiResponse(200, updatedCategory, "Category updated successfully").toJSON());
});

// Soft delete a category
export const softDeleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const categoryRepository = AppDataSource.getRepository(Category);
    const category = await categoryRepository.findOneBy({ id: req.params.id as string });

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    // Delete the image from Cloudinary if it exists
    if (category.image) {
        await deleteImage(category.image);
    }

    // Soft delete category
    category.isDeleted = true;
    const saved = await categoryRepository.save(category);

    res.status(200).json(new ApiResponse(200, saved, "Category soft deleted successfully").toJSON());
});
