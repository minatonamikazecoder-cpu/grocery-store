import { Request, Response } from "express";
import { Response as ResponseModel } from "../models/Response";
import nodemailer from "nodemailer";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AppDataSource } from "../db/data-source";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const createResponse = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phone, message } = req.body;
    const responseRepository = AppDataSource.getRepository(ResponseModel);
    const newResponse = responseRepository.create({ name, email, phone, message });
    await responseRepository.save(newResponse);
    res.status(201).json(newResponse);
});

export const getAllResponses = asyncHandler(async (req: Request, res: Response) => {
    const responseRepository = AppDataSource.getRepository(ResponseModel);
    // Since there is no createdAt column on Response entity, let's just find all responses.
    // Wait, let's verify if Response entity has createdAt. It doesn't in Response.ts.
    // So let's check if it does. It does not. Let's just do find().
    const responses = await responseRepository.find();
    res.status(200).json(responses);
});

export const getResponseById = asyncHandler(async (req: Request, res: Response) => {
    const responseRepository = AppDataSource.getRepository(ResponseModel);
    const response = await responseRepository.findOneBy({ id: req.params.id as string });
    if (!response) {
        throw new ApiError(404, "Response not found");
    }
    res.status(200).json(response);
});

export const updateReply = asyncHandler(async (req: Request, res: Response) => {
    const { reply } = req.body;
    const responseRepository = AppDataSource.getRepository(ResponseModel);
    const response = await responseRepository.findOneBy({ id: req.params.id as string });
    if (!response) {
        throw new ApiError(404, "Response not found");
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

export const deleteResponse = asyncHandler(async (req: Request, res: Response) => {
    const responseRepository = AppDataSource.getRepository(ResponseModel);
    const response = await responseRepository.findOneBy({ id: req.params.id as string });
    if (!response) {
        throw new ApiError(404, "Response not found");
    }
    await responseRepository.remove(response);
    res.status(200).json({ message: "Response deleted successfully" });
});
