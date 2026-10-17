from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: datetime
    profile: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# --- Profile Schemas ---
class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    educational_qualification: Optional[str] = None
    college_university: Optional[str] = None
    degree_branch: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    technical_skills: Optional[str] = None
    areas_of_interest: Optional[str] = None
    preferred_categories: Optional[str] = None
    preferred_job_roles: Optional[str] = None
    career_goals: Optional[str] = None
    location_preferences: Optional[str] = None
    certifications: Optional[str] = None
    experience_projects: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    educational_qualification: str
    college_university: str
    degree_branch: str
    graduation_year: int
    cgpa: float
    technical_skills: str
    areas_of_interest: str
    preferred_categories: str
    preferred_job_roles: str
    career_goals: str
    location_preferences: str
    certifications: str
    experience_projects: str
    profile_completion_pct: float

    class Config:
        from_attributes = True

# --- Opportunity Schemas ---
class CriteriaCreate(BaseModel):
    criteria_type: str
    description: str
    required_value: Optional[str] = None
    is_mandatory: bool = True

class DocumentCreate(BaseModel):
    document_name: str
    description: Optional[str] = None
    is_mandatory: bool = True

class OpportunityCreate(BaseModel):
    title: str
    organization: str
    category: str # Internship, Scholarship, Exam, Job, Fellowship, Hackathon
    description: str
    official_url: Optional[str] = None
    application_start_date: Optional[datetime] = None
    application_deadline: datetime
    eligibility_summary: Optional[str] = None
    education_level: Optional[str] = "Undergraduate / Graduate"
    min_cgpa: Optional[float] = 0.0
    required_skills: Optional[str] = ""
    prep_time_days: Optional[int] = 5
    criteria: Optional[List[CriteriaCreate]] = []
    documents: Optional[List[DocumentCreate]] = []

class OpportunityDetailResponse(BaseModel):
    id: int
    title: str
    organization: str
    category: str
    description: str
    official_url: Optional[str] = None
    application_start_date: Optional[datetime] = None
    application_deadline: datetime
    days_left: int
    urgency_status: str
    eligibility_summary: Optional[str] = None
    education_level: str
    min_cgpa: float
    required_skills: str
    is_verified: bool
    verification_status: str
    status: str
    prep_time_days: int
    match_percentage: float
    risk_score: float
    risk_level: str
    risk_reasons: List[str]
    suggested_actions: List[str]
    is_bookmarked: bool = False
    application_status: Optional[str] = "Not Applied"
    documents: List[Dict[str, Any]] = []
    criteria: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True

# --- Risk Assessment Schema ---
class RiskBreakdownResponse(BaseModel):
    opportunity_id: int
    opportunity_title: str
    risk_score: float
    risk_level: str
    deadline_urgency_score: float
    eligibility_mismatch_score: float
    preparation_burden_score: float
    missing_info_score: float
    reasons: List[str]
    suggested_actions: List[str]
    days_left: int

# --- Extraction Schema ---
class ExtractRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None

class ExtractResultResponse(BaseModel):
    title: str
    organization: str
    category: str
    application_deadline: Optional[str]
    eligibility_criteria: List[str]
    education_requirements: str
    required_skills: List[str]
    required_documents: List[str]
    application_link: Optional[str]
    description: str
    confidence_score: float
    uncertain_deadline: bool
    is_duplicate: bool
    source_type: str
    source_identifier: str

# --- Notification Schema ---
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime
    opportunity_id: Optional[int] = None

    class Config:
        from_attributes = True

# --- Analytics / Dashboard Summary ---
class DashboardSummaryResponse(BaseModel):
    total_opportunities: int
    expiring_soon: int
    high_risk: int
    recommended_count: int
    profile_match: Dict[str, Any]
    quick_insights: List[str]
    smart_alerts_preview: List[Dict[str, Any]]
