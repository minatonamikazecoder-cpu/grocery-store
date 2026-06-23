"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const data_source_1 = require("../db/data-source");
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const Category_1 = require("../models/Category");
const User_1 = require("../models/User");
const logger_1 = __importDefault(require("../utils/logger"));
exports.getDashboardStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const [totalActiveProducts, totalOrders, totalCategories, totalActiveUsers] = await Promise.all([
            data_source_1.AppDataSource.getRepository(Product_1.Product).count({ where: { isActive: true } }),
            data_source_1.AppDataSource.getRepository(Order_1.Order).count({ where: { isDeleted: false } }),
            data_source_1.AppDataSource.getRepository(Category_1.Category).count({ where: { isDeleted: false } }),
            data_source_1.AppDataSource.getRepository(User_1.User).count({ where: { role: "User", status: "Active" } })
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
    }
    catch (err) {
        logger_1.default.error("Error fetching dashboard stats: " + err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
