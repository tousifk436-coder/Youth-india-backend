import { Router } from "express";
import {
    createTeam,
    getAllTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
} from "../controllers/TeamController.js";
import { verifyJWT, optionalAuth } from "../middlewares/authTypeMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// Public (website) – visitors see only active team members; an admin token also shows inactive ones
router.get("/", optionalAuth, getAllTeams);
router.get("/:id", optionalAuth, getTeamById);

// Admin only
router.post("/", verifyJWT, isAdmin, createTeam);
router.put("/:id", verifyJWT, isAdmin, updateTeam);
router.delete("/:id", verifyJWT, isAdmin, deleteTeam);

export default router;
