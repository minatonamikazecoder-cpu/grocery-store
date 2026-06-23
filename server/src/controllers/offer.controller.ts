import { Request, Response } from "express";
import { DeepPartial } from "typeorm";
import { Offer } from "../models/Offer";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AppDataSource } from "../db/data-source";

const isActive = (startDate: Date, endDate: Date) => {
    const now = new Date();
    return new Date(startDate) <= now && now <= new Date(endDate);
};

export const createOffer = asyncHandler(async (req: Request, res: Response) => {
    const offerRepository = AppDataSource.getRepository(Offer);
    const offer = offerRepository.create(req.body as DeepPartial<Offer>);
    await offerRepository.save(offer);

    const offerWithStatus = {
        ...offer,
        activeStatus: isActive(offer.startDate, offer.endDate)
    };

    res.status(201).json(offerWithStatus);
});

export const getAllOffers = asyncHandler(async (req: Request, res: Response) => {
    const offerRepository = AppDataSource.getRepository(Offer);
    const offers = await offerRepository.find();
    
    const offersWithStatus = offers.map((offer) => ({
        ...offer,
        activeStatus: isActive(offer.startDate, offer.endDate)
    }));

    res.status(200).json(offersWithStatus);
});

export const getOfferById = asyncHandler(async (req: Request, res: Response) => {
    const offerRepository = AppDataSource.getRepository(Offer);
    const offer = await offerRepository.findOneBy({ id: req.params.id as string });
    if (!offer) {
        throw new ApiError(404, "Offer not found");
    }

    const offerWithStatus = {
        ...offer,
        activeStatus: isActive(offer.startDate, offer.endDate)
    };

    res.status(200).json(offerWithStatus);
});

export const updateOffer = asyncHandler(async (req: Request, res: Response) => {
    const offerRepository = AppDataSource.getRepository(Offer);
    const offer = await offerRepository.findOneBy({ id: req.params.id as string });
    if (!offer) {
        throw new ApiError(404, "Offer not found");
    }

    offerRepository.merge(offer, req.body);
    await offerRepository.save(offer);

    const offerWithStatus = {
        ...offer,
        activeStatus: isActive(offer.startDate, offer.endDate)
    };

    res.status(200).json(offerWithStatus);
});

export const deleteOffer = asyncHandler(async (req: Request, res: Response) => {
    const offerRepository = AppDataSource.getRepository(Offer);
    const offer = await offerRepository.findOneBy({ id: req.params.id as string });
    if (!offer) {
        throw new ApiError(404, "Offer not found");
    }

    await offerRepository.remove(offer);
    res.status(200).json({ message: "Offer deleted successfully." });
});
