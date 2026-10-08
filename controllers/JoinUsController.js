import JoinUs from "../models/JoinUs.modal.js";
import Event from "../models/Event.modal.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { getPaging, pageMeta, paginate, searchRegex, toBool, clean } from "../utils/query.js";

const str = (v) => (v === undefined || v === null || v === "" ? undefined : String(v).trim());

// CREATE – used by the website "Join us" and "Event Registration" forms
export const createJoinUs = asyncHandler(async (req, res) => {
    const b = req.body || {};
    const name = str(b.name);
    const phone = str(b.phone ?? b.phoneNumber);
    const email = str(b.email);

    if (!name) {
        return res.status(400).json(new apiResponse(400, null, "Name is required"));
    }
    if (!phone && !email) {
        return res.status(400).json(new apiResponse(400, null, "Phone or email is required"));
    }

    const eventId = str(b.eventId ?? b.event);
    const isEventRegistration = !!eventId || b.type === "event-registration";

    const data = clean({
        type: isEventRegistration ? "event-registration" : (["volunteer", "internship"].includes(b.type) ? b.type : "join-us"),
        name,
        phone,
        whatsappNo: str(b.whatsappNo ?? b.whatsapp),
        email,
        designation: str(b.designation),
        city: str(b.city),
        state: str(b.state),
        district: str(b.district),
        country: str(b.country),
        fullAddress: str(b.fullAddress),
        resume: str(b.resume),
        message: str(b.message),
    });

    if (isEventRegistration) {
        if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json(new apiResponse(400, null, "Please select a valid event"));
        }
        const event = await Event.findById(eventId);
        if (!event || event.isActive === false) {
            return res.status(404).json(new apiResponse(404, null, "Event not found"));
        }
        if (event.registrationOpen === false) {
            return res.status(400).json(new apiResponse(400, null, "Registration for this event is closed"));
        }

        // one registration per person per event
        const or = [];
        if (phone) or.push({ phone });
        if (email) or.push({ email: email.toLowerCase() });
        const already = await JoinUs.findOne({ type: "event-registration", event: event._id, $or: or });
        if (already) {
            return res.status(409).json(new apiResponse(409, { registrationId: already._id }, "You have already registered for this event"));
        }

        // fee always comes from the event (never from the browser)
        const transactionId = str(b.transactionId ?? b.utr ?? b.upiId);
        if (event.isPaid && !transactionId) {
            return res.status(400).json(new apiResponse(400, null, "Transaction / UTR ID is required for this paid event"));
        }

        Object.assign(data, {
            event: event._id,
            eventName: event.title,
            eventDate: event.date,
            isPaid: !!event.isPaid,
            entryFee: event.isPaid ? event.fee : 0,
            transactionId: event.isPaid ? transactionId : undefined,
            paymentStatus: event.isPaid ? "pending-verification" : "not-required",
            status: event.isPaid ? "pending" : "approved",
        });
    }

    const joinUs = await JoinUs.create(clean(data));

    return res.status(201).json(
        new apiResponse(
            201,
            joinUs,
            isEventRegistration ? "Event registration submitted successfully" : "Join request submitted successfully"
        )
    );
});

// GET ALL (admin) – filter by ?type=event-registration&event=<id>&status=pending
export const getAllJoinUs = asyncHandler(async (req, res) => {
    const { search, isActive, type, event, status, paymentStatus } = req.query;
    const paging = getPaging(req.query);

    const filter = {};
    if (search) {
        filter.$or = ["name", "phone", "email", "designation", "eventName", "transactionId", "city"].map((f) => ({ [f]: searchRegex(search) }));
    }
    if (isActive === "true" || isActive === "false") filter.isActive = isActive === "true";
    if (type) filter.type = type;
    if (event && mongoose.Types.ObjectId.isValid(event)) filter.event = event;
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const totalJoinUs = await JoinUs.countDocuments(filter);
    const joinUs = await paginate(
        JoinUs.find(filter).populate("event", "title date isPaid fee").sort({ createdAt: -1 }),
        paging
    );

    return res.status(200).json(
        new apiResponse(
            200,
            {
                joinUs,
                totalJoinUs,
                ...pageMeta(totalJoinUs, paging),
            },
            "Join requests fetched successfully"
        )
    );
});

// GET BY ID (admin)
export const getJoinUsById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid id"));
    }

    const joinUs = await JoinUs.findById(id).populate("event", "title date isPaid fee");

    if (!joinUs) {
        return res.status(404).json(new apiResponse(404, null, "Record not found"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, joinUs, "Record fetched successfully"));
});

// UPDATE (admin) – e.g. { "status": "approved", "paymentStatus": "verified" }
export const updateJoinUs = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid id"));
    }

    const joinUs = await JoinUs.findById(id);
    if (!joinUs) {
        return res.status(404).json(new apiResponse(404, null, "Record not found"));
    }

    const b = req.body || {};
    joinUs.set(clean({
        name: str(b.name),
        phone: str(b.phone),
        whatsappNo: str(b.whatsappNo),
        email: str(b.email),
        designation: str(b.designation),
        city: str(b.city),
        state: str(b.state),
        district: str(b.district),
        country: str(b.country),
        fullAddress: str(b.fullAddress),
        resume: str(b.resume),
        message: str(b.message),
        transactionId: str(b.transactionId),
        status: b.status,
        paymentStatus: b.paymentStatus,
        isActive: toBool(b.isActive),
    }));
    await joinUs.save();

    return res
        .status(200)
        .json(new apiResponse(200, joinUs, "Record updated successfully"));
});

// DELETE (admin)
export const deleteJoinUs = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid id"));
    }

    const joinUs = await JoinUs.findByIdAndDelete(id);

    if (!joinUs) {
        return res.status(404).json(new apiResponse(404, null, "Record not found"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, joinUs, "Record deleted successfully"));
});
