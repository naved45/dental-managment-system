const router = require("express").Router();
const Patient = require("../models/Patient");
const Dentist = require("../models/Dentist");
const Appointment = require("../models/Appointment");
const Invoice = require("../models/Invoice");
const auth = require("../middleware/auth");
const { authedLimiter } = require("../middleware/rateLimiters");

router.use(auth, authedLimiter);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

router.get("/stats", async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [
    patients,
    dentists,
    upcomingAppointments,
    invoices,
    statusAgg,
    appointmentsToday,
    appointmentsThisMonth,
    invoicesToday,
    completedToday,
  ] = await Promise.all([
    Patient.countDocuments(),
    Dentist.countDocuments(),
    Appointment.countDocuments({ status: "Scheduled" }),
    Invoice.find(),
    Appointment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Appointment.find({ date: { $gte: startOfToday, $lte: endOfToday } }).select("patient"),
    Appointment.find({ date: { $gte: startOfMonth, $lte: endOfToday } }).select("patient"),
    Invoice.find({ createdAt: { $gte: startOfToday, $lte: endOfToday } }),
    Appointment.countDocuments({ status: "Completed", date: { $gte: startOfToday, $lte: endOfToday } }),
  ]);

  const revenue = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const pending = invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
  const revenueToday = invoicesToday.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);

  // "Patients today/this month" = distinct patients with an appointment in that window
  // (matches how the dashboard's own "Patients Today" card already defines it on the frontend).
  const patientsToday = new Set(appointmentsToday.map((a) => String(a.patient))).size;
  const patientsThisMonth = new Set(appointmentsThisMonth.map((a) => String(a.patient))).size;

  const statusBreakdown = { Pending: 0, Scheduled: 0, Completed: 0, Cancelled: 0 };
  statusAgg.forEach((s) => { statusBreakdown[s._id] = s.count; });

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

  res.json({
    patients,
    dentists,
    upcomingAppointments,
    revenue,
    pending,
    statusBreakdown,
    revenueTrend,
    pendingRequests: statusBreakdown.Pending,
    patientsToday,
    patientsThisMonth,
    revenueToday,
    completedToday,
  });
});

module.exports = router;
