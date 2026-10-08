import { Router } from "express";
import {
    createNews,
    getAllNews,
    getNewsById,
    updateNews,
    deleteNews,
} from "../controllers/NewsController.js";
import { verifyJWT, optionalAuth } from "../middlewares/authTypeMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// Public (website) – visitors see only active news; an admin token also shows inactive ones
router.get("/", optionalAuth, getAllNews);
router.get("/:id", optionalAuth, getNewsById);

// Admin only
router.post("/", verifyJWT, isAdmin, createNews);
router.put("/:id", verifyJWT, isAdmin, updateNews);
router.delete("/:id", verifyJWT, isAdmin, deleteNews);

export default router;
