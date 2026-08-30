const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    dentist: { type: mongoose.Schema.Types.ObjectId, ref: "Dentist" },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    visitDate: { type: Date, default: Date.now },
    diagnosis: String,
    treatmentDone: String,
    prescription: String,
    notes: String,
    attachments: [{ filename: String, url: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
