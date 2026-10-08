import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    qualification: {
      type: String,
      trim: true,
    },

    experience: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
    },

    facebook: {
      type: String,
      trim: true,
    },

    instagram: {
      type: String,
      trim: true,
    },

    linkedin: {
      type: String,
      trim: true,
    },

    twitter: {
      type: String,
      trim: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Team", teamSchema);