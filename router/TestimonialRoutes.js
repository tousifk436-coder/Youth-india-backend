import { Router } from "express";
import {
    createTestimonial,
    getAllTestimonials,
    getTestimonialById,
    updateTestimonial,
    deleteTestimonial,
} from "../controllers/TestimonialController.js";
import { verifyJWT, optionalAuth } from "../middlewares/authTypeMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// Public (website) – visitors see only active testimonials; an admin token also shows inactive ones
router.get("/", optionalAuth, getAllTestimonials);
router.get("/:id", optionalAuth, getTestimonialById);

// Admin only
router.post("/", verifyJWT, isAdmin, createTestimonial);
router.put("/:id", verifyJWT, isAdmin, updateTestimonial);
router.delete("/:id", verifyJWT, isAdmin, deleteTestimonial);

export default router;
