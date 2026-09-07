const nodemailer = require("nodemailer");

// The transporter reads its connection details from environment variables so
// real credentials are never hardcoded. See backend/.env.example for the
// variables you need to set (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL).
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return null; // no email configured yet — features that use it will just skip sending
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

// Sends an email. Never throws — logs a warning and resolves false instead,
// so a failed/misconfigured email never breaks the feature that triggered it
// (e.g. booking an appointment should succeed even if the confirmation email fails).
async function sendMail({ to, subject, html, attachments }) {
  const t = getTransporter();
  if (!t) {
    console.warn(`[mailer] SMTP not configured — skipped email "${subject}" to ${to}`);
    return false;
  }
  try {
    await t.sendMail({
      from: process.env.FROM_EMAIL || '"DentalCare Clinic" <no-reply@dentalcare.example>',
      to,
      subject,
      html,
      attachments,
    });
    return true;
  } catch (err) {
    console.error(`[mailer] Failed to send "${subject}" to ${to}:`, err.message);
    return false;
  }
}

module.exports = { sendMail };
