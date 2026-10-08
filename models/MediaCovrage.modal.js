import mongoose from "mongoose";

/**
 * Electronic media coverage (TV / radio / online interviews).
 * Only "title" is required so a simple interview link can be added quickly.
 */
const MediaCovrageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    // channel / newspaper / platform name
    publisherName: {
      type: String,
      trim: true,
    },

    // tv | radio | online | print | other
    mediaType: {
      type: String,
      trim: true,
      lowercase: true,
      default: "tv",
    },

    shortDescription: {
      type: String,
      trim: true,
    },

    detailDescription: {
      type: String,
    },

    coverageDate: {
      type: Date,
    },

    // link to the interview / programme (YouTube, news site …)
    link: {
      type: String,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    videos: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* Friendly names used by the website */
MediaCovrageSchema.virtual("channel").get(function () {
  return this.publisherName || "";
});
MediaCovrageSchema.virtual("description").get(function () {
  return this.shortDescription || this.detailDescription || "";
});
MediaCovrageSchema.virtual("date").get(function () {
  return this.coverageDate || null;
});
MediaCovrageSchema.virtual("url").get(function () {
  return this.link || (this.videos || []).find(Boolean) || "";
});
MediaCovrageSchema.virtual("image").get(function () {
  return (this.images || []).find(Boolean) || "";
});

MediaCovrageSchema.index({ isActive: 1, coverageDate: -1 });

export default mongoose.model("MediaCovrage", MediaCovrageSchema);
