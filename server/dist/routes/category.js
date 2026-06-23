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
const categoryController = __importStar(require("../controllers/category.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = __importDefault(require("../middlewares/validate.middleware"));
const category_validation_1 = require("../validations/category.validation");
const multer_middleware_1 = __importDefault(require("../middlewares/multer.middleware"));
const router = express_1.default.Router();
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
// Admin routes
router.use(auth_middleware_1.verifyJWT, auth_middleware_1.verifyAdmin);
router.post("/", multer_middleware_1.default.single("image"), (0, validate_middleware_1.default)(category_validation_1.categorySchema), categoryController.createCategory);
router.put("/:id", multer_middleware_1.default.single("image"), (0, validate_middleware_1.default)(category_validation_1.categorySchema), categoryController.updateCategory);
router.delete("/:id", categoryController.softDeleteCategory);
exports.default = router;
