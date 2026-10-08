import mongoose from "mongoose";

/**
 * Home page hero slider. Every ACTIVE banner is one slide (sorted by "order").
 */
const HomeBannerSchema = new mongoose.Schema(
    {
        // kept as an array for the existing admin panel – the first URL is the slide photo
        imgUrl: [
            {
                type: String,
                trim: true,
            },
        ],
        mobileImage: {
            type: String,
            trim: true,
        },
        title: {
            type: String,
            trim: true,
        },
        subtitle: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
        },
        buttonText: {
            type: String,
            trim: true,
        },
        buttonLink: {
            type: String,
            trim: true,
        },
        order: {
            type: Number,
            default: 0,
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

HomeBannerSchema.virtual("image").get(function () {
    return (this.imgUrl || []).find(Boolean) || "";
});
HomeBannerSchema.virtual("imageUrl").get(function () {
    return (this.imgUrl || []).find(Boolean) || "";
});
HomeBannerSchema.virtual("link").get(function () {
    return this.buttonLink || "";
});

HomeBannerSchema.index({ isActive: 1, order: 1 });

export default mongoose.model("HomeBanner", HomeBannerSchema);
