import Team from "../models/Team.modal.js";
import { applyActiveFilter, isAdminRequest, escapeRegex } from "../utils/query.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { apiResponse } from "../utils/apiResponse.js";


export const createTeam = asyncHandler(async (req, res) => {
  const {
    name,
    designation,
    department,
    qualification,
    experience,
    image,
    email,
    phone,
    bio,
    facebook,
    instagram,
    linkedin,
    twitter,
    order,
    isFeatured,
    isActive,
  } = req.body;

  if (!name?.trim()) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Name is required"));
  }

  if (!designation?.trim()) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Designation is required"));
  }

  const member = await Team.create({
    name: name.trim(),
    designation: designation.trim(),
    department,
    qualification,
    experience,
    image,
    email,
    phone,
    bio,
    facebook,
    instagram,
    linkedin,
    twitter,
    order,
    isFeatured,
    isActive,
  });

  return res
    .status(201)
    .json(new apiResponse(201, member, "Team member created successfully"));
});

export const getAllTeams = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    isActive,
    isFeatured,
    department,
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
        department: {
          $regex: escapeRegex(search),
          $options: "i",
        },
      },
      {
        qualification: {
          $regex: escapeRegex(search),
          $options: "i",
        },
      },
      {
        experience: {
          $regex: escapeRegex(search),
          $options: "i",
        },
      },
    ];
  }

  if (department) {
    filter.department = department;
  }

  if (isFeatured !== undefined) {
    filter.isFeatured = isFeatured === "true";
  }

  const totalTeams = await Team.countDocuments(filter);

  let query = Team.find(filter).sort({
    order: 1,
    createdAt: -1,
  });

  if (isPagination === "true") {
    query = query
      .skip((Number(page) - 1) * Math.min(Number(limit) || 10, 100))
      .limit(Math.min(Number(limit) || 10, 100));
  }

  const teams = await query;

  return res.status(200).json(
    new apiResponse(
      200,
      {
        teams,
        totalTeams,
        totalPages: Math.ceil(totalTeams / Math.min(Number(limit) || 10, 100)),
        currentPage: Number(page),
      },
      "Team members fetched successfully"
    )
  );
});

export const getTeamById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Invalid team member id"));
  }

  const member = await Team.findById(id);

  if (!member || (member.isActive === false && !isAdminRequest(req))) {
    return res
      .status(404)
      .json(new apiResponse(404, null, "Team member not found"));
  }

  return res
    .status(200)
    .json(new apiResponse(200, member, "Team member fetched successfully"));
});

export const updateTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Invalid team member id"));
  }

  const member = await Team.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!member) {
    return res
      .status(404)
      .json(new apiResponse(404, null, "Team member not found"));
  }

  return res
    .status(200)
    .json(new apiResponse(200, member, "Team member updated successfully"));
});

export const deleteTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Invalid team member id"));
  }

  const member = await Team.findByIdAndDelete(id);

  if (!member) {
    return res
      .status(404)
      .json(new apiResponse(404, null, "Team member not found"));
  }

  return res
    .status(200)
    .json(new apiResponse(200, member, "Team member deleted successfully"));
});

