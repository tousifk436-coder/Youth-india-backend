import mongoose from "mongoose";

const SchemeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true,
        },
        discription: {
            type: String,
        },
        websiteUrl: {
            type: String,
        },
        type: {
            type: String,
        },

        attachments: [
            {
                documentType: {
                    type: String,
                    enum: ["image", "video", "file"],
                    required: true,
                },

                urls: [
                    {
                        type: String,
                    },
                ],
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
    }
);

export default mongoose.model("Scheme", SchemeSchema);