const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { authLimiter, authedLimiter, checkBackoff, recordFailure, clearFailures } = require("../middleware/rateLimiters");
const { staffRegister, staffLogin, passwordChange } = require("../validators/schemas");
const AppError = require("../utils/AppError");
const { sendMail } = require("../config/mailer");
const { emailVerificationEmail } = require("../utils/emailTemplates");
const { generateVerificationToken } = require("../utils/verification");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const genToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

function sendVerificationEmail(user) {
  const { token, expires } = generateVerificationToken();
  user.emailVerificationToken = token;
  user.emailVerificationExpires = expires;
  return user.save().then(() => {
    const link = `${FRONTEND_URL}/verify-email?type=staff&token=${token}`;
    return sendMail({
      to: user.email,
      subject: "Verify your DentalCare staff account",
      html: emailVerificationEmail({ name: user.name, link }),
    });
  });
}

// Register — strict tier: rate-limited + exponential backoff + full input validation.
router.post("/register", authLimiter, checkBackoff, staffRegister, validate, async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    recordFailure(req);
    throw new AppError("Email already registered", 400);
  }
  const user = await User.create({ name, email, password, role });
  clearFailures(req);

  sendVerificationEmail(user).catch(() => {});

  res.status(201).json({
    token: genToken(user),
    user: { id: user._id, name: user.name, role: user.role, emailVerified: user.emailVerified },
  });
});

// Login — strict tier: rate-limited + exponential backoff on repeated failures.
router.post("/login", authLimiter, checkBackoff, staffLogin, validate, async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const match = user && (await user.comparePassword(password));
  if (!user || !match) {
    recordFailure(req);
    throw new AppError("Invalid credentials", 400);
  }
  clearFailures(req);
  res.json({
    token: genToken(user),
    user: { id: user._id, name: user.name, role: user.role, emailVerified: user.emailVerified },
  });
});

// Verify email via the link sent at registration
router.get("/verify-email/:token", authLimiter, async (req, res) => {
  const user = await User.findOne({
    emailVerificationToken: req.params.token,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");
  if (!user) throw new AppError("This verification link is invalid or has expired.", 400);

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  res.json({ message: "Email verified successfully." });
});

// Resend the verification email (must be logged in) — strict tier since it sends an email per call.
router.post("/resend-verification", authLimiter, auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User not found", 404);
  if (user.emailVerified) return res.json({ message: "Your email is already verified." });
  const sent = await sendVerificationEmail(user);
  res.json({ sent, message: sent ? "Verification email sent." : "Could not send email — SMTP is not configured on the server." });
});

// Get current logged-in user's profile — loose tier (routine authenticated action)
router.get("/me", authedLimiter, auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// Update current user's name
router.put("/me", authedLimiter, auth, async (req, res) => {
  const { name } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true }).select("-password");
  res.json(user);
});

// Change current user's password — strict tier + backoff + validation.
router.put("/me/password", authLimiter, auth, checkBackoff, passwordChange, validate, async (req, res) => {
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

module.exports = router;
