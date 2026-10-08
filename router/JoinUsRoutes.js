import { Router } from "express";
import {
    createJoinUs,
    getAllJoinUs,
    getJoinUsById,
    updateJoinUs,
    deleteJoinUs,
} from "../controllers/JoinUsController.js";
import { verifyJWT, optionalAuth } from "../middlewares/authTypeMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { formLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Public – website form (Join Us + Event Registration)
router.post("/", formLimiter, createJoinUs);

// Admin only
router.get("/", verifyJWT, isAdmin, getAllJoinUs);
router.get("/:id", verifyJWT, isAdmin, getJoinUsById);
router.put("/:id", verifyJWT, isAdmin, updateJoinUs);
router.patch("/:id", verifyJWT, isAdmin, updateJoinUs);
router.delete("/:id", verifyJWT, isAdmin, deleteJoinUs);

export default router;
