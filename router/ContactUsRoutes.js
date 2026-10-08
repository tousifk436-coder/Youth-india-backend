import { Router } from "express";
import {
    createContactUs,
    getAllContactUs,
    getContactUsById,
    updateContactUs,
    deleteContactUs,
} from "../controllers/ContactUsController.js";
import { verifyJWT, optionalAuth } from "../middlewares/authTypeMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { formLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Public – website form (Contact Us)
router.post("/", formLimiter, createContactUs);

// Admin only
router.get("/", verifyJWT, isAdmin, getAllContactUs);
router.get("/:id", verifyJWT, isAdmin, getContactUsById);
router.put("/:id", verifyJWT, isAdmin, updateContactUs);
router.patch("/:id", verifyJWT, isAdmin, updateContactUs);
router.delete("/:id", verifyJWT, isAdmin, deleteContactUs);

export default router;
