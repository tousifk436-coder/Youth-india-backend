import Gallery from "../models/Gallery.modal.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { normalizeAttachments, urlList } from "../utils/media.js";
import {
    getPaging, pageMeta, paginate, applyActiveFilter, isAdminRequest,
    searchRegex, toDate, toBool, clean,
} from "../utils/query.js";

const buildGalleryData = (body = {}) => {
    const data = {
        title: body.title !== undefined ? String(body.title).trim() : undefined,
        galleryType: body.galleryType !== undefined ? String(body.galleryType).trim() : (body.type !== undefined ? String(body.type).trim() : undefined),
        category: body.category !== undefined ? (mongoose.Types.ObjectId.isValid(body.category) ? body.category : null) : undefined,
        discription: body.discription ?? body.description,
        date: body.date !== undefined ? (toDate(body.date) ?? null) : undefined,
        location: body.location,
        coverImage: body.coverImage !== undefined ? urlList(body.coverImage)[0] || "" : undefined,
        attachments: normalizeAttachments(body),
        isActive: toBool(body.isActive),
        order: body.order !== undefined ? Number(body.order) || 0 : undefined,
    };
    return clean(data);
};

export const createGallery = asyncHandler(async (req, res) => {
    const data = buildGalleryData(req.body);

    if (!data.title) {
        return res.status(400).json(new apiResponse(400, null, "Title is required"));
    }

    const gallery = await Gallery.create(data);

    return res
        .status(201)
        .json(new apiResponse(201, gallery, "Gallery created successfully"));
});

export const getAllGalleries = asyncHandler(async (req, res) => {
    const { search, fromDate, toDate: to, type, galleryType, category } = req.query;
    const paging = getPaging(req.query);

    const filter = applyActiveFilter(req, {});

    if (search) filter.title = searchRegex(search);
    if (galleryType) filter.galleryType = searchRegex(galleryType);
    if (category && mongoose.Types.ObjectId.isValid(category)) filter.category = category;

    const from = toDate(fromDate), till = toDate(to);
    if (from || till) {
        filter.date = {};
        if (from) filter.date.$gte = from;
        if (till) { till.setHours(23, 59, 59, 999); filter.date.$lte = till; }
    }

    if (type === "upcoming" || type === "completed") {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        filter.date = { ...(filter.date || {}), [type === "upcoming" ? "$gte" : "$lt"]: startOfToday };
    }

    const totalGalleries = await Gallery.countDocuments(filter);
    const galleries = await paginate(
        Gallery.find(filter).populate("category", "name").sort({ order: 1, date: -1, createdAt: -1 }),
        paging
    );

    return res.status(200).json(
        new apiResponse(
            200,
            {
                galleries,
                totalGalleries,
                ...pageMeta(totalGalleries, paging),
            },
            "Galleries fetched successfully"
        )
    );
});

export const getGalleryById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid gallery id"));
    }

    const gallery = await Gallery.findById(id).populate("category", "name");

    if (!gallery || (gallery.isActive === false && !isAdminRequest(req))) {
        return res.status(404).json(new apiResponse(404, null, "Gallery not found"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, gallery, "Gallery fetched successfully"));
});

export const updateGallery = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid gallery id"));
    }

    const gallery = await Gallery.findById(id);
    if (!gallery) {
        return res.status(404).json(new apiResponse(404, null, "Gallery not found"));
    }

    const data = buildGalleryData(req.body);
    if (data.title === "") {
        return res.status(400).json(new apiResponse(400, null, "Title cannot be empty"));
    }
    gallery.set(data);
    await gallery.save();
    await gallery.populate("category", "name");

    return res
        .status(200)
        .json(new apiResponse(200, gallery, "Gallery updated successfully"));
});

export const deleteGallery = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid gallery id"));
    }

    const gallery = await Gallery.findByIdAndDelete(id);

    if (!gallery) {
        return res.status(404).json(new apiResponse(404, null, "Gallery not found"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, gallery, "Gallery deleted successfully"));
});
