import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppDataSource } from "../db/data-source";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { Category } from "../models/Category";
import { User } from "../models/User";
import logger from "../utils/logger";

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    const [totalActiveProducts, totalOrders, totalCategories, totalActiveUsers] = await Promise.all([
      AppDataSource.getRepository(Product).count({ where: { isActive: true } }),
      AppDataSource.getRepository(Order).count({ where: { isDeleted: false } }),
      AppDataSource.getRepository(Category).count({ where: { isDeleted: false } }),
      AppDataSource.getRepository(User).count({ where: { role: "User", status: "Active" } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalActiveProducts,
        totalOrders,
        totalCategories,
        totalActiveUsers
      }
    });
  } catch (err) {
    logger.error("Error fetching dashboard stats: " + (err as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
