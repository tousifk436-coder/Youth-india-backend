import MediaCovrage from "../models/MediaCovrage.modal.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { urlList } from "../utils/media.js";
import {
  getPaging, pageMeta, paginate, applyActiveFilter, isAdminRequest,
  searchRegex, toDate, toBool, clean,
} from "../utils/query.js";

/**
 * Accepts the admin panel names (publisherName, shortDescription, coverageDate…)
 * and the simple names (channel, description, date, link/url).
 */
const buildMediaData = (body = {}) => {
  const dateIn = body.coverageDate ?? body.date;
  const data = {
    title: body.title !== undefined ? String(body.title).trim() : undefined,
    publisherName: body.publisherName ?? body.channel ?? body.publisher,
    mediaType: body.mediaType ?? body.type,
    shortDescription: body.shortDescription ?? body.description,
    detailDescription: body.detailDescription,
    coverageDate: dateIn !== undefined ? (toDate(dateIn) ?? null) : undefined,
    link: body.link ?? body.url ?? body.videoUrl,
    images: body.images !== undefined || body.image !== undefined ? [...new Set([...urlList(body.images), ...urlList(body.image)])] : undefined,
    videos: body.videos !== undefined ? urlList(body.videos) : undefined,
    isActive: toBool(body.isActive),
    order: body.order !== undefined ? Number(body.order) || 0 : undefined,
  };
  if (typeof data.publisherName === "string") data.publisherName = data.publisherName.trim();
  return clean(data);
};

const invalidDate = (body) => {
  const v = body.coverageDate ?? body.date;
  return v !== undefined && v !== null && v !== "" && !toDate(v);
};

export const createMediaCovrage = asyncHandler(async (req, res) => {
  if (invalidDate(req.body)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid coverage date"));
  }
  const data = buildMediaData(req.body);

  if (!data.title) {
    return res.status(400).json(new apiResponse(400, null, "Title is required"));
  }

  const mediaCovrage = await MediaCovrage.create(data);

  return res
    .status(201)
    .json(new apiResponse(201, mediaCovrage, "Media coverage created successfully"));
});

export const getAllMediaCovrages = asyncHandler(async (req, res) => {
  const { search = "", fromDate, toDate: to, mediaType } = req.query;
  const paging = getPaging(req.query);

  const filter = applyActiveFilter(req, {});

  if (String(search).trim()) {
    filter.$or = ["title", "publisherName", "shortDescription", "detailDescription"].map((f) => ({ [f]: searchRegex(search) }));
  }
  if (mediaType) filter.mediaType = String(mediaType).toLowerCase();

  const from = toDate(fromDate), till = toDate(to);
  if (fromDate && !from) return res.status(400).json(new apiResponse(400, null, "Invalid from date"));
  if (to && !till) return res.status(400).json(new apiResponse(400, null, "Invalid to date"));
  if (from || till) {
    filter.coverageDate = {};
    if (from) { from.setHours(0, 0, 0, 0); filter.coverageDate.$gte = from; }
    if (till) { till.setHours(23, 59, 59, 999); filter.coverageDate.$lte = till; }
  }

  const totalMediaCovrages = await MediaCovrage.countDocuments(filter);
  const mediaCovrages = await paginate(
    MediaCovrage.find(filter).sort({ order: 1, coverageDate: -1, createdAt: -1 }),
    paging
  );

  return res.status(200).json(
    new apiResponse(
      200,
      {
        mediaCovrages,
        totalMediaCovrages,
        ...pageMeta(totalMediaCovrages, paging),
      },
      "Media coverages fetched successfully"
    )
  );
});

export const getMediaCovrageById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid media coverage id"));
  }

  const mediaCovrage = await MediaCovrage.findById(id);

  if (!mediaCovrage || (mediaCovrage.isActive === false && !isAdminRequest(req))) {
    return res.status(404).json(new apiResponse(404, null, "Media coverage not found"));
  }

  return res
    .status(200)
    .json(new apiResponse(200, mediaCovrage, "Media coverage fetched successfully"));
});

export const updateMediaCovrage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid media coverage id"));
  }
  if (invalidDate(req.body)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid coverage date"));
  }

  const mediaCovrage = await MediaCovrage.findById(id);
  if (!mediaCovrage) {
    return res.status(404).json(new apiResponse(404, null, "Media coverage not found"));
  }

  const data = buildMediaData(req.body);
  if (data.title === "") {
    return res.status(400).json(new apiResponse(400, null, "Title cannot be empty"));
  }
  mediaCovrage.set(data);
  await mediaCovrage.save();

  return res
    .status(200)
    .json(new apiResponse(200, mediaCovrage, "Media coverage updated successfully"));
});

export const deleteMediaCovrage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid media coverage id"));
  }

  const mediaCovrage = await MediaCovrage.findByIdAndDelete(id);

  if (!mediaCovrage) {
    return res.status(404).json(new apiResponse(404, null, "Media coverage not found"));
  }

  return res
    .status(200)
    .json(new apiResponse(200, mediaCovrage, "Media coverage deleted successfully"));
});
