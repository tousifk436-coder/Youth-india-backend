import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Category", categorySchema);
