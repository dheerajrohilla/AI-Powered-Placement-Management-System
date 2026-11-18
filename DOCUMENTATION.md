# AI-Powered Placement Management System — Full Project Documentation

## 1. Overview
A full-stack **MERN** web application that digitizes campus placements. Four role-based portals — **Student, Company (Recruiter), TPO Head, Admin** — let students apply to drives, companies hire, and the placement office monitor and report on the whole season. All data is stored in MongoDB and served through a REST API; the React frontend consumes it live (no hardcoded data).

## 2. Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, React Router 7, Axios, lucide-react |
| Backend | Node.js, Express 4 (ES modules) |
| Database | MongoDB + Mongoose 7 |
| Auth | JWT (`jsonwebtoken` 9) + `bcryptjs` password hashing |
| File uploads | Multer 2 (PDF resumes → `uploads/resumes/`) |
| Testing | Node's built-in test runner (`node --test`) |

## 3. Architecture & Folder Structure
```
CAPSTONE PROJECT/
├── placement-backend/
│   ├── .env                    # PORT=5002, MONGODB_URI, JWT_SECRET, CLIENT_URL
│   ├── uploads/resumes/        # uploaded student resumes
│   └── src/
│       ├── server.js           # Express app, CORS, routes, startup seed
│       ├── config/db.js        # Mongo connection
│       ├── models/             # User, Student, Company, PlacementDrive, Application, Interview
│       ├── controllers/        # auth, student, company, tpo, admin
│       ├── routes/             # authRoutes, studentRoutes, companyRoutes, tpoRoutes, adminRoutes
│       ├── middleware/         # auth.js (protect/authorize), errorHandler.js
│       ├── utils/reports.js    # shared aggregation report builder
│       ├── seed/seed.js        # idempotent, self-healing seeder
│       └── __tests__/auth.test.js
└── placement-frontend/
    ├── .env                    # VITE_API_URL=http://localhost:5002/api
    └── src/
        ├── App.jsx             # all routes
        ├── main.jsx
        ├── context/            # AuthContext, useAuth
        ├── services/           # api.js (endpoint map), apiClient.js (axios + interceptors)
        ├── layouts/            # Dashboard/Company/TPO/Admin layouts
        ├── components/         # Navbar, Sidebar, StatCard (per role)
        └── pages/              # Login + student/Company/TPO/Admin pages
```

**Request flow:** Browser → Axios (`apiClient` attaches `Bearer <token>`, auto-redirects on 401) → Express route → `protect` (verify JWT) → `authorize(...roles)` (role gate) → controller → Mongoose → MongoDB.

## 4. Database (MongoDB)
- **Database name:** `placement-db` (development) · `placement-db-test` (tests)
- **Default URI:** `mongodb://localhost:27017/placement-db`
- **6 collections**, related by ObjectId references (`ref`):

### `users` — authentication identity for every account
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique, lowercase, validated |
| password | String | required, min 6, **hashed** (bcrypt, 10 rounds), `select:false` |
| role | String | enum: `student` / `company` / `tpo` / `admin` |
| profilePicture, phone | String | optional |
| passwordResetToken / passwordResetExpires | String/Date | forgot-password flow, `select:false` |

Hooks: pre-save hashes password only when modified; `matchPassword()` compares.

### `students` — profile (1:1 with a `student` user)
`userId`→User (unique) · `rollNumber` (unique) · `department` · `batch` · `cgpa` · `resume` (path) · `skills[]` · `bio` · `atsScore` · `profileStrength` · `isPlaced` · `placedCompany`→Company · `salary`

### `companies` — recruiter profile (1:1 with a `company` user)
`userId`→User (unique) · `companyName` (unique) · `website` · `location` · `industry` · `description` · `hrName/hrPhone/hrEmail` · `logo` · `isVerified` (default false) · `totalPositions` · `filledPositions`

### `placementdrives` — a job posting created by a company
`title` · `description` · `company`→Company · `positions` · `salary` · `location` · `jobRole` · `jobType` · `eligibility{minCGPA, departments[], batches[]}` · `registrationDeadline` · `driveDate` · `status` (enum: `upcoming/ongoing/completed/cancelled`) · `requirements[]` · `benefits[]`

### `applications` — a student applying to a drive
`student`→Student · `placementDrive`→Drive · `company`→Company · `status` (enum: `applied/shortlisted/rejected/selected`) · `appliedAt/shortlistedAt/rejectedAt/selectedAt` · `salary` · `ctc`

**Unique compound index** `{student, placementDrive}` → prevents duplicate applications.

### `interviews` — interview scheduled by a company
`student`→Student · `company`→Company · `placementDrive`→Drive · `round` (enum: `online/group discussion/technical/hr/final`) · `scheduledDate` · `status` (enum: `scheduled/completed/passed/failed/cancelled`) · `location` · `interviewer` · `interviewerEmail` · `feedback` · `result` · `joinLink`

### Relationships (ERD)
```
User 1──1 Student 1──* Application *──1 PlacementDrive *──1 Company 1──1 User
                    └──* Interview  *──1 Company
Student.isPlaced / placedCompany / salary  ← set when an Application becomes "selected"
```
Reports (`utils/reports.js`) use aggregation pipelines (`$group`, `$bucket`, `$lookup`) over these collections for placement rate, average/highest package, package distribution, and top recruiters.

## 5. Authentication & Security
- **Register** creates a `User` (+ role profile: Student or Company) and returns a JWT.
- **Login** verifies the bcrypt hash and returns `{ token, user }`.
- **JWT** signed with `JWT_SECRET`, expiry `JWT_EXPIRE` (7d). Token payload = `{ id, role }`.
- `protect` middleware verifies the token; `authorize('student')` etc. gates each route group.
- Passwords hashed with bcrypt (salt 10), never returned (`select:false`).
- CORS restricted to the client origin (`http://localhost:5173`).
- Frontend stores the token in `localStorage`; axios interceptor attaches it and logs out + redirects on 401.

## 6. API Reference
Base URL: `http://localhost:5002/api`

**Auth** (`/auth`) — public: `POST /register`, `POST /login`, `POST /forgot-password`, `POST /reset-password`; protected: `GET /me`

**Health:** `GET /health`

**Student** (`/student`, role=student): `GET /dashboard`, `GET /profile`, `PUT /profile`, `POST /resume`, `GET /drives`, `POST /apply`, `GET /applications`, `GET /interviews`

**Company** (`/company`, role=company): `GET /dashboard`, `POST /drives`, `GET /drives`, `GET /applicants`, `GET /shortlisted`, `PATCH /applications/:applicationId/status`, `POST /interviews`, `GET /interviews`

**TPO** (`/tpo`, role=tpo): `GET /dashboard`, `/students`, `/companies`, `/drives`, `/interviews`, `/reports`

**Admin** (`/admin`, role=admin): `GET /dashboard`, `/students`, `/companies`, `/drives`, `/interviews`, `/reports`; `POST /verify-company`

## 7. Roles & Capabilities
- **Student** — build profile, upload resume, view AI/ATS analysis, browse & apply to drives, track application status, view interviews.
- **Company** — create drives, view applicants (name/CGPA/ATS/skills), shortlist/reject/select (selecting marks the student placed + records salary), schedule interviews.
- **TPO Head** — institution-wide read-only monitoring of students, companies, drives, interviews, and analytics/reports.
- **Admin** — everything TPO sees **plus** company verification (`isVerified`).

| Capability | Student | Company | TPO | Admin |
|---|:--:|:--:|:--:|:--:|
| Apply to drives | ✅ | — | — | — |
| Upload resume / edit profile | ✅ | — | — | — |
| Create drives | — | ✅ | — | — |
| Shortlist / select / reject | — | ✅ | — | — |
| Schedule interviews | — | ✅ | — | — |
| View all students/companies/drives | — | — | ✅ | ✅ |
| Reports & analytics | — | — | ✅ | ✅ |
| Verify companies | — | — | — | ✅ |

## 8. Seed Data & Default Logins
Running the seed creates a full demo dataset (5 students, 6 companies, 6 drives, 9 applications, 3 interviews, 1 TPO, 1 admin). The seeder is **idempotent and self-healing** — on server startup it preserves real registered users and removes orphaned profiles; `npm run seed` does a full reset.

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@placement.com | admin123 |
| **TPO Head** | tpohead@placement.com | tpohead123 |
| Student | prajwal@student.com · aditya@ · sneha@ · rahul@ · ananya@student.com | student123 |
| Company | careers@abctech.com · jobs@techsolutions.com · campus@infosys.com · careers@deloitte.com · careers@wipro.com · careers@tcs.com | company123 |

## 9. How To Run

**Prerequisites:** Node.js ≥ 18 (developed on v26), npm, and MongoDB running locally on `27017`.

```bash
# 0) Start MongoDB (macOS with Homebrew)
brew services start mongodb-community      # or: mongod --dbpath /path/to/data

# 1) BACKEND
cd "placement-backend"
npm install
cp .env.example .env                        # then edit values (see §10)
npm run seed                                # optional: load demo data
npm run dev                                 # starts on http://localhost:5002

# 2) FRONTEND (new terminal)
cd "placement-frontend"
npm install
# ensure .env has: VITE_API_URL=http://localhost:5002/api
npm run dev                                 # opens http://localhost:5173
```
Open **http://localhost:5173**, log in with any seeded account (or register a new student/company).

**Other commands**
```bash
# Backend
npm test          # run auth tests against placement-db-test
npm start         # production start (no --watch)

# Frontend
npm run build     # production build → dist/
npm run preview   # preview the production build
npm run lint      # eslint
```

## 10. Environment Variables
**Backend `.env`**
```
PORT=5002
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/placement-db
JWT_SECRET=<long-random-string>       # change in production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```
**Frontend `.env`**
```
VITE_API_URL=http://localhost:5002/api
```
> The backend falls back to a default JWT secret if `JWT_SECRET` is unset — set a strong secret for any real deployment.

## 11. Key Flows
- **Registration → dashboard:** `POST /auth/register` creates User+profile → token stored → `/auth/me` and role dashboard render the user's real name and DB data.
- **Apply:** student `POST /student/apply {driveId}` → creates Application (`applied`), duplicate blocked by unique index.
- **Hire:** company `PATCH /company/applications/:id/status` → `shortlisted`/`rejected`/`selected`; `selected` sets the student's `isPlaced`, `placedCompany`, `salary`, which then flows into TPO/Admin reports.
- **Reports:** TPO/Admin `GET /reports` → aggregation returns placement rate, avg/highest package, package distribution, top companies — all live.

## 12. Study Material Hub
The **Study Material Hub** provides a centralized, secure repository of academic and placement preparation documents:
- **Dynamic Scanner**: Recursively scans the `StudyMaterial/` folder, discovering PDFs and categorizing them across 7 core subjects:
  1. `OOPS` (Object-Oriented Programming)
  2. `DSA` (Data Structures & Algorithms)
  3. `DAA` (Design & Analysis of Algorithms)
  4. `COA` (Computer Organization & Architecture)
  5. `OS` (Operating Systems)
  6. `DBMS` (Database Management Systems)
  7. `CN` (Computer Networks)
- **Secure Range Streaming**: Supports `Range: bytes=start-end` HTTP streaming (`206 Partial Content`) preventing full memory loading and enabling instant seeking across large documents.
- **Directory Traversal Protection**: Ensures file path boundaries remain strictly inside the authorized `StudyMaterial/` root.
- **Integrated PDF Reader**: Renders PDF pages using `pdfjs-dist` on high-resolution canvas with:
  - Page Navigation (Prev, Next, direct page jump input)
  - Zoom Controls (Zoom In, Zoom Out, Reset, Fit-to-Width)
  - In-document Full-Text Search (keyword matching, next/prev match jumping, match count)
  - Full-screen Reading Mode
  - Direct secure PDF download
- **APIs**:
  - `GET /api/study-materials/subjects`: Discovered subjects, PDF counts, and metadata.
  - `GET /api/study-materials/subjects/:subjectId`: Subject-specific PDF materials.
  - `GET /api/study-materials/pdf/:fileId/metadata`: Individual PDF metadata.
  - `GET /api/study-materials/pdf/:fileId/stream`: High-speed HTTP range stream.
  - `GET /api/study-materials/pdf/:fileId/download`: Attachment download.

## 13. AI-Powered Subject-Wise Quiz and Assessment System
A complete, secure, subject-wise assessment engine designed for campus placement preparation across core CS disciplines:
- **7 Supported Subjects**:
  1. `OOPS` — Object-Oriented Programming
  2. `DSA` — Data Structures and Algorithms
  3. `DAA` — Design and Analysis of Algorithms
  4. `COA` — Computer Organization and Architecture
  5. `OS` — Operating Systems
  6. `DBMS` — Database Management Systems
  7. `CN` — Computer Networks
- **Independent Difficulty Selection & Rules**:
  - **Easy**: Strictly 100% easy-level questions testing fundamental concepts, definitions, and basic applications.
  - **Medium**: Strictly 100% medium-level questions testing conceptual understanding, scenarios, and logical reasoning.
  - **Hard**: Blended mixture of Easy (3) + Medium (5) + Hard (7) = 15 questions testing advanced technical placement concepts.
- **Strict MCQ Rules**:
  - 15 questions per quiz session.
  - Exactly 4 options (A, B, C, D) per question with 1 unambiguous correct answer.
  - 15 marks total (1 mark/correct, 0 for incorrect/unanswered, no negative marking).
  - Anti-cheat security: Correct answers and explanations are stripped from session payloads and **never leaked** to client while in progress.
  - All scoring and validation is executed server-side.
- **Quiz Taking Interface (`QuizPlayer.jsx`)**:
  - One question displayed at a time with selectable radio options.
  - Next / Previous question navigation and complete question status palette (Answered, Unanswered, Flagged for review).
  - Live 20-minute countdown timer with automatic force-submission on expiration.
  - Final submission confirmation modal showing answer progress.
- **Result Evaluation & Answer Key Review (`QuizResultView.jsx`)**:
  - Automatic backend grading with score, percentage, counts, and duration.
  - 6 performance categories (Outstanding, Excellent, Good job, Nice effort, Improve, Don't give up) with tailored motivational messages.
  - Complete post-quiz review displaying question, all 4 options, student choice, correct answer, and in-depth explanations.
  - Options to Retake Quiz or return to Dashboard.
- **Student Performance Dashboard (`QuizDashboardView.jsx` & `VisualAnalyticsCharts.jsx`)**:
  - **Overall Statistics**: Total attempts, questions answered, average score %, overall accuracy %, best score, and total practice time.
  - **Subject Mastery Cards**: Subject cards with attempt counts, average scores, best marks, and color-coded mastery tiers.
  - **Difficulty Breakdown**: Easy, Medium, and Hard performance cards.
  - **Visual Analytics Charts**:
    - Subject Performance Bar Chart (with target benchmark comparison)
    - Difficulty Performance Breakdown
    - Score Trends Over Time (chronological progress line)
    - Accuracy Distribution (Correct vs Incorrect)
  - **Personalized AI Recommendations**: Identifies strongest subject, weakest subject, subjects requiring more focus, and difficulty tier strengths.
  - **Attempt History Table**: Filterable and sortable log of all past quiz sessions with instant score inspection.
- **AI Question Generation Integration**:
  - Integrated with Google Gemini AI (`@google/genai`) to generate new syllabus-aligned MCQs on demand into the database with duplicate prevention and validation.
- **APIs**:
  - `GET /api/quiz/config`: System configuration, subjects, and difficulty metadata.
  - `POST /api/quiz/start`: Initiates a quiz session, samples questions strictly adhering to difficulty rules, and returns an anti-cheat sanitized session.
  - `POST /api/quiz/submit`: Validates answers against stored session, computes marks, persists attempt to MongoDB, and returns evaluation with explanations.
  - `GET /api/quiz/attempt/:attemptId`: Fetches past attempt details with question solutions.
  - `GET /api/quiz/dashboard`: Computes and aggregates overall, subject-wise, difficulty-wise statistics, chart metrics, and recommendations for the authenticated student.
  - `POST /api/quiz/generate-ai-questions`: TPO/Admin or system endpoint to generate questions via Gemini AI.

## 14. Notes / Known Limitations
- Company **verification is not enforced** as a gate — a registered company can create drives immediately; `isVerified` only affects the TPO/Admin company lists.
- "AI Resume Analysis" is **rule-based** (skill/keyword overlap, ATS heuristic from skills + resume presence) — not an ML model.
- Resume upload stores files locally under `uploads/resumes/` (no cloud storage).
- No refresh-token mechanism; sessions last for the JWT expiry (7 days).
- Two `.env`-style files exist in the frontend; only `.env` is loaded by Vite (`.env.example` is a template).

