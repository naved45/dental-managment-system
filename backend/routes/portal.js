const router = require("express").Router();
const { param } = require("express-validator");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Invoice = require("../models/Invoice");
const MedicalRecord = require("../models/MedicalRecord");
const Dentist = require("../models/Dentist");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const patientOnly = require("../middleware/patientOnly");
const validate = require("../middleware/validate");
const { authedLimiter } = require("../middleware/rateLimiters");
const { appointmentBookPortal } = require("../validators/schemas");
const AppError = require("../utils/AppError");
const { sendMail } = require("../config/mailer");
const { paymentReceiptEmail, medicalReportEmail, appointmentPendingEmail } = require("../utils/emailTemplates");
const { generateReceiptPDF, generateMedicalReportPDF } = require("../utils/pdfGenerator");
const { notifyStaff } = require("../config/socket");

const MONGO_ID = (name) => param(name).isMongoId().withMessage("Invalid ID format");

// Every route below requires a valid PATIENT portal login (not a staff token).
router.use(auth, patientOnly, authedLimiter);

router.get("/dashboard", async (req, res) => {
  const patientId = req.user.id;
  const [patient, appointments, invoices, records] = await Promise.all([
    Patient.findById(patientId),
    Appointment.find({ patient: patientId }).populate("dentist", "name specialization").sort({ date: 1 }),
    Invoice.find({ patient: patientId }),
    MedicalRecord.find({ patient: patientId }),
  ]);

  const now = new Date();
  const nextAppointment = appointments.find((a) => ["Pending", "Scheduled"].includes(a.status) && new Date(a.date) >= now) || null;
  const totalVisits = appointments.filter((a) => a.status === "Completed").length;
  const outstandingBalance = invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

  res.json({
    patient: { name: patient.name, email: patient.email, phone: patient.phone },
    nextAppointment,
    totalVisits,
    totalAppointments: appointments.length,
    outstandingBalance,
    totalRecords: records.length,
  });
});

router.get("/appointments", async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user.id })
    .populate("dentist", "name specialization")
    .sort({ date: -1 });
  res.json(appointments);
});

router.get("/invoices", async (req, res) => {
  const invoices = await Invoice.find({ patient: req.user.id }).sort({ createdAt: -1 });
  res.json(invoices);
});

router.get("/records", async (req, res) => {
  const records = await MedicalRecord.find({ patient: req.user.id })
    .populate("dentist", "name specialization")
    .sort({ visitDate: -1 });
  res.json(records);
});

router.get("/invoices/:id/pdf", MONGO_ID("id"), validate, async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, patient: req.user.id });
  if (!invoice) throw new AppError("Invoice not found", 404);
  const patient = await Patient.findById(req.user.id);
  const pdfBuffer = await generateReceiptPDF(invoice, patient);
  res.set({ "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename=receipt-${invoice._id}.pdf` });
  res.send(pdfBuffer);
});

router.get("/records/:id/pdf", MONGO_ID("id"), validate, async (req, res) => {
  const record = await MedicalRecord.findOne({ _id: req.params.id, patient: req.user.id });
  if (!record) throw new AppError("Record not found", 404);
  const patient = await Patient.findById(req.user.id);
  const pdfBuffer = await generateMedicalReportPDF(record, patient);
  res.set({ "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename=medical-report-${record._id}.pdf` });
  res.send(pdfBuffer);
});

router.post("/invoices/:id/email", MONGO_ID("id"), validate, async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, patient: req.user.id });
  if (!invoice) throw new AppError("Invoice not found", 404);
  const patient = await Patient.findById(req.user.id);
  if (!patient.email) throw new AppError("No email on file", 400);

  const pdfBuffer = await generateReceiptPDF(invoice, patient);
  const sent = await sendMail({
    to: patient.email,
    subject: "Your DentalCare Payment Receipt",
    html: paymentReceiptEmail({ patientName: patient.name, totalAmount: invoice.totalAmount, paidAmount: invoice.paidAmount, status: invoice.status }),
    attachments: [{ filename: "receipt.pdf", content: pdfBuffer }],
  });
  res.json({ sent, message: sent ? "Receipt emailed" : "Email not sent — SMTP not configured on the server" });
});

router.post("/records/:id/email", MONGO_ID("id"), validate, async (req, res) => {
  const record = await MedicalRecord.findOne({ _id: req.params.id, patient: req.user.id });
  if (!record) throw new AppError("Record not found", 404);
  const patient = await Patient.findById(req.user.id);
  if (!patient.email) throw new AppError("No email on file", 400);

  const pdfBuffer = await generateMedicalReportPDF(record, patient);
  const sent = await sendMail({
    to: patient.email,
    subject: "Your DentalCare Medical Report",
    html: medicalReportEmail({ patientName: patient.name, visitDate: new Date(record.visitDate).toLocaleDateString() }),
    attachments: [{ filename: "medical-report.pdf", content: pdfBuffer }],
  });
  res.json({ sent, message: sent ? "Report emailed" : "Email not sent — SMTP not configured on the server" });
});

router.get("/doctors", async (req, res) => {
  const dentists = await Dentist.find().select("name specialization experienceYears").sort({ name: 1 });
  res.json(dentists);
});

// Patient self-service booking — validated, and the patient id is always
// forced to req.user.id (never trusted from the request body), so a patient
// can never book an appointment on someone else's behalf.
router.post("/appointments", appointmentBookPortal, validate, async (req, res) => {
  const { dentist, date, time, reason } = req.body;

  const appointment = await Appointment.create({
    patient: req.user.id,
    dentist,
    date,
    time,
    reason,
    status: "Pending",
  });
  const populated = await appointment.populate([
    { path: "patient", select: "name email" },
    { path: "dentist", select: "name" },
  ]);

  Notification.create({
    message: `New appointment request: ${populated.patient?.name || "Patient"} with Dr. ${populated.dentist?.name || ""} on ${new Date(appointment.date).toLocaleDateString()} — awaiting approval`,
    type: "appointment",
  }).catch(() => {});

  // Real-time push: every staff/admin browser currently open gets this
  // instantly via WebSocket — no page reload, no polling delay.
  notifyStaff("appointment:new", {
    _id: appointment._id,
    patientName: populated.patient?.name,
    dentistName: populated.dentist?.name,
    date: appointment.date,
    time: appointment.time,
    reason: appointment.reason,
  });

  if (populated.patient?.email) {
    sendMail({
      to: populated.patient.email,
      subject: "Your DentalCare Appointment Request",
      html: appointmentPendingEmail({
        patientName: populated.patient.name,
        dentistName: populated.dentist?.name || "",
        date: new Date(appointment.date).toLocaleDateString(),
        time: appointment.time,
        reason: appointment.reason,
      }),
    }).catch(() => {});
  }

  res.status(201).json(appointment);
});

module.exports = router;
