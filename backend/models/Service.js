const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, default: "General" },
    price: { type: Number, required: true },
    durationMinutes: { type: Number, default: 30 },
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
