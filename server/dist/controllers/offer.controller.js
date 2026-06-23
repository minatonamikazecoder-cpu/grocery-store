"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOffer = exports.updateOffer = exports.getOfferById = exports.getAllOffers = exports.createOffer = void 0;
const Offer_1 = require("../models/Offer");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const data_source_1 = require("../db/data-source");
const isActive = (startDate, endDate) => {
    const now = new Date();
    return new Date(startDate) <= now && now <= new Date(endDate);
};
exports.createOffer = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const offerRepository = data_source_1.AppDataSource.getRepository(Offer_1.Offer);
    const offer = offerRepository.create(req.body);
    await offerRepository.save(offer);
    const offerWithStatus = {
        ...offer,
        activeStatus: isActive(offer.startDate, offer.endDate)
    };
    res.status(201).json(offerWithStatus);
});
exports.getAllOffers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const offerRepository = data_source_1.AppDataSource.getRepository(Offer_1.Offer);
    const offers = await offerRepository.find();
    const offersWithStatus = offers.map((offer) => ({
        ...offer,
        activeStatus: isActive(offer.startDate, offer.endDate)
    }));
    res.status(200).json(offersWithStatus);
});
exports.getOfferById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const offerRepository = data_source_1.AppDataSource.getRepository(Offer_1.Offer);
    const offer = await offerRepository.findOneBy({ id: req.params.id });
    if (!offer) {
        throw new ApiError_1.ApiError(404, "Offer not found");
    }
    const offerWithStatus = {
        ...offer,
        activeStatus: isActive(offer.startDate, offer.endDate)
    };
    res.status(200).json(offerWithStatus);
});
exports.updateOffer = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const offerRepository = data_source_1.AppDataSource.getRepository(Offer_1.Offer);
    const offer = await offerRepository.findOneBy({ id: req.params.id });
    if (!offer) {
        throw new ApiError_1.ApiError(404, "Offer not found");
    }
    offerRepository.merge(offer, req.body);
    await offerRepository.save(offer);
    const offerWithStatus = {
        ...offer,
        activeStatus: isActive(offer.startDate, offer.endDate)
    };
    res.status(200).json(offerWithStatus);
});
exports.deleteOffer = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const offerRepository = data_source_1.AppDataSource.getRepository(Offer_1.Offer);
    const offer = await offerRepository.findOneBy({ id: req.params.id });
    if (!offer) {
        throw new ApiError_1.ApiError(404, "Offer not found");
    }
    await offerRepository.remove(offer);
    res.status(200).json({ message: "Offer deleted successfully." });
});
