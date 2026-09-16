const router = require("express").Router();
const { param } = require("express-validator");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { authedLimiter } = require("../middleware/rateLimiters");

router.use(auth, authedLimiter);

router.get("/", async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(30);
  res.json(notifications);
});

router.get("/unread-count", async (req, res) => {
  const count = await Notification.countDocuments({ read: false });
  res.json({ count });
});

router.put("/:id/read", param("id").isMongoId().withMessage("Invalid ID"), validate, async (req, res) => {
  const n = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  res.json(n);
});

router.put("/read-all", async (req, res) => {
  await Notification.updateMany({ read: false }, { read: true });
  res.json({ message: "All marked as read" });
});

module.exports = router;
