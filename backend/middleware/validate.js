const { validationResult } = require("express-validator");

// Runs after a list of express-validator checks. If any failed, responds
// with a clean 400 listing exactly what's wrong — never a raw Mongoose/DB
// error, and rejects the request outright rather than silently sanitizing
// bad input and continuing.
module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  return res.status(400).json({ message: "Invalid input", errors: formatted });
};
