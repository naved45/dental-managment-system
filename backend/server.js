require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const patientRoutes = require("./routes/patients");
const dentistRoutes = require("./routes/dentists");
const appointmentRoutes = require("./routes/appointments");
const invoiceRoutes = require("./routes/invoices");
const dashboardRoutes = require("./routes/dashboard");
const userRoutes = require("./routes/users");
const serviceRoutes = require("./routes/services");
const notificationRoutes = require("./routes/notifications");
const recordRoutes = require("./routes/records");
const uploadRoutes = require("./routes/upload");
const patientAuthRoutes = require("./routes/patientAuth");
const portalRoutes = require("./routes/portal");
const { startReminderCron } = require("./config/cron");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/dentists", dentistRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/patient-auth", patientAuthRoutes);
app.use("/api/portal", portalRoutes);

app.get("/", (req, res) => res.send("Dental Management API running"));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dental_management", {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startReminderCron();
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    // still start server so API structure can be inspected/tested
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (DB not connected)`));
  });

module.exports = app;
