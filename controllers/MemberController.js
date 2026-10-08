import mongoose from "mongoose";
import Member, { MEMBER_STATUSES, activateMember } from "../models/Member.modal.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { urlList } from "../utils/media.js";
import { getPaging, pageMeta, searchRegex, isAdminRequest, toDate, toBool, clean } from "../utils/query.js";

/* ----------------------------------------------------------------------------
   Settings (can be changed in .env)
   MEMBER_FEES='{"Student Membership":0,"Organizational Membership":1000,"Corporate Membership":5000}'
---------------------------------------------------------------------------- */
const DEFAULT_FEES = {
  "Student Membership": 0,
  "Organizational Membership": 1000,
  "Corporate Membership": 5000,
};
const memberFees = () => {
  try {
    return process.env.MEMBER_FEES ? JSON.parse(process.env.MEMBER_FEES) : DEFAULT_FEES;
  } catch {
    return DEFAULT_FEES;
  }
};
/** "student" -> "Student Membership" (case-insensitive match with the configured categories) */
const matchCategory = (value) => {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return null;
  return Object.keys(memberFees()).find((c) => c.toLowerCase() === v || c.toLowerCase().startsWith(v)) || null;
};

const str = (v) => (v === undefined || v === null || v === "" ? undefined : String(v).trim());
const digits = (v) => String(v || "").replace(/\D/g, "").slice(-10);
const normId = (v) => String(v || "").trim().toUpperCase();

/** What a website visitor may see about a membership (no ID proof, no referrer, no payment refs) */
const publicView = (m) => ({
  memberId: m.memberId,
  fullName: m.fullName,
  companyName: m.companyName,
  memberCategory: m.memberCategory,
  profilePhoto: m.profilePhoto,
  phoneNumber: m.phoneNumber,
  city: m.city,
  state: m.state,
  country: m.country,
  status: m.membershipStatus,
  isExpired: m.isExpired,
  registrationDate: m.registrationDate,
  validFrom: m.validFrom,
  expiryDate: m.expiryDate,
  createdAt: m.createdAt,
});

/** Active members whose end date has passed are stored as "expired" */
const syncExpiry = async (m) => {
  if (m && m.status === "active" && m.expiryDate && m.expiryDate < new Date()) {
    m.status = "expired";
    await m.save();
  }
  return m;
};

/** Collects + validates the website / Postman registration body */
const readRegistration = (b = {}) => {
  const referrer = b.referrer || {};
  const idProof = b.idProof || {};
  return {
    fullName: str(b.fullName),
    companyName: str(b.companyName ?? b.organization),
    email: str(b.email)?.toLowerCase(),
    whatsappNo: str(b.whatsappNo),
    phoneNumber: str(b.phoneNumber ?? b.phone),
    memberCategory: str(b.memberCategory),
    profilePhoto: urlList(b.profilePhoto)[0],
    country: str(b.country) || "India",
    state: str(b.state),
    city: str(b.city),
    pincode: str(b.pincode),
    referrer: clean({
      name: str(referrer.name ?? b.referrerName),
      mobileNo: str(referrer.mobileNo ?? b.referrerMobile),
    }),
    idProof: {
      idName: str(idProof.idName ?? b.idProofType),
      idImage: urlList(idProof.idImage ?? b.idProofImage)[0],
    },
    transactionId: str(b.transactionId ?? b.upiId),
    upiId: str(b.upiId),
    isChecked: toBool(b.isChecked) === true,
  };
};

// @desc    Register a new member (or renew an expired / inactive membership)
// @route   POST /api/member/register
// @access  Public
export const registerMember = asyncHandler(async (req, res) => {
  const d = readRegistration(req.body);

  const missing = [];
  if (!d.fullName) missing.push("full name");
  if (!d.phoneNumber) missing.push("phone number");
  if (!d.memberCategory) missing.push("membership category");
  if (!d.state) missing.push("state");
  if (!d.city) missing.push("city");
  if (!d.pincode) missing.push("postal code");
  if (!d.idProof.idName) missing.push("ID proof type");
  if (!d.idProof.idImage) missing.push("ID proof file");
  if (missing.length) {
    return res.status(400).json(new apiResponse(400, null, `Please provide: ${missing.join(", ")}`));
  }
  if (!/^\+?\d[\d\s-]{6,17}$/.test(d.phoneNumber)) {
    return res.status(400).json(new apiResponse(400, null, "Please enter a valid phone number"));
  }
  if (!d.isChecked) {
    return res.status(400).json(new apiResponse(400, null, "Please accept the terms and conditions"));
  }

  const category = matchCategory(d.memberCategory);
  if (!category) {
    return res.status(400).json(
      new apiResponse(400, { allowedCategories: Object.keys(memberFees()) }, "Invalid membership category")
    );
  }
  d.memberCategory = category;
  const amount = Number(memberFees()[category]) || 0;
  if (amount > 0 && !d.transactionId) {
    return res.status(400).json(new apiResponse(400, null, "Transaction / UTR ID is required for this membership category"));
  }

  const payment = amount > 0
    ? { amount, transactionId: d.transactionId, upiId: d.upiId || d.transactionId, paymentStatus: "pending-verification" }
    : { amount: 0, transactionId: undefined, upiId: undefined, paymentStatus: "not-required" };

  const { transactionId, upiId, ...profile } = d;

  // ---- Already registered with this phone number?
  const existing = await Member.findOne({ phoneNumber: d.phoneNumber });
  if (existing) {
    await syncExpiry(existing);
    const canRenew = ["expired", "inactive", "rejected"].includes(existing.status) || existing.isExpired;
    if (!canRenew) {
      return res.status(409).json(
        new apiResponse(
          409,
          null,
          existing.status === "suspended"
            ? "This membership is suspended. Please contact us."
            : "This phone number is already registered. Please check your membership status or contact us."
        )
      );
    }

    existing.set(clean({ ...profile }));
    existing.amount = payment.amount;
    existing.transactionId = payment.transactionId;
    existing.upiId = payment.upiId;
    existing.paymentStatus = payment.paymentStatus;
    existing.status = "pending";
    existing.registrationDate = new Date();
    existing.renewalCount = (existing.renewalCount || 0) + 1;
    await existing.save();

    return res.status(200).json(
      new apiResponse(
        200,
        {
          memberId: existing.memberId,
          status: existing.status,
          fullName: existing.fullName,
          phoneNumber: existing.phoneNumber,
          memberCategory: existing.memberCategory,
          amount: existing.amount,
          paymentStatus: existing.paymentStatus,
          isRenewal: true,
        },
        "Membership renewal submitted successfully"
      )
    );
  }

  const member = await Member.create(clean({ ...profile, ...payment, registrationDate: new Date() }));

  return res.status(201).json(
    new apiResponse(
      201,
      {
        memberId: member.memberId,
        status: member.status,
        fullName: member.fullName,
        phoneNumber: member.phoneNumber,
        memberCategory: member.memberCategory,
        amount: member.amount,
        paymentStatus: member.paymentStatus,
        isRenewal: false,
      },
      "Member registered successfully"
    )
  );
});

/**
 * Finds a member for a public request. A visitor must give the Member ID AND
 * the registered phone number (or e-mail) – so nobody can look up other people.
 * Admins can search with any one of them.
 */
const findForRequest = async (req, src) => {
  const memberId = normId(src.memberId);
  const phone = digits(src.phoneNumber ?? src.phone);
  const email = str(src.email)?.toLowerCase();
  const admin = isAdminRequest(req);

  if (!admin && (!memberId || (!phone && !email))) {
    return { error: [400, "Member ID and registered phone number (or e-mail) are required"] };
  }
  if (admin && !memberId && !phone && !email) {
    return { error: [400, "Member ID, phone number or e-mail is required"] };
  }

  let member = null;
  if (memberId) member = await Member.findOne({ memberId });
  else if (phone) member = await Member.findOne({ phoneNumber: { $regex: `${phone}$` } });
  else member = await Member.findOne({ email });

  if (member && memberId) {
    const phoneOk = !phone || [member.phoneNumber, member.whatsappNo].map(digits).includes(phone);
    const emailOk = !email || (member.email || "").toLowerCase() === email;
    if (!phoneOk || !emailOk) member = null;
  }
  if (!member) return { error: [404, "No membership found with these details"] };

  await syncExpiry(member);
  return { member };
};

// @desc    Member "login" – Member ID + phone number (or e-mail)
// @route   POST /api/member/login
// @access  Public
export const loginMember = asyncHandler(async (req, res) => {
  const { member, error } = await findForRequest(req, req.body || {});
  if (error) return res.status(error[0]).json(new apiResponse(error[0], null, error[1]));

  if (member.status === "suspended") {
    return res.status(403).json(new apiResponse(403, null, "Your membership has been suspended"));
  }

  return res.status(200).json(new apiResponse(200, publicView(member), "Login successful"));
});

// @desc    Membership status (website "Membership Status" page)
// @route   GET /api/member/details?memberId=MEM000001&phoneNumber=9876543210   (or &email=)
// @access  Public (admins may use only one of the fields)
export const getMemberDetails = asyncHandler(async (req, res) => {
  const { member, error } = await findForRequest(req, req.query || {});
  if (error) return res.status(error[0]).json(new apiResponse(error[0], null, error[1]));

  const data = isAdminRequest(req) ? member : publicView(member);
  return res.status(200).json(new apiResponse(200, data, "Member details fetched successfully"));
});

// @desc    Get member by MongoDB _id
// @route   GET /api/member/:id
// @access  Private (Admin)
export const getMemberById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid member id"));
  }
  const member = await Member.findById(req.params.id);

  if (!member) {
    return res.status(404).json(new apiResponse(404, null, "Member not found"));
  }
  await syncExpiry(member);

  return res.status(200).json(new apiResponse(200, member, "Member fetched successfully"));
});

// @desc    Get all members
// @route   GET /api/member/all/members
// @access  Private (Admin)
export const getAllMembers = asyncHandler(async (req, res) => {
  const { search = "", status, memberCategory, paymentStatus, sortBy = "-createdAt" } = req.query;
  const paging = getPaging(req.query);

  // mark finished memberships as expired before listing
  await Member.updateMany(
    { status: "active", expiryDate: { $lt: new Date() } },
    { $set: { status: "expired" } }
  );

  const query = {};
  if (String(search).trim()) {
    query.$or = ["fullName", "phoneNumber", "memberId", "city", "email", "companyName"].map((f) => ({ [f]: searchRegex(search) }));
  }
  if (status) query.status = status;
  if (memberCategory) query.memberCategory = memberCategory;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  const SORTS = ["createdAt", "-createdAt", "fullName", "-fullName", "memberId", "-memberId", "expiryDate", "-expiryDate", "status", "-status"];
  const sort = SORTS.includes(sortBy) ? sortBy : "-createdAt";

  let q = Member.find(query).sort(sort);
  if (paging.isPagination) q = q.skip(paging.skip).limit(paging.limit);
  const [members, total] = await Promise.all([q, Member.countDocuments(query)]);

  return res.status(200).json(
    new apiResponse(
      200,
      {
        members,
        pagination: {
          total,
          page: paging.page,
          limit: paging.limit,
          pages: Math.ceil(total / paging.limit),
        },
        totalMembers: total,
        ...pageMeta(total, paging),
      },
      "Members fetched successfully"
    )
  );
});

const ADMIN_EDITABLE = [
  "fullName", "companyName", "email", "whatsappNo", "phoneNumber", "memberCategory", "profilePhoto",
  "country", "state", "city", "pincode", "referrer", "idProof", "upiId", "transactionId", "amount",
  "paymentStatus", "isChecked", "validFrom", "expiryDate", "remarks", "status",
];

// @desc    Update member
// @route   PUT /api/member/:id
// @access  Private (Admin)
export const updateMember = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid member id"));
  }
  const member = await Member.findById(req.params.id);

  if (!member) {
    return res.status(404).json(new apiResponse(404, null, "Member not found"));
  }

  const body = req.body || {};
  if (body.phoneNumber && body.phoneNumber !== member.phoneNumber) {
    const taken = await Member.exists({ phoneNumber: body.phoneNumber, _id: { $ne: member._id } });
    if (taken) {
      return res.status(409).json(new apiResponse(409, null, "Phone number already exists"));
    }
  }
  if (body.status !== undefined && !MEMBER_STATUSES.includes(body.status)) {
    return res.status(400).json(new apiResponse(400, { allowed: MEMBER_STATUSES }, "Invalid status value"));
  }

  const wasActive = member.status === "active";
  ADMIN_EDITABLE.forEach((k) => {
    if (body[k] === undefined) return;
    if (k === "validFrom" || k === "expiryDate") member[k] = toDate(body[k]) ?? null;
    else member[k] = body[k];
  });
  if (member.status === "active" && (!wasActive || !member.expiryDate)) activateMember(member, { from: body.validFrom });

  await member.save();

  return res.status(200).json(new apiResponse(200, member, "Member updated successfully"));
});

// @desc    Delete member
// @route   DELETE /api/member/:id
// @access  Private (Admin)
export const deleteMember = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid member id"));
  }
  const member = await Member.findByIdAndDelete(req.params.id);

  if (!member) {
    return res.status(404).json(new apiResponse(404, null, "Member not found"));
  }

  return res.status(200).json(new apiResponse(200, null, "Member deleted successfully"));
});

// @desc    Update member status – "active" also sets validFrom / expiryDate automatically
// @route   PATCH /api/member/:id/status   { "status": "active", "expiryDate"?: "2027-12-31", "remarks"?: "" }
// @access  Private (Admin)
export const updateMemberStatus = asyncHandler(async (req, res) => {
  const { status, expiryDate, validFrom, remarks } = req.body || {};

  if (!MEMBER_STATUSES.includes(status)) {
    return res.status(400).json(new apiResponse(400, { allowed: MEMBER_STATUSES }, "Invalid status value"));
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid member id"));
  }

  const member = await Member.findById(req.params.id);

  if (!member) {
    return res.status(404).json(new apiResponse(404, null, "Member not found"));
  }

  if (validFrom !== undefined) member.validFrom = toDate(validFrom) ?? member.validFrom;
  if (expiryDate !== undefined) member.expiryDate = toDate(expiryDate) ?? member.expiryDate;
  if (remarks !== undefined) member.remarks = remarks;

  member.status = status;
  if (status === "active") activateMember(member, { from: validFrom });
  if (status === "rejected" && member.paymentStatus === "pending-verification") member.paymentStatus = "rejected";

  await member.save();

  return res.status(200).json(new apiResponse(200, member, "Member status updated successfully"));
});

// @desc    Member statistics
// @route   GET /api/member/stats/all
// @access  Private (Admin)
export const getMemberStats = asyncHandler(async (req, res) => {
  await Member.updateMany(
    { status: "active", expiryDate: { $lt: new Date() } },
    { $set: { status: "expired" } }
  );

  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);

  const [totalMembers, activeMembers, pendingMembers, suspendedMembers, expiredMembers, rejectedMembers, inactiveMembers,
    expiringSoon, paymentsToVerify, categoryStats, stateStats] = await Promise.all([
    Member.countDocuments(),
    Member.countDocuments({ status: "active" }),
    Member.countDocuments({ status: "pending" }),
    Member.countDocuments({ status: "suspended" }),
    Member.countDocuments({ status: "expired" }),
    Member.countDocuments({ status: "rejected" }),
    Member.countDocuments({ status: "inactive" }),
    Member.countDocuments({ status: "active", expiryDate: { $gte: new Date(), $lte: in30 } }),
    Member.countDocuments({ paymentStatus: "pending-verification" }),
    Member.aggregate([{ $group: { _id: "$memberCategory", count: { $sum: 1 } } }]),
    Member.aggregate([{ $group: { _id: "$state", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
  ]);

  return res.status(200).json(
    new apiResponse(
      200,
      {
        totalMembers,
        activeMembers,
        pendingMembers,
        suspendedMembers,
        expiredMembers,
        rejectedMembers,
        inactiveMembers,
        expiringSoon,
        paymentsToVerify,
        categoryStats,
        topStates: stateStats,
        fees: memberFees(),
      },
      "Member statistics fetched successfully"
    )
  );
});
