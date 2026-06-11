const ContactPage = require("../models/ContactPage");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const getContactPage = asyncHandler(async (req, res) => {
    const contactPage = await ContactPage.findOne();
    if (!contactPage) {
        return res.status(200).json({});
    }
    res.status(200).json(contactPage);
});

const updateContactPage = asyncHandler(async (req, res) => {
    const { contactEmail, contactNumber } = req.body;
    let contactPage = await ContactPage.findOne();
    if (!contactPage && (!contactEmail || !contactNumber)) {
        throw new ApiError(400, "No contact data provided");
    }
    if (!contactPage) {
        contactPage = new ContactPage({ contactEmail, contactNumber });
    } else {
        if (contactEmail) contactPage.contactEmail = contactEmail;
        if (contactNumber) contactPage.contactNumber = contactNumber;
    }
    await contactPage.save();
    res.status(200).json(contactPage);
});

module.exports = {
    getContactPage,
    updateContactPage,
};
