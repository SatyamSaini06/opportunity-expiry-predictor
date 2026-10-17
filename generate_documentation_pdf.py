import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_header_footer(self, page_count):
        self.saveState()
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#172D50"))
            self.drawString(54, 750, "OPPORTUNITY EXPIRY PREDICTOR")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawRightString(612 - 54, 750, "Technical Stack & Implementation Specification")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.75)
            self.line(54, 744, 612 - 54, 744)

        # Footer (all pages)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(54, 36, "IBM Z / LinuxONE Architecture Ready • Confidential & Technical Architecture")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 36, page_text)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.75)
        self.line(54, 48, 612 - 54, 48)

        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    primary_color = colors.HexColor("#172D50")
    blue_color = colors.HexColor("#2563EB")
    slate_dark = colors.HexColor("#1E293B")
    slate_muted = colors.HexColor("#64748B")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=primary_color,
        spaceAfter=2
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=blue_color,
        spaceAfter=10
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=16,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13.5,
        textColor=blue_color,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=slate_dark,
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=14,
        firstLineIndent=-9,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=body_style,
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0F172A")
    )

    table_header_style = ParagraphStyle(
        'THStyle',
        parent=body_style,
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TDStyle',
        parent=body_style,
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=slate_dark
    )

    table_bold_cell = ParagraphStyle(
        'TDBoldStyle',
        parent=body_style,
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=slate_dark
    )

    story = []

    # Title & Subtitle Banner
    story.append(Paragraph("Opportunity Expiry Predictor", title_style))
    story.append(Paragraph("Full Technology Stack & Implementation Specification Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=blue_color, spaceBefore=0, spaceAfter=8))

    # Meta Overview Box
    meta_data = [
        [
            Paragraph("<b>Project:</b> Opportunity Expiry Predictor", table_cell_style),
            Paragraph("<b>Runtime Target:</b> IBM Z / LinuxONE Enterprise Linux", table_cell_style)
        ],
        [
            Paragraph("<b>Architecture:</b> Full-Stack Decoupled (FastAPI + React 19)", table_cell_style),
            Paragraph("<b>Risk Algorithm:</b> Explainable AI 40-30-20-10 Heuristic", table_cell_style)
        ],
        [
            Paragraph("<b>Authentication:</b> JWT + PBKDF2-HMAC-SHA256 (Salted)", table_cell_style),
            Paragraph("<b>Database:</b> SQLAlchemy ORM (PostgreSQL &amp; SQLite)", table_cell_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[246, 258])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))

    # SECTION 1: EXECUTIVE SUMMARY
    story.append(Paragraph("1. Executive Summary & Vision", h1_style))
    story.append(Paragraph(
        "The <b>Opportunity Expiry Predictor</b> is an AI-powered SaaS web application designed for students and job seekers "
        "to discover, track, evaluate, and prioritize valuable academic and career milestones (scholarships, internships, competitive examinations, "
        "hackathons, fellowships, and job openings). Engineered for <b>IBM Z and LinuxONE</b>, the platform provides automated deadline urgency "
        "detection, natural language document extraction, and transparent explainable recommendations.",
        body_style
    ))
    story.append(Paragraph(
        "The system replaces fragmented tracking spreadsheets with an intelligent priority heuristic (0 to 100) that alerts candidates "
        "to imminent deadlines, excessive documentation requirements, or eligibility gaps, offering prescriptive guidance to submit competitive applications on time.",
        body_style
    ))

    # SECTION 2: FULL TECH STACK
    story.append(Paragraph("2. Complete Technology Stack Matrix", h1_style))
    tech_stack_data = [
        [Paragraph("Layer", table_header_style), Paragraph("Component", table_header_style), Paragraph("Version / Library", table_header_style), Paragraph("Architectural Purpose &amp; Capability", table_header_style)],
        [Paragraph("<b>Frontend Core</b>", table_bold_cell), Paragraph("React.js + Vite", table_cell_style), Paragraph("React 19, Vite 8", table_cell_style), Paragraph("High performance SPA with instant HMR and reactive modular state management.", table_cell_style)],
        [Paragraph("<b>Routing</b>", table_bold_cell), Paragraph("React Router DOM", table_cell_style), Paragraph("v7.x", table_cell_style), Paragraph("Client-side routing: /dashboard, /profile, /opportunities, /recommendations, /alerts, /settings, /login, /register.", table_cell_style)],
        [Paragraph("<b>Iconography</b>", table_bold_cell), Paragraph("Font Awesome React", table_cell_style), Paragraph("@fortawesome/free-solid", table_cell_style), Paragraph("Strictly uses FontAwesomeIcon components across navigation, categories, and status indicators.", table_cell_style)],
        [Paragraph("<b>Styling System</b>", table_bold_cell), Paragraph("Vanilla CSS3 Tokens", table_cell_style), Paragraph("CSS Grid &amp; Flexbox", table_cell_style), Paragraph("Clean custom design system: dark navy sidebar (#172D50), primary blue (#2563EB), pastel stat cards, and responsive media queries.", table_cell_style)],
        [Paragraph("<b>Visualization</b>", table_bold_cell), Paragraph("SVG Progress &amp; Recharts", table_cell_style), Paragraph("SVG / Recharts", table_cell_style), Paragraph("Radial progress gauge for Profile Match and multi-dimensional profile alignment breakdowns.", table_cell_style)],
        [Paragraph("<b>Backend API</b>", table_bold_cell), Paragraph("Python FastAPI", table_cell_style), Paragraph("FastAPI 0.141+", table_cell_style), Paragraph("Asynchronous ASGI REST framework with automated OpenAPI / Swagger interactive documentation.", table_cell_style)],
        [Paragraph("<b>ASGI Server</b>", table_bold_cell), Paragraph("Uvicorn", table_cell_style), Paragraph("Uvicorn 0.52+", table_cell_style), Paragraph("High throughput asynchronous web server supporting hot-reloading and enterprise hosting.", table_cell_style)],
        [Paragraph("<b>Data Validation</b>", table_bold_cell), Paragraph("Pydantic", table_cell_style), Paragraph("Pydantic v2.13+", table_cell_style), Paragraph("Type-safe request/response serialization, schema validation, and error reporting.", table_cell_style)],
        [Paragraph("<b>ORM &amp; Database</b>", table_bold_cell), Paragraph("SQLAlchemy ORM", table_cell_style), Paragraph("SQLAlchemy 2.0+", table_cell_style), Paragraph("Normalized models supporting PostgreSQL for production and zero-config SQLite for local development.", table_cell_style)],
        [Paragraph("<b>Security &amp; Auth</b>", table_bold_cell), Paragraph("JWT + PBKDF2 HMAC", table_cell_style), Paragraph("python-jose, hashlib", table_cell_style), Paragraph("Stateless JSON Web Tokens with cryptographically salted PBKDF2-HMAC-SHA256 password security.", table_cell_style)],
        [Paragraph("<b>Document AI</b>", table_bold_cell), Paragraph("PyMuPDF", table_cell_style), Paragraph("PyMuPDF 1.28.2 (fitz)", table_cell_style), Paragraph("Extracts text, deadlines, eligibility criteria, and required documents from uploaded PDF circulars.", table_cell_style)],
        [Paragraph("<b>Web Scraping / NLP</b>", table_bold_cell), Paragraph("BeautifulSoup4 + Regex", table_cell_style), Paragraph("BS4 4.15+, Requests", table_cell_style), Paragraph("Parses official announcements, extracts date patterns, and normalizes unstructured circular notices.", table_cell_style)],
        [Paragraph("<b>Target Runtime</b>", table_bold_cell), Paragraph("IBM Z / LinuxONE", table_cell_style), Paragraph("s390x Enterprise Linux", table_cell_style), Paragraph("High security, continuous availability, and enterprise transaction resilience.", table_cell_style)]
    ]
    tech_table = Table(tech_stack_data, colWidths=[85, 110, 100, 209])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 10))

    # SECTION 3: WHAT IS IMPLEMENTED
    story.append(Paragraph("3. Detailed Implementation Breakdown", h1_style))
    story.append(Paragraph(
        "The following modules represent the complete implementation delivered across the frontend and backend:",
        body_style
    ))

    # Subsections A to D
    story.append(Paragraph("A. Visual Design System &amp; Reference Dashboard Layout", h2_style))
    story.append(Paragraph("&bull; <b>Precision Palette:</b> Dark navy sidebar (<code>#172D50</code>), primary blue (<code>#2563EB</code>), light canvas (<code>#F4F7FC</code>), white card surfaces (<code>#FFFFFF</code>), borders (<code>#E2E8F0</code>).", bullet_style))
    story.append(Paragraph("&bull; <b>Typography:</b> Inter sans-serif typeface configured with exact hierarchical scale (Headings: 22px, Section titles: 16px, Table/Meta: 11-13px).", bullet_style))
    story.append(Paragraph("&bull; <b>Fixed Dark Navy Sidebar:</b> Fixed 190px sidebar with brand mark, active nav pill in bright blue, Font Awesome icons, and IBM Z footer panel: <i>'Deployed on IBM Z for a smarter tomorrow'</i>.", bullet_style))
    story.append(Paragraph("&bull; <b>Navigation Items:</b> Dashboard (<code>faHouse</code>), My Profile (<code>faUser</code>), Opportunities (<code>faBriefcase</code>), Recommendations (<code>faStar</code>), Alerts (<code>faBell</code>), Settings (<code>faGear</code>), and Log Out (<code>faRightFromBracket</code>).", bullet_style))

    story.append(Paragraph("B. Header &amp; Live Database-Backed Stat Cards", h2_style))
    story.append(Paragraph("&bull; <b>Dashboard Header:</b> Dynamic greeting (<i>'Hello, [User Name]!'</i>), search input with <code>faMagnifyingGlass</code>, user avatar, and user menu dropdown.", bullet_style))
    story.append(Paragraph("&bull; <b>4 Pastel Stat Cards:</b> Calculated live from backend database records (Total Opportunities: soft blue <code>#EAF3FF</code>; Expiring Soon within 7d: soft yellow <code>#FFF7E6</code>; High Risk: soft red <code>#FFF0F0</code>; Recommended for You: soft green <code>#E9FAF1</code>).", bullet_style))
    story.append(Paragraph("&bull; <b>Top Urgent Opportunities:</b> Displays top time-sensitive rows with category icon, deadline date, days remaining badge, risk level badge, match %, and 'View' modal button.", bullet_style))
    story.append(Paragraph("&bull; <b>All Opportunities Data Table:</b> Live multi-criteria filtering (search title/org, category dropdown, risk level dropdown), sortable columns (deadline, risk score, match %), pagination, and empty/loading states.", bullet_style))

    story.append(Paragraph("C. Right-Side Intelligence Panel", h2_style))
    story.append(Paragraph("&bull; <b>Your Profile Match:</b> Radial circular progress chart showing overall profile match % with 4 dimensional indicators (Education 94%, Skills 70%, Interests 90%, Career Goals 85%).", bullet_style))
    story.append(Paragraph("&bull; <b>Upcoming Deadlines:</b> Next 4 impending opportunities with urgency badges (Red for critical &lt;=2d, Amber for approaching &lt;=7d, Green for normal).", bullet_style))
    story.append(Paragraph("&bull; <b>Quick Insights:</b> Dynamic AI takeaways generated from database state with direct 'View Recommendations' button.", bullet_style))
    story.append(Paragraph("&bull; <b>Smart Alerts:</b> Soft-blue card summarizing recent notifications with unread badges linking to the Alert Center.", bullet_style))

    story.append(Paragraph("D. Explainable AI Risk Scoring Engine (40-30-20-10 Heuristic)", h2_style))
    story.append(Paragraph(
        "Implemented in <code>backend/risk_engine.py</code>, this engine computes an explainable risk score (0 to 100) "
        "identifying opportunities at high risk of being missed:",
        body_style
    ))

    risk_table_data = [
        [Paragraph("Weight", table_header_style), Paragraph("Evaluation Factor", table_header_style), Paragraph("Algorithmic Rules &amp; Contributing Criteria", table_header_style)],
        [Paragraph("<b>40%</b>", table_bold_cell), Paragraph("Deadline Urgency", table_bold_cell), Paragraph("Compares remaining days against preparation days. Days &lt;= 1 yields 100/100; &lt;= 2 yields 95/100 (Critical); &lt;= 7 yields 65/100; prep time exceeding remaining time adds +20 penalty.", table_cell_style)],
        [Paragraph("<b>30%</b>", table_bold_cell), Paragraph("Eligibility Mismatch", table_bold_cell), Paragraph("Compares user's CGPA, degree branch, and technical skill tags against opportunity minimum criteria.", table_cell_style)],
        [Paragraph("<b>20%</b>", table_bold_cell), Paragraph("Preparation Burden", table_bold_cell), Paragraph("Quantifies documentation difficulty based on required documents (transcripts, SOP essays, recommendation letters, pitch decks).", table_cell_style)],
        [Paragraph("<b>10%</b>", table_bold_cell), Paragraph("Missing Info / Verification", table_bold_cell), Paragraph("Penalizes unverified deadlines (+75) or missing application URLs (+20) requiring manual confirmation.", table_cell_style)]
    ]
    risk_table = Table(risk_table_data, colWidths=[55, 120, 329])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), blue_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(risk_table)
    story.append(Spacer(1, 4))
    story.append(Paragraph("&bull; <b>Opportunity Detail Modal:</b> Clicking 'View' displays transparent factor breakdowns (e.g. <i>'Critical urgency: Application deadline is in 2 days'</i>), suggested actions, required documents, and official portal link.", body_style))

    story.append(Paragraph("E. Automatic NLP Document &amp; Notice Extraction", h2_style))
    story.append(Paragraph("&bull; <b>PDF Notice Extraction:</b> Uses PyMuPDF to extract text from official uploaded PDF circulars.", bullet_style))
    story.append(Paragraph("&bull; <b>Date &amp; Deadline NLP:</b> Intelligently detects application cutoff dates across unstructured phrasing (e.g. <i>'Last Date of Application: 30 November 2026'</i>).", bullet_style))
    story.append(Paragraph("&bull; <b>Webpage Parsing:</b> Employs BeautifulSoup4 to extract clean text from authorized university announcement pages.", bullet_style))
    story.append(Paragraph("&bull; <b>Interactive Extractor Modal:</b> Located on the Opportunities page; allows pasting text or uploading PDFs to preview extracted fields, confidence scores, and save directly to the database.", bullet_style))

    story.append(Paragraph("F. Profile Management &amp; Dynamic Recalculation", h2_style))
    story.append(Paragraph("&bull; <b>Profile Management (<code>/profile</code>):</b> Candidates manage degree, university, CGPA, technical skills, areas of interest, preferred categories, and career goals.", bullet_style))
    story.append(Paragraph("&bull; <b>Live Profile Completion Bar:</b> Tracks completeness percentage in real-time.", bullet_style))
    story.append(Paragraph("&bull; <b>Automatic Reactive Recalculation:</b> Updating and saving profile immediately triggers background recalculation of match percentages and risk assessments across all opportunities.", bullet_style))

    story.append(Paragraph("G. Authentication, Sign-in, Registration &amp; Logout", h2_style))
    story.append(Paragraph("&bull; <b>Registration Page (<code>/register</code>):</b> Account creation with degree/branch selection, password validation, and automatic onboarding.", bullet_style))
    story.append(Paragraph("&bull; <b>Login Page (<code>/login</code>, <code>/signin</code>):</b> Clean auth view with password show/hide toggle and 'Remember me' support.", bullet_style))
    story.append(Paragraph("&bull; <b>1-Click Demo Student Access:</b> Instant login as Alex Chen (<code>student@university.edu</code>) pre-seeded with active opportunities and notifications.", bullet_style))
    story.append(Paragraph("&bull; <b>Logout Option:</b> Seamlessly accessible from both the Header user dropdown and Left Sidebar, clearing tokens and returning to sign-in.", bullet_style))

    story.append(Paragraph("H. Recommendations, Alerts &amp; Settings Pages", h2_style))
    story.append(Paragraph("&bull; <b>Recommendations (<code>/recommendations</code>):</b> Ranked opportunities with explainable reasoning (<i>'Why this is recommended for you'</i>) and dismiss actions.", bullet_style))
    story.append(Paragraph("&bull; <b>Alert Center (<code>/alerts</code>):</b> In-app notification center tracking approaching deadlines with bulk 'Mark all as read'.", bullet_style))
    story.append(Paragraph("&bull; <b>Settings (<code>/settings</code>):</b> Configurable reminder schedule (7d, 3d, 1d, 0d) and IBM Z / LinuxONE telemetry status.", bullet_style))

    # SECTION 4: DATABASE & API SPECIFICATION
    story.append(Paragraph("4. Relational Database Schema &amp; REST API Endpoints", h1_style))
    story.append(Paragraph(
        "The backend database contains 11 normalized SQLAlchemy models with complete foreign keys and cascade rules:",
        body_style
    ))

    db_models_data = [
        [Paragraph("Entity Model", table_header_style), Paragraph("Key Fields", table_header_style), Paragraph("Description &amp; Relationships", table_header_style)],
        [Paragraph("<b>User</b>", table_bold_cell), Paragraph("id, email, hashed_password, full_name, is_active", table_cell_style), Paragraph("Core authentication model linked to Profile, Bookmarks, and Notifications.", table_cell_style)],
        [Paragraph("<b>UserProfile</b>", table_bold_cell), Paragraph("id, user_id, educational_qualification, degree_branch, cgpa, skills", table_cell_style), Paragraph("Academic standing and technical profile used for dynamic matching.", table_cell_style)],
        [Paragraph("<b>Opportunity</b>", table_bold_cell), Paragraph("id, title, organization, category, deadline, min_cgpa, is_verified, status", table_cell_style), Paragraph("Master opportunity catalog with verification status and prep requirements.", table_cell_style)],
        [Paragraph("<b>EligibilityCriteria</b>", table_bold_cell), Paragraph("id, opportunity_id, criteria_type, description, required_value", table_cell_style), Paragraph("Fine-grained eligibility rules (degree, CGPA, year, skills).", table_cell_style)],
        [Paragraph("<b>RequiredDocument</b>", table_bold_cell), Paragraph("id, opportunity_id, document_name, is_mandatory", table_cell_style), Paragraph("Mandatory and optional documents evaluated for preparation burden.", table_cell_style)],
        [Paragraph("<b>RiskAssessment</b>", table_bold_cell), Paragraph("id, user_id, opportunity_id, risk_score, risk_level, reasons_json", table_cell_style), Paragraph("Stored explainable 4-factor risk assessment scores.", table_cell_style)],
        [Paragraph("<b>OpportunityRecommendation</b>", table_bold_cell), Paragraph("id, user_id, opportunity_id, match_percentage, reason", table_cell_style), Paragraph("Ranked recommendations with plain-English reasoning.", table_cell_style)],
        [Paragraph("<b>Notification</b>", table_bold_cell), Paragraph("id, user_id, opportunity_id, title, message, type, is_read", table_cell_style), Paragraph("Deadline warnings and recommendation alerts.", table_cell_style)],
        [Paragraph("<b>UserBookmark</b>", table_bold_cell), Paragraph("id, user_id, opportunity_id, created_at", table_cell_style), Paragraph("Saved opportunities tracked by individual candidates.", table_cell_style)],
        [Paragraph("<b>OpportunitySource</b>", table_bold_cell), Paragraph("id, opportunity_id, source_type, source_url, raw_content, confidence", table_cell_style), Paragraph("Audit log of extracted PDF notices and web circulars.", table_cell_style)]
    ]
    db_table = Table(db_models_data, colWidths=[110, 160, 234])
    db_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(db_table)
    story.append(Spacer(1, 6))

    # REST Endpoints Summary
    story.append(Paragraph("FastAPI Endpoints Summary", h2_style))
    api_list = [
        "<code>POST /auth/register</code> &amp; <code>POST /auth/login</code> — User registration and JWT authentication",
        "<code>GET /users/me</code> &amp; <code>PUT /users/me</code> — Fetch/update profile with dynamic score recalculation",
        "<code>GET /opportunities</code> — Filtered opportunity catalog (search, category, risk level, pagination)",
        "<code>GET /opportunities/urgent</code> — Top urgent opportunities prioritized by days left and risk score",
        "<code>GET /opportunities/recommended</code> — Personalized opportunity recommendations with transparent reasoning",
        "<code>GET /opportunities/{id}</code> — Detailed opportunity breakdown with documents and criteria",
        "<code>POST /opportunities/upload</code> — Document &amp; text extraction via PyMuPDF / BeautifulSoup4",
        "<code>GET /analytics/dashboard</code> — Live database dashboard statistics (Total, Expiring, High Risk, Recommended)",
        "<code>GET /notifications</code> &amp; <code>PATCH /notifications/{id}/read</code> — Notification management",
        "<code>POST /bookmarks/{id}</code> &amp; <code>DELETE /bookmarks/{id}</code> — Opportunity bookmarking"
    ]
    for api_ep in api_list:
        story.append(Paragraph(f"&bull; {api_ep}", bullet_style))

    # SECTION 5: HOW TO RUN
    story.append(Paragraph("5. Local Execution Instructions", h1_style))
    story.append(Paragraph("<b>Start Backend API:</b> <code>cd backend &amp;&amp; python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload</code>", bullet_style))
    story.append(Paragraph("<b>Start Frontend App:</b> <code>cd frontend &amp;&amp; npm run dev -- --host 127.0.0.1 --port 5173</code>", bullet_style))
    story.append(Paragraph("<b>Interactive Swagger Docs:</b> <code>http://127.0.0.1:8000/docs</code> | <b>Dashboard:</b> <code>http://127.0.0.1:5173/</code>", bullet_style))
    story.append(Spacer(1, 6))

    story.append(Paragraph(
        "<b>Summary:</b> The Opportunity Expiry Predictor is a production-quality, data-backed full-stack web application "
        "faithfully matching the reference design and deployed ready for IBM Z / LinuxONE enterprise infrastructure.",
        callout_style
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Refined PDF successfully built: {filename}")

if __name__ == "__main__":
    out_pdf = os.path.join(os.path.dirname(__file__), "Opportunity_Expiry_Predictor_Tech_Stack_and_Implementation.pdf")
    build_pdf(out_pdf)
