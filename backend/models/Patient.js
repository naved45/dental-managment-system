const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: Number,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    phone: { type: String, required: true },
    email: String,
    address: String,
    medicalHistory: String,
    bloodGroup: String,
    photo: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
