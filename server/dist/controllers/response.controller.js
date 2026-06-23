"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResponse = exports.updateReply = exports.getResponseById = exports.getAllResponses = exports.createResponse = void 0;
const Response_1 = require("../models/Response");
const nodemailer_1 = __importDefault(require("nodemailer"));
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const data_source_1 = require("../db/data-source");
const transporter = nodemailer_1.default.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
exports.createResponse = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, phone, message } = req.body;
    const responseRepository = data_source_1.AppDataSource.getRepository(Response_1.Response);
    const newResponse = responseRepository.create({ name, email, phone, message });
    await responseRepository.save(newResponse);
    res.status(201).json(newResponse);
});
exports.getAllResponses = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const responseRepository = data_source_1.AppDataSource.getRepository(Response_1.Response);
    // Since there is no createdAt column on Response entity, let's just find all responses.
    // Wait, let's verify if Response entity has createdAt. It doesn't in Response.ts.
    // So let's check if it does. It does not. Let's just do find().
    const responses = await responseRepository.find();
    res.status(200).json(responses);
});
exports.getResponseById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const responseRepository = data_source_1.AppDataSource.getRepository(Response_1.Response);
    const response = await responseRepository.findOneBy({ id: req.params.id });
    if (!response) {
        throw new ApiError_1.ApiError(404, "Response not found");
    }
    res.status(200).json(response);
});
exports.updateReply = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { reply } = req.body;
    const responseRepository = data_source_1.AppDataSource.getRepository(Response_1.Response);
    const response = await responseRepository.findOneBy({ id: req.params.id });
    if (!response) {
        throw new ApiError_1.ApiError(404, "Response not found");
    }
    response.reply = reply;
    await responseRepository.save(response);
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: response.email,
        subject: "Response to your query",
        text: `Hi ${response.name},\n\nYour Query: ${response.message}\nReply: ${reply}`
    });
    res.status(200).json(response);
});
exports.deleteResponse = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const responseRepository = data_source_1.AppDataSource.getRepository(Response_1.Response);
    const response = await responseRepository.findOneBy({ id: req.params.id });
    if (!response) {
        throw new ApiError_1.ApiError(404, "Response not found");
    }
    await responseRepository.remove(response);
    res.status(200).json({ message: "Response deleted successfully" });
});
