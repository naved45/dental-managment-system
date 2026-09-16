const router = require("express").Router();
const Invoice = require("../models/Invoice");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { authedLimiter } = require("../middleware/rateLimiters");
const { invoiceCreate, invoiceUpdate, MONGO_ID } = require("../validators/schemas");
const AppError = require("../utils/AppError");
const { sendMail } = require("../config/mailer");
const { paymentReceiptEmail } = require("../utils/emailTemplates");
const { generateReceiptPDF } = require("../utils/pdfGenerator");

router.use(auth, authedLimiter);

router.get("/", async (req, res) => {
  const invoices = await Invoice.find().populate("patient", "name phone").sort({ createdAt: -1 });
  res.json(invoices);
});

router.get("/:id", MONGO_ID(), validate, async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate("patient", "name phone address");
  if (!invoice) throw new AppError("Invoice not found", 404);
  res.json(invoice);
});

router.post("/", invoiceCreate, validate, async (req, res) => {
  const invoice = await Invoice.create(req.body);
  const populated = await invoice.populate("patient", "name email");
  Notification.create({
    message: `New invoice created for ${populated.patient?.name || "patient"} — ₹${invoice.totalAmount} (${invoice.status})`,
    type: "payment",
  }).catch(() => {});

  if (populated.patient?.email) {
    generateReceiptPDF(invoice, populated.patient)
      .then((pdfBuffer) =>
        sendMail({
          to: populated.patient.email,
          subject: "Your DentalCare Payment Receipt",
          html: paymentReceiptEmail({
            patientName: populated.patient.name,
            totalAmount: invoice.totalAmount,
            paidAmount: invoice.paidAmount,
            status: invoice.status,
          }),
          attachments: [{ filename: "receipt.pdf", content: pdfBuffer }],
        })
      )
      .catch((err) => console.error("[invoices] receipt email failed:", err.message));
  }

  res.status(201).json(invoice);
});

router.put("/:id", invoiceUpdate, validate, async (req, res) => {
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!invoice) throw new AppError("Invoice not found", 404);
  res.json(invoice);
});

router.delete("/:id", MONGO_ID(), validate, adminOnly, async (req, res) => {
  const invoice = await Invoice.findByIdAndDelete(req.params.id);
  if (!invoice) throw new AppError("Invoice not found", 404);
  res.json({ message: "Invoice deleted" });
});

module.exports = router;
