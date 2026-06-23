"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("./logger"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadImage = async (filePath, folderName) => {
    try {
        const result = await cloudinary_1.v2.uploader.upload(filePath, {
            folder: folderName,
        });
        // Delete local file after upload
        fs_1.default.unlinkSync(filePath);
        return result.secure_url;
    }
    catch (error) {
        // Delete the file if upload fails too
        if (fs_1.default.existsSync(filePath))
            fs_1.default.unlinkSync(filePath);
        logger_1.default.error("Failed to upload image to Cloudinary: " + error.message);
        throw new Error("Failed to upload image to Cloudinary", { cause: error });
    }
};
exports.uploadImage = uploadImage;
// Function to delete an image from Cloudinary
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary_1.v2.uploader.destroy(publicId);
        if (result.result === 'ok') {
            return true;
        }
        else {
            logger_1.default.error(`Failed to delete image with public ID ${publicId}. Result: ${result.result}`);
            return false;
        }
    }
    catch (error) {
        logger_1.default.error("Failed to delete image from Cloudinary: " + error.message);
        throw new Error("Failed to delete image from Cloudinary", { cause: error });
    }
};
exports.deleteImage = deleteImage;
