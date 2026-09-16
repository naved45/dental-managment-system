// const router = require("express").Router();
// const Dentist = require("../models/Dentist");
// const auth = require("../middleware/auth");
// const { adminOnly } = require("../middleware/auth");
// const validate = require("../middleware/validate");
// const { authedLimiter } = require("../middleware/rateLimiters");
// const { dentistCreate, dentistUpdate, MONGO_ID } = require("../validators/schemas");
// const AppError = require("../utils/AppError");

// router.use(auth, authedLimiter);

// // Staff AND admin can view the doctor directory.
// router.get("/", async (req, res) => {
//   const dentists = await Dentist.find().sort({ createdAt: -1 });
//   res.json(dentists);
// });

// // Only admins manage the doctor directory itself — staff are read-only here.
// router.post("/", adminOnly, dentistCreate, validate, async (req, res) => {
//   const dentist = await Dentist.create(req.body);
//   res.status(201).json(dentist);
// });

// router.put("/:id", adminOnly, dentistUpdate, validate, async (req, res) => {
//   const dentist = await Dentist.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//   if (!dentist) throw new AppError("Dentist not found", 404);
//   res.json(dentist);
// });

// router.delete("/:id", adminOnly, MONGO_ID(), validate, async (req, res) => {
//   const dentist = await Dentist.findByIdAndDelete(req.params.id);
//   if (!dentist) throw new AppError("Dentist not found", 404);
//   res.json({ message: "Dentist deleted" });
// });

// module.exports = router;

const router = require("express").Router();

const Dentist = require("../models/Dentist");

const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/auth");

const validate = require("../middleware/validate");

const { authedLimiter } = require("../middleware/rateLimiters");

const {
  dentistCreate,
  dentistUpdate,
  MONGO_ID,
} = require("../validators/schemas");

const AppError = require("../utils/AppError");

// Authentication + rate limiting for all dentist routes
router.use(auth, authedLimiter);

// Staff AND admin can view the doctor directory
router.get("/", async (req, res) => {
  const dentists = await Dentist.find().sort({ createdAt: -1 });

  res.json(dentists);
});

// Only admins can add doctors
router.post("/", adminOnly, dentistCreate, validate, async (req, res) => {
  const dentist = await Dentist.create(req.body);

  res.status(201).json(dentist);
});

// Only admins can update doctors
router.put("/:id", adminOnly, dentistUpdate, validate, async (req, res) => {
  const dentist = await Dentist.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!dentist) {
    throw new AppError("Dentist not found", 404);
  }

  res.json(dentist);
});

// Only admins can delete doctors
router.delete("/:id", adminOnly, MONGO_ID(), validate, async (req, res) => {
  const dentist = await Dentist.findByIdAndDelete(req.params.id);

  if (!dentist) {
    throw new AppError("Dentist not found", 404);
  }

  res.json({
    message: "Dentist deleted",
  });
});

module.exports = router;
