/**
 * Creates (or upgrades) an admin account.
 *
 *   npm run create-admin -- <userId> <password> <phone> "<name>" [Admin|SuperAdmin]
 *   e.g. npm run create-admin -- admin MyStrongPass123 9876543210 "Site Admin" SuperAdmin
 *
 * Uses MONGO_URI from .env. If the userId already exists, its role and password are updated.
 */
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.modal.js";

const [userId, password, phone, name = "Administrator", role = "SuperAdmin"] = process.argv.slice(2);

if (!userId || !password || !phone) {
  console.log('Usage: npm run create-admin -- <userId> <password> <phone> "<name>" [Admin|SuperAdmin]');
  process.exit(1);
}
if (!["Admin", "SuperAdmin"].includes(role)) {
  console.log("Role must be Admin or SuperAdmin");
  process.exit(1);
}
if (password.length < 6) {
  console.log("Password must be at least 6 characters");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

let user = await User.findOne({ userId }).select("+password");
if (user) {
  user.role = role;
  user.password = password;
  user.isBlock = false;
  if (!user.phone) user.phone = phone;
  await user.save();
  console.log(`✅ Updated "${userId}" -> role ${role}`);
} else {
  if (await User.exists({ phone })) {
    console.log("❌ This phone number is already used by another account");
    process.exit(1);
  }
  user = await User.create({ userId, password, phone, name, role, isNewUser: false });
  console.log(`✅ Created ${role} "${userId}"`);
}

await mongoose.disconnect();
process.exit(0);
