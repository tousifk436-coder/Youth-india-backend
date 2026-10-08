import jwt from "jsonwebtoken";
import { apiError } from "../utils/apiError.js";
import User from "../models/User.modal.js";

const readToken = (req) => {
  const header = req.header("Authorization") || "";
  return req.cookies?.accessToken || (header.startsWith("Bearer ") ? header.slice(7).trim() : header.trim()) || null;
};

/**
 * Requires a valid login token. Blocked users are refused.
 */
export const verifyJWT = async (req, res, next) => {
  try {
    const token = readToken(req);
    if (!token) {
      return apiError(res, 401, false, "Unauthorized request: No token provided");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken?.userId);

    if (!user) {
      return apiError(res, 401, false, "Invalid access token: User not found");
    }
    if (user.isBlock) {
      return apiError(res, 403, false, "Your account has been blocked. Please contact administrator.");
    }

    req.user = user;
    next();
  } catch (error) {
    const msg = error?.name === "TokenExpiredError" ? "Session expired, please login again" : "Invalid access token";
    return apiError(res, 401, false, msg);
  }
};

/**
 * Reads the token if present but never blocks the request.
 * Used on public GET routes so admins can also see inactive items.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = readToken(req);
    if (token) {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decodedToken?.userId);
      if (user && !user.isBlock) req.user = user;
    }
  } catch {
    /* invalid / expired token on a public route – just treat as a visitor */
  }
  next();
};

/**
 * Allows only the given roles (e.g. authorizeUserType("Admin", "SuperAdmin")).
 */
export const authorizeUserType = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiError(res, 401, false, "Unauthorized access: No user data available");
    }
    if (!allowedTypes.includes(req.user.role)) {
      return apiError(res, 403, false, "Forbidden: You do not have access to this resource");
    }
    next();
  };
};
