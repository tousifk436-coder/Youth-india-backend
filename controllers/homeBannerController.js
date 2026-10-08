import HomeBanner from "../models/HomeBanner.modal.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { urlList } from "../utils/media.js";
import { getPaging, pageMeta, paginate, applyActiveFilter, isAdminRequest, toBool, clean } from "../utils/query.js";

/**
 * Accepts imgUrl (array or string), imageUrl, image or images for the photo.
 * Several banners can be active at the same time – each one is a slide.
 */
const buildBannerData = (body = {}) => {
    const sent = ["imgUrl", "imageUrl", "image", "images"].some((k) => body[k] !== undefined);
    const data = {
        imgUrl: sent
            ? [...new Set([...urlList(body.imgUrl), ...urlList(body.imageUrl), ...urlList(body.image), ...urlList(body.images)])]
            : undefined,
        mobileImage: body.mobileImage !== undefined ? urlList(body.mobileImage)[0] || "" : undefined,
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        buttonText: body.buttonText,
        buttonLink: body.buttonLink ?? body.link,
        order: body.order !== undefined ? Number(body.order) || 0 : undefined,
        isActive: toBool(body.isActive),
    };
    return clean(data);
};

export const createHomeBanner = asyncHandler(async (req, res) => {
    const data = buildBannerData(req.body);

    if (!data.imgUrl || !data.imgUrl.length) {
        return res.status(400).json(new apiResponse(400, null, "Banner image is required (imgUrl or imageUrl)"));
    }

    const banner = await HomeBanner.create(data);

    return res
        .status(201)
        .json(new apiResponse(201, banner, "Home banner created successfully"));
});

export const getAllHomeBanners = asyncHandler(async (req, res) => {
    const paging = getPaging(req.query);
    const filter = applyActiveFilter(req, {});

    const totalBanners = await HomeBanner.countDocuments(filter);
    const banners = await paginate(HomeBanner.find(filter).sort({ order: 1, createdAt: -1 }), paging);

    return res.status(200).json(
        new apiResponse(
            200,
            {
                banners,
                totalBanners,
                ...pageMeta(totalBanners, paging),
            },
            "Home banners fetched successfully"
        )
    );
});

export const getHomeBannerById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid home banner id"));
    }

    const banner = await HomeBanner.findById(id);

    if (!banner || (banner.isActive === false && !isAdminRequest(req))) {
        return res.status(404).json(new apiResponse(404, null, "Home banner not found"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, banner, "Home banner fetched successfully"));
});

export const updateHomeBanner = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid home banner id"));
    }

    const banner = await HomeBanner.findById(id);
    if (!banner) {
        return res.status(404).json(new apiResponse(404, null, "Home banner not found"));
    }

    const data = buildBannerData(req.body);
    if (data.imgUrl && !data.imgUrl.length) {
        return res.status(400).json(new apiResponse(400, null, "Banner image cannot be empty"));
    }
    banner.set(data);
    await banner.save();

    return res
        .status(200)
        .json(new apiResponse(200, banner, "Home banner updated successfully"));
});

export const deleteHomeBanner = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid home banner id"));
    }

    const banner = await HomeBanner.findByIdAndDelete(id);

    if (!banner) {
        return res.status(404).json(new apiResponse(404, null, "Home banner not found"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, banner, "Home banner deleted successfully"));
});
