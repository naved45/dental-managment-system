const router = require("express").Router();
const Patient = require("../models/Patient");
const Dentist = require("../models/Dentist");
const Appointment = require("../models/Appointment");
const Invoice = require("../models/Invoice");
const auth = require("../middleware/auth");

router.use(auth);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

router.get("/stats", async (req, res) => {
  const [patients, dentists, upcomingAppointments, invoices, statusAgg] = await Promise.all([
    Patient.countDocuments(),
    Dentist.countDocuments(),
    Appointment.countDocuments({ status: "Scheduled" }),
    Invoice.find(),
    Appointment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const revenue = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const pending = invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

  const statusBreakdown = { Scheduled: 0, Completed: 0, Cancelled: 0 };
  statusAgg.forEach((s) => { statusBreakdown[s._id] = s.count; });

  // Revenue trend: last 6 months, grouped by paid invoices' createdAt
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTHS[d.getMonth()] });
  }
  const totalsByKey = {};
  invoices.forEach((inv) => {
    const d = new Date(inv.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    totalsByKey[key] = (totalsByKey[key] || 0) + (inv.paidAmount || 0);
  });
  const revenueTrend = months.map((m) => ({ label: m.label, total: totalsByKey[`${m.year}-${m.month}`] || 0 }));

  res.json({ patients, dentists, upcomingAppointments, revenue, pending, statusBreakdown, revenueTrend });
});

module.exports = router;
