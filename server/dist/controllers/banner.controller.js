"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleBannerStatus = exports.deleteBanner = exports.updateBanner = exports.getBannerById = exports.getAllBanners = exports.addBanner = void 0;
const Banner_1 = require("../models/Banner");
const cloudinary_1 = require("../utils/cloudinary");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const data_source_1 = require("../db/data-source");
exports.addBanner = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw new ApiError_1.ApiError(400, "Banner image is required");
    }
    const imageUrl = await (0, cloudinary_1.uploadImage)(req.file.path, "banners");
    const activeStatus = req.body.activeStatus === "true" || req.body.activeStatus === true;
    const bannerRepository = data_source_1.AppDataSource.getRepository(Banner_1.Banner);
    const banner = bannerRepository.create({
        bannerImage: imageUrl,
        viewOrder: parseInt(req.body.viewOrder) || 0,
        activeStatus,
    });
    const savedBanner = await bannerRepository.save(banner);
    res.status(201).json(savedBanner);
});
exports.getAllBanners = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const bannerRepository = data_source_1.AppDataSource.getRepository(Banner_1.Banner);
    const banners = await bannerRepository.find();
    res.status(200).json(banners);
});
exports.getBannerById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const bannerRepository = data_source_1.AppDataSource.getRepository(Banner_1.Banner);
    const banner = await bannerRepository.findOneBy({ id: req.params.bannerId });
    if (!banner) {
        throw new ApiError_1.ApiError(404, "Banner not found");
    }
    res.status(200).json(banner);
});
exports.updateBanner = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { viewOrder, activeStatus, type } = req.body;
    const bannerRepository = data_source_1.AppDataSource.getRepository(Banner_1.Banner);
    const banner = await bannerRepository.findOneBy({ id: req.params.bannerId });
    if (!banner) {
        throw new ApiError_1.ApiError(404, "Banner not found");
    }
    let imageUrl = banner.bannerImage;
    if (req.file) {
        if (banner.bannerImage) {
            await (0, cloudinary_1.deleteImage)(banner.bannerImage);
        }
        imageUrl = await (0, cloudinary_1.uploadImage)(req.file.path, "banners");
    }
    banner.viewOrder = viewOrder !== undefined ? parseInt(viewOrder) : banner.viewOrder;
    if (activeStatus !== undefined) {
        banner.activeStatus = activeStatus === "true" || activeStatus === true;
    }
    banner.bannerImage = imageUrl;
    banner.type = type || banner.type;
    const updatedBanner = await bannerRepository.save(banner);
    res.status(200).json(updatedBanner);
});
exports.deleteBanner = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const bannerRepository = data_source_1.AppDataSource.getRepository(Banner_1.Banner);
    const banner = await bannerRepository.findOneBy({ id: req.params.bannerId });
    if (!banner) {
        throw new ApiError_1.ApiError(404, "Banner not found");
    }
    if (banner.bannerImage) {
        await (0, cloudinary_1.deleteImage)(banner.bannerImage);
    }
    await bannerRepository.remove(banner);
    res.status(200).json({ message: "Banner deleted successfully" });
});
exports.toggleBannerStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const bannerId = req.params.bannerId;
    const { status } = req.body;
    if (typeof status !== "boolean") {
        throw new ApiError_1.ApiError(400, "Status must be a boolean");
    }
    const bannerRepository = data_source_1.AppDataSource.getRepository(Banner_1.Banner);
    const banner = await bannerRepository.findOneBy({ id: bannerId });
    if (!banner) {
        throw new ApiError_1.ApiError(404, "Banner not found");
    }
    banner.activeStatus = status;
    const updatedBanner = await bannerRepository.save(banner);
    res.status(200).json({
        message: `Banner ${status ? "activated" : "deactivated"} successfully`,
        banner: updatedBanner,
    });
});
