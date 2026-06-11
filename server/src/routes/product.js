const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const upload = require("../middlewares/multer.middleware");
const { verifyJWT, verifyAdmin } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { createProductSchema } = require("../validations/product.validation");

router.post("/", verifyJWT, verifyAdmin, upload.single("productImage"), validate(createProductSchema), productController.createProduct);

router.get("/", productController.getAllProducts);
router.get("/trending", productController.getTrendingProducts);
router.get("/latest", productController.getLatestProducts);

router.get("/:id", productController.getProductById);

router.get('/category/:categoryId', productController.getProductsByCategoryId);

router.put("/:id", verifyJWT, verifyAdmin, upload.single("productImage"), productController.updateProduct);

router.delete("/:id", verifyJWT, verifyAdmin, productController.deleteProduct);

module.exports = router;
