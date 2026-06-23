import express from "express";
import * as categoryController from "../controllers/category.controller";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import { categorySchema } from "../validations/category.validation";
import upload from "../middlewares/multer.middleware";

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// Admin routes
router.use(verifyJWT, verifyAdmin);

router.post("/", upload.single("image"), validate(categorySchema), categoryController.createCategory);
router.put("/:id", upload.single("image"), validate(categorySchema), categoryController.updateCategory);
router.delete("/:id", categoryController.softDeleteCategory);

export default router;
