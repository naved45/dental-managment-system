const router = require("express").Router();
const { Parser } = require("json2csv");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Invoice = require("../models/Invoice");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { authedLimiter } = require("../middleware/rateLimiters");
const { patientCreate, patientUpdate, paginationQuery, MONGO_ID } = require("../validators/schemas");
const AppError = require("../utils/AppError");

router.use(auth, authedLimiter);

router.get("/", paginationQuery, validate, async (req, res) => {
  const { search = "", gender = "", page = 1, limit = 10 } = req.query;
  const query = {};
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // avoid regex-injection via search input
    query.$or = [
      { name: new RegExp(escaped, "i") },
      { phone: new RegExp(escaped, "i") },
      { email: new RegExp(escaped, "i") },
    ];
  }
  if (gender) query.gender = gender;

  const skip = (Number(page) - 1) * Number(limit);
  const [patients, total] = await Promise.all([
    Patient.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Patient.countDocuments(query),
  ]);
  res.json({ patients, total, page: Number(page), pages: Math.ceil(total / limit) || 1 });
});

router.get("/export/csv", async (req, res) => {
  const patients = await Patient.find().sort({ name: 1 }).lean();
  const fields = ["name", "age", "gender", "phone", "email", "address", "bloodGroup", "medicalHistory"];
  const parser = new Parser({ fields });
  const csv = parser.parse(patients);
  res.header("Content-Type", "text/csv");
  res.attachment("patients.csv");
  res.send(csv);
});

router.get("/:id/full", MONGO_ID(), validate, async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) throw new AppError("Patient not found", 404);

  const [appointments, invoices] = await Promise.all([
    Appointment.find({ patient: patient._id }).populate("dentist", "name specialization").sort({ date: -1 }),
    Invoice.find({ patient: patient._id }).sort({ createdAt: -1 }),
  ]);

  res.json({ patient, appointments, invoices });
});

router.get("/:id", MONGO_ID(), validate, async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) throw new AppError("Patient not found", 404);
  res.json(patient);
});

router.post("/", patientCreate, validate, async (req, res) => {
  const patient = await Patient.create(req.body);
  res.status(201).json(patient);
});

router.put("/:id", patientUpdate, validate, async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!patient) throw new AppError("Patient not found", 404);
  res.json(patient);
});

router.delete("/:id", adminOnly, MONGO_ID(), validate, async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) throw new AppError("Patient not found", 404);
  res.json({ message: "Patient deleted" });
});

module.exports = router;
