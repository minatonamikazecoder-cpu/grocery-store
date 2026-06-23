import express from "express";
import * as userController from "../controllers/user.controller";
import upload from "../middlewares/multer.middleware";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../validations/user.validation";

const router = express.Router();

// Registration & Login
router.post("/register", validate(registerSchema), userController.register);
router.post("/login", validate(loginSchema), userController.login);
router.post("/google-login", userController.googleLogin);
router.post("/check-email", userController.checkEmail);
router.post("/logout", userController.logout);

// OTP & Password Reset
router.post("/send-otp", userController.sendOtp);
router.post("/verify-otp", userController.verifyOtp);
router.post("/reset-password", userController.resetPassword);
router.put("/update-password", verifyJWT, userController.updatePassword);
router.get("/verify-email", userController.verifyEmail);
router.post("/resend-verification", userController.resendVerification);

// User CRUD
router.post("/", verifyJWT, verifyAdmin, upload.single("profilePicture"), userController.createUser);
router.get("/", verifyJWT, verifyAdmin, userController.getAllUsers);
router.get("/:id", verifyJWT, userController.getUserById);
router.put("/:id", verifyJWT, upload.single("profilePicture"), userController.updateUser);
router.delete("/:id", verifyJWT, verifyAdmin, userController.deleteUser);

export default router;
