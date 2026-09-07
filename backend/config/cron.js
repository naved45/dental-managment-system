const cron = require("node-cron");
const Appointment = require("../models/Appointment");
const { sendMail } = require("./mailer");
const { appointmentReminderEmail } = require("../utils/emailTemplates");

// Step 10: Appointment reminder emails.
// Runs every hour, looks for Scheduled appointments happening in the next
// 24-48 hours that haven't had a reminder sent yet, and emails the patient.
async function sendUpcomingReminders() {
  const windowStart = new Date();
  windowStart.setHours(windowStart.getHours() + 24);
  const windowEnd = new Date();
  windowEnd.setHours(windowEnd.getHours() + 48);

  const appointments = await Appointment.find({
    status: "Scheduled",
    reminderSent: { $ne: true },
    date: { $gte: windowStart, $lte: windowEnd },
  })
    .populate("patient", "name email")
    .populate("dentist", "name");

  for (const appt of appointments) {
    if (!appt.patient?.email) continue;
    const sent = await sendMail({
      to: appt.patient.email,
      subject: "Reminder: Your DentalCare Appointment Tomorrow",
      html: appointmentReminderEmail({
        patientName: appt.patient.name,
        dentistName: appt.dentist?.name || "",
        date: new Date(appt.date).toLocaleDateString(),
        time: appt.time,
      }),
    });
    if (sent) {
      appt.reminderSent = true;
      await appt.save();
    }
  }

  if (appointments.length) {
    console.log(`[cron] Processed ${appointments.length} appointment reminder(s)`);
  }
}

function startReminderCron() {
  // Every hour, on the hour. Change the schedule string to run more/less often.
  cron.schedule("0 * * * *", () => {
    sendUpcomingReminders().catch((err) => console.error("[cron] reminder job failed:", err.message));
  });
  console.log("[cron] Appointment reminder job scheduled (runs hourly)");
}

module.exports = { startReminderCron, sendUpcomingReminders };
