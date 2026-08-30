const router = require("express").Router();
const Dentist = require("../models/Dentist");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/", async (req, res) => {
  const dentists = await Dentist.find().sort({ createdAt: -1 });
  res.json(dentists);
});

router.post("/", async (req, res) => {
  try {
    const dentist = await Dentist.create(req.body);
    res.status(201).json(dentist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const dentist = await Dentist.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(dentist);
});

router.delete("/:id", async (req, res) => {
  await Dentist.findByIdAndDelete(req.params.id);
  res.json({ message: "Dentist deleted" });
});

module.exports = router;
