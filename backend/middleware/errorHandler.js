const AppError = require("../utils/AppError");

// Converts a few well-known Mongoose error shapes into safe, curated
// AppErrors — so callers of the DB never need their own try/catch just to
// avoid leaking Mongoose's internal error text (which includes schema paths,
// collection names, etc).
function normalizeError(err) {
  if (err instanceof AppError) return err;

  // Mongoose validation error (missing/invalid required field)
  if (err.name === "ValidationError") {
    const fields = Object.keys(err.errors || {});
    const msg = fields.length ? `Invalid or missing field(s): ${fields.join(", ")}` : "Invalid input data";
    return new AppError(msg, 400);
  }

  // Mongoose CastError (e.g. a malformed MongoDB ObjectId in a URL param)
  if (err.name === "CastError") {
    return new AppError("Invalid ID format", 400);
  }

  // MongoDB duplicate key error (E11000) — only reveal the field name, never the raw driver message
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "value";
    return new AppError(`This ${field} is already in use`, 409);
  }

  // Anything else is NOT safe to show the user as-is.
  return null;
}

// Centralized error handler. Must be registered last, after all routes.
// - Always logs the full error (message + stack) server-side for debugging.
// - Only ever sends a curated, generic message to the client — never a raw
//   stack trace, file path, or database error string.
module.exports = function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  console.error(`[error] ${req.method} ${req.originalUrl} ->`, err.stack || err.message || err);

  const known = normalizeError(err);
  if (known) {
    return res.status(known.statusCode).json({ message: known.message });
  }

  // Unknown/unexpected error: never leak err.message to the client.
  res.status(500).json({ message: "Something went wrong on our end. Please try again later." });
};
