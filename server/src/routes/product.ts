import express from "express";
import * as productController from "../controllers/product.controller";
import upload from "../middlewares/multer.middleware";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import { createProductSchema } from "../validations/product.validation";

const router = express.Router();

router.post("/", verifyJWT, verifyAdmin, upload.single("productImage"), validate(createProductSchema), productController.createProduct);

router.get("/", productController.getAllProducts);
router.get("/trending", productController.getTrendingProducts);
router.get("/latest", productController.getLatestProducts);
router.get("/search", productController.searchProducts);

router.get("/:id", productController.getProductById);

router.get('/category/:categoryId', productController.getProductsByCategoryId);

router.put("/:id", verifyJWT, verifyAdmin, upload.single("productImage"), productController.updateProduct);

router.delete("/:id", verifyJWT, verifyAdmin, productController.deleteProduct);

export default router;
