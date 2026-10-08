import mongoose from "mongoose";
import User, { USER_ROLES, ADMIN_ROLES } from "../models/User.modal.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendOTP } from "../utils/sendOTP.js";
import { searchRegex, getPaging, pageMeta, isAdminRequest } from "../utils/query.js";

const OTP_EXPIRATION_TIME = (Number(process.env.OTP_EXPIRY_MINUTES) || 5) * 60 * 1000;
const str = (v) => (v === undefined || v === null || v === "" ? undefined : String(v).trim());

/** OTP is only returned in the response when OTP_DEBUG=true (local testing) */
const otpDebug = (otp) => (process.env.OTP_DEBUG === "true" && process.env.NODE_ENV !== "production" ? { otp } : {});

/** Optional review/demo number from .env (TEST_PHONE + TEST_OTP) */
const makeOtp = (phone) =>
  process.env.TEST_PHONE && process.env.TEST_OTP && phone === process.env.TEST_PHONE ? process.env.TEST_OTP : generateOTP();

/**
 * Which role a new account gets.
 *  - Admin / SuperAdmin logged in  -> any allowed role (only a SuperAdmin can create a SuperAdmin)
 *  - "setupKey" matching ADMIN_SETUP_KEY in .env -> requested role (to create the first admin)
 *  - everybody else -> "User"
 */
const decideRole = (req, requested) => {
  const role = USER_ROLES.includes(requested) ? requested : "User";
  if (role === "User") return "User";
  if (isAdminRequest(req)) {
    if (role === "SuperAdmin" && req.user.role !== "SuperAdmin") return null;
    return role;
  }
  const key = process.env.ADMIN_SETUP_KEY;
  if (key && req.body?.setupKey && req.body.setupKey === key) return role;
  return null;
};

const loadWithSecrets = (filter) => User.findOne(filter).select("+password +otp +otpExpiration");

// POST /api/auth/registerOrLogin  – creates the user (if new) and sends an OTP
const registerOrLogin = asyncHandler(async (req, res) => {
  const phone = str(req.body.phone);
  const userId = str(req.body.userId);
  const password = req.body.password;
  const { name, gender } = req.body;

  if (!phone || !userId || !password) {
    return res.status(400).json(new apiResponse(400, null, "Phone, userId and password are required"));
  }

  const otp = makeOtp(phone);
  const otpExpiration = new Date(Date.now() + OTP_EXPIRATION_TIME);

  let user = await loadWithSecrets({ userId });

  if (user) {
    if (user.phone !== phone) {
      return res.status(400).json(new apiResponse(400, null, "Phone number does not match userId"));
    }
    if (user.isBlock) {
      return res.status(403).json(new apiResponse(403, null, "Your account has been blocked. Please contact administrator."));
    }
    if (!(await user.checkPassword(password))) {
      return res.status(400).json(new apiResponse(400, null, "Invalid password"));
    }
    user.otp = otp;
    user.otpExpiration = otpExpiration;
    await user.save();
    await sendOTP(phone, otp);

    return res.status(200).json(
      new apiResponse(
        200,
        { _id: user._id, userId: user.userId, phone: user.phone, isNew: user.isNewUser, name: user.name, gender: user.gender, role: user.role, ...otpDebug(otp) },
        "Existing user - OTP sent successfully"
      )
    );
  }

  if (await User.exists({ phone })) {
    return res.status(400).json(new apiResponse(400, null, "Phone already registered"));
  }
  const role = decideRole(req, req.body.role);
  if (!role) {
    return res.status(403).json(new apiResponse(403, null, "You are not allowed to create this role"));
  }

  const newUser = await User.create({
    userId,
    phone,
    password,
    otp,
    otpExpiration,
    name,
    gender: gender || undefined,
    role,
    isNewUser: true,
  });
  await sendOTP(phone, otp);

  return res.status(200).json(
    new apiResponse(
      200,
      { _id: newUser._id, userId: newUser.userId, phone: newUser.phone, isNew: true, role: newUser.role, ...otpDebug(otp) },
      "New user created - OTP sent successfully"
    )
  );
});

// POST /api/auth/registerUser  – direct registration (no OTP), returns a token
const registerUser = asyncHandler(async (req, res) => {
  const phone = str(req.body.phone);
  const userId = str(req.body.userId);
  const name = str(req.body.name);
  const email = str(req.body.email)?.toLowerCase();
  const { password, gender } = req.body;

  if (!phone || !userId || !password || !name) {
    return res.status(400).json(new apiResponse(400, null, "Phone, userId, password and name are required"));
  }
  if (String(password).length < 6) {
    return res.status(400).json(new apiResponse(400, null, "Password must be at least 6 characters"));
  }

  if (await User.exists({ phone })) {
    return res.status(400).json(new apiResponse(400, null, "Phone already registered"));
  }
  if (await User.exists({ userId })) {
    return res.status(400).json(new apiResponse(400, null, "UserId already exists"));
  }
  if (email && (await User.exists({ email }))) {
    return res.status(400).json(new apiResponse(400, null, "Email already exists"));
  }

  const role = decideRole(req, req.body.role);
  if (!role) {
    return res.status(403).json(new apiResponse(403, null, "You are not allowed to create this role"));
  }

  const user = await User.create({
    phone,
    userId,
    password,
    name,
    gender: gender || undefined,
    role,
    email,
    isNewUser: false,
  });

  const token = user.generateAuthToken();

  return res
    .status(201)
    .json(new apiResponse(201, user.toSafeJSON({ authToken: token }), "User registered successfully"));
});

// POST /api/auth/verifyOtp
const verifyOtp = asyncHandler(async (req, res) => {
  const phone = str(req.body.phone);
  const otp = str(req.body.otp);

  if (!phone || !otp) {
    return res.status(400).json(new apiResponse(400, null, "Phone and OTP are required"));
  }

  const user = await loadWithSecrets({ phone });
  if (!user) return res.status(400).json(new apiResponse(400, null, "User not found"));
  if (user.isBlock) {
    return res.status(403).json(new apiResponse(403, null, "Your account has been blocked. Please contact administrator."));
  }
  if (!user.otp || user.otp !== otp) {
    return res.status(400).json(new apiResponse(400, null, "Invalid OTP"));
  }
  if (!user.otpExpiration || user.otpExpiration < new Date()) {
    return res.status(400).json(new apiResponse(400, null, "OTP has expired. Please request a new one."));
  }

  user.otp = undefined;
  user.otpExpiration = undefined;
  await user.save();

  const token = user.generateAuthToken();

  return res
    .status(200)
    .json(new apiResponse(200, user.toSafeJSON({ authToken: token }), "OTP verified successfully"));
});

const issueOtp = async (req, res, message) => {
  const phone = str(req.body.phone);

  if (!phone) return res.status(400).json(new apiResponse(400, null, "Phone number is required"));

  const user = await loadWithSecrets({ phone });
  if (!user) return res.status(400).json(new apiResponse(400, null, "User not found"));
  if (user.isBlock) {
    return res.status(403).json(new apiResponse(403, null, "Your account has been blocked. Please contact administrator."));
  }

  const otp = makeOtp(phone);
  user.otp = otp;
  user.otpExpiration = new Date(Date.now() + OTP_EXPIRATION_TIME);
  await user.save();
  await sendOTP(phone, otp);

  return res.status(200).json(new apiResponse(200, { phone, ...otpDebug(otp) }, message));
};

// POST /api/auth/sendOtp
const sendOtp = asyncHandler(async (req, res) => issueOtp(req, res, "OTP sent successfully"));

// POST /api/auth/resendOtp
const resendOtp = asyncHandler(async (req, res) => issueOtp(req, res, "OTP resent successfully"));

// PATCH /api/auth/update/:id  – the user himself or an admin (role / password / block are NOT changed here)
const updateUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid user id"));
  }
  if (String(req.user._id) !== String(id) && !isAdminRequest(req)) {
    return res.status(403).json(new apiResponse(403, null, "You can only update your own profile"));
  }

  const user = await User.findById(id);
  if (!user) return res.status(404).json(new apiResponse(404, null, "User not found"));

  const ALLOWED = ["name", "email", "gender", "dob", "age", "profilePic", "address", "fcmToken"];
  if (isAdminRequest(req)) ALLOWED.push("phone", "userId");

  if (req.body.email && str(req.body.email).toLowerCase() !== user.email) {
    if (await User.exists({ email: str(req.body.email).toLowerCase(), _id: { $ne: user._id } })) {
      return res.status(400).json(new apiResponse(400, null, "Email already exists"));
    }
  }
  if (req.body.phone && isAdminRequest(req) && req.body.phone !== user.phone) {
    if (await User.exists({ phone: req.body.phone, _id: { $ne: user._id } })) {
      return res.status(400).json(new apiResponse(400, null, "Phone already registered"));
    }
  }

  ALLOWED.forEach((key) => {
    if (req.body[key] !== undefined) user[key] = req.body[key];
  });
  user.isNewUser = false;
  await user.save();

  return res.status(200).json(new apiResponse(200, user.toSafeJSON(), "User updated successfully"));
});

// DELETE /api/auth/delete/:id  (admin)
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid user id"));
  }
  if (String(req.user._id) === String(id)) {
    return res.status(400).json(new apiResponse(400, null, "You cannot delete your own account"));
  }

  const user = await User.findById(id);
  if (!user) return res.status(404).json(new apiResponse(404, null, "User not found"));
  if (user.role === "SuperAdmin" && req.user.role !== "SuperAdmin") {
    return res.status(403).json(new apiResponse(403, null, "Only a SuperAdmin can delete a SuperAdmin"));
  }

  await User.findByIdAndDelete(id);
  return res.status(200).json(new apiResponse(200, null, "User deleted successfully"));
});

// GET /api/auth/getAllUsers  (admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { search, sortBy = "recent", role, isBlock } = req.query;
  const paging = getPaging(req.query);

  const match = {};
  if (role) match.role = role;
  if (isBlock === "true" || isBlock === "false") match.isBlock = isBlock === "true";
  if (search) {
    const words = String(search).trim().split(/\s+/).filter(Boolean);
    match.$or = words.flatMap((w) => [{ name: searchRegex(w) }, { phone: searchRegex(w) }, { email: searchRegex(w) }, { userId: searchRegex(w) }]);
  }

  const sort = sortBy === "oldest" ? { createdAt: 1, _id: 1 } : { createdAt: -1, _id: -1 };

  let q = User.find(match).sort(sort);
  if (paging.isPagination) q = q.skip(paging.skip).limit(paging.limit);
  const [users, total] = await Promise.all([q, User.countDocuments(match)]);

  return res.status(200).json(
    new apiResponse(
      200,
      {
        users: users.map((u) => u.toSafeJSON()),
        totalUsers: total,
        ...pageMeta(total, paging),
      },
      "Users fetched successfully"
    )
  );
});

// GET /api/auth/profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json(new apiResponse(404, null, "User not found"));

  return res
    .status(200)
    .json(new apiResponse(200, { role: user.role, user: user.toSafeJSON() }, "Profile fetched successfully"));
});

// POST /api/auth/loginWithPassword  { userId | email | phone, password }
const loginWithPassword = asyncHandler(async (req, res) => {
  const userId = str(req.body.userId);
  const email = str(req.body.email)?.toLowerCase();
  const phone = str(req.body.phone);
  const { password } = req.body;

  if ((!userId && !email && !phone) || !password) {
    return res.status(400).json(new apiResponse(400, null, "UserId (or email / phone) and password are required"));
  }

  const existingUser = await loadWithSecrets(userId ? { userId } : email ? { email } : { phone });

  // same message for "not found" and "wrong password" (does not reveal which accounts exist)
  if (!existingUser || !existingUser.password) {
    return res.status(400).json(new apiResponse(400, null, "Invalid login details"));
  }
  if (existingUser.isBlock) {
    return res.status(403).json(new apiResponse(403, null, "Your account has been blocked. Please contact administrator."));
  }
  if (!(await existingUser.checkPassword(password))) {
    return res.status(400).json(new apiResponse(400, null, "Invalid login details"));
  }

  const token = existingUser.generateAuthToken();

  return res
    .status(200)
    .json(new apiResponse(200, existingUser.toSafeJSON({ authToken: token }), "Login successful"));
});

// POST /api/auth/createPassword  – logged-in user without a password (e.g. OTP sign-up); admins may pass userId
const createPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || String(password).length < 6) {
    return res.status(400).json(new apiResponse(400, null, "Password of at least 6 characters is required"));
  }

  const target = isAdminRequest(req) && req.body.userId ? { userId: str(req.body.userId) } : { _id: req.user._id };
  const user = await loadWithSecrets(target);
  if (!user) return res.status(400).json(new apiResponse(400, null, "User not found"));

  if (user.password) {
    return res.status(400).json(new apiResponse(400, null, "Password already set"));
  }

  user.password = password;
  await user.save();

  return res.status(200).json(new apiResponse(200, null, "Password created successfully"));
});

// POST /api/auth/resetPassword  (admin) { userId, password }
const resetPassword = asyncHandler(async (req, res) => {
  const userId = str(req.body.userId);
  const { password } = req.body;

  if (!userId || !password || String(password).length < 6) {
    return res.status(400).json(new apiResponse(400, null, "UserId and a password of at least 6 characters are required"));
  }

  const user = await loadWithSecrets({ userId });
  if (!user) return res.status(400).json(new apiResponse(400, null, "User not found"));
  if (user.role === "SuperAdmin" && req.user.role !== "SuperAdmin") {
    return res.status(403).json(new apiResponse(403, null, "Only a SuperAdmin can reset a SuperAdmin password"));
  }

  user.password = password;
  await user.save();

  return res.status(200).json(new apiResponse(200, null, "Password reset successfully"));
});

// POST /api/auth/updatePassword  (logged-in user) { oldPassword, newPassword }
const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json(new apiResponse(400, null, "Old password and new password are required"));
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json(new apiResponse(400, null, "New password must be at least 6 characters"));
  }

  const user = await loadWithSecrets({ _id: req.user._id });
  if (!user) return res.status(400).json(new apiResponse(400, null, "User not found"));

  if (!(await user.checkPassword(oldPassword))) {
    return res.status(400).json(new apiResponse(400, null, "Invalid old password"));
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json(new apiResponse(200, null, "Password updated successfully"));
});

// PUT /api/auth/updateRoll/:userId  (admin)
const updateUserRoll = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const role = str(req.body.role);

  if (!userId || !role) {
    return res.status(400).json(new apiResponse(400, null, "User ID and role are required"));
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid user id"));
  }
  if (!USER_ROLES.includes(role)) {
    return res
      .status(400)
      .json(new apiResponse(400, { receivedRole: role, allowedRoles: USER_ROLES }, "Invalid role value"));
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json(new apiResponse(404, null, "User not found"));

  // only a SuperAdmin can give or take away the SuperAdmin role
  if ((role === "SuperAdmin" || user.role === "SuperAdmin") && req.user.role !== "SuperAdmin") {
    return res.status(403).json(new apiResponse(403, null, "Only a SuperAdmin can change SuperAdmin roles"));
  }
  if (String(req.user._id) === String(user._id) && !ADMIN_ROLES.includes(role)) {
    return res.status(400).json(new apiResponse(400, null, "You cannot remove your own admin access"));
  }

  user.role = role;
  await user.save();

  return res
    .status(200)
    .json(new apiResponse(200, { userId: user._id, role: user.role }, "Role updated successfully"));
});

// GET /api/auth/user/:userId  (admin, or the user himself)
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid user id"));
  }
  if (String(req.user._id) !== String(userId) && !isAdminRequest(req)) {
    return res.status(403).json(new apiResponse(403, null, "Access denied"));
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json(new apiResponse(404, null, "User not found"));

  return res.status(200).json(new apiResponse(200, user.toSafeJSON(), "User details fetched successfully"));
});

// PUT /api/auth/blockUser/:userId  (admin) { isBlock: true|false }
const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const isBlock = req.body.isBlock === true || req.body.isBlock === "true";

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid user id"));
  }
  if (String(req.user._id) === String(userId)) {
    return res.status(400).json(new apiResponse(400, null, "You cannot block your own account"));
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json(new apiResponse(404, null, "User not found"));
  if (user.role === "SuperAdmin" && req.user.role !== "SuperAdmin") {
    return res.status(403).json(new apiResponse(403, null, "Only a SuperAdmin can block a SuperAdmin"));
  }

  user.isBlock = isBlock;
  await user.save();

  return res
    .status(200)
    .json(new apiResponse(200, user.toSafeJSON(), `User ${isBlock ? "blocked" : "unblocked"} successfully`));
});

export {
  registerOrLogin,
  verifyOtp,
  sendOtp,
  resendOtp,
  updateUserById,
  getAllUsers,
  getProfile,
  loginWithPassword,
  createPassword,
  updateUserRoll,
  updatePassword,
  resetPassword,
  deleteUser,
  getUserById,
  registerUser,
  blockUser,
};