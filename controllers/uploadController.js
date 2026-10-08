import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

export const LOCAL_DIR = path.resolve(process.env.UPLOAD_DIR || "uploads");

const streamToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) =>
      error ? reject(error) : resolve(result)
    );
    Readable.from(buffer).pipe(uploadStream);
  });

/**
 * POST /api/upload   (form-data field "file")
 * Returns { imageUrl, url, publicId, resourceType, format, bytes }.
 * Used by the website membership form (photo + ID proof) and the admin panel.
 */
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(new apiResponse(400, null, "No file uploaded (use form-data field \"file\")"));
  }

  const cloudinaryReady =
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

  // No Cloudinary keys (e.g. local PC) -> keep the file in ./uploads and serve it from /uploads
  if (!cloudinaryReady || process.env.UPLOAD_DRIVER === "local") {
    const ext = (path.extname(req.file.originalname || "").toLowerCase().match(/^\.[a-z0-9]{1,5}$/) || [""])[0]
      || ({ "application/pdf": ".pdf", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "video/mp4": ".mp4" }[req.file.mimetype] || ".jpg");
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    await fs.mkdir(LOCAL_DIR, { recursive: true });
    await fs.writeFile(path.join(LOCAL_DIR, name), req.file.buffer);
    const base = (process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`).replace(/\/+$/, "");
    const url = `${base}/uploads/${name}`;
    return res.status(200).json(
      new apiResponse(200, { imageUrl: url, url, publicId: name, resourceType: req.file.mimetype.split("/")[0], bytes: req.file.size, storage: "local" }, "File uploaded successfully")
    );
  }

  try {
    const result = await streamToCloudinary(req.file.buffer, {
      resource_type: "auto",
      folder: process.env.CLOUDINARY_FOLDER || "holyvision",
    });

    return res.status(200).json(
      new apiResponse(
        200,
        {
          imageUrl: result.secure_url,
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          bytes: result.bytes,
        },
        "File uploaded successfully"
      )
    );
  } catch (error) {
    console.error("Upload error:", error?.message || error);
    return res.status(502).json(new apiResponse(502, null, "File upload failed. Please try again."));
  }
});

export { uploadImage };
