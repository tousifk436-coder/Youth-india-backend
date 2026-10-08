import mongoose from "mongoose";

const ContactUsSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, "Name is required"],
            maxlength: 150,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        },
        // optional – the website form does not ask for a phone number
        phone: {
            type: String,
            trim: true,
        },
        subject: {
            type: String,
            trim: true,
            maxlength: 300,
        },
        // the message (field name kept for the existing admin panel; "message" is accepted and returned too)
        discription: {
            type: String,
            maxlength: 5000,
        },
        source: {
            type: String,
            trim: true,
            default: "website",
        },
        status: {
            type: String,
            enum: ["new", "read", "resolved"],
            default: "new",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

ContactUsSchema.virtual("message").get(function () {
    return this.discription;
});

export default mongoose.model("ContactUs", ContactUsSchema);
