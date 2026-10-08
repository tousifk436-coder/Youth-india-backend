import multer from "multer";

/**
 * Upload rules: images, PDF and short videos only, max MAX_UPLOAD_MB (default 10 MB).
 */
const MAX_MB = Number(process.env.MAX_UPLOAD_MB) || 10;
const ALLOWED = /^(image\/(jpeg|png|webp|gif|avif|heic|heif)|application\/pdf|video\/(mp4|webm|quicktime))$/i;

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_MB * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED.test(file.mimetype)) return cb(null, true);
    const err = new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname);
    err.message = "Only images (JPG, PNG, WEBP, GIF), PDF and MP4/WEBM videos are allowed";
    return cb(err);
  },
});

export default upload;
