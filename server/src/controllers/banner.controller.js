const Banner = require("../models/Banner");
const { uploadImage, deleteImage } = require("../utils/cloudinary");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const addBanner = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Banner image is required");
    }

    const imageUrl = await uploadImage(req.file.path, "banners");

    const banner = new Banner({
        bannerImage: imageUrl,
        viewOrder: req.body.viewOrder,
        activeStatus: req.body.activeStatus,
    });

    const savedBanner = await banner.save();
    res.status(201).json(savedBanner);
});

const getAllBanners = asyncHandler(async (req, res) => {
    const banners = await Banner.find();
    res.status(200).json(banners);
});

const getBannerById = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.bannerId);
    if (!banner || banner.isDeleted) {
        throw new ApiError(404, "Banner not found");
    }
    res.status(200).json(banner);
});

const updateBanner = asyncHandler(async (req, res) => {
    const { viewOrder, activeStatus, type } = req.body;

    const banner = await Banner.findById(req.params.bannerId);
    if (!banner || banner.isDeleted) {
        throw new ApiError(404, "Banner not found");
    }

    let imageUrl = banner.bannerImage;

    if (req.file) {
        if (banner.bannerImage) {
            await deleteImage(banner.bannerImage);
        }
        imageUrl = await uploadImage(req.file.path, "banners");
    }

    banner.viewOrder = viewOrder || banner.viewOrder;
    banner.activeStatus = activeStatus || banner.activeStatus;
    banner.bannerImage = imageUrl;
    banner.type = type || banner.type; // Update type field

    const updatedBanner = await banner.save();
    res.status(200).json(updatedBanner);
});

const deleteBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.bannerId);
    if (!banner) {
        throw new ApiError(404, "Banner not found");
    }

    if (banner.bannerImage) {
        await deleteImage(banner.bannerImage);
    }

    await Banner.findByIdAndDelete(req.params.bannerId);
    res.status(200).json({ message: "Banner deleted successfully" });
});

const toggleBannerStatus = asyncHandler(async (req, res) => {
    const { bannerId } = req.params;
    const { status } = req.body;

    if (typeof status !== "boolean") {
        throw new ApiError(400, "Status must be a boolean");
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
        bannerId,
        { activeStatus: status },
        { new: true }
    );

    if (!updatedBanner) {
        throw new ApiError(404, "Banner not found");
    }

    res.status(200).json({
        message: `Banner ${status ? "activated" : "deactivated"} successfully`,
        banner: updatedBanner,
    });
});

module.exports = {
    addBanner,
    getAllBanners,
    getBannerById,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
};
