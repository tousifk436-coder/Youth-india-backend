// errorHandler.js – turns every error into a clear JSON response with the right status code
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = err.statusCode || err.status || 500;
  let message = err.message || "Server Error";
  let errors;

  // Mongoose validation (missing / wrong fields)
  if (err.name === "ValidationError") {
    status = 400;
    errors = Object.values(err.errors || {}).map((e) => e.message);
    message = errors.join(", ") || "Validation failed";
  }
  // Wrong ObjectId / wrong type
  else if (err.name === "CastError") {
    status = 400;
    message = `Invalid value for ${err.path}`;
  }
  // Duplicate unique field
  else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0] || "field";
    message = `${field} already exists`;
  }
  // Bad JSON body
  else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON in request body";
  }
  else if (err.type === "entity.too.large") {
    status = 413;
    message = "Request body is too large";
  }
  // File upload limits / type
  else if (err.name === "MulterError") {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? `File is too large (max ${process.env.MAX_UPLOAD_MB || 10} MB)` : err.message;
  }
  else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    message = "Invalid or expired token";
  }

  if (status >= 500) {
    console.error("Error:", err);
    if (process.env.NODE_ENV === "production") message = "Something went wrong. Please try again later.";
  }

  res.status(status).json({
    statusCode: status,
    data: null,
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};
