import rateLimit from "express-rate-limit";

/**
 * Protects public forms and login from spam / brute force.
 * Limits can be changed in .env.
 */
const make = (windowMinutes, max, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { statusCode: 429, data: null, success: false, message },
  });

// website forms: contact, join-us / event registration, membership, upload
export const formLimiter = make(
  Number(process.env.FORM_RATE_WINDOW_MIN) || 15,
  Number(process.env.FORM_RATE_MAX) || 30,
  "Too many submissions. Please try again after some time."
);

// login / OTP
export const authLimiter = make(
  Number(process.env.AUTH_RATE_WINDOW_MIN) || 15,
  Number(process.env.AUTH_RATE_MAX) || 20,
  "Too many attempts. Please try again after some time."
);

// membership status lookups
export const lookupLimiter = make(
  Number(process.env.LOOKUP_RATE_WINDOW_MIN) || 15,
  Number(process.env.LOOKUP_RATE_MAX) || 60,
  "Too many requests. Please try again after some time."
);
