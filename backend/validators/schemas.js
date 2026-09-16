const { body, param, query } = require("express-validator");

// Strict, allow-list style validation: every field has an explicit type,
// length, and format check. Anything not matching is rejected (400) rather
// than silently trimmed/escaped and allowed through.
//
// IMPORTANT: field validators are built by FACTORY FUNCTIONS (functions that
// return a fresh express-validator chain each call), not shared array
// literals. express-validator chains are mutable — calling .optional() on an
// already-built chain mutates it in place. Reusing the same chain object
// between a "create" schema and an "update" schema would silently make the
// create schema optional too. Factories avoid that entirely.

const MONGO_ID = () => param("id").isMongoId().withMessage("Invalid ID format");

// ---------- Staff auth ----------
const staffRegister = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 8, max: 128 }).withMessage("Password must be 8-128 characters")
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/).withMessage("Password must contain at least one letter and one number"),
  body("role").optional().isIn(["admin", "staff"]).withMessage("Role must be 'admin' or 'staff'"),
];

const staffLogin = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").isLength({ min: 1, max: 128 }).withMessage("Password is required"),
];

const passwordChange = [
  body("currentPassword").isLength({ min: 1, max: 128 }).withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8, max: 128 }).withMessage("New password must be 8-128 characters")
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/).withMessage("New password must contain at least one letter and one number"),
];

// ---------- Patient auth (portal) ----------
const patientRegister = [
  body("name").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("phone").trim().matches(/^[0-9+\-\s()]{7,20}$/).withMessage("Enter a valid phone number"),
  body("password")
    .isLength({ min: 8, max: 128 }).withMessage("Password must be 8-128 characters")
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/).withMessage("Password must contain at least one letter and one number"),
];

const patientLogin = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").isLength({ min: 1, max: 128 }).withMessage("Password is required"),
];

// ---------- Patients (staff-managed records) ----------
const patientFields = (required) => [
  required
    ? body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters")
    : body("name").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  body("age").optional({ values: "falsy" }).isInt({ min: 0, max: 130 }).withMessage("Age must be 0-130"),
  body("gender").optional({ values: "falsy" }).isIn(["Male", "Female", "Other"]).withMessage("Invalid gender"),
  required
    ? body("phone").trim().matches(/^[0-9+\-\s()]{7,20}$/).withMessage("Enter a valid phone number")
    : body("phone").optional().trim().matches(/^[0-9+\-\s()]{7,20}$/).withMessage("Enter a valid phone number"),
  body("email").optional({ values: "falsy" }).trim().isEmail().withMessage("Enter a valid email").normalizeEmail(),
  body("address").optional({ values: "falsy" }).trim().isLength({ max: 300 }).withMessage("Address is too long"),
  body("medicalHistory").optional({ values: "falsy" }).trim().isLength({ max: 2000 }).withMessage("Medical history is too long"),
  body("bloodGroup").optional({ values: "falsy" }).trim().isLength({ max: 10 }).withMessage("Invalid blood group"),
];
const patientCreate = patientFields(true);
const patientUpdate = [MONGO_ID(), ...patientFields(false)];

// ---------- Dentists ----------
const dentistFields = (required) => [
  required
    ? body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters")
    : body("name").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  body("specialization").optional({ values: "falsy" }).trim().isLength({ max: 100 }).withMessage("Specialization is too long"),
  body("phone").optional({ values: "falsy" }).trim().matches(/^[0-9+\-\s()]{7,20}$/).withMessage("Enter a valid phone number"),
  body("email").optional({ values: "falsy" }).trim().isEmail().withMessage("Enter a valid email").normalizeEmail(),
  body("experienceYears").optional({ values: "falsy" }).isInt({ min: 0, max: 80 }).withMessage("Experience must be 0-80 years"),
];
const dentistCreate = dentistFields(true);
const dentistUpdate = [MONGO_ID(), ...dentistFields(false)];

// ---------- Appointments ----------
const appointmentCreate = [
  body("patient").isMongoId().withMessage("A valid patient is required"),
  body("dentist").isMongoId().withMessage("A valid dentist is required"),
  body("date").isISO8601().toDate().withMessage("A valid date is required"),
  body("time").matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Time must be in HH:MM format"),
  body("reason").optional({ values: "falsy" }).trim().isLength({ max: 300 }).withMessage("Reason is too long"),
  body("status").optional().isIn(["Pending", "Scheduled", "Completed", "Cancelled"]).withMessage("Invalid status"),
];
const appointmentBookPortal = [
  body("dentist").isMongoId().withMessage("A valid dentist is required"),
  body("date").isISO8601().toDate().withMessage("A valid date is required"),
  body("time").matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Time must be in HH:MM format"),
  body("reason").optional({ values: "falsy" }).trim().isLength({ max: 300 }).withMessage("Reason is too long"),
];
const appointmentUpdate = [
  MONGO_ID(),
  body("status").optional().isIn(["Pending", "Scheduled", "Completed", "Cancelled"]).withMessage("Invalid status"),
  body("date").optional().isISO8601().toDate().withMessage("A valid date is required"),
  body("time").optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Time must be in HH:MM format"),
  body("reason").optional({ values: "falsy" }).trim().isLength({ max: 300 }).withMessage("Reason is too long"),
  body("notes").optional({ values: "falsy" }).trim().isLength({ max: 1000 }).withMessage("Notes are too long"),
];

// ---------- Services (price catalog) ----------
const serviceFields = (required) => [
  required
    ? body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters")
    : body("name").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  body("category").optional({ values: "falsy" }).trim().isLength({ max: 50 }).withMessage("Category is too long"),
  required
    ? body("price").isFloat({ min: 0, max: 10000000 }).withMessage("Price must be a positive number")
    : body("price").optional().isFloat({ min: 0, max: 10000000 }).withMessage("Price must be a positive number"),
  body("durationMinutes").optional({ values: "falsy" }).isInt({ min: 1, max: 1440 }).withMessage("Duration must be 1-1440 minutes"),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 500 }).withMessage("Description is too long"),
];
const serviceCreate = serviceFields(true);
const serviceUpdate = [MONGO_ID(), ...serviceFields(false)];

// ---------- Invoices ----------
const invoiceCreate = [
  body("patient").isMongoId().withMessage("A valid patient is required"),
  body("items").isArray({ min: 1 }).withMessage("At least one invoice item is required"),
  body("items.*.treatment").trim().isLength({ min: 1, max: 150 }).withMessage("Treatment name is required"),
  body("items.*.cost").isFloat({ min: 0, max: 10000000 }).withMessage("Cost must be a positive number"),
  body("totalAmount").isFloat({ min: 0, max: 10000000 }).withMessage("Total amount must be a positive number"),
  body("paidAmount").optional({ values: "falsy" }).isFloat({ min: 0, max: 10000000 }).withMessage("Paid amount must be a positive number"),
  body("status").optional().isIn(["Unpaid", "Partially Paid", "Paid"]).withMessage("Invalid status"),
];
const invoiceUpdate = [
  MONGO_ID(),
  body("paidAmount").optional({ values: "falsy" }).isFloat({ min: 0, max: 10000000 }).withMessage("Paid amount must be a positive number"),
  body("status").optional().isIn(["Unpaid", "Partially Paid", "Paid"]).withMessage("Invalid status"),
];

// ---------- Medical records ----------
const recordCreate = [
  body("patient").isMongoId().withMessage("A valid patient is required"),
  body("dentist").optional({ values: "falsy" }).isMongoId().withMessage("Invalid dentist"),
  body("appointment").optional({ values: "falsy" }).isMongoId().withMessage("Invalid appointment"),
  body("diagnosis").optional({ values: "falsy" }).trim().isLength({ max: 500 }).withMessage("Diagnosis is too long"),
  body("treatmentDone").optional({ values: "falsy" }).trim().isLength({ max: 500 }).withMessage("Treatment is too long"),
  body("prescription").optional({ values: "falsy" }).trim().isLength({ max: 1000 }).withMessage("Prescription is too long"),
  body("notes").optional({ values: "falsy" }).trim().isLength({ max: 1000 }).withMessage("Notes are too long"),
  body("attachments").optional().isArray({ max: 10 }).withMessage("Too many attachments"),
];

// ---------- Users (staff management) ----------
const userUpdate = [
  MONGO_ID(),
  body("role").optional().isIn(["admin", "staff"]).withMessage("Role must be 'admin' or 'staff'"),
  body("isActive").optional().isBoolean().withMessage("isActive must be true or false"),
];

// ---------- Shared: pagination / search query params ----------
const paginationQuery = [
  query("page").optional().isInt({ min: 1, max: 100000 }).withMessage("Invalid page"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Invalid limit"),
  query("search").optional().trim().isLength({ max: 100 }).withMessage("Search term is too long"),
  query("gender").optional().isIn(["Male", "Female", "Other"]).withMessage("Invalid gender filter"),
];

module.exports = {
  MONGO_ID,
  staffRegister,
  staffLogin,
  passwordChange,
  patientRegister,
  patientLogin,
  patientCreate,
  patientUpdate,
  dentistCreate,
  dentistUpdate,
  appointmentCreate,
  appointmentBookPortal,
  appointmentUpdate,
  serviceCreate,
  serviceUpdate,
  invoiceCreate,
  invoiceUpdate,
  recordCreate,
  userUpdate,
  paginationQuery,
};
