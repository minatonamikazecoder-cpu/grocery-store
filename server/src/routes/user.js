// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const upload = require("../middlewares/multer.middleware"); 
const { verifyJWT, verifyAdmin } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { registerSchema, loginSchema } = require("../validations/user.validation");

// Registration & Login
router.post("/register", validate(registerSchema), userController.register);
router.post("/login", validate(loginSchema), userController.login);
router.post("/google-login", userController.googleLogin);
router.post("/check-email", userController.checkEmail);

// OTP & Password Reset
router.post("/send-otp", userController.sendOtp);
router.post("/verify-otp", userController.verifyOtp);
router.post("/reset-password", userController.resetPassword);
router.put("/update-password", verifyJWT, userController.updatePassword);
router.get("/verify-email", userController.verifyEmail);

// User CRUD
router.post("/", verifyJWT, verifyAdmin, upload.single("profilePicture"), userController.createUser);
router.get("/", verifyJWT, verifyAdmin, userController.getAllUsers);
router.get("/:id", verifyJWT, userController.getUserById);
router.put("/:id", verifyJWT, upload.single("profilePicture"),  userController.updateUser);
router.delete("/:id", verifyJWT, verifyAdmin, userController.deleteUser);

module.exports = router;
