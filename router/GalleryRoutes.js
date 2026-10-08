import { Router } from "express";
import {
    createGallery,
    getAllGalleries,
    getGalleryById,
    updateGallery,
    deleteGallery,
} from "../controllers/GalleryController.js";
import { verifyJWT, optionalAuth } from "../middlewares/authTypeMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// Public (website) – visitors see only active galleries; an admin token also shows inactive ones
router.get("/", optionalAuth, getAllGalleries);
router.get("/:id", optionalAuth, getGalleryById);

// Admin only
router.post("/", verifyJWT, isAdmin, createGallery);
router.put("/:id", verifyJWT, isAdmin, updateGallery);
router.delete("/:id", verifyJWT, isAdmin, deleteGallery);

export default router;
