const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");
const auth = require("../middleware/auth");
const patientOnly = require("../middleware/patientOnly");
const validate = require("../middleware/validate");
const { authLimiter, checkBackoff, recordFailure, clearFailures } = require("../middleware/rateLimiters");
const { patientRegister, patientLogin } = require("../validators/schemas");
const AppError = require("../utils/AppError");
const { sendMail } = require("../config/mailer");
const { registrationEmail, emailVerificationEmail } = require("../utils/emailTemplates");
const { generateVerificationToken } = require("../utils/verification");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const genToken = (patient) =>
  jwt.sign(
    { id: patient._id, role: "patient", name: patient.name },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

function sendVerificationEmail(patient) {
  const { token, expires } = generateVerificationToken();
  patient.emailVerificationToken = token;
  patient.emailVerificationExpires = expires;
  return patient.save().then(() => {
    const link = `${FRONTEND_URL}/verify-email?type=patient&token=${token}`;
    return sendMail({
      to: patient.email,
      subject: "Verify your DentalCare patient account",
      html: emailVerificationEmail({ name: patient.name, link }),
    });
  });
}

// Patient registration + JWT issued immediately on success.
router.post("/register", authLimiter, checkBackoff, patientRegister, validate, async (req, res) => {
  const { name, email, phone, password } = req.body;

  let patient = await Patient.findOne({ email });
  if (patient && patient.hasPortalAccess) {
    recordFailure(req);
    throw new AppError("An account with this email already exists. Please log in.", 400);
  }

  if (patient) {
    patient.password = password;
    patient.hasPortalAccess = true;
    if (name) patient.name = name;
    if (phone) patient.phone = phone;
  } else {
    patient = new Patient({ name, email, phone, password, hasPortalAccess: true });
  }
  await patient.save();
  clearFailures(req);

  sendMail({ to: email, subject: "Welcome to DentalCare!", html: registrationEmail(patient.name) }).catch(() => {});
  sendVerificationEmail(patient).catch(() => {});

  res.status(201).json({
    token: genToken(patient),
    patient: { id: patient._id, name: patient.name, email: patient.email, emailVerified: patient.emailVerified },
  });
});

// Patient login
router.post("/login", authLimiter, checkBackoff, patientLogin, validate, async (req, res) => {
  const { email, password } = req.body;
  const patient = await Patient.findOne({ email, hasPortalAccess: true }).select("+password");
  const match = patient && (await patient.comparePassword(password));
  if (!patient || !match) {
    recordFailure(req);
    throw new AppError("Invalid credentials", 400);
  }
  clearFailures(req);

  res.json({
    token: genToken(patient),
    patient: { id: patient._id, name: patient.name, email: patient.email, emailVerified: patient.emailVerified },
  });
});

// Verify email via the link sent at registration
router.get("/verify-email/:token", authLimiter, async (req, res) => {
  const patient = await Patient.findOne({
    emailVerificationToken: req.params.token,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");
  if (!patient) throw new AppError("This verification link is invalid or has expired.", 400);

  patient.emailVerified = true;
  patient.emailVerificationToken = undefined;
  patient.emailVerificationExpires = undefined;
  await patient.save();
  res.json({ message: "Email verified successfully." });
});

// Resend the verification email (must be logged in as a patient)
router.post("/resend-verification", authLimiter, auth, patientOnly, async (req, res) => {
  const patient = await Patient.findById(req.user.id);
  if (!patient) throw new AppError("Account not found", 404);
  if (patient.emailVerified) return res.json({ message: "Your email is already verified." });
  const sent = await sendVerificationEmail(patient);
  res.json({ sent, message: sent ? "Verification email sent." : "Could not send email — SMTP is not configured on the server." });
});

module.exports = router;
