const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer.middleware");
const bannerController = require("../controllers/banner.controller");
const { verifyJWT, verifyAdmin } = require("../middlewares/auth.middleware");

router.get("/", bannerController.getAllBanners);
router.get("/:bannerId", bannerController.getBannerById);

// Admin routes
router.use(verifyJWT, verifyAdmin);

router.post("/", upload.single("bannerImage"), bannerController.addBanner);
router.put("/:bannerId", upload.single("bannerImage"), bannerController.updateBanner);
router.delete("/:bannerId", bannerController.deleteBanner);
router.patch("/:bannerId/status", bannerController.toggleBannerStatus);

module.exports = router;
