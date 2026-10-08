import express from "express";
import { getDashboard } from "../controllers/DashboardController.js";
import { verifyJWT } from "../middlewares/authTypeMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// Admin only (contains contact details of visitors)
router.get("/", verifyJWT, isAdmin, getDashboard);

export default router;
