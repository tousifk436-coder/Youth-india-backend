import { apiResponse } from "../utils/apiResponse.js";
import { ADMIN_ROLES } from "../models/User.modal.js";

/**
 * Admin & SuperAdmin only. Use after verifyJWT.
 */
const isAdmin = (req, res, next) => {
  if (!ADMIN_ROLES.includes(req.user?.role)) {
    return res
      .status(403)
      .json(new apiResponse(403, null, "Access denied: Admin only"));
  }
  next();
};

export { isAdmin };
