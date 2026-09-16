// const mongoose = require("mongoose");

// const dentistSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     specialization: String,
//     phone: String,
//     email: String,
//     experienceYears: Number,
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Dentist", dentistSchema);

const mongoose = require("mongoose");

const dentistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    specialization: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    experienceYears: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Dentist", dentistSchema);
