const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/auth");

router.use(auth);

router.get("/me", async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

router.put("/me", async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { name, phone, avatar }, { new: true }).select("-password");
  res.json(user);
});

router.put("/me/password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  const match = await user.comparePassword(currentPassword);
  if (!match) return res.status(400).json({ message: "Current password is incorrect" });
  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated" });
});

// Admin-only: manage staff accounts
router.get("/", adminOnly, async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

router.put("/:id", adminOnly, async (req, res) => {
  const { role, isActive } = req.body;
  const update = {};
  if (role) update.role = role;
  if (typeof isActive === "boolean") update.isActive = isActive;
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-password");
  res.json(user);
});

router.delete("/:id", adminOnly, async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: "You can't delete your own account" });
  }
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User removed" });
});

module.exports = router;
