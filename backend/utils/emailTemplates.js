// Simple inline-HTML email templates. Kept as small functions returning a
// string so they're easy to preview/edit without a templating engine.

const wrapper = (title, bodyHtml) => `
  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color:#1e293b;">
    <div style="background:#0e7490; color:#fff; padding:18px 24px; border-radius:10px 10px 0 0;">
      <h2 style="margin:0; font-size:20px;">🦷 DentalCare Clinic</h2>
    </div>
    <div style="border:1px solid #e2e8f0; border-top:none; padding:24px; border-radius:0 0 10px 10px;">
      <h3 style="color:#0e7490; margin-top:0;">${title}</h3>
      ${bodyHtml}
      <p style="color:#94a3b8; font-size:12px; margin-top:28px;">This is an automated message from DentalCare Clinic. Please do not reply directly to this email.</p>
    </div>
  </div>`;

function registrationEmail(name) {
  return wrapper("Welcome to DentalCare!", `
    <p>Hi ${name},</p>
    <p>Your patient portal account has been created successfully. You can now log in anytime to view your
    appointment history, payment history, and medical reports.</p>`);
}

function appointmentConfirmationEmail({ patientName, dentistName, date, time, reason }) {
  return wrapper("Appointment Confirmed ✅", `
    <p>Hi ${patientName},</p>
    <p>Your appointment has been booked:</p>
    <table style="width:100%; border-collapse:collapse; margin:12px 0;">
      <tr><td style="padding:6px 0; color:#64748b;">Dentist</td><td style="padding:6px 0;"><b>Dr. ${dentistName}</b></td></tr>
      <tr><td style="padding:6px 0; color:#64748b;">Date</td><td style="padding:6px 0;"><b>${date}</b></td></tr>
      <tr><td style="padding:6px 0; color:#64748b;">Time</td><td style="padding:6px 0;"><b>${time}</b></td></tr>
      <tr><td style="padding:6px 0; color:#64748b;">Reason</td><td style="padding:6px 0;">${reason || "-"}</td></tr>
    </table>
    <p>We look forward to seeing you!</p>`);
}

function appointmentReminderEmail({ patientName, dentistName, date, time }) {
  return wrapper("Appointment Reminder ⏰", `
    <p>Hi ${patientName},</p>
    <p>This is a friendly reminder about your upcoming appointment tomorrow:</p>
    <table style="width:100%; border-collapse:collapse; margin:12px 0;">
      <tr><td style="padding:6px 0; color:#64748b;">Dentist</td><td style="padding:6px 0;"><b>Dr. ${dentistName}</b></td></tr>
      <tr><td style="padding:6px 0; color:#64748b;">Date</td><td style="padding:6px 0;"><b>${date}</b></td></tr>
      <tr><td style="padding:6px 0; color:#64748b;">Time</td><td style="padding:6px 0;"><b>${time}</b></td></tr>
    </table>
    <p>See you soon!</p>`);
}

function paymentReceiptEmail({ patientName, totalAmount, paidAmount, status }) {
  return wrapper("Payment Receipt 🧾", `
    <p>Hi ${patientName},</p>
    <p>Thank you for your payment. Here is a summary:</p>
    <table style="width:100%; border-collapse:collapse; margin:12px 0;">
      <tr><td style="padding:6px 0; color:#64748b;">Total Amount</td><td style="padding:6px 0;"><b>₹${totalAmount}</b></td></tr>
      <tr><td style="padding:6px 0; color:#64748b;">Amount Paid</td><td style="padding:6px 0;"><b>₹${paidAmount}</b></td></tr>
      <tr><td style="padding:6px 0; color:#64748b;">Status</td><td style="padding:6px 0;"><b>${status}</b></td></tr>
    </table>
    <p>The detailed receipt is attached as a PDF.</p>`);
}

function medicalReportEmail({ patientName, visitDate }) {
  return wrapper("Your Medical Report 📋", `
    <p>Hi ${patientName},</p>
    <p>Your medical report from your visit on <b>${visitDate}</b> is attached as a PDF for your records.</p>`);
}

module.exports = {
  registrationEmail,
  appointmentConfirmationEmail,
  appointmentReminderEmail,
  paymentReceiptEmail,
  medicalReportEmail,
};
