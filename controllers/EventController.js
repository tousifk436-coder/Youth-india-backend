import Event from "../models/Event.modal.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { normalizeAttachments, urlList } from "../utils/media.js";
import {
    getPaging, pageMeta, paginate, applyActiveFilter, isAdminRequest,
    searchRegex, toDate, toBool, clean,
} from "../utils/query.js";

/** Turns any accepted request body into Event fields (create + update) */
const buildEventData = (body = {}) => {
    const data = {
        title: body.title !== undefined ? String(body.title).trim() : undefined,
        subtitle: body.subtitle,
        eventType: body.eventType !== undefined ? String(body.eventType).trim() : undefined,
        discription: body.discription ?? body.description,
        date: body.date !== undefined ? (toDate(body.date) ?? null) : undefined,
        endDate: body.endDate !== undefined ? (toDate(body.endDate) ?? null) : undefined,
        time: body.time,
        location: body.location ?? body.venue,
        banner: body.banner ?? body.bannerImage,
        bannerDescription: body.bannerDescription,
        highlights: body.highlights !== undefined
            ? (Array.isArray(body.highlights) ? body.highlights : String(body.highlights).split(/\n|,/))
                .map((h) => String(h).trim()).filter(Boolean)
            : undefined,
        isPaid: toBool(body.isPaid ?? body.paid),
        fee: body.fee !== undefined || body.entryFee !== undefined ? Number(body.fee ?? body.entryFee) || 0 : undefined,
        paymentQr: body.paymentQr ?? body.qrCode,
        registrationOpen: toBool(body.registrationOpen),
        attachments: normalizeAttachments(body),
        isActive: toBool(body.isActive),
        order: body.order !== undefined ? Number(body.order) || 0 : undefined,
    };
    if (data.banner !== undefined) data.banner = urlList(data.banner)[0] || "";
    if (data.isPaid === false) data.fee = 0;
    // a fee without an explicit isPaid means "paid event"
    if (data.isPaid === undefined && data.fee > 0) data.isPaid = true;
    return clean(data);
};

export const createEvent = asyncHandler(async (req, res) => {
    const data = buildEventData(req.body);

    if (!data.title) {
        return res.status(400).json(new apiResponse(400, null, "Title is required"));
    }
    if (data.isPaid && !(data.fee > 0)) {
        return res.status(400).json(new apiResponse(400, null, "Please enter the entry fee for a paid event"));
    }

    const event = await Event.create(data);

    return res
        .status(201)
        .json(new apiResponse(201, event, "Event created successfully"));
});

export const getAllEvents = asyncHandler(async (req, res) => {
    const { search, fromDate, toDate: to, type, eventType, isPaid } = req.query;
    const paging = getPaging(req.query);

    const filter = applyActiveFilter(req, {});

    if (search) filter.title = searchRegex(search);
    if (eventType) filter.eventType = searchRegex(eventType);
    if (isPaid === "true" || isPaid === "false") filter.isPaid = isPaid === "true";

    // Date range filter
    const from = toDate(fromDate), till = toDate(to);
    if (from || till) {
        filter.date = {};
        if (from) filter.date.$gte = from;
        if (till) { till.setHours(23, 59, 59, 999); filter.date.$lte = till; }
    }

    // Upcoming / Completed filter (events happening today still count as upcoming)
    let sort = { date: 1, order: 1, createdAt: -1 };
    if (type === "upcoming" || type === "completed") {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        if (type === "upcoming") {
            filter.$or = [{ date: { $gte: startOfToday } }, { date: null }];
        } else {
            filter.date = { ...(filter.date || {}), $lt: startOfToday };
            sort = { date: -1, order: 1, createdAt: -1 };
        }
    }

    const totalEvents = await Event.countDocuments(filter);
    const events = await paginate(Event.find(filter).sort(sort), paging);

    return res.status(200).json(
        new apiResponse(
            200,
            {
                events,
                totalEvents,
                ...pageMeta(totalEvents, paging),
            },
            "Events fetched successfully"
        )
    );
});

export const getEventById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid event id"));
    }

    const event = await Event.findById(id);

    if (!event || (event.isActive === false && !isAdminRequest(req))) {
        return res.status(404).json(new apiResponse(404, null, "Event not found"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, event, "Event fetched successfully"));
});

export const updateEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid event id"));
    }

    const event = await Event.findById(id);
    if (!event) {
        return res.status(404).json(new apiResponse(404, null, "Event not found"));
    }

    const data = buildEventData(req.body);
    if (data.title === "") {
        return res.status(400).json(new apiResponse(400, null, "Title cannot be empty"));
    }
    event.set(data);
    if (event.isPaid && !(event.fee > 0)) {
        return res.status(400).json(new apiResponse(400, null, "Please enter the entry fee for a paid event"));
    }
    await event.save();

    return res
        .status(200)
        .json(new apiResponse(200, event, "Event updated successfully"));
});

export const deleteEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid event id"));
    }

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
        return res.status(404).json(new apiResponse(404, null, "Event not found"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, event, "Event deleted successfully"));
});
