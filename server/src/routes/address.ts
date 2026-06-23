import express from "express";
import * as addressController from "../controllers/address.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import { createAddressSchema, updateAddressSchema } from "../validations/address.validation";

const router = express.Router();

router.use(verifyJWT);

router.post("/", validate(createAddressSchema), addressController.addAddress);
router.get("/:addressId", addressController.getAddressById);
router.get("/user/:userId", addressController.getAddressesByUserId);
router.put("/:addressId", validate(updateAddressSchema), addressController.updateAddress);

export default router;
