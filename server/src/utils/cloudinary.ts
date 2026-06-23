import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import logger from "./logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (filePath: string, folderName: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folderName,
    });

    // Delete local file after upload
    fs.unlinkSync(filePath);

    return result.secure_url;
  } catch (error) {
    // Delete the file if upload fails too
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    logger.error("Failed to upload image to Cloudinary: " + (error as Error).message);
    throw new Error("Failed to upload image to Cloudinary", { cause: error });
  }
};

// Function to delete an image from Cloudinary
export const deleteImage = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === 'ok') {
      return true;
    } else {
      logger.error(`Failed to delete image with public ID ${publicId}. Result: ${result.result}`);
      return false;
    }
  } catch (error) {
    logger.error("Failed to delete image from Cloudinary: " + (error as Error).message);
    throw new Error("Failed to delete image from Cloudinary", { cause: error });
  }
};
