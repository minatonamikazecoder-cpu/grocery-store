const Category = require("../models/Category");
const { uploadImage, deleteImage } = require("../utils/cloudinary");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const createCategory = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Image is required");
    }

    const imageUrl = await uploadImage(req.file.path, "categories");

    const category = new Category({
        name: req.body.name,
        color: req.body.color,
        image: imageUrl,
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
});

// Get all categories
const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isDeleted: false }).lean();
    res.status(200).json(categories);
});

// Get a single category by ID
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category || category.isDeleted) {
        throw new ApiError(404, "Category not found");
    }
    res.status(200).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
    const { name, color } = req.body;

    // Find the existing category
    const category = await Category.findById(req.params.id);
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

    const updatedCategory = await category.save();

    res.status(200).json(updatedCategory);
});

// Soft delete a category
const softDeleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    // Delete the image from Cloudinary if it exists
    if (category.image) {
        await deleteImage(category.image);
    }

    // Soft delete category
    category.isDeleted = true;
    await category.save();

    res.status(200).json({ message: "Category soft deleted", data: category });
});

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    softDeleteCategory,
};
