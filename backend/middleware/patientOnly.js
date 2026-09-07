// Guards the patient-portal routes so a staff/admin JWT can't be used to view
// patient-portal data, and vice versa — the two account types are kept separate.
module.exports = function patientOnly(req, res, next) {
  if (!req.user || req.user.role !== "patient") {
    return res.status(403).json({ message: "This endpoint is for patient portal accounts only" });
  }
  next();
};
