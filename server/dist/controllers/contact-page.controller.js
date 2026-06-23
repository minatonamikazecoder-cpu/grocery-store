"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContactPage = exports.getContactPage = void 0;
const ContactPage_1 = require("../models/ContactPage");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const data_source_1 = require("../db/data-source");
exports.getContactPage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const contactPageRepository = data_source_1.AppDataSource.getRepository(ContactPage_1.ContactPage);
    const contactPage = await contactPageRepository.findOne({ where: {} });
    if (!contactPage) {
        return res.status(200).json({});
    }
    res.status(200).json(contactPage);
});
exports.updateContactPage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { contactEmail, contactNumber } = req.body;
    const contactPageRepository = data_source_1.AppDataSource.getRepository(ContactPage_1.ContactPage);
    let contactPage = await contactPageRepository.findOne({ where: {} });
    if (!contactPage && (!contactEmail || !contactNumber)) {
        throw new ApiError_1.ApiError(400, "No contact data provided");
    }
    if (!contactPage) {
        contactPage = contactPageRepository.create({ contactEmail, contactNumber });
    }
    else {
        if (contactEmail)
            contactPage.contactEmail = contactEmail;
        if (contactNumber)
            contactPage.contactNumber = contactNumber;
    }
    await contactPageRepository.save(contactPage);
    res.status(200).json(contactPage);
});
