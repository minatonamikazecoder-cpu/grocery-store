import express from "express";
import * as cartController from "../controllers/cart.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import { addToCartSchema } from "../validations/cart.validation";

const router = express.Router();

router.use(verifyJWT);

router.post("/", validate(addToCartSchema), cartController.addToCart);
router.get("/:userId", cartController.getCartByUserId);
router.put("/:userId", validate(addToCartSchema), cartController.updateCartItem);
router.delete("/:userId", cartController.removeCartItem);
router.delete("/clear/:userId", cartController.clearCart);

export default router;
