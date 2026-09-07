const router = require("express").Router();
const Invoice = require("../models/Invoice");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/auth");
const { sendMail } = require("../config/mailer");
const { paymentReceiptEmail } = require("../utils/emailTemplates");
const { generateReceiptPDF } = require("../utils/pdfGenerator");

router.use(auth);

router.get("/", async (req, res) => {
  const invoices = await Invoice.find().populate("patient", "name phone").sort({ createdAt: -1 });
  res.json(invoices);
});

router.post("/", async (req, res) => {
  try {
    const invoice = await Invoice.create(req.body);
    const populated = await invoice.populate("patient", "name email");
    Notification.create({
      message: `New invoice created for ${populated.patient?.name || "patient"} — ₹${invoice.totalAmount} (${invoice.status})`,
      type: "payment",
    }).catch(() => {});

    // Step 9: Email the payment receipt (with PDF attached) if the patient has an email on file.
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
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(invoice);
});

router.delete("/:id", adminOnly, async (req, res) => {
  await Invoice.findByIdAndDelete(req.params.id);
  res.json({ message: "Invoice deleted" });
});

router.get("/:id", async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate("patient", "name phone address");
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });
  res.json(invoice);
});

module.exports = router;
