from datetime import datetime, timezone
import json
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    bookmarks = relationship("UserBookmark", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("OpportunityRecommendation", back_populates="user", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("ApplicationTracking", back_populates="user", cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    educational_qualification = Column(String(100), default="Bachelor of Technology")
    college_university = Column(String(255), default="Indian Institute of Technology")
    degree_branch = Column(String(150), default="Computer Science & Engineering")
    graduation_year = Column(Integer, default=2027)
    cgpa = Column(Float, default=8.5)
    technical_skills = Column(Text, default="Python, React, Machine Learning, Data Structures, SQL, Git")
    areas_of_interest = Column(Text, default="Software Engineering, AI Research, Open Source, Cloud Computing")
    preferred_categories = Column(Text, default="Internship, Scholarship, Hackathon, Fellowship")
    preferred_job_roles = Column(Text, default="Software Engineer Intern, AI Research Fellow, Data Scientist")
    career_goals = Column(Text, default="Build cutting-edge AI systems and lead high-impact engineering teams")
    location_preferences = Column(String(255), default="Remote, Bangalore, Hyderabad, Delhi NCR")
    certifications = Column(Text, default="AWS Certified Cloud Practitioner, DeepLearning.AI ML Specialization")
    experience_projects = Column(Text, default="Built full-stack AI applications, contributed to open-source libraries")
    profile_completion_pct = Column(Float, default=85.0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="profile")

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    organization = Column(String(255), index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False) # Internship, Scholarship, Exam, Job, Fellowship, Hackathon
    description = Column(Text, nullable=False)
    official_url = Column(String(500), nullable=True)
    application_start_date = Column(DateTime, nullable=True)
    application_deadline = Column(DateTime, nullable=False, index=True)
    eligibility_summary = Column(Text, nullable=True)
    education_level = Column(String(100), default="Undergraduate / Graduate")
    min_cgpa = Column(Float, default=0.0)
    required_skills = Column(Text, default="")
    is_verified = Column(Boolean, default=True)
    verification_status = Column(String(50), default="Verified") # Verified, Pending, Flagged
    status = Column(String(50), default="Open") # Open, Closing Soon, Expired, Ineligible
    prep_time_days = Column(Integer, default=5) # Estimated days to complete application
    logo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    criteria = relationship("EligibilityCriteria", back_populates="opportunity", cascade="all, delete-orphan")
    documents = relationship("RequiredDocument", back_populates="opportunity", cascade="all, delete-orphan")
    sources = relationship("OpportunitySource", back_populates="opportunity", cascade="all, delete-orphan")
    bookmarks = relationship("UserBookmark", back_populates="opportunity", cascade="all, delete-orphan")
    recommendations = relationship("OpportunityRecommendation", back_populates="opportunity", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="opportunity", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="opportunity", cascade="all, delete-orphan")
    applications = relationship("ApplicationTracking", back_populates="opportunity", cascade="all, delete-orphan")

class EligibilityCriteria(Base):
    __tablename__ = "eligibility_criteria"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    criteria_type = Column(String(100), nullable=False) # Education, CGPA, Branch, Year, Skill
    description = Column(String(500), nullable=False)
    required_value = Column(String(255), nullable=True)
    is_mandatory = Column(Boolean, default=True)

    opportunity = relationship("Opportunity", back_populates="criteria")

class RequiredDocument(Base):
    __tablename__ = "required_documents"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    document_name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    is_mandatory = Column(Boolean, default=True)

    opportunity = relationship("Opportunity", back_populates="documents")

class UserBookmark(Base):
    __tablename__ = "user_bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="bookmarks")
    opportunity = relationship("Opportunity", back_populates="bookmarks")

class OpportunityRecommendation(Base):
    __tablename__ = "opportunity_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    match_percentage = Column(Float, default=80.0)
    reason = Column(Text, nullable=False)
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="recommendations")
    opportunity = relationship("Opportunity", back_populates="recommendations")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    risk_score = Column(Float, nullable=False) # 0 to 100
    risk_level = Column(String(50), nullable=False) # High Risk, Medium Risk, Low Risk
    deadline_urgency_score = Column(Float, default=0.0)
    eligibility_mismatch_score = Column(Float, default=0.0)
    preparation_burden_score = Column(Float, default=0.0)
    missing_info_score = Column(Float, default=0.0)
    reasons_json = Column(Text, default="[]") # JSON list of strings
    suggested_actions_json = Column(Text, default="[]") # JSON list of strings
    evaluated_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="risk_assessments")
    opportunity = relationship("Opportunity", back_populates="risk_assessments")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="Deadline") # Deadline, Recommendation, System, MissingDocument
    is_read = Column(Boolean, default=False)
    scheduled_for = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="notifications")
    opportunity = relationship("Opportunity", back_populates="notifications")

class ApplicationTracking(Base):
    __tablename__ = "application_tracking"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="Saved") # Saved, In Progress, Submitted, Interview, Accepted, Rejected
    notes = Column(Text, nullable=True)
    applied_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="applications")
    opportunity = relationship("Opportunity", back_populates="applications")

class OpportunitySource(Base):
    __tablename__ = "opportunity_sources"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    source_type = Column(String(50), default="PDF") # PDF, Webpage, Pasted Text, API
    source_url = Column(String(500), nullable=True)
    original_filename = Column(String(255), nullable=True)
    raw_content = Column(Text, nullable=True)
    confidence_score = Column(Float, default=90.0)
    extraction_timestamp = Column(DateTime, default=utc_now)

    opportunity = relationship("Opportunity", back_populates="sources")
