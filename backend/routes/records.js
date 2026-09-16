const router = require("express").Router();
const MedicalRecord = require("../models/MedicalRecord");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { authedLimiter } = require("../middleware/rateLimiters");
const { recordCreate, MONGO_ID } = require("../validators/schemas");
const AppError = require("../utils/AppError");
const { param } = require("express-validator");

router.use(auth, authedLimiter);

router.get("/patient/:patientId", param("patientId").isMongoId().withMessage("Invalid patient ID"), validate, async (req, res) => {
  const records = await MedicalRecord.find({ patient: req.params.patientId })
    .populate("dentist", "name specialization")
    .sort({ visitDate: -1 });
  res.json(records);
});

router.post("/", recordCreate, validate, async (req, res) => {
  const record = await MedicalRecord.create(req.body);
  res.status(201).json(record);
});

router.put("/:id", MONGO_ID(), validate, async (req, res) => {
  const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!record) throw new AppError("Record not found", 404);
  res.json(record);
});

router.delete("/:id", MONGO_ID(), validate, async (req, res) => {
  const record = await MedicalRecord.findByIdAndDelete(req.params.id);
  if (!record) throw new AppError("Record not found", 404);
  res.json({ message: "Record deleted" });
});

module.exports = router;
