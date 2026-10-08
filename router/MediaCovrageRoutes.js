import { Router } from "express";
import {
    createMediaCovrage,
    getAllMediaCovrages,
    getMediaCovrageById,
    updateMediaCovrage,
    deleteMediaCovrage,
} from "../controllers/MediaCovrageController.js";
import { verifyJWT, optionalAuth } from "../middlewares/authTypeMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// Public (website) – visitors see only active media coverage; an admin token also shows inactive ones
router.get("/", optionalAuth, getAllMediaCovrages);
router.get("/:id", optionalAuth, getMediaCovrageById);

// Admin only
router.post("/", verifyJWT, isAdmin, createMediaCovrage);
router.put("/:id", verifyJWT, isAdmin, updateMediaCovrage);
router.delete("/:id", verifyJWT, isAdmin, deleteMediaCovrage);

export default router;
