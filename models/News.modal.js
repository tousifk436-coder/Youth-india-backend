import mongoose from "mongoose";

/**
 * Newspaper coverage. The website shows it in three tabs by "language":
 * English / Hindi / Multilingual (any other language goes to Multilingual).
 */
const NewsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: [true, "Title is required"],
        },

        // e.g. newspaper name ("Times of India")
        newspaperName: {
            type: String,
            trim: true,
        },

        newsType: {
            type: String,
            trim: true,
        },

        language: {
            type: String,
            trim: true,
            default: "English",
        },

        description: {
            type: String,
        },

        link: {
            type: String,
            trim: true,
        },

        date: {
            type: Date,
        },

        images: [
            {
                type: String,
                trim: true,
            },
        ],

        videos: [
            {
                type: String,
                trim: true,
            },
        ],

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

NewsSchema.virtual("image").get(function () {
    return (this.images || []).find(Boolean) || "";
});

NewsSchema.index({ isActive: 1, language: 1, date: -1 });

export default mongoose.model("News", NewsSchema);
