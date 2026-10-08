import { Router } from "express";
import {
  blockUser, createPassword, deleteUser, getAllUsers, getProfile, getUserById, loginWithPassword,
  registerOrLogin, registerUser, resendOtp, resetPassword, sendOtp, updatePassword, updateUserById,
  updateUserRoll, verifyOtp,
} from "../controllers/authController.js";
import { verifyJWT, optionalAuth } from "../middlewares/authTypeMiddleware.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const routes = Router();

// Public (rate limited). An admin token lets these create Admin / other roles.
routes.post("/registerOrLogin", authLimiter, optionalAuth, registerOrLogin);
routes.post("/registerUser", authLimiter, optionalAuth, registerUser);
routes.post("/verifyOtp", authLimiter, verifyOtp);
routes.post("/sendOtp", authLimiter, sendOtp);
routes.post("/resendOtp", authLimiter, resendOtp);
routes.post("/loginWithPassword", authLimiter, loginWithPassword);

// Logged-in user
routes.get("/profile", verifyJWT, getProfile);
routes.patch("/update/:id", verifyJWT, updateUserById);
routes.post("/createPassword", verifyJWT, createPassword);
routes.post("/updatePassword", verifyJWT, updatePassword);
routes.get("/user/:userId", verifyJWT, getUserById);

// Admin only
routes.get("/getAllUsers", verifyJWT, isAdmin, getAllUsers);
routes.delete("/delete/:id", verifyJWT, isAdmin, deleteUser);
routes.put("/updateRoll/:userId", verifyJWT, isAdmin, updateUserRoll);
routes.put("/blockUser/:userId", verifyJWT, isAdmin, blockUser);
routes.post("/resetPassword", verifyJWT, isAdmin, resetPassword);

export default routes;
