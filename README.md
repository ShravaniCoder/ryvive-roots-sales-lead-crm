# Ryvive Roots Sales CRM

A separate React + Vite frontend and Express + MongoDB backend for the Ryvive Roots sales team.

## Structure
- `frontend/` React, Vite, React Router, Axios, Recharts, Lucide React
- `backend/` Express API, Mongoose models, JWT authentication in HTTP-only cookies

## Local setup

### 1. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Set `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL` in `.env`.

### 2. Create the first admin
After starting the backend:
```bash
npm run seed:admin
```
Set `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` in `.env` first.
The seed script creates an admin only if that email does not already exist.

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open the Vite URL. The frontend expects the backend at `http://localhost:5000`.

## Roles and access
- `admin`: can view all leads, create/deactivate employees, assign leads, and see reports.
- `employee`: can create leads and view/update only leads assigned to or created by them.
- Lead creator and creation timestamp are set by the backend.
- Interaction history is append-only through the API.

## Production domains
- Frontend: `https://sales.ryviveroots.com`
- Backend: `https://api-sales.ryviveroots.com`

Set:
- Frontend `VITE_API_URL=https://api-sales.ryviveroots.com`
- Backend `FRONTEND_URL=https://sales.ryviveroots.com`
- Backend `NODE_ENV=production`
- Backend `COOKIE_SECURE=true`

Deploy the frontend `dist/` contents to the sales subdomain document root. Deploy the backend as a Node.js web application if your Hostinger plan supports it. Configure HTTPS on both subdomains.

## Important
This is a starter implementation. Before production use, configure a strong unique JWT secret, database IP restrictions, backups, HTTPS, and test role permissions. Do not commit `.env` files. Add your own privacy notice and retention policy for customer personal information.


## Frontend page structure

Each screen is maintained in its own file under `frontend/src/pages/`: `Login.jsx`, `Dashboard.jsx`, `Leads.jsx`, `LeadForm.jsx`, `Followups.jsx`, `Employees.jsx`, and `Reports.jsx`. Shared UI is in `components/Shared.jsx`, and the authenticated navigation shell is in `layout/AppShell.jsx`. The layout uses typography, CSS shapes, and the Ryvive Roots colour palette only; no photos or image assets are used.


## Employee lead submission (simple mode)

Employees do not need individual login accounts in this version. Open the frontend URL at `/submit-lead`, choose the employee name from the dropdown, complete the lead details, and submit. The public API endpoint saves the selected employee name with the lead. The Admin signs in at `/login` and sees all submitted leads in the dashboard and lead directory.

### Configure employee names

Edit `frontend/src/pages/LeadForm.jsx` and replace the sample names in the `EMPLOYEES` array with your actual team names.

### Important

The employee dropdown is a simple attribution field, not identity verification. Anyone who can access the submission URL can choose a name. Admin lead viewing and management remain protected by admin authentication.


## Business location photo uploads

- Employee submissions must include 2 or 3 JPG, PNG or WEBP location photos (maximum 5 MB each).
- The backend stores photos in `backend/uploads/locations/` and saves the relative image path on the lead record.
- The Admin Dashboard is a simple **Submitted records** view. It displays only real records saved from the employee form, including contact details, company information, employee name, submission date, discussion notes, and all uploaded location photos. Select a photo to open its full-size version. No demo leads, charts, or sample statistics are shown.
- The uploads directory is excluded from Git. Ensure your Hostinger backend has persistent writable storage for `backend/uploads/locations/` and include backups for uploaded files.
- For production, restrict access to uploaded photos if they may contain private premises or people; this starter serves them as public static files.


## Required business location photos

The employee lead submission form requires **2 or 3** business location photos per lead. Accepted formats are JPG, PNG, and WEBP; each image can be up to 5 MB. Photos are uploaded under `backend/uploads/locations/` and their paths are stored in the lead's `locationImages` array. Admin users can view each employee-submitted record and its location photos in the Dashboard's **Submitted records** page. Ensure this upload directory is writable and persistent on your hosting provider.


## Employee submissions and Admin records

- Employee form: `/submit-lead` (public form; employee selects their name).
- Admin records: sign in at `/login`, then open `/dashboard`.
- Admin dashboard loads only records returned by MongoDB; it does not insert or display sample records.
- New records are checked automatically every 15 seconds; use Refresh records for an immediate reload.
- Each submission requires 2 or 3 JPG, PNG, or WEBP location photos (maximum 5 MB each).
- Photos are stored in `backend/uploads/locations`; keep this folder persistent and writable when deploying.
- The frontend Axios client intentionally does not set a global Content-Type header, so browser-generated multipart boundaries are preserved for image uploads.
