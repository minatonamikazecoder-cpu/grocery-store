import express from "express";
import upload from "../middlewares/multer.middleware";
import * as bannerController from "../controllers/banner.controller";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", bannerController.getAllBanners);
router.get("/:bannerId", bannerController.getBannerById);

// Admin routes
router.use(verifyJWT, verifyAdmin);

router.post("/", upload.single("bannerImage"), bannerController.addBanner);
router.put("/:bannerId", upload.single("bannerImage"), bannerController.updateBanner);
router.delete("/:bannerId", bannerController.deleteBanner);
router.patch("/:bannerId/status", bannerController.toggleBannerStatus);

export default router;
