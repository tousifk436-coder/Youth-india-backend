import mongoose from "mongoose";

/**
 * Join-us requests AND website event registrations (type: "event-registration").
 */
const JoinUsSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["join-us", "event-registration", "volunteer", "internship"],
            default: "join-us",
        },
        name: {
            type: String,
            trim: true,
            required: [true, "Name is required"],
            maxlength: 150,
        },
        phone: {
            type: String,
            trim: true,
        },
        whatsappNo: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        },
        designation: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        district: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
        },
        fullAddress: {
            type: String,
            trim: true,
        },
        resume: {
            type: String,
            trim: true,
        },
        message: {
            type: String,
            maxlength: 5000,
        },

        // ---- Event registration details
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
        },
        eventName: {
            type: String,
            trim: true,
        },
        eventDate: {
            type: Date,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        entryFee: {
            type: Number,
            default: 0,
        },
        transactionId: {
            type: String,
            trim: true,
        },
        paymentStatus: {
            type: String,
            enum: ["not-required", "pending-verification", "verified", "rejected"],
            default: "not-required",
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
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

JoinUsSchema.index({ type: 1, event: 1, createdAt: -1 });

export default mongoose.model("JoinUs", JoinUsSchema);
