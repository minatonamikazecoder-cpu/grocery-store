import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(verifyJWT, verifyAdmin);

router.get("/", getDashboardStats);

export default router;
