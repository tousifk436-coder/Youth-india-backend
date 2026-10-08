import { Router } from "express";
import {
    createHomeBanner,
    getAllHomeBanners,
    getHomeBannerById,
    updateHomeBanner,
    deleteHomeBanner,
} from "../controllers/homeBannerController.js";
import { verifyJWT, optionalAuth } from "../middlewares/authTypeMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// Public (website) – visitors see only active banners; an admin token also shows inactive ones
router.get("/", optionalAuth, getAllHomeBanners);
router.get("/:id", optionalAuth, getHomeBannerById);

// Admin only
router.post("/", verifyJWT, isAdmin, createHomeBanner);
router.put("/:id", verifyJWT, isAdmin, updateHomeBanner);
router.delete("/:id", verifyJWT, isAdmin, deleteHomeBanner);

export default router;
