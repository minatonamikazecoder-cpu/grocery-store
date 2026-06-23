import express from "express";
import * as wishlistController from "../controllers/wishlist.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(verifyJWT);

// Route to add a product to the wishlist
router.post('/:userId/add', wishlistController.addToWishlist);

// Route to remove a product from the wishlist
router.delete('/:userId/remove', wishlistController.removeFromWishlist);

// Route to get the user's wishlist
router.get('/:userId', wishlistController.getWishlist);

export default router;
