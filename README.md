# DentalCare Management System

A full-stack dental clinic management web app (MERN: MongoDB, Express, React, Node.js), with two
separate portals: a **Staff Portal** for the clinic team and a **Patient Portal** for self-service.

## Features

### Staff Portal
- Public marketing landing page + staff login/register (JWT auth, bcrypt password hashing)
- Role-based access control (Admin vs Staff) with an admin-only Staff Management page
- Dashboard with live stats, a revenue trend line chart, and an appointment-status pie chart (Recharts)
- Patients: search, gender filter, pagination, CSV export, and a full patient profile page
- Patient profile page with tabs: Info, Appointment history, Invoices, and Medical Records
- Medical records per patient with file/X-ray upload (image or PDF attachments)
- Dentist directory (CRUD)
- Appointments: list view and a full month calendar view, booking, status updates
- Treatment/service price catalog (admin-managed) used to auto-fill invoice item costs
- Billing & invoicing with itemized costs, payment tracking, and one-click PDF invoice download
- In-app notification bell (new appointments & invoices create notifications automatically)
- Dark mode toggle, toast notifications for actions, 404 page
- Admin-only destructive actions (delete patient/invoice/staff) with safety checks

### Patient Portal (self-service, separate login from staff)
- Patient registration & login with its own JWT session (`/patient-login`, `/patient-register`)
- Patient dashboard: next appointment, visit count, outstanding balance, report count
- Appointment history (read-only, scoped to the logged-in patient only)
- Payment history with itemized invoices
- Medical reports (diagnosis, treatment, prescription) per visit
- One-click PDF download for both payment receipts and medical reports (generated server-side)
- **Automatic emails**: registration confirmation, appointment booking confirmation, payment
  receipt (with PDF attached) on invoice creation, and a reminder email ~24-48h before an
  upcoming appointment (sent by an hourly background job)
- "Email me" buttons to re-send a receipt/report on demand

## Project Structure
```
dental-management-system/
├── backend/    Express API + MongoDB (Mongoose) + JWT auth (staff + patient)
└── frontend/   React (Vite) + Tailwind CSS (staff app + patient portal)
```

## Setup

### Backend
```
cd backend
npm install
cp .env.example .env   # set MONGO_URI to your local Mongo or Atlas connection string
npm run dev
```
Runs on http://localhost:5000

### Frontend
```
cd frontend
npm install
cp .env.example .env
npm run dev
```
Runs on http://localhost:5173

Register a staff/admin account from the Register page, then log in. The first account you create
can be set to "admin" from the role dropdown to unlock Staff Management and pricing controls.

Patients use a separate area of the same app at `/patient-login` / `/patient-register`.

## Email Setup (optional, needed for confirmations/receipts/reminders)

The app works fully without email configured — it just silently skips sending and logs a warning.
To turn emails on, fill in the SMTP variables in `backend/.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youraddress@gmail.com
SMTP_PASS=your16digitapppassword
FROM_EMAIL="DentalCare Clinic" <no-reply@dentalcare.example>
```

**Using Gmail:** you can't use your normal Gmail password — create an "App Password" from your
Google Account's Security settings (requires 2-Step Verification to be turned on), and use that
16-character code as `SMTP_PASS`.

**For testing without a real inbox:** a free service like [Mailtrap.io](https://mailtrap.io) gives
you SMTP credentials that catch every email in a test inbox instead of actually sending it —
handy for demoing the feature without spamming a real email address.

Once configured, restart the backend. You'll then automatically get:
- A welcome email when a patient registers
- A booking confirmation email whenever an appointment is created
- A payment receipt email (with PDF attached) whenever an invoice is created
- A reminder email roughly a day before an upcoming appointment (checked hourly by a background cron job)
