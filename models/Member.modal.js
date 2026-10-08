import mongoose from "mongoose";
import { nextSequence } from "./Counter.modal.js";

export const MEMBER_STATUSES = ["pending", "active", "inactive", "suspended", "rejected", "expired"];

const memberSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: 150,
    },
    companyName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    whatsappNo: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    // Website: "Student Membership" | "Organizational Membership" | "Corporate Membership"
    memberCategory: {
      type: String,
      required: [true, "Member category is required"],
      trim: true,
    },
    profilePhoto: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      trim: true,
    },
    referrer: {
      name: {
        type: String,
        trim: true,
      },
      mobileNo: {
        type: String,
        trim: true,
      },
    },
    idProof: {
      idName: {
        type: String,
        required: [true, "ID proof name is required"],
        trim: true,
      },
      idImage: {
        type: String,
        required: [true, "ID proof image is required"],
        trim: true,
      },
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },

    // ---- Payment (QR on the website; Student Membership is free)
    upiId: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["not-required", "pending-verification", "verified", "rejected"],
      default: "not-required",
    },

    isChecked: {
      type: Boolean,
      default: false,
    },

    // ---- Membership validity (set automatically when the admin makes the member "active")
    validFrom: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    approvedAt: {
      type: Date,
    },
    renewalCount: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: MEMBER_STATUSES,
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* true when the membership end date has passed */
memberSchema.virtual("isExpired").get(function () {
  return this.status === "expired" || (!!this.expiryDate && this.expiryDate < new Date());
});

/* status as the website should show it (active members past their end date show "expired") */
memberSchema.virtual("membershipStatus").get(function () {
  if (this.status === "active" && this.expiryDate && this.expiryDate < new Date()) return "expired";
  return this.status;
});

/* Auto-generate a unique memberId (MEM000001 …) using an atomic counter */
memberSchema.pre("save", async function () {
  if (this.memberId) return;
  const Model = this.constructor;
  // skips numbers already used by members created before the counter existed
  for (let i = 0; i < 1000; i++) {
    const seq = await nextSequence("memberId");
    const candidate = `MEM${String(seq).padStart(6, "0")}`;
    if (!(await Model.exists({ memberId: candidate }))) {
      this.memberId = candidate;
      return;
    }
  }
  throw new Error("Could not generate a unique Member ID");
});

memberSchema.index({ status: 1, createdAt: -1 });

const Member = mongoose.model("Member", memberSchema);

/** Months a membership stays valid after approval (env MEMBERSHIP_VALIDITY_MONTHS, default 12) */
export const validityMonths = () => Math.max(Number(process.env.MEMBERSHIP_VALIDITY_MONTHS) || 12, 1);

/** Adds validity dates when a member becomes active */
export const activateMember = (member, { from } = {}) => {
  const start = from ? new Date(from) : new Date();
  if (!member.validFrom || member.isExpired) member.validFrom = start;
  if (!member.expiryDate || member.expiryDate < new Date()) {
    const end = new Date(member.validFrom);
    end.setMonth(end.getMonth() + validityMonths());
    member.expiryDate = end;
  }
  member.approvedAt = new Date();
  if (member.paymentStatus === "pending-verification") member.paymentStatus = "verified";
  return member;
};

export default Member;
