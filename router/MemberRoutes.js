import { Router } from "express";
import {
  registerMember,
  loginMember,
  getMemberById,
  getMemberDetails,
  getAllMembers,
  updateMember,
  deleteMember,
  updateMemberStatus,
  getMemberStats,
} from "../controllers/MemberController.js";
import { verifyJWT, optionalAuth } from "../middlewares/authTypeMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { formLimiter, lookupLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Public (website)
router.post("/register", formLimiter, registerMember);
router.post("/login", lookupLimiter, optionalAuth, loginMember);
router.get("/details", lookupLimiter, optionalAuth, getMemberDetails); // ?memberId=&phoneNumber= (or &email=)

// Admin only (static paths first so they are not taken as an :id)
router.get("/all/members", verifyJWT, isAdmin, getAllMembers);
router.get("/stats/all", verifyJWT, isAdmin, getMemberStats);
router.get("/:id", verifyJWT, isAdmin, getMemberById);
router.put("/:id", verifyJWT, isAdmin, updateMember);
router.patch("/:id/status", verifyJWT, isAdmin, updateMemberStatus);
router.delete("/:id", verifyJWT, isAdmin, deleteMember);

export default router;
