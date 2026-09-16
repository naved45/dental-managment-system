const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    dentist: { type: mongoose.Schema.Types.ObjectId, ref: "Dentist", required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    reason: String,
    status: {
      type: String,
      enum: ["Pending", "Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    notes: String,
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
