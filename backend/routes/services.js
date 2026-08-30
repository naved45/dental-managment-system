const router = require("express").Router();
const Service = require("../models/Service");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/auth");

router.use(auth);

router.get("/", async (req, res) => {
  const services = await Service.find().sort({ category: 1, name: 1 });
  res.json(services);
});

router.post("/", adminOnly, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", adminOnly, async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(service);
});

router.delete("/:id", adminOnly, async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ message: "Service deleted" });
});

module.exports = router;
