import { Request, Response } from "express";
import { Banner } from "../models/Banner";
import { uploadImage, deleteImage } from "../utils/cloudinary";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AppDataSource } from "../db/data-source";

export const addBanner = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new ApiError(400, "Banner image is required");
    }

    const imageUrl = await uploadImage(req.file.path, "banners");
    const activeStatus = req.body.activeStatus === "true" || req.body.activeStatus === true;

    const bannerRepository = AppDataSource.getRepository(Banner);
    const banner = bannerRepository.create({
        bannerImage: imageUrl,
        viewOrder: parseInt(req.body.viewOrder) || 0,
        activeStatus,
    });

    const savedBanner = await bannerRepository.save(banner);
    res.status(201).json(savedBanner);
});

export const getAllBanners = asyncHandler(async (req: Request, res: Response) => {
    const bannerRepository = AppDataSource.getRepository(Banner);
    const banners = await bannerRepository.find();
    res.status(200).json(banners);
});

export const getBannerById = asyncHandler(async (req: Request, res: Response) => {
    const bannerRepository = AppDataSource.getRepository(Banner);
    const banner = await bannerRepository.findOneBy({ id: req.params.bannerId as string });
    if (!banner) {
        throw new ApiError(404, "Banner not found");
    }
    res.status(200).json(banner);
});

export const updateBanner = asyncHandler(async (req: Request, res: Response) => {
    const { viewOrder, activeStatus, type } = req.body;

    const bannerRepository = AppDataSource.getRepository(Banner);
    const banner = await bannerRepository.findOneBy({ id: req.params.bannerId as string });
    if (!banner) {
        throw new ApiError(404, "Banner not found");
    }

    let imageUrl = banner.bannerImage;

    if (req.file) {
        if (banner.bannerImage) {
            await deleteImage(banner.bannerImage);
        }
        imageUrl = await uploadImage(req.file.path, "banners");
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

export const deleteBanner = asyncHandler(async (req: Request, res: Response) => {
    const bannerRepository = AppDataSource.getRepository(Banner);
    const banner = await bannerRepository.findOneBy({ id: req.params.bannerId as string });
    if (!banner) {
        throw new ApiError(404, "Banner not found");
    }

    if (banner.bannerImage) {
        await deleteImage(banner.bannerImage);
    }

    await bannerRepository.remove(banner);
    res.status(200).json({ message: "Banner deleted successfully" });
});

export const toggleBannerStatus = asyncHandler(async (req: Request, res: Response) => {
    const bannerId = req.params.bannerId as string;
    const { status } = req.body;

    if (typeof status !== "boolean") {
        throw new ApiError(400, "Status must be a boolean");
    }

    const bannerRepository = AppDataSource.getRepository(Banner);
    const banner = await bannerRepository.findOneBy({ id: bannerId });
    if (!banner) {
        throw new ApiError(404, "Banner not found");
    }

    banner.activeStatus = status;
    const updatedBanner = await bannerRepository.save(banner);

    res.status(200).json({
        message: `Banner ${status ? "activated" : "deactivated"} successfully`,
        banner: updatedBanner,
    });
});
