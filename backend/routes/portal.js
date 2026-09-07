const router = require("express").Router();
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Invoice = require("../models/Invoice");
const MedicalRecord = require("../models/MedicalRecord");
const Dentist = require("../models/Dentist");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const patientOnly = require("../middleware/patientOnly");
const { sendMail } = require("../config/mailer");
const { paymentReceiptEmail, medicalReportEmail, appointmentConfirmationEmail } = require("../utils/emailTemplates");
const { generateReceiptPDF, generateMedicalReportPDF } = require("../utils/pdfGenerator");

// Every route below requires a valid PATIENT portal login (not a staff token).
router.use(auth, patientOnly);

// Step 3: Patient's own dashboard summary
router.get("/dashboard", async (req, res) => {
  const patientId = req.user.id;
  const [patient, appointments, invoices, records] = await Promise.all([
    Patient.findById(patientId),
    Appointment.find({ patient: patientId }).populate("dentist", "name specialization").sort({ date: 1 }),
    Invoice.find({ patient: patientId }),
    MedicalRecord.find({ patient: patientId }),
  ]);

  const now = new Date();
  const nextAppointment = appointments.find((a) => a.status === "Scheduled" && new Date(a.date) >= now) || null;
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

// Step 4: Appointment history
router.get("/appointments", async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user.id })
    .populate("dentist", "name specialization")
    .sort({ date: -1 });
  res.json(appointments);
});

// Step 5: Payment history
router.get("/invoices", async (req, res) => {
  const invoices = await Invoice.find({ patient: req.user.id }).sort({ createdAt: -1 });
  res.json(invoices);
});

// Step 6: Medical reports
router.get("/records", async (req, res) => {
  const records = await MedicalRecord.find({ patient: req.user.id })
    .populate("dentist", "name specialization")
    .sort({ visitDate: -1 });
  res.json(records);
});

// Step 7: PDF download — payment receipt
router.get("/invoices/:id/pdf", async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, patient: req.user.id });
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });
  const patient = await Patient.findById(req.user.id);
  const pdfBuffer = await generateReceiptPDF(invoice, patient);
  res.set({ "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename=receipt-${invoice._id}.pdf` });
  res.send(pdfBuffer);
});

// Step 7: PDF download — medical report
router.get("/records/:id/pdf", async (req, res) => {
  const record = await MedicalRecord.findOne({ _id: req.params.id, patient: req.user.id });
  if (!record) return res.status(404).json({ message: "Record not found" });
  const patient = await Patient.findById(req.user.id);
  const pdfBuffer = await generateMedicalReportPDF(record, patient);
  res.set({ "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename=medical-report-${record._id}.pdf` });
  res.send(pdfBuffer);
});

// Step 9: Re-send payment receipt by email on demand
router.post("/invoices/:id/email", async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, patient: req.user.id });
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });
  const patient = await Patient.findById(req.user.id);
  if (!patient.email) return res.status(400).json({ message: "No email on file" });

  const pdfBuffer = await generateReceiptPDF(invoice, patient);
  const sent = await sendMail({
    to: patient.email,
    subject: "Your DentalCare Payment Receipt",
    html: paymentReceiptEmail({ patientName: patient.name, totalAmount: invoice.totalAmount, paidAmount: invoice.paidAmount, status: invoice.status }),
    attachments: [{ filename: "receipt.pdf", content: pdfBuffer }],
  });
  res.json({ sent, message: sent ? "Receipt emailed" : "Email not sent — SMTP not configured on the server" });
});

// Step 9: Email a medical report on demand
router.post("/records/:id/email", async (req, res) => {
  const record = await MedicalRecord.findOne({ _id: req.params.id, patient: req.user.id });
  if (!record) return res.status(404).json({ message: "Record not found" });
  const patient = await Patient.findById(req.user.id);
  if (!patient.email) return res.status(400).json({ message: "No email on file" });

  const pdfBuffer = await generateMedicalReportPDF(record, patient);
  const sent = await sendMail({
    to: patient.email,
    subject: "Your DentalCare Medical Report",
    html: medicalReportEmail({ patientName: patient.name, visitDate: new Date(record.visitDate).toLocaleDateString() }),
    attachments: [{ filename: "medical-report.pdf", content: pdfBuffer }],
  });
  res.json({ sent, message: sent ? "Report emailed" : "Email not sent — SMTP not configured on the server" });
});

// See available doctors (read-only — just the public-facing profile fields)
router.get("/doctors", async (req, res) => {
  const dentists = await Dentist.find().select("name specialization experienceYears").sort({ name: 1 });
  res.json(dentists);
});

// Patient self-service booking. Unlike the staff booking route, the patient
// is NOT allowed to set which patient the appointment is for — it is always
// forced to their own id, so a patient can never book on someone else's behalf.
router.post("/appointments", async (req, res) => {
  try {
    const { dentist, date, time, reason } = req.body;
    if (!dentist || !date || !time) {
      return res.status(400).json({ message: "Dentist, date and time are required" });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      dentist,
      date,
      time,
      reason,
      status: "Scheduled",
    });
    const populated = await appointment.populate([
      { path: "patient", select: "name email" },
      { path: "dentist", select: "name" },
    ]);

    // Same notification staff see when they book — so a patient's self-booked
    // appointment shows up in the staff/admin notification bell automatically.
    Notification.create({
      message: `New appointment: ${populated.patient?.name || "Patient"} with Dr. ${populated.dentist?.name || ""} on ${new Date(appointment.date).toLocaleDateString()} (booked via patient portal)`,
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
      }).catch(() => {});
    }

    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
