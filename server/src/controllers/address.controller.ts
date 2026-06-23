import { Request, Response } from "express";
import { Address } from "../models/Address";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { AppDataSource } from "../db/data-source";

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || (req.user.id !== req.body.userId && req.user.role !== 'Admin')) {
        throw new ApiError(403, "Unauthorized access");
    }
    const addressRepository = AppDataSource.getRepository(Address);
    const address = addressRepository.create(req.body);
    const savedAddress = await addressRepository.save(address);
    res.status(201).json(new ApiResponse(201, savedAddress, "Address created successfully").toJSON());
});

export const getAddressById = asyncHandler(async (req: Request, res: Response) => {
    const addressRepository = AppDataSource.getRepository(Address);
    const address = await addressRepository.findOneBy({ id: req.params.addressId as string });
    if (!address) {
        throw new ApiError(404, "Address not found");
    }
    if (!req.user || (address.userId !== req.user.id && req.user.role !== 'Admin')) {
        throw new ApiError(403, "Unauthorized access");
    }
    res.status(200).json(new ApiResponse(200, address, "Address fetched successfully").toJSON());
});

export const getAddressesByUserId = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || (req.user.id !== req.params.userId as string && req.user.role !== 'Admin')) {
        throw new ApiError(403, "Unauthorized access");
    }
    const addressRepository = AppDataSource.getRepository(Address);
    const addresses = await addressRepository.find({ where: { userId: req.params.userId as string } });
    res.status(200).json(new ApiResponse(200, addresses, "Addresses fetched successfully").toJSON());
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
    const addressRepository = AppDataSource.getRepository(Address);
    const address = await addressRepository.findOneBy({ id: req.params.addressId as string });
    if (!address) {
        throw new ApiError(404, "Address not found");
    }

    if (!req.user || (address.userId !== req.user.id && req.user.role !== 'Admin')) {
        throw new ApiError(403, "Unauthorized access");
    }

    addressRepository.merge(address, req.body);
    const updatedAddress = await addressRepository.save(address);
    res.status(200).json(new ApiResponse(200, updatedAddress, "Address updated successfully").toJSON());
});
