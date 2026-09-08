# Redressal — Student Grievance & Review Portal

A full-stack web app that lets students file, track, and get real responses to
campus complaints — instead of the outdated, informal channels most colleges
still rely on. Built to a design system called **Obsidian Glass**: dark
glassmorphism, violet/cyan accents, Space Grotesk + JetBrains Mono. Fully
responsive from mobile to desktop.

Backed by research: institutions largely still use outdated or informal
complaint-handling methods that lead to inefficiency, lost accountability, and
unresolved issues (see `/docs` reference in the project writeup, sourced from
a 2025 full-stack development research paper on student review systems).

## Stack

- **Frontend:** React 18 + Vite, Tailwind CSS, React Router
- **Backend:** Node.js + Express
- **Database:** SQLite (via `better-sqlite3`) — zero setup, one file, no
  external DB server needed
- **Auth:** JWT + bcrypt password hashing
- **File uploads:** Multer (images/PDF, 5MB limit)

## Features

- Student & HOD roles with separate dashboards
- Students file complaints with title, category, description, and an
  optional image/PDF attachment
- HOD dashboard with live counts, average resolution time, and status/category
  breakdowns
- Status workflow: `submitted → in_review → resolved / rejected`, with an HOD
  response visible to the student
- Filter complaints by status on the HOD side

## Running it locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # edit JWT_SECRET to any random string
npm run dev                 # or: npm start
```

Runs on `http://localhost:5000`. The SQLite file is created automatically at
`backend/data/grievance.db` on first run.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api` and `/uploads` calls to the
backend — no CORS config needed in dev.

### 3. Try it

1. Open `http://localhost:5173/register`
2. Create a **student** account, log in, file a complaint (with an optional
   attachment)
3. Register a second account as **HOD**, log in, and update the complaint's
   status / leave a response — it appears instantly on the student's side

## Project structure

```
student-grievance-portal/
├── backend/
│   ├── routes/          auth.js, complaints.js
│   ├── middleware/       auth.js (JWT + role guard)
│   ├── db.js             SQLite schema + connection
│   └── server.js
└── frontend/
    └── src/
        ├── pages/         Login, Register, StudentDashboard, HODDashboard, ComplaintForm
        ├── components/    Navbar, GlassCard, StatusBadge, ComplaintCard
        └── AuthContext.jsx
```

## Notes for deployment / your report

- Swap SQLite for MongoDB/Postgres later if you want to match the "MERN"
  framing recruiters expect — the query layer in `db.js` and the route files
  is the only place that would need to change.
- For a live demo, deploy the backend on Render/Railway and the frontend on
  Vercel/Netlify; set the `VITE_API_URL` environment variable on your frontend host
  (e.g., `VITE_API_URL=https://your-backend.onrender.com/api`). In local dev,
  leaving it empty automatically defaults to `/api` and Vite's local proxy.
- Good places to extend for your paper: email/SMS notifications on status
  change, complaint escalation after N days unresolved, and a public
  aggregate stats page for transparency.
