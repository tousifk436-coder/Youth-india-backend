import News from "../models/News.modal.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { urlList } from "../utils/media.js";
import {
    getPaging, pageMeta, paginate, applyActiveFilter, isAdminRequest,
    searchRegex, toDate, toBool, clean,
} from "../utils/query.js";

/** Accepts images (array / "a,b") or a single image / imageUrl */
const buildNewsData = (body = {}) => {
    const imgSent = ["images", "image", "imageUrl"].some((k) => body[k] !== undefined);
    const data = {
        title: body.title !== undefined ? String(body.title).trim() : undefined,
        newspaperName: body.newspaperName,
        newsType: body.newsType,
        language: body.language,
        description: body.description,
        link: body.link,
        date: body.date !== undefined ? (toDate(body.date) ?? null) : undefined,
        images: imgSent ? [...new Set([...urlList(body.images), ...urlList(body.image), ...urlList(body.imageUrl)])] : undefined,
        videos: body.videos !== undefined ? urlList(body.videos) : undefined,
        isActive: toBool(body.isActive),
        order: body.order !== undefined ? Number(body.order) || 0 : undefined,
    };
    return clean(data);
};

export const createNews = asyncHandler(async (req, res) => {
    const data = buildNewsData(req.body);

    if (!data.title) {
        return res.status(400).json(new apiResponse(400, null, "Title is required"));
    }

    const news = await News.create(data);

    return res
        .status(201)
        .json(new apiResponse(201, news, "News created successfully"));
});

export const getAllNews = asyncHandler(async (req, res) => {
    const { search, fromDate, toDate: to, newsType, language } = req.query;
    const paging = getPaging(req.query);

    const filter = applyActiveFilter(req, {});

    if (search) filter.$or = [{ title: searchRegex(search) }, { newspaperName: searchRegex(search) }];
    if (newsType) filter.newsType = searchRegex(newsType);
    if (language) filter.language = searchRegex(language);

    const from = toDate(fromDate), till = toDate(to);
    if (from || till) {
        filter.date = {};
        if (from) filter.date.$gte = from;
        if (till) { till.setHours(23, 59, 59, 999); filter.date.$lte = till; }
    }

    const totalNews = await News.countDocuments(filter);
    const news = await paginate(News.find(filter).sort({ date: -1, order: 1, createdAt: -1 }), paging);

    return res.status(200).json(
        new apiResponse(
            200,
            {
                news,
                totalNews,
                ...pageMeta(totalNews, paging),
            },
            "News fetched successfully"
        )
    );
});

export const getNewsById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid news id"));
    }

    const news = await News.findById(id);

    if (!news || (news.isActive === false && !isAdminRequest(req))) {
        return res.status(404).json(new apiResponse(404, null, "News not found"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, news, "News fetched successfully"));
});

export const updateNews = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid news id"));
    }

    const news = await News.findById(id);
    if (!news) {
        return res.status(404).json(new apiResponse(404, null, "News not found"));
    }

    const data = buildNewsData(req.body);
    if (data.title === "") {
        return res.status(400).json(new apiResponse(400, null, "Title cannot be empty"));
    }
    news.set(data);
    await news.save();

    return res
        .status(200)
        .json(new apiResponse(200, news, "News updated successfully"));
});

export const deleteNews = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid news id"));
    }

    const news = await News.findByIdAndDelete(id);

    if (!news) {
        return res.status(404).json(new apiResponse(404, null, "News not found"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, news, "News deleted successfully"));
});
