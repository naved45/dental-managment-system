const router = require("express").Router();
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const { sendMail } = require("../config/mailer");
const { appointmentConfirmationEmail } = require("../utils/emailTemplates");

router.use(auth);

// Supports ?status=&date=&dentist=
router.get("/", async (req, res) => {
  const { status, date, dentist } = req.query;
  const query = {};
  if (status) query.status = status;
  if (dentist) query.dentist = dentist;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    query.date = { $gte: start, $lt: end };
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

router.post("/", async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    const populated = await appointment.populate([{ path: "patient", select: "name email" }, { path: "dentist", select: "name" }]);
    Notification.create({
      message: `New appointment: ${populated.patient?.name || "Patient"} with Dr. ${populated.dentist?.name || ""} on ${new Date(appointment.date).toLocaleDateString()}`,
      type: "appointment",
    }).catch(() => {});

    // Step 8: Email confirmation to the patient, if we have an email on file.
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
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(appointment);
});

router.delete("/:id", async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ message: "Appointment deleted" });
});

module.exports = router;
