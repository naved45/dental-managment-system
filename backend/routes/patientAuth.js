const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");
const { sendMail } = require("../config/mailer");
const { registrationEmail } = require("../utils/emailTemplates");

const genToken = (patient) =>
  jwt.sign(
    { id: patient._id, role: "patient", name: patient.name },
    process.env.JWT_SECRET || "change_this_secret_key",
    { expiresIn: "30d" }
  );

// Step 1 & 2: Patient registration + JWT issued immediately on success.
// If a Patient record already exists with this email/phone (added by clinic staff),
// this links portal access to that existing record instead of creating a duplicate.
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    let patient = await Patient.findOne({ email });
    if (patient && patient.hasPortalAccess) {
      return res.status(400).json({ message: "An account with this email already exists. Please log in." });
    }

    if (patient) {
      // Existing clinic record (added by staff) — link portal access to it.
      patient.password = password;
      patient.hasPortalAccess = true;
      if (name) patient.name = name;
      if (phone) patient.phone = phone;
    } else {
      patient = new Patient({ name, email, phone, password, hasPortalAccess: true });
    }
    await patient.save();

    // Step 8: Email confirmation on registration (non-blocking — registration
    // still succeeds even if the email fails to send, e.g. SMTP not configured).
    sendMail({ to: email, subject: "Welcome to DentalCare!", html: registrationEmail(patient.name) });

    res.status(201).json({
      token: genToken(patient),
      patient: { id: patient._id, name: patient.name, email: patient.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Step 1 & 2: Patient login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const patient = await Patient.findOne({ email, hasPortalAccess: true }).select("+password");
    if (!patient) return res.status(400).json({ message: "Invalid credentials" });
    const match = await patient.comparePassword(password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      token: genToken(patient),
      patient: { id: patient._id, name: patient.name, email: patient.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
