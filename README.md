# DentalCare Management System

A full-stack dental clinic management web app (MERN: MongoDB, Express, React, Node.js).

## Features
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

## Project Structure
```
dental-management-system/
├── backend/    Express API + MongoDB (Mongoose) + JWT auth
└── frontend/   React (Vite) + Tailwind CSS
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

Register a staff/admin account from the Register page, then log in. The first account you create can be set to "admin" from the role dropdown to unlock Staff Management and pricing controls.
"# dental-managment-system" 
