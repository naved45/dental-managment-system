const router = require("express").Router();
const upload = require("../config/upload");
const auth = require("../middleware/auth");

router.use(auth);

// Generic single-file upload endpoint. Returns a URL usable by the frontend.
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.originalname });
});

module.exports = router;
