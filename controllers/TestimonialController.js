import Testimonial from "../models/Testimonials.modal.js";
import { applyActiveFilter, isAdminRequest, escapeRegex } from "../utils/query.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { apiResponse } from "../utils/apiResponse.js";


export const createTestimonial = asyncHandler(async (req, res) => {
  const {
    name,
    designation,
    company,
    image,
    review,
    rating,
    location,
    order,
    isFeatured,
    isActive,
  } = req.body;

  if (!name?.trim()) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Name is required"));
  }

  if (!review?.trim()) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Review is required"));
  }

  const testimonial = await Testimonial.create({
    name: name.trim(),
    designation,
    company,
    image,
    review,
    rating,
    location,
    order,
    isFeatured,
    isActive,
  });

  return res
    .status(201)
    .json(
      new apiResponse(
        201,
        testimonial,
        "Testimonial created successfully"
      )
    );
});

export const getAllTestimonials = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    isActive,
    isFeatured,
    isPagination = "true",
  } = req.query;

  const filter = applyActiveFilter(req, {});

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: escapeRegex(search),
          $options: "i",
        },
      },
      {
        designation: {
          $regex: escapeRegex(search),
          $options: "i",
        },
      },
      {
        company: {
          $regex: escapeRegex(search),
          $options: "i",
        },
      },
      {
        review: {
          $regex: escapeRegex(search),
          $options: "i",
        },
      },
      {
        location: {
          $regex: escapeRegex(search),
          $options: "i",
        },
      },
    ];
  }

  if (isFeatured !== undefined) {
    filter.isFeatured = isFeatured === "true";
  }

  const totalTestimonials = await Testimonial.countDocuments(filter);

  let query = Testimonial.find(filter).sort({
    order: 1,
    createdAt: -1,
  });

  if (isPagination === "true") {
    query = query
      .skip((Number(page) - 1) * Math.min(Number(limit) || 10, 100))
      .limit(Math.min(Number(limit) || 10, 100));
  }

  const testimonials = await query;

  return res.status(200).json(
    new apiResponse(
      200,
      {
        testimonials,
        totalTestimonials,
        totalPages: Math.ceil(totalTestimonials / Math.min(Number(limit) || 10, 100)),
        currentPage: Number(page),
      },
      "Testimonials fetched successfully"
    )
  );
});

export const getTestimonialById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Invalid testimonial id"));
  }

  const testimonial = await Testimonial.findById(id);

  if (!testimonial || (testimonial.isActive === false && !isAdminRequest(req))) {
    return res
      .status(404)
      .json(new apiResponse(404, null, "Testimonial not found"));
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        testimonial,
        "Testimonial fetched successfully"
      )
    );
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Invalid testimonial id"));
  }

  const testimonial = await Testimonial.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!testimonial) {
    return res
      .status(404)
      .json(new apiResponse(404, null, "Testimonial not found"));
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        testimonial,
        "Testimonial updated successfully"
      )
    );
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Invalid testimonial id"));
  }

  const testimonial = await Testimonial.findByIdAndDelete(id);

  if (!testimonial) {
    return res
      .status(404)
      .json(new apiResponse(404, null, "Testimonial not found"));
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        testimonial,
        "Testimonial deleted successfully"
      )
    );
});