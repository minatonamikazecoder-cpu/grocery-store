const Address = require("../models/Address");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const addAddress = asyncHandler(async (req, res) => {
    if (req.user._id.toString() !== req.body.userId.toString() && req.user.role !== 'Admin') {
        throw new ApiError(403, "Unauthorized access");
    }
    const address = new Address(req.body);
    const savedAddress = await address.save();
    res.status(201).json(savedAddress);
});

const getAddressById = asyncHandler(async (req, res) => {
    const address = await Address.findById(req.params.addressId);
    if (!address) {
        throw new ApiError(404, "Address not found");
    }
    if (address.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        throw new ApiError(403, "Unauthorized access");
    }
    res.status(200).json(address);
});

const getAddressesByUserId = asyncHandler(async (req, res) => {
    if (req.user._id.toString() !== req.params.userId && req.user.role !== 'Admin') {
        throw new ApiError(403, "Unauthorized access");
    }
    const addresses = await Address.find({ userId: req.params.userId });
    res.status(200).json(addresses);
});

const updateAddress = asyncHandler(async (req, res) => {
    const address = await Address.findById(req.params.addressId);
    if (!address) {
        throw new ApiError(404, "Address not found");
    }

    if (address.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        throw new ApiError(403, "Unauthorized access");
    }

    const updatedAddress = await Address.findByIdAndUpdate(
        req.params.addressId,
        { $set: req.body },
        { new: true }
    );
    res.status(200).json(updatedAddress);
});

module.exports = {
    addAddress,
    getAddressById,
    getAddressesByUserId,
    updateAddress,
};
