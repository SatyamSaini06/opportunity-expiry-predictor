# Opportunity Expiry Predictor (IBM Z / LinuxONE Ready)

An AI-powered full-stack web application designed to help students, graduates, and job seekers discover, track, evaluate, and prioritize high-value opportunities—including scholarships, internships, competitive examinations, hackathons, fellowships, and job openings.

---

## 🚀 Architecture & Tech Stack

### Frontend
- **Framework:** React 19 with Vite
- **Styling:** Vanilla CSS3 with Design Tokens, Flexbox, CSS Grid, and Responsive Breakpoints
- **Icons:** Font Awesome React components (`@fortawesome/free-solid-svg-icons`, `@fortawesome/react-fontawesome`)
- **Routing:** React Router DOM (v7)
- **Charts:** Custom animated SVG Radial Progress Charts & Recharts

### Backend
- **Framework:** Python FastAPI (Asynchronous REST API)
- **Database:** SQLAlchemy ORM with SQLite (local default) and PostgreSQL compatibility for IBM Z enterprise deployments
- **Data Validation:** Pydantic v2
- **Authentication:** JWT-based bearer authentication with PBKDF2-HMAC-SHA256 password security
- **AI & NLP Extraction Engine:** PyMuPDF (`fitz`) for PDF parsing, BeautifulSoup4 for HTML/webpage parsing, and regex-driven date extraction
- **Risk Scoring Heuristic:** Transparent 40-30-20-10 explainable heuristic prioritizing deadline urgency, eligibility alignment, documentation burden, and verification status

---

## 🎨 Visual Design & Theme

- **Sidebar Background:** Dark navy blue (`#172D50`)
- **Primary Blue:** `#2563EB`
- **Page Background:** `#F4F7FC`
- **Card Background:** `#FFFFFF`
- **Borders:** `#E2E8F0`
- **Pastel Stat Cards:**
  - Total Opportunities: Soft Blue (`#EAF3FF`)
  - Expiring Soon: Soft Yellow (`#FFF7E6`)
  - High Risk: Soft Red (`#FFF0F0`)
  - Recommended for You: Soft Green (`#E9FAF1`)
- **Urgency & Risk Badges:**
  - High Risk: `#FEE2E2` / `#991B1B`
  - Medium Risk: `#FEF3C7` / `#92400E`
  - Low Risk: `#D1FAE5` / `#065F46`

---

## 📁 Project Directory Structure

```text
ibm/
├── backend/
│   ├── database.py              # Database engine & session configuration
│   ├── models.py                # Normalized SQLAlchemy models (Users, Opportunities, Criteria, etc.)
│   ├── schemas.py               # Pydantic v2 schemas for requests & responses
│   ├── auth.py                  # JWT creation, verification & user dependencies
│   ├── risk_engine.py           # Explainable rule-based risk scoring & profile matching
│   ├── extractor.py             # PDF & webpage NLP extraction engine
│   ├── seed_data.py             # Pre-seeded verified opportunities & sample profile
│   ├── main.py                  # FastAPI application entrypoint with CORS & routers
│   ├── requirements.txt         # Python dependencies
│   └── routers/
│       ├── auth_routes.py       # User registration & login
│       ├── user_routes.py       # Profile fetching & updating
│       ├── opportunity_routes.py# Catalog, urgent list, upload & extraction
│       ├── analytics_routes.py  # Live dashboard statistics & risk breakdown
│       ├── notification_routes.py# Notifications & mark-as-read
│       └── bookmark_routes.py   # User opportunity bookmarks
│
├── frontend/
│   ├── index.html               # HTML entry with Google Font 'Inter'
│   ├── package.json             # React, Vite, Font Awesome & routing dependencies
│   ├── src/
│   │   ├── main.jsx             # React DOM root
│   │   ├── App.jsx              # App layout with Sidebar, Header & Routes
│   │   ├── index.css            # Reusable CSS design tokens and layout classes
│   │   ├── services/
│   │   │   └── api.js           # Fetch API service connecting to FastAPI backend
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Fixed dark navy sidebar with IBM Z footer
│   │   │   ├── Header.jsx       # Header with greeting, search & user dropdown
│   │   │   ├── StatCard.jsx     # Four pastel summary cards
│   │   │   ├── UrgentOpportunityCard.jsx # Top Urgent Opportunities section
│   │   │   ├── OpportunityTable.jsx      # All Opportunities table with search & filters
│   │   │   ├── ProfileMatchCard.jsx      # Circular match progress chart & dimensions
│   │   │   ├── UpcomingDeadlines.jsx     # Upcoming deadlines list with badges
│   │   │   ├── QuickInsights.jsx         # Dynamic AI insights with button
│   │   │   ├── SmartAlerts.jsx           # Soft-blue smart alerts summary card
│   │   │   ├── RiskBadge.jsx             # Color-coded risk badge
│   │   │   ├── OpportunityDetailModal.jsx# Detail modal with risk breakdown & docs
│   │   │   └── ExtractModal.jsx          # AI notice upload & extraction modal
│   │   └── pages/
│   │       ├── Dashboard.jsx    # Primary desktop dashboard
│   │       ├── MyProfile.jsx    # Profile management & completion bar
│   │       ├── Opportunities.jsx# Opportunity discovery (Grid & Table views)
│   │       ├── Recommendations.jsx # Personalized ranking with explainability
│   │       ├── Alerts.jsx       # Notification center
│   │       └── Settings.jsx     # Reminder schedules & IBM Z telemetry
└── README.md
```

---

## 🏃 Running the Application Locally

### 1. Start the Backend API (FastAPI)

```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The interactive API documentation (Swagger UI) is available at:
`http://127.0.0.1:8000/docs`

### 2. Start the Frontend (Vite + React)

```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
Open your browser to:
`http://127.0.0.1:5173/`

---

## 💡 Key Features Implemented

1. **Exact Visual Reproduction of Reference Dashboard:**
   - Dark navy vertical sidebar with logo and IBM Z LinuxONE footer.
   - Header with greeting: *"Hello, Alex Chen!"* and quick opportunity search.
   - Four pastel summary cards dynamically populated from database statistics:
     - Total Opportunities (`#EAF3FF`)
     - Expiring Soon (`#FFF7E6`)
     - High Risk (`#FFF0F0`)
     - Recommended for You (`#E9FAF1`)
   - **Top Urgent Opportunities:** Categorized rows with days remaining, risk-level badges, match percentages, and "View" action buttons.
   - **All Opportunities Table:** Compact rows with title, category, deadline, days left, risk score, match %, status, search filter, category filter, risk level filter, sorting, and pagination.
   - **Right-Side Panel:**
     - Your Profile Match with circular progress indicator and 4 profile dimensions (Education, Skills, Interests, Career Goals).
     - Upcoming Deadlines with countdown badges.
     - Quick Insights generated from real database state with "View Recommendations" button.
     - Smart Alerts with unread indicators and quick navigation.

2. **Explainable AI Risk Scoring Engine (40-30-20-10 Heuristic):**
   - **40% Deadline Urgency:** Compares remaining time against estimated preparation requirements.
   - **30% Profile & Eligibility Alignment:** Evaluates degree, branch, skills, and minimum CGPA criteria.
   - **20% Application Preparation Burden:** Considers number of required documents, essays/SOPs, tests, and recommendation letters.
   - **10% Verification & Completeness:** Identifies unverified deadlines or missing user profile documents.
   - Displays contributing factors and transparent recommended actions in the Opportunity Detail modal.

3. **Automatic Information Extraction:**
   - Built-in backend parser supporting PDF circulars (PyMuPDF), pasted notice text, or official web announcements.
   - Extracts deadline dates, eligibility rules, required documents, and skill keywords with confidence scoring.
   - Preview extracted details and save directly into the Opportunity database.

4. **Comprehensive Pages:**
   - **My Profile:** Complete profile management with live profile completion percentage bar. Saving recalculates opportunity match scores and risk levels across the system!
   - **Opportunities:** Full catalog with grid and table view toggle, bookmarking, and AI notice extractor modal.
   - **Recommendations:** Personalized ranked opportunities with transparent reasoning explaining why each opportunity was recommended.
   - **Alert Center:** Configurable alerts, unread badges, and bulk mark-as-read.
   - **Settings:** Automated reminder timeline (7d, 3d, 1d, 0d) and IBM Z / LinuxONE deployment telemetry.
