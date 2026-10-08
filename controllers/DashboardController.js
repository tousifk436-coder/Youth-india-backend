import Blog from "../models/Blog.modal.js";
import ContactUs from "../models/ContactUs.modal.js";
import Event from "../models/Event.modal.js";
import Gallery from "../models/Gallery.modal.js";
import JoinUs from "../models/JoinUs.modal.js";
import MediaCovrage from "../models/MediaCovrage.modal.js";
import Scheme from "../models/Scheme.modal.js";
import Team from "../models/Team.modal.js";
import Testimonial from "../models/Testimonials.modal.js";
import News from "../models/News.modal.js";
import HomeBanner from "../models/HomeBanner.modal.js";
import Member from "../models/Member.modal.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

/** total / active / inactive counts */
const getModelStats = async (Model) => {
    const [total, active, inactive] = await Promise.all([
        Model.countDocuments(),
        Model.countDocuments({ isActive: { $ne: false } }),
        Model.countDocuments({ isActive: false }),
    ]);
    return { total, active, inactive };
};

/** counts image / video / file URLs inside "attachments" */
const getAttachmentStats = async (Model) => {
    const docs = await Model.find({}, { attachments: 1 }).lean();
    const out = { images: 0, videos: 0, files: 0 };
    docs.forEach((d) =>
        (d.attachments || []).forEach((a) => {
            const n = (a.urls || []).length;
            if (a.documentType === "image") out.images += n;
            if (a.documentType === "video") out.videos += n;
            if (a.documentType === "file") out.files += n;
        })
    );
    return out;
};

/** counts URLs in simple images / videos arrays */
const getArrayMediaStats = async (Model) => {
    const docs = await Model.find({}, { images: 1, videos: 1 }).lean();
    return docs.reduce(
        (o, d) => ({ images: o.images + (d.images || []).length, videos: o.videos + (d.videos || []).length, files: 0 }),
        { images: 0, videos: 0, files: 0 }
    );
};

export const getDashboard = asyncHandler(async (req, res) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
        blogs, contacts, events, galleries, joinRequests, mediaCoverages, schemes,
        teamMembers, testimonials, news, banners,
        upcomingEvents, featuredTeam, featuredTestimonials,
        eventRegistrations, paidRegistrationsToVerify, newContacts,
        totalMembers, activeMembers, pendingMembers, expiredMembers, memberPaymentsToVerify,
        recentJoinRequests, recentContactRequests, recentEvents, recentMembers,
        galleryStats, eventAttachmentStats, mediaStats, schemeAttachmentStats,
    ] = await Promise.all([
        getModelStats(Blog),
        getModelStats(ContactUs),
        getModelStats(Event),
        getModelStats(Gallery),
        getModelStats(JoinUs),
        getModelStats(MediaCovrage),
        getModelStats(Scheme),
        getModelStats(Team),
        getModelStats(Testimonial),
        getModelStats(News),
        getModelStats(HomeBanner),

        Event.countDocuments({ isActive: { $ne: false }, date: { $gte: startOfToday } }),
        Team.countDocuments({ isActive: true, isFeatured: true }),
        Testimonial.countDocuments({ isActive: true, isFeatured: true }),

        JoinUs.countDocuments({ type: "event-registration" }),
        JoinUs.countDocuments({ paymentStatus: "pending-verification" }),
        ContactUs.countDocuments({ status: "new" }),

        Member.countDocuments(),
        Member.countDocuments({ status: "active", $or: [{ expiryDate: null }, { expiryDate: { $gte: new Date() } }] }),
        Member.countDocuments({ status: "pending" }),
        Member.countDocuments({ $or: [{ status: "expired" }, { status: "active", expiryDate: { $lt: new Date() } }] }),
        Member.countDocuments({ paymentStatus: "pending-verification" }),

        JoinUs.find()
            .select("type name phone email designation eventName status paymentStatus createdAt")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        ContactUs.find()
            .select("name phone email subject discription status createdAt")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        Event.find()
            .select("title discription date isPaid fee isActive order createdAt")
            .sort({ date: -1, createdAt: -1 })
            .limit(5)
            .lean(),
        Member.find()
            .select("memberId fullName memberCategory status paymentStatus createdAt")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),

        getAttachmentStats(Gallery),
        getAttachmentStats(Event),
        getArrayMediaStats(MediaCovrage),
        getAttachmentStats(Scheme),
    ]);

    const responseData = {
        overview: {
            totalBlogs: blogs.total,
            totalContacts: contacts.total,
            totalEvents: events.total,
            totalGalleries: galleries.total,
            totalJoinRequests: joinRequests.total,
            totalMediaCoverages: mediaCoverages.total,
            totalSchemes: schemes.total,
            totalTeamMembers: teamMembers.total,
            totalTestimonials: testimonials.total,
            totalNews: news.total,
            totalBanners: banners.total,
            totalMembers,
            totalEventRegistrations: eventRegistrations,
        },

        moduleStats: {
            blogs,
            contacts: { ...contacts, new: newContacts },
            events,
            galleries,
            joinRequests,
            mediaCoverages,
            schemes,
            news,
            banners,
            teamMembers: { ...teamMembers, featured: featuredTeam },
            testimonials: { ...testimonials, featured: featuredTestimonials },
        },

        memberStats: {
            total: totalMembers,
            active: activeMembers,
            pending: pendingMembers,
            expired: expiredMembers,
            paymentsToVerify: memberPaymentsToVerify,
        },

        eventStats: {
            upcomingEvents,
            registrations: eventRegistrations,
            paymentsToVerify: paidRegistrationsToVerify,
            attachmentStats: eventAttachmentStats,
        },

        galleryStats: { totalImages: galleryStats.images, totalVideos: galleryStats.videos },

        mediaCoverageStats: { attachmentStats: mediaStats },

        schemeStats: { attachmentStats: schemeAttachmentStats },

        recentData: {
            joinRequests: recentJoinRequests,
            contactRequests: recentContactRequests,
            events: recentEvents,
            members: recentMembers,
        },
    };

    return res
        .status(200)
        .json(new apiResponse(200, responseData, "Dashboard data retrieved successfully"));
});
