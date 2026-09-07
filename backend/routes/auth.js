const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const genToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET || "change_this_secret_key", {
    expiresIn: "7d",
  });

// Register (first admin / staff signup)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    const user = await User.create({ name, email, password, role });
    res.status(201).json({ token: genToken(user), user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    res.json({ token: genToken(user), user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current logged-in user's profile
router.get("/me", require("../middleware/auth"), async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// Update current user's name
router.put("/me", require("../middleware/auth"), async (req, res) => {
  const { name } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true }).select("-password");
  res.json(user);
});

// Change current user's password
router.put("/me/password", require("../middleware/auth"), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(400).json({ message: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
