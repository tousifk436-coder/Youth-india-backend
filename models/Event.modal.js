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

const EventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: [true, "Title is required"],
        },

        subtitle: {
            type: String,
            trim: true,
        },

        eventType: {
            type: String,
            trim: true,
        },

        // (spelling kept for the existing admin panel – "description" is also accepted and returned)
        discription: {
            type: String,
        },

        date: {
            type: Date,
        },

        endDate: {
            type: Date,
        },

        time: {
            type: String,
            trim: true,
        },

        location: {
            type: String,
            trim: true,
        },

        // Customised banner shown on "Upcoming Events" (first image is used when empty)
        banner: {
            type: String,
            trim: true,
        },

        bannerDescription: {
            type: String,
            trim: true,
        },

        highlights: {
            type: [String],
            default: [],
        },

        // ---- Registration & payment (website: Paid event shows the QR, Free event shows the popup)
        isPaid: {
            type: Boolean,
            default: false,
        },

        fee: {
            type: Number,
            min: [0, "Fee cannot be negative"],
            default: 0,
        },

        paymentQr: {
            type: String,
            trim: true,
        },

        registrationOpen: {
            type: Boolean,
            default: true,
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

/* Ready-to-use lists for the website / admin panel */
EventSchema.virtual("description").get(function () {
    return this.discription;
});
EventSchema.virtual("images").get(function () {
    return urlsOfType(this.attachments, "image");
});
EventSchema.virtual("videos").get(function () {
    return urlsOfType(this.attachments, "video");
});
EventSchema.virtual("image").get(function () {
    return this.banner || urlsOfType(this.attachments, "image")[0] || "";
});
EventSchema.virtual("status").get(function () {
    if (!this.date) return "upcoming";
    const end = new Date(this.endDate || this.date);
    end.setHours(23, 59, 59, 999);
    return end < new Date() ? "completed" : "upcoming";
});

EventSchema.pre("validate", function (next) {
    if (!this.isPaid) this.fee = 0;
    next();
});

EventSchema.index({ isActive: 1, date: 1 });

export default mongoose.model("Event", EventSchema);
