const router = require("express").Router();
const Service = require("../models/Service");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { authedLimiter } = require("../middleware/rateLimiters");
const { serviceCreate, serviceUpdate, MONGO_ID } = require("../validators/schemas");
const AppError = require("../utils/AppError");

router.use(auth, authedLimiter);

router.get("/", async (req, res) => {
  const services = await Service.find().sort({ category: 1, name: 1 });
  res.json(services);
});

router.post("/", adminOnly, serviceCreate, validate, async (req, res) => {
  const service = await Service.create(req.body);
  res.status(201).json(service);
});

router.put("/:id", adminOnly, serviceUpdate, validate, async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!service) throw new AppError("Service not found", 404);
  res.json(service);
});

router.delete("/:id", adminOnly, MONGO_ID(), validate, async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) throw new AppError("Service not found", 404);
  res.json({ message: "Service deleted" });
});

module.exports = router;
