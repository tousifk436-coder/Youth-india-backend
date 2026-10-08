import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    
    heading: {
      type: String,
      trim: true,
    },
    Title: {
      type: String,
      
    },

    metaKeywords: {
      type: String,
      trim: true,
    },
    
    shortDescription: {
      type: String,
      trim: true,
    },

    mainImage: {
      type: String,
      trim: true,
    },

    multipleImages: {
      type: [String],
      default: [],
    },

    mainImageName: {
      type: String,
      trim: true,
    },

    details: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


export default mongoose.model("blog", blogSchema);