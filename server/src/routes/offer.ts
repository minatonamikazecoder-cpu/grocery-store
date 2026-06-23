import express from "express";
import * as offerController from "../controllers/offer.controller";

const router = express.Router();

router.post("/", offerController.createOffer);
router.get("/", offerController.getAllOffers);
router.get("/:id", offerController.getOfferById);
router.put("/:id", offerController.updateOffer);
router.delete("/:id", offerController.deleteOffer);

export default router;
