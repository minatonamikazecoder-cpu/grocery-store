const Response = require("../models/Response");
const nodemailer = require("nodemailer");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const createResponse = asyncHandler(async (req, res) => {
    const { name, email, phone, message } = req.body;
    const newResponse = new Response({ name, email, phone, message });
    await newResponse.save();
    res.status(201).json(newResponse);
});

const getAllResponses = asyncHandler(async (req, res) => {
    const responses = await Response.find().sort({ createdAt: -1 });
    res.status(200).json(responses);
});

const getResponseById = asyncHandler(async (req, res) => {
    const response = await Response.findById(req.params.id);
    if (!response) {
        throw new ApiError(404, "Response not found");
    }
    res.status(200).json(response);
});

const updateReply = asyncHandler(async (req, res) => {
    const { reply } = req.body;
    const response = await Response.findByIdAndUpdate(
        req.params.id,
        { reply },
        { new: true, runValidators: true }
    );
    if (!response) {
        throw new ApiError(404, "Response not found");
    }

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: response.email,
        subject: "Response to your query",
        text: `Hi ${response.name},\n\nYour Query: ${response.message}\nReply: ${reply}`
    });

    res.status(200).json(response);
});

const deleteResponse = asyncHandler(async (req, res) => {
    const response = await Response.findByIdAndDelete(req.params.id);
    if (!response) {
        throw new ApiError(404, "Response not found");
    }
    res.status(200).json({ message: "Response deleted successfully" });
});

module.exports = {
    createResponse,
    getAllResponses,
    getResponseById,
    updateReply,
    deleteResponse
};
