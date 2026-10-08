import { Router } from "express";
import {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
} from "../controllers/BlogController.js";
import { verifyJWT, optionalAuth } from "../middlewares/authTypeMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// Public (website) – visitors see only active blogs; an admin token also shows inactive ones
router.get("/", optionalAuth, getAllBlogs);
router.get("/:id", optionalAuth, getBlogById);

// Admin only
router.post("/", verifyJWT, isAdmin, createBlog);
router.put("/:id", verifyJWT, isAdmin, updateBlog);
router.delete("/:id", verifyJWT, isAdmin, deleteBlog);

export default router;
