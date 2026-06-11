const Offer = require("../models/Offer");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// Utility to determine if an offer is active based on dates
const isActive = (startDate, endDate) => {
    const now = new Date();
    return new Date(startDate) <= now && now <= new Date(endDate);
};

// Create a new offer
exports.createOffer = asyncHandler(async (req, res) => {
    const offer = new Offer(req.body);
    await offer.save();
    const offerObject = offer.toObject();
    offerObject.activeStatus = isActive(offer.startDate, offer.endDate);
    res.status(201).json(offerObject);
});

// Get all offers with activeStatus calculated
exports.getAllOffers = asyncHandler(async (req, res) => {
    const offers = await Offer.find();
    const offersWithStatus = offers.map((offer) => {
        const offerObj = offer.toObject();
        offerObj.activeStatus = isActive(offer.startDate, offer.endDate);
        return offerObj;
    });
    res.status(200).json(offersWithStatus);
});

// Get offer by ID
exports.getOfferById = asyncHandler(async (req, res) => {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
        throw new ApiError(404, "Offer not found");
    }
    const offerObj = offer.toObject();
    offerObj.activeStatus = isActive(offer.startDate, offer.endDate);
    res.status(200).json(offerObj);
});

// Update an offer
exports.updateOffer = asyncHandler(async (req, res) => {
    const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!updatedOffer) {
        throw new ApiError(404, "Offer not found");
    }
    const offerObj = updatedOffer.toObject();
    offerObj.activeStatus = isActive(
        updatedOffer.startDate,
        updatedOffer.endDate
    );
    res.status(200).json(offerObj);
});

// Delete an offer
exports.deleteOffer = asyncHandler(async (req, res) => {
    const deletedOffer = await Offer.findByIdAndDelete(req.params.id);
    if (!deletedOffer) {
        throw new ApiError(404, "Offer not found");
    }
    res.status(200).json({ message: "Offer deleted successfully." });
});
