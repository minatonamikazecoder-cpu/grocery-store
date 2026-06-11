const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { verifyJWT, verifyAdmin } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { categorySchema } = require("../validations/category.validation");

// Import configured multer
const upload = require("../middlewares/multer.middleware"); // adjust the path if needed

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// Admin routes
router.use(verifyJWT, verifyAdmin);

router.post("/", upload.single("image"), validate(categorySchema), categoryController.createCategory);
router.put("/:id", upload.single("image"), validate(categorySchema), categoryController.updateCategory);
router.delete("/:id", categoryController.softDeleteCategory);

module.exports = router;
