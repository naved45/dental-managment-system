const router = require("express").Router();
const { Parser } = require("json2csv");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Invoice = require("../models/Invoice");
const auth = require("../middleware/auth");

router.use(auth);

// Supports ?search=&gender=&page=&limit=
router.get("/", async (req, res) => {
  const { search = "", gender = "", page = 1, limit = 10 } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { name: new RegExp(search, "i") },
      { phone: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
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

// Export all patients as CSV
router.get("/export/csv", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ name: 1 }).lean();
    const fields = ["name", "age", "gender", "phone", "email", "address", "bloodGroup", "medicalHistory"];
    const parser = new Parser({ fields });
    const csv = parser.parse(patients);
    res.header("Content-Type", "text/csv");
    res.attachment("patients.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Full patient profile: patient + appointments + invoices + medical records
router.get("/:id/full", async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ message: "Patient not found" });

  const [appointments, invoices] = await Promise.all([
    Appointment.find({ patient: patient._id }).populate("dentist", "name specialization").sort({ date: -1 }),
    Invoice.find({ patient: patient._id }).sort({ createdAt: -1 }),
  ]);

  res.json({ patient, appointments, invoices });
});

router.get("/:id", async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ message: "Patient not found" });
  res.json(patient);
});

router.post("/", async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(patient);
});

router.delete("/:id", async (req, res) => {
  await Patient.findByIdAndDelete(req.params.id);
  res.json({ message: "Patient deleted" });
});

module.exports = router;
