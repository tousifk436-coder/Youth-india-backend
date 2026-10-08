import { Router } from "express";
import {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
} from "../controllers/EventController.js";
import { verifyJWT, optionalAuth } from "../middlewares/authTypeMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// Public (website) – visitors see only active events; an admin token also shows inactive ones
router.get("/", optionalAuth, getAllEvents);
router.get("/:id", optionalAuth, getEventById);

// Admin only
router.post("/", verifyJWT, isAdmin, createEvent);
router.put("/:id", verifyJWT, isAdmin, updateEvent);
router.delete("/:id", verifyJWT, isAdmin, deleteEvent);

export default router;
