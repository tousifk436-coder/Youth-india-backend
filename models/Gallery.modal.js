import mongoose from "mongoose";
import { urlsOfType } from "../utils/media.js";

const AttachmentSchema = new mongoose.Schema(
    {
        documentType: {
            type: String,
            enum: ["image", "video", "file"],
            required: true,
        },
        urls: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    { _id: false }
);

const GallerySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: [true, "Title is required"],
        },

        /**
         * Decides on which website page the album appears:
         *   "guests" (default) -> Gallery > Guests & Dignitaries
         *   "video"            -> Gallery > Videos
         *   "event"            -> Events > Previous Events
         * Any text containing these words works (e.g. "Videos", "Guests & Dignitaries").
         */
        galleryType: {
            type: String,
            trim: true,
            default: "guests",
        },

        // optional link to a master category
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },

        // (spelling kept for the existing admin panel – "description" is also accepted and returned)
        discription: {
            type: String,
        },

        date: {
            type: Date,
        },

        location: {
            type: String,
            trim: true,
        },

        coverImage: {
            type: String,
            trim: true,
        },

        attachments: {
            type: [AttachmentSchema],
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

GallerySchema.virtual("description").get(function () {
    return this.discription;
});
GallerySchema.virtual("images").get(function () {
    return urlsOfType(this.attachments, "image");
});
GallerySchema.virtual("videos").get(function () {
    return urlsOfType(this.attachments, "video");
});
GallerySchema.virtual("cover").get(function () {
    return this.coverImage || urlsOfType(this.attachments, "image")[0] || "";
});

GallerySchema.index({ isActive: 1, galleryType: 1, order: 1 });

export default mongoose.model("Gallery", GallerySchema);
