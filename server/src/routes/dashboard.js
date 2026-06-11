const express = require("express");
const router = express.Router();
const { verifyJWT, verifyAdmin } = require("../middlewares/auth.middleware");

const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");
const User = require("../models/User");

router.use(verifyJWT, verifyAdmin);

router.get("/", async (req, res) => {
  try {
    const [totalActiveProducts, totalOrders, totalCategories, totalActiveUsers] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({ isDeleted: false }),
      Category.countDocuments({ isDeleted: false }),
      User.countDocuments({ role: "User", status: "Active" })
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
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
