const mongoose = require("mongoose");

const dentistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialization: String,
    phone: String,
    email: String,
    experienceYears: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dentist", dentistSchema);
