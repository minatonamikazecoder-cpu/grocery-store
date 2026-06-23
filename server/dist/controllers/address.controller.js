"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddress = exports.getAddressesByUserId = exports.getAddressById = exports.addAddress = void 0;
const Address_1 = require("../models/Address");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const data_source_1 = require("../db/data-source");
exports.addAddress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user || (req.user.id !== req.body.userId && req.user.role !== 'Admin')) {
        throw new ApiError_1.ApiError(403, "Unauthorized access");
    }
    const addressRepository = data_source_1.AppDataSource.getRepository(Address_1.Address);
    const address = addressRepository.create(req.body);
    const savedAddress = await addressRepository.save(address);
    res.status(201).json(new ApiResponse_1.ApiResponse(201, savedAddress, "Address created successfully").toJSON());
});
exports.getAddressById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const addressRepository = data_source_1.AppDataSource.getRepository(Address_1.Address);
    const address = await addressRepository.findOneBy({ id: req.params.addressId });
    if (!address) {
        throw new ApiError_1.ApiError(404, "Address not found");
    }
    if (!req.user || (address.userId !== req.user.id && req.user.role !== 'Admin')) {
        throw new ApiError_1.ApiError(403, "Unauthorized access");
    }
    res.status(200).json(new ApiResponse_1.ApiResponse(200, address, "Address fetched successfully").toJSON());
});
exports.getAddressesByUserId = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user || (req.user.id !== req.params.userId && req.user.role !== 'Admin')) {
        throw new ApiError_1.ApiError(403, "Unauthorized access");
    }
    const addressRepository = data_source_1.AppDataSource.getRepository(Address_1.Address);
    const addresses = await addressRepository.find({ where: { userId: req.params.userId } });
    res.status(200).json(new ApiResponse_1.ApiResponse(200, addresses, "Addresses fetched successfully").toJSON());
});
exports.updateAddress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const addressRepository = data_source_1.AppDataSource.getRepository(Address_1.Address);
    const address = await addressRepository.findOneBy({ id: req.params.addressId });
    if (!address) {
        throw new ApiError_1.ApiError(404, "Address not found");
    }
    if (!req.user || (address.userId !== req.user.id && req.user.role !== 'Admin')) {
        throw new ApiError_1.ApiError(403, "Unauthorized access");
    }
    addressRepository.merge(address, req.body);
    const updatedAddress = await addressRepository.save(address);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, updatedAddress, "Address updated successfully").toJSON());
});
