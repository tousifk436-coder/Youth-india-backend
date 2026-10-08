// .env must be loaded before anything else reads process.env
import "dotenv/config";

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import { LOCAL_DIR } from "./controllers/uploadController.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import authRoutes from "./router/authRoutes.js";
import uploadRoutes from "./router/uploadRoutes.js";
import categoryRoutes from "./router/master/categoryRoutes.js";
import galleryRoutes from "./router/GalleryRoutes.js";
import eventRoutes from "./router/EventRoutes.js";
import mediaCovrageRoutes from "./router/MediaCovrageRoutes.js";
import contactUsRoutes from "./router/ContactUsRoutes.js";
import joinUsRoutes from "./router/JoinUsRoutes.js";
import schemeRoutes from "./router/SchemeRoutes.js";
import homeBannerRoutes from "./router/HomeBannerRoutes.js";
import blogRoutes from "./router/BlogRoutes.js";
import testimonialRoutes from "./router/TestimonialRoutes.js";
import teamRoutes from "./router/TeamRoutes.js";
import dashboardRoutes from "./router/DashboardRoutes.js";
import newsRoutes from "./router/NewsRoutes.js";
import memberRoutes from "./router/MemberRoutes.js";

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing in .env – the server cannot start.");
  process.exit(1);
}

const app = express();

// behind Render / Nginx / Cloudflare: needed for correct client IPs (rate limiting)
app.set("trust proxy", Number(process.env.TRUST_PROXY ?? 1));
app.disable("x-powered-by");

/* ---------- CORS ----------
   CLIENT_URL can hold several addresses, comma separated, e.g.
   CLIENT_URL=https://youthforhumanrightsindia.org,https://holyvisioninternational.org,https://admin.example.com
   Empty = allow every website (no cookies).                                          */
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors(
    allowedOrigins.length
      ? {
          origin: (origin, cb) => {
            if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ""))) return cb(null, true);
            return cb(null, false);
          },
          credentials: true,
        }
      : { origin: "*", credentials: false }
  )
);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: process.env.JSON_LIMIT || "10mb" }));
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_LIMIT || "10mb" }));
app.use(cookieParser());

// files saved locally when Cloudinary is not configured
app.use("/uploads", express.static(LOCAL_DIR, { maxAge: "7d", fallthrough: false, dotfiles: "deny" }));

app.get("/api/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.status(200).json({
    status: "ok",
    database: states[mongoose.connection.readyState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/media-covrage", mediaCovrageRoutes);
app.use("/api/media-coverage", mediaCovrageRoutes); // correctly spelled alias
app.use("/api/contact-us", contactUsRoutes);
app.use("/api/join-us", joinUsRoutes);
app.use("/api/scheme", schemeRoutes);
app.use("/api/home-banner", homeBannerRoutes);
app.use("/api/testimonial", testimonialRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/member", memberRoutes);

app.use((req, res) => {
  res.status(404).json({ statusCode: 404, data: null, success: false, message: "Route not found" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const start = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received – closing server`);
    server.close(() => mongoose.connection.close(false).finally(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

process.on("unhandledRejection", (err) => console.error("Unhandled rejection:", err));

start();

export default app;
