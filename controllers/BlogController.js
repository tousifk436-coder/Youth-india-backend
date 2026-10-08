import Blog from "../models/Blog.modal.js";
import { applyActiveFilter, isAdminRequest, escapeRegex } from "../utils/query.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { apiResponse } from "../utils/apiResponse.js";

export const createBlog = asyncHandler(async (req, res) => {
  const {
    heading,
    Title,
    metaKeywords,
    shortDescription,
    mainImage,
    multipleImages,
    mainImageName,
    details,
    tags,
    isActive,
  } = req.body;

  if (!heading?.trim()) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Heading is required"));
  }

  const blog = await Blog.create({
    heading: heading.trim(),
    Title,
    metaKeywords,
    shortDescription,
    mainImage,
    multipleImages,
    mainImageName,
    details,
    tags,
    isActive,
  });

  return res
    .status(201)
    .json(new apiResponse(201, blog, "Blog created successfully"));
});

export const getAllBlogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    isActive,
    isPagination = "true",
  } = req.query;

  const filter = applyActiveFilter(req, {});

  if (search) {
    filter.$or = [
      {
        heading: {
          $regex: escapeRegex(search),
          $options: "i",
        },
      },
      {
        Title: {
          $regex: escapeRegex(search),
          $options: "i",
        },
      },
      {
        metaKeywords: {
          $regex: escapeRegex(search),
          $options: "i",
        },
      },
      {
        shortDescription: {
          $regex: escapeRegex(search),
          $options: "i",
        },
      },
      {
        details: {
          $regex: escapeRegex(search),
          $options: "i",
        },
      },
      {
        tags: {
          $in: [
            new RegExp(search, "i"),
          ],
        },
      },
    ];
  }

  const totalBlogs = await Blog.countDocuments(filter);

  let query = Blog.find(filter).sort({
    createdAt: -1,
  });

  if (isPagination === "true") {
    query = query
      .skip((Number(page) - 1) * Math.min(Number(limit) || 10, 100))
      .limit(Math.min(Number(limit) || 10, 100));
  }

  const blogs = await query;

  return res.status(200).json(
    new apiResponse(
      200,
      {
        blogs,
        totalBlogs,
        totalPages: Math.ceil(totalBlogs / Math.min(Number(limit) || 10, 100)),
        currentPage: Number(page),
      },
      "Blogs fetched successfully"
    )
  );
});

export const getBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Invalid blog id"));
  }

  const blog = await Blog.findById(id);

  if (!blog || (blog.isActive === false && !isAdminRequest(req))) {
    return res
      .status(404)
      .json(new apiResponse(404, null, "Blog not found"));
  }

  return res
    .status(200)
    .json(new apiResponse(200, blog, "Blog fetched successfully"));
});

export const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Invalid blog id"));
  }

  const blog = await Blog.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!blog) {
    return res
      .status(404)
      .json(new apiResponse(404, null, "Blog not found"));
  }

  return res
    .status(200)
    .json(new apiResponse(200, blog, "Blog updated successfully"));
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Invalid blog id"));
  }

  const blog = await Blog.findByIdAndDelete(id);

  if (!blog) {
    return res
      .status(404)
      .json(new apiResponse(404, null, "Blog not found"));
  }

  return res
    .status(200)
    .json(new apiResponse(200, blog, "Blog deleted successfully"));
});