"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController = __importStar(require("../controllers/user.controller"));
const multer_middleware_1 = __importDefault(require("../middlewares/multer.middleware"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = __importDefault(require("../middlewares/validate.middleware"));
const user_validation_1 = require("../validations/user.validation");
const router = express_1.default.Router();
// Registration & Login
router.post("/register", (0, validate_middleware_1.default)(user_validation_1.registerSchema), userController.register);
router.post("/login", (0, validate_middleware_1.default)(user_validation_1.loginSchema), userController.login);
router.post("/google-login", userController.googleLogin);
router.post("/check-email", userController.checkEmail);
router.post("/logout", userController.logout);
// OTP & Password Reset
router.post("/send-otp", userController.sendOtp);
router.post("/verify-otp", userController.verifyOtp);
router.post("/reset-password", userController.resetPassword);
router.put("/update-password", auth_middleware_1.verifyJWT, userController.updatePassword);
router.get("/verify-email", userController.verifyEmail);
router.post("/resend-verification", userController.resendVerification);
// User CRUD
router.post("/", auth_middleware_1.verifyJWT, auth_middleware_1.verifyAdmin, multer_middleware_1.default.single("profilePicture"), userController.createUser);
router.get("/", auth_middleware_1.verifyJWT, auth_middleware_1.verifyAdmin, userController.getAllUsers);
router.get("/:id", auth_middleware_1.verifyJWT, userController.getUserById);
router.put("/:id", auth_middleware_1.verifyJWT, multer_middleware_1.default.single("profilePicture"), userController.updateUser);
router.delete("/:id", auth_middleware_1.verifyJWT, auth_middleware_1.verifyAdmin, userController.deleteUser);
exports.default = router;
