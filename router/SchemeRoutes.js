import { Router } from "express";
import {
    createScheme,
    getAllSchemes,
    getSchemeById,
    updateScheme,
    deleteScheme,
} from "../controllers/SchemeController.js";
import { verifyJWT, optionalAuth } from "../middlewares/authTypeMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// Public (website) – visitors see only active schemes; an admin token also shows inactive ones
router.get("/", optionalAuth, getAllSchemes);
router.get("/:id", optionalAuth, getSchemeById);

// Admin only
router.post("/", verifyJWT, isAdmin, createScheme);
router.put("/:id", verifyJWT, isAdmin, updateScheme);
router.delete("/:id", verifyJWT, isAdmin, deleteScheme);

export default router;
