import re
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
try:
    import pymupdf as fitz
except ImportError:
    import fitz
from bs4 import BeautifulSoup
import requests

DATE_PATTERNS = [
    r'(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})',
    r'(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})',
    r'(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)[,\s]+(\d{4})',
    r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?[,\s]+(\d{4})',
]

MONTH_MAP = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
    'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12
}

def parse_deadline_from_text(text: str) -> Optional[datetime]:
    text_lower = text.lower()
    
    # Look for keywords near dates: deadline, last date, due date, closes on, apply by
    keywords = ["deadline", "last date", "closing date", "apply by", "closes on", "due date", "submission deadline"]
    
    found_dates = []
    
    for kw in keywords:
        pos = text_lower.find(kw)
        if pos != -1:
            snippet = text[pos:pos+150]
            for pattern in DATE_PATTERNS:
                matches = re.finditer(pattern, snippet, re.IGNORECASE)
                for m in matches:
                    parsed = parse_single_match(m)
                    if parsed:
                        found_dates.append(parsed)
                        
    if not found_dates:
        # Global search in text
        for pattern in DATE_PATTERNS:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for m in matches:
                parsed = parse_single_match(m)
                if parsed and parsed > datetime.now(timezone.utc) - timedelta(days=365):
                    found_dates.append(parsed)

    if found_dates:
        # Choose the first or future date
        now = datetime.now(timezone.utc)
        future_dates = [d for d in found_dates if d >= now]
        return future_dates[0] if future_dates else found_dates[0]
    
    return None

def parse_single_match(match) -> Optional[datetime]:
    try:
        groups = match.groups()
        if len(groups) == 3:
            # Check month name format
            g1, g2, g3 = groups
            if g2.lower() in MONTH_MAP: # e.g. 15 October 2026
                day, month, year = int(g1), MONTH_MAP[g2.lower()], int(g3)
                return datetime(year, month, day, 23, 59, 59, tzinfo=timezone.utc)
            elif g1.lower() in MONTH_MAP: # e.g. October 15 2026
                month, day, year = MONTH_MAP[g1.lower()], int(g2), int(g3)
                return datetime(year, month, day, 23, 59, 59, tzinfo=timezone.utc)
            elif len(g3) == 4: # e.g. 15-10-2026
                return datetime(int(g3), int(g2), int(g1), 23, 59, 59, tzinfo=timezone.utc)
            elif len(g1) == 4: # e.g. 2026-10-15
                return datetime(int(g1), int(g2), int(g3), 23, 59, 59, tzinfo=timezone.utc)
    except Exception:
        pass
    return None

def infer_category(text: str) -> str:
    t = text.lower()
    if any(k in t for k in ["scholarship", "financial aid", "grant", "fellowship stipend"]):
        return "Scholarship"
    elif any(k in t for k in ["fellowship", "fellow", "research grant"]):
        return "Fellowship"
    elif any(k in t for k in ["internship", "intern", "trainee", "apprentice"]):
        return "Internship"
    elif any(k in t for k in ["hackathon", "coding challenge", "ideathon", "competition"]):
        return "Hackathon"
    elif any(k in t for k in ["exam", "examination", "gate", "cat", "entrance test"]):
        return "Exam"
    elif any(k in t for k in ["full time", "job opening", "engineer", "associate", "developer"]):
        return "Job"
    return "Internship"

def extract_skills_from_text(text: str) -> List[str]:
    common_skills = [
        "Python", "Java", "C++", "JavaScript", "TypeScript", "React", "Node.js", 
        "Machine Learning", "Deep Learning", "SQL", "Data Science", "AWS", "Cloud",
        "Linux", "Git", "Docker", "Algorithms", "Cybersecurity", "NLP"
    ]
    t = text.lower()
    found = []
    for skill in common_skills:
        if re.search(r'\b' + re.escape(skill.lower()) + r'\b', t):
            found.append(skill)
    return found if found else ["Problem Solving", "Analytical Thinking"]

def extract_documents_from_text(text: str) -> List[str]:
    common_docs = [
        "Resume / CV", "Academic Transcript", "Statement of Purpose (SOP)",
        "Letter of Recommendation (LOR)", "Government ID Proof", "Certificate of Enrollment",
        "Bonafide Certificate", "Income Certificate", "Project Portfolio"
    ]
    t = text.lower()
    found = []
    for doc in common_docs:
        kw = doc.split("(")[0].strip().lower()
        if kw in t or ("recommendation" in t and "letter" in doc.lower()):
            found.append(doc)
    return found if found else ["Resume / CV", "Academic Transcript"]

def extract_from_pdf(pdf_bytes: bytes) -> str:
    text = ""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page in doc:
            text += page.get_text() + "\n"
    except Exception as e:
        text = f"Error parsing PDF: {str(e)}"
    return text

def extract_from_url(url: str) -> str:
    try:
        resp = requests.get(url, timeout=10, headers={"User-Agent": "OpportunityExpiryPredictor/1.0"})
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            # Remove scripts and styles
            for script in soup(["script", "style", "nav", "footer"]):
                script.decompose()
            return soup.get_text(separator=' ', strip=True)
    except Exception as e:
        return f"Error fetching URL: {str(e)}"
    return ""

def process_opportunity_text(text: str, source_type: str = "Pasted Text", source_identifier: str = "Manual Input") -> Dict[str, Any]:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    first_few_lines = lines[:5]
    
    # Infer Title
    title = "Extracted Opportunity Notice"
    for line in first_few_lines:
        if len(line) > 10 and not any(k in line.lower() for k in ["deadline", "http", "page", "date"]):
            title = line[:100]
            break
            
    # Infer Organization
    organization = "Partner Organization"
    org_keywords = ["Google", "Microsoft", "Tata", "Amazon", "IBM", "ISRO", "Government of India", "GATE", "Ministry", "NITI Aayog"]
    for org in org_keywords:
        if org.lower() in text.lower():
            organization = org
            break

    category = infer_category(text)
    deadline = parse_deadline_from_text(text)
    uncertain_deadline = False
    
    if not deadline:
        # Fallback to 14 days from now but flag as uncertain
        deadline = datetime.now(timezone.utc) + timedelta(days=14)
        uncertain_deadline = True
        
    skills = extract_skills_from_text(text)
    docs = extract_documents_from_text(text)
    
    # Calculate confidence score
    confidence = 88.0
    if uncertain_deadline:
        confidence -= 25.0
    if organization == "Partner Organization":
        confidence -= 10.0
    if len(text) < 100:
        confidence -= 20.0
    confidence = max(40.0, min(98.0, confidence))

    # Extract URLs if any
    urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', text)
    app_link = urls[0] if urls else None

    # Education level
    edu = "Undergraduate / Graduate"
    if "b.tech" in text.lower() or "bachelor" in text.lower():
        edu = "B.Tech / B.E. / Undergraduate"
    elif "master" in text.lower() or "phd" in text.lower():
        edu = "Masters / Ph.D."

    eligibility = [
        f"Education: {edu}",
        "Enrolled in recognized accredited university",
        f"Preferred skills: {', '.join(skills[:3])}"
    ]

    return {
        "title": title,
        "organization": organization,
        "category": category,
        "application_deadline": deadline.isoformat(),
        "eligibility_criteria": eligibility,
        "education_requirements": edu,
        "required_skills": skills,
        "required_documents": docs,
        "application_link": app_link,
        "description": text[:600] + ("..." if len(text) > 600 else ""),
        "confidence_score": round(confidence, 1),
        "uncertain_deadline": uncertain_deadline,
        "is_duplicate": False,
        "source_type": source_type,
        "source_identifier": source_identifier
    }
