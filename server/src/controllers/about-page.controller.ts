import { Request, Response } from "express";
import { AboutPage } from "../models/AboutPage";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AppDataSource } from "../db/data-source";

export const getAboutPage = asyncHandler(async (req: Request, res: Response) => {
    const aboutPageRepository = AppDataSource.getRepository(AboutPage);
    const aboutPage = await aboutPageRepository.findOne({ where: {} });
    
    // In case no document exists, match original Mongoose behavior returning a mock content object
    const data = aboutPage ? aboutPage : { content: "" };

    res.status(200).json({
        message: "About page retrieved successfully",
        data,
    });
});

export const updateAboutPage = asyncHandler(async (req: Request, res: Response) => {
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const aboutPageRepository = AppDataSource.getRepository(AboutPage);
    let aboutPage = await aboutPageRepository.findOne({ where: {} });

    if (!aboutPage) {
        aboutPage = aboutPageRepository.create({ content });
        await aboutPageRepository.save(aboutPage);
        return res.status(201).json({
            message: "About page created successfully",
            data: aboutPage,
        });
    }

    aboutPage.content = content;
    await aboutPageRepository.save(aboutPage);

    res.status(200).json({
        message: "About page updated successfully",
        data: aboutPage,
    });
});
