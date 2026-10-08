import ContactUs from "../models/ContactUs.modal.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { getPaging, pageMeta, paginate, searchRegex, toBool, clean } from "../utils/query.js";

const str = (v) => (v === undefined || v === null ? undefined : String(v).trim());

export const createContactUs = asyncHandler(async (req, res) => {
    const body = req.body || {};
    const name = str(body.name);
    const email = str(body.email);
    const phone = str(body.phone);
    const subject = str(body.subject);
    const message = str(body.message ?? body.discription ?? body.description);

    if (!name) {
        return res.status(400).json(new apiResponse(400, null, "Name is required"));
    }
    if (!email && !phone) {
        return res.status(400).json(new apiResponse(400, null, "Email or phone is required"));
    }
    if (!message && !subject) {
        return res.status(400).json(new apiResponse(400, null, "Message is required"));
    }

    const contactUs = await ContactUs.create(clean({
        name,
        email: email || undefined,
        phone: phone || undefined,
        subject,
        discription: message,
        source: str(body.source),
    }));

    return res
        .status(201)
        .json(new apiResponse(201, contactUs, "Contact details submitted successfully"));
});

export const getAllContactUs = asyncHandler(async (req, res) => {
    const { search, isActive, status } = req.query;
    const paging = getPaging(req.query);

    const filter = {};
    if (search) {
        filter.$or = ["name", "email", "phone", "subject"].map((f) => ({ [f]: searchRegex(search) }));
    }
    if (isActive === "true" || isActive === "false") filter.isActive = isActive === "true";
    if (status) filter.status = status;

    const totalContacts = await ContactUs.countDocuments(filter);
    const contacts = await paginate(ContactUs.find(filter).sort({ createdAt: -1 }), paging);

    return res.status(200).json(
        new apiResponse(
            200,
            {
                contacts,
                totalContacts,
                ...pageMeta(totalContacts, paging),
            },
            "Contact details fetched successfully"
        )
    );
});

export const getContactUsById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid contact id"));
    }

    const contact = await ContactUs.findById(id);

    if (!contact) {
        return res.status(404).json(new apiResponse(404, null, "Contact not found"));
    }

    // opening a new enquiry marks it as read
    if (contact.status === "new") {
        contact.status = "read";
        await contact.save();
    }

    return res
        .status(200)
        .json(new apiResponse(200, contact, "Contact fetched successfully"));
});

export const updateContactUs = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid contact id"));
    }

    const contact = await ContactUs.findById(id);
    if (!contact) {
        return res.status(404).json(new apiResponse(404, null, "Contact not found"));
    }

    const b = req.body || {};
    contact.set(clean({
        name: str(b.name),
        email: str(b.email),
        phone: str(b.phone),
        subject: str(b.subject),
        discription: b.message ?? b.discription,
        status: b.status,
        isActive: toBool(b.isActive),
    }));
    await contact.save();

    return res
        .status(200)
        .json(new apiResponse(200, contact, "Contact updated successfully"));
});

export const deleteContactUs = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new apiResponse(400, null, "Invalid contact id"));
    }

    const contact = await ContactUs.findByIdAndDelete(id);

    if (!contact) {
        return res.status(404).json(new apiResponse(404, null, "Contact not found"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, contact, "Contact deleted successfully"));
});
