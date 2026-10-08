import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const USER_ROLES = [
  "User",
  "Admin",
  "SuperAdmin",
  "Host",
  "OfficeBearer",
  "ExecutiveMember",
  "LocalSecretary",
];
export const ADMIN_ROLES = ["Admin", "SuperAdmin"];

const UserSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      trim: true,
    },
    userId: {
      type: String,
      trim: true,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiration: {
      type: Date,
      select: false,
    },

    // "isNew" is a reserved Mongoose name, so it is stored as isNewUser.
    // API responses still return it as "isNew".
    isNewUser: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    isBlock: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: USER_ROLES,
      default: "User",
      required: true,
    },

    dob: Date,
    age: Number,

    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    profilePic: String,
    address: {
      type: String,
      trim: true,
    },
    // stored as a bcrypt hash (old plain-text passwords are upgraded on the next login)
    password: {
      type: String,
      select: false,
    },
    fcmToken: {
      type: String,
    },
  },
  { timestamps: true }
);

const isHash = (v) => typeof v === "string" && /^\$2[aby]\$\d{2}\$/.test(v);

/* Hash the password whenever it is set or changed */
UserSchema.pre("save", async function () {
  if (this.isModified("password") && this.password && !isHash(this.password)) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

/**
 * Compares a password. Works with bcrypt hashes and with old plain-text
 * passwords (which are then upgraded to a hash automatically).
 * The document must be loaded with .select("+password").
 */
UserSchema.methods.checkPassword = async function (plain) {
  if (!this.password || !plain) return false;
  if (isHash(this.password)) return bcrypt.compare(String(plain), this.password);
  if (this.password !== String(plain)) return false;
  // upgrade the old plain-text password to a bcrypt hash
  this.password = await bcrypt.hash(String(plain), 10);
  await this.save();
  return true;
};

UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { userId: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
  );
};

/* Safe public shape (no password / otp) */
UserSchema.methods.toSafeJSON = function (extra = {}) {
  return {
    _id: this._id,
    userId: this.userId,
    phone: this.phone,
    name: this.name,
    email: this.email,
    gender: this.gender,
    role: this.role,
    isBlock: this.isBlock,
    isNew: this.isNewUser,
    profilePic: this.profilePic,
    address: this.address,
    dob: this.dob,
    age: this.age,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    ...extra,
  };
};

UserSchema.index({ userId: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ email: 1 });

export default mongoose.model("User", UserSchema);
