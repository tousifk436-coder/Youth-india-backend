import { Router } from "express";
import { uploadImage } from "../controllers/uploadController.js";
import upload from "../config/multerConfig.js";
import { formLimiter } from "../middlewares/rateLimiter.js";

const routes = Router();

// Public: the website membership form uploads the photo + ID proof here (rate limited, images/PDF/video only)
routes.post("/", formLimiter, upload.single("file"), uploadImage);

export default routes;
