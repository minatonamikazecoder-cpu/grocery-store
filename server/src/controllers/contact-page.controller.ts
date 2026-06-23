import { Request, Response } from "express";
import { ContactPage } from "../models/ContactPage";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AppDataSource } from "../db/data-source";

export const getContactPage = asyncHandler(async (req: Request, res: Response) => {
    const contactPageRepository = AppDataSource.getRepository(ContactPage);
    const contactPage = await contactPageRepository.findOne({ where: {} });
    if (!contactPage) {
        return res.status(200).json({});
    }
    res.status(200).json(contactPage);
});

export const updateContactPage = asyncHandler(async (req: Request, res: Response) => {
    const { contactEmail, contactNumber } = req.body;
    const contactPageRepository = AppDataSource.getRepository(ContactPage);
    let contactPage = await contactPageRepository.findOne({ where: {} });

    if (!contactPage && (!contactEmail || !contactNumber)) {
        throw new ApiError(400, "No contact data provided");
    }

    if (!contactPage) {
        contactPage = contactPageRepository.create({ contactEmail, contactNumber });
    } else {
        if (contactEmail) contactPage.contactEmail = contactEmail;
        if (contactNumber) contactPage.contactNumber = contactNumber;
    }

    await contactPageRepository.save(contactPage);
    res.status(200).json(contactPage);
});
