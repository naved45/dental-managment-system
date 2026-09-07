const router = require("express").Router();
const MedicalRecord = require("../models/MedicalRecord");
const auth = require("../middleware/auth");

router.use(auth);

// Get all records for a given patient
router.get("/patient/:patientId", async (req, res) => {
  const records = await MedicalRecord.find({ patient: req.params.patientId })
    .populate("dentist", "name specialization")
    .sort({ visitDate: -1 });
  res.json(records);
});

router.post("/", async (req, res) => {
  try {
    const record = await MedicalRecord.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(record);
});

router.delete("/:id", async (req, res) => {
  await MedicalRecord.findByIdAndDelete(req.params.id);
  res.json({ message: "Record deleted" });
});

module.exports = router;
