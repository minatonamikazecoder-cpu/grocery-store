"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAboutPage = exports.getAboutPage = void 0;
const AboutPage_1 = require("../models/AboutPage");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const data_source_1 = require("../db/data-source");
exports.getAboutPage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const aboutPageRepository = data_source_1.AppDataSource.getRepository(AboutPage_1.AboutPage);
    const aboutPage = await aboutPageRepository.findOne({ where: {} });
    // In case no document exists, match original Mongoose behavior returning a mock content object
    const data = aboutPage ? aboutPage : { content: "" };
    res.status(200).json({
        message: "About page retrieved successfully",
        data,
    });
});
exports.updateAboutPage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { content } = req.body;
    if (!content) {
        throw new ApiError_1.ApiError(400, "Content is required");
    }
    const aboutPageRepository = data_source_1.AppDataSource.getRepository(AboutPage_1.AboutPage);
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
