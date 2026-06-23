import express from "express";
import * as aboutPageController from "../controllers/about-page.controller";

const router = express.Router();

router.get("/", aboutPageController.getAboutPage);
router.put("/", aboutPageController.updateAboutPage);

export default router;
