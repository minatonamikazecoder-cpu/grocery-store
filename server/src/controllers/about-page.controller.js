const AboutPage = require("../models/AboutPage");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const getAboutPage = asyncHandler(async (req, res) => {
    let aboutPage = await AboutPage.findOne();
    if (!aboutPage) {
        aboutPage = { content: "" };
    }
    res.status(200).json({
        message: "About page retrieved successfully",
        data: aboutPage,
    });
});

const updateAboutPage = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    let aboutPage = await AboutPage.findOne();
    if (!aboutPage) {
        aboutPage = new AboutPage({ content });
        await aboutPage.save();
        return res.status(201).json({
            message: "About page created successfully",
            data: aboutPage,
        });
    }

    aboutPage.content = content;
    await aboutPage.save();

    res.status(200).json({
        message: "About page updated successfully",
        data: aboutPage,
    });
});

module.exports = { getAboutPage, updateAboutPage };
