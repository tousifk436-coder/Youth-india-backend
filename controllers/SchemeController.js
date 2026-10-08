import Scheme from "../models/Scheme.modal.js";
import { applyActiveFilter, isAdminRequest, escapeRegex } from "../utils/query.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { normalizeAttachments } from "../utils/media.js";

export const createScheme = asyncHandler(async (req, res) => {
    const { title, discription, type, websiteUrl, attachments, isActive, order } = req.body;

    if (!title?.trim()) {
        return res
            .status(400)
            .json(new apiResponse(400, null, "Title is required"));
    }

    const scheme = await Scheme.create({
        title: title.trim(),
        discription,
        attachments: normalizeAttachments(req.body) || [],
        isActive,
        type,
        websiteUrl,
        order,
    });

    return res
        .status(201)
        .json(new apiResponse(201, scheme, "Scheme created successfully"));
});

export const getAllSchemes = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        search,
        type,
        isActive,
        isPagination = "true",
    } = req.query;

    const filter = applyActiveFilter(req, {});

    if (search) {
        filter.title = {
            $regex: escapeRegex(search),
            $options: "i",
        };
    }

    if (type) {
        filter.type = type;
    }

    const totalSchemes = await Scheme.countDocuments(filter);

    let query = Scheme.find(filter).sort({
        order: 1,
        createdAt: -1,
    });

    if (isPagination === "true") {
        query = query
            .skip((Number(page) - 1) * Math.min(Number(limit) || 10, 100))
            .limit(Math.min(Number(limit) || 10, 100));
    }

    const schemes = await query;

    return res.status(200).json(
        new apiResponse(
            200,
            {
                schemes,
                totalSchemes,
                totalPages: Math.ceil(totalSchemes / Math.min(Number(limit) || 10, 100)),
                currentPage: Number(page),
            },
            "Schemes fetched successfully"
        )
    );
});

export const getSchemeById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
            .status(400)
            .json(new apiResponse(400, null, "Invalid scheme id"));
    }

    const scheme = await Scheme.findById(id);

    if (!scheme || (scheme.isActive === false && !isAdminRequest(req))) {
        return res
            .status(404)
            .json(new apiResponse(404, null, "Scheme not found"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, scheme, "Scheme fetched successfully"));
});

export const updateScheme = asyncHandler(async (req, res) => {
    const body = { ...req.body };
    const att = normalizeAttachments(body);
    if (att) body.attachments = att;
    delete body.images; delete body.videos; delete body.files;

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
            .status(400)
            .json(new apiResponse(400, null, "Invalid scheme id"));
    }

    const scheme = await Scheme.findByIdAndUpdate(
        id,
        body,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!scheme) {
        return res
            .status(404)
            .json(new apiResponse(404, null, "Scheme not found"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, scheme, "Scheme updated successfully"));
});

export const deleteScheme = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
            .status(400)
            .json(new apiResponse(400, null, "Invalid scheme id"));
    }

    const scheme = await Scheme.findByIdAndDelete(id);

    if (!scheme) {
        return res
            .status(404)
            .json(new apiResponse(404, null, "Scheme not found"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, scheme, "Scheme deleted successfully"));
});