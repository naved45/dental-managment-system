const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: Number,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    phone: { type: String, required: true },
    email: { type: String, unique: true, sparse: true }, // sparse: many old records may have no email
    address: String,
    medicalHistory: String,
    bloodGroup: String,
    photo: String,

    // --- Patient portal login (added for self-service portal) ---
    password: { type: String, select: false }, // only set once the patient registers for portal access
    hasPortalAccess: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

patientSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

patientSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("Patient", patientSchema);
