import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../../controllers/master/CategoryController.js";
import { verifyJWT, optionalAuth } from "../../middlewares/authTypeMiddleware.js";
import { isAdmin } from "../../middlewares/isAdmin.js";

const router = Router();

// Public
router.get("/", optionalAuth, getAllCategories);
router.get("/:id", optionalAuth, getCategoryById);

// Admin only
router.post("/", verifyJWT, isAdmin, createCategory);
router.put("/:id", verifyJWT, isAdmin, updateCategory);
router.delete("/:id", verifyJWT, isAdmin, deleteCategory);

export default router;
