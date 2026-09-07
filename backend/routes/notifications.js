const router = require("express").Router();
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/", async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(30);
  res.json(notifications);
});

router.get("/unread-count", async (req, res) => {
  const count = await Notification.countDocuments({ read: false });
  res.json({ count });
});

router.put("/:id/read", async (req, res) => {
  const n = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  res.json(n);
});

router.put("/read-all", async (req, res) => {
  await Notification.updateMany({ read: false }, { read: true });
  res.json({ message: "All marked as read" });
});

module.exports = router;
