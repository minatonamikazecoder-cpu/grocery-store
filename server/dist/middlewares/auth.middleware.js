"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdmin = exports.verifyJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const data_source_1 = require("../db/data-source");
const User_1 = require("../models/User");
exports.verifyJWT = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError_1.ApiError(401, "Unauthorized request");
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "default_secret");
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedToken?.id);
        if (!isUuid) {
            throw new ApiError_1.ApiError(401, "Invalid Access Token");
        }
        const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOne({
            where: { id: decodedToken.id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                mobile: true,
                profilePicture: true,
                role: true,
                status: true,
                token: true,
                authType: true,
                createdAt: true,
            }
        });
        if (!user) {
            throw new ApiError_1.ApiError(401, "Invalid Access Token");
        }
        req.user = user;
        next();
    }
    catch (error) {
        throw new ApiError_1.ApiError(401, error?.message || "Invalid access token");
    }
});
const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === "Admin") {
        next();
    }
    else {
        throw new ApiError_1.ApiError(403, "Forbidden: Admin access required");
    }
};
exports.verifyAdmin = verifyAdmin;
