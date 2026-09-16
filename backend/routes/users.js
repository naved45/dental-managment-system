const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { authLimiter, authedLimiter, checkBackoff, recordFailure, clearFailures } = require("../middleware/rateLimiters");
const { passwordChange, userUpdate, MONGO_ID } = require("../validators/schemas");
const AppError = require("../utils/AppError");

router.use(auth);

router.get("/me", authedLimiter, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

router.put("/me", authedLimiter, async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { name, phone, avatar }, { new: true }).select("-password");
  res.json(user);
});

// Strict tier + backoff, since this is a sensitive credential-changing action.
router.put("/me/password", authLimiter, checkBackoff, passwordChange, validate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  const match = await user.comparePassword(currentPassword);
  if (!match) {
    recordFailure(req);
    throw new AppError("Current password is incorrect", 400);
  }
  clearFailures(req);
  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated" });
});

// Admin-only: manage staff accounts
router.get("/", authedLimiter, adminOnly, async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

router.put("/:id", authedLimiter, adminOnly, userUpdate, validate, async (req, res) => {
  const { role, isActive } = req.body;
  const update = {};
  if (role) update.role = role;
  if (typeof isActive === "boolean") update.isActive = isActive;
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-password");
  if (!user) throw new AppError("User not found", 404);
  res.json(user);
});

router.delete("/:id", authedLimiter, adminOnly, MONGO_ID(), validate, async (req, res) => {
  if (req.params.id === req.user.id) {
    throw new AppError("You can't delete your own account", 400);
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError("User not found", 404);
  res.json({ message: "User removed" });
});

module.exports = router;
