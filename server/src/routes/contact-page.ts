import express from "express";
import * as contactPageController from "../controllers/contact-page.controller";

const router = express.Router();

router.get("/", contactPageController.getContactPage);
router.put("/", contactPageController.updateContactPage);

export default router;
