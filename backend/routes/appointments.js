const router = require("express").Router();
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { authedLimiter } = require("../middleware/rateLimiters");
const { appointmentCreate, appointmentUpdate, MONGO_ID } = require("../validators/schemas");
const AppError = require("../utils/AppError");
const { sendMail } = require("../config/mailer");
const { appointmentConfirmationEmail, appointmentApprovedEmail, appointmentDeclinedEmail } = require("../utils/emailTemplates");
const { notifyPatient } = require("../config/socket");

router.use(auth, authedLimiter);

// Supports ?status=&date=&dentist=
router.get("/", async (req, res) => {
  const { status, date, dentist } = req.query;
  const query = {};
  if (status && ["Pending", "Scheduled", "Completed", "Cancelled"].includes(status)) query.status = status;
  if (dentist) query.dentist = dentist;
  if (date) {
    const start = new Date(date);
    if (!isNaN(start)) {
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }
  }
  const appointments = await Appointment.find(query)
    .populate("patient", "name phone")
    .populate("dentist", "name specialization")
    .sort({ date: 1 });
  res.json(appointments);
});

router.get("/today/list", async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const appointments = await Appointment.find({ date: { $gte: start, $lte: end }, status: "Scheduled" })
    .populate("patient", "name phone")
    .populate("dentist", "name")
    .sort({ time: 1 });
  res.json(appointments);
});

router.post("/", appointmentCreate, validate, async (req, res) => {
  const appointment = await Appointment.create(req.body);
  const populated = await appointment.populate([{ path: "patient", select: "name email" }, { path: "dentist", select: "name" }]);
  Notification.create({
    message: `New appointment: ${populated.patient?.name || "Patient"} with Dr. ${populated.dentist?.name || ""} on ${new Date(appointment.date).toLocaleDateString()}`,
    type: "appointment",
  }).catch(() => {});

  if (populated.patient?.email) {
    sendMail({
      to: populated.patient.email,
      subject: "Your DentalCare Appointment is Confirmed",
      html: appointmentConfirmationEmail({
        patientName: populated.patient.name,
        dentistName: populated.dentist?.name || "",
        date: new Date(appointment.date).toLocaleDateString(),
        time: appointment.time,
        reason: appointment.reason,
      }),
    }).catch((err) => console.error("[appointments] confirmation email failed:", err.message));
  }

  res.status(201).json(appointment);
});

router.put("/:id", appointmentUpdate, validate, async (req, res) => {
  const before = await Appointment.findById(req.params.id);
  if (!before) throw new AppError("Appointment not found", 404);

  const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate([
    { path: "patient", select: "name email" },
    { path: "dentist", select: "name" },
  ]);

  if (before.status === "Pending" && appointment.status === "Scheduled" && appointment.patient?.email) {
    sendMail({
      to: appointment.patient.email,
      subject: "Your DentalCare Appointment is Confirmed",
      html: appointmentApprovedEmail({
        patientName: appointment.patient.name,
        dentistName: appointment.dentist?.name || "",
        date: new Date(appointment.date).toLocaleDateString(),
        time: appointment.time,
      }),
    }).catch((err) => console.error("[appointments] approval email failed:", err.message));

    Notification.create({
      message: `Appointment confirmed for ${appointment.patient.name} with Dr. ${appointment.dentist?.name || ""} on ${new Date(appointment.date).toLocaleDateString()}`,
      type: "appointment",
    }).catch(() => {});

    // Real-time push straight to this patient's own dashboard — they see the
    // "confirmed" popup instantly, without refreshing the page.
    notifyPatient(appointment.patient._id, "appointment:approved", {
      _id: appointment._id,
      dentistName: appointment.dentist?.name,
      date: appointment.date,
      time: appointment.time,
    });
  }

  if (before.status === "Pending" && appointment.status === "Cancelled" && appointment.patient?.email) {
    sendMail({
      to: appointment.patient.email,
      subject: "Update on Your DentalCare Appointment Request",
      html: appointmentDeclinedEmail({
        patientName: appointment.patient.name,
        dentistName: appointment.dentist?.name || "",
        date: new Date(appointment.date).toLocaleDateString(),
        time: appointment.time,
      }),
    }).catch((err) => console.error("[appointments] decline email failed:", err.message));

    notifyPatient(appointment.patient._id, "appointment:declined", {
      _id: appointment._id,
      dentistName: appointment.dentist?.name,
      date: appointment.date,
      time: appointment.time,
    });
  }

  res.json(appointment);
});

// Deleting an appointment record outright is admin-only — staff manage the
// day-to-day queue (approve/decline/complete/cancel via the PUT route above)
// but can't permanently remove appointment history.
router.delete("/:id", adminOnly, MONGO_ID(), validate, async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  if (!appointment) throw new AppError("Appointment not found", 404);
  res.json({ message: "Appointment deleted" });
});

module.exports = router;
