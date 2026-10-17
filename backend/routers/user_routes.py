from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from database import get_db
import models
import schemas
from auth import get_current_user
from risk_engine import calculate_risk_score, calculate_profile_match
import json

router = APIRouter(prefix="/users", tags=["Users"])

def calculate_completion_percentage(user: models.User, profile: models.UserProfile) -> float:
    fields = [
        user.full_name,
        profile.educational_qualification,
        profile.college_university,
        profile.degree_branch,
        profile.graduation_year,
        profile.cgpa,
        profile.technical_skills,
        profile.areas_of_interest,
        profile.preferred_categories,
        profile.preferred_job_roles,
        profile.career_goals,
        profile.location_preferences,
        profile.certifications,
        profile.experience_projects
    ]
    completed = sum(1 for f in fields if f not in [None, "", 0, 0.0])
    return round((completed / len(fields)) * 100.0, 1)

@router.get("/me")
def get_current_user_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = models.UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
        "profile": {
            "educational_qualification": profile.educational_qualification or "",
            "college_university": profile.college_university or "",
            "degree_branch": profile.degree_branch or "",
            "graduation_year": profile.graduation_year or 2027,
            "cgpa": profile.cgpa or 8.0,
            "technical_skills": profile.technical_skills or "",
            "areas_of_interest": profile.areas_of_interest or "",
            "preferred_categories": profile.preferred_categories or "",
            "preferred_job_roles": profile.preferred_job_roles or "",
            "career_goals": profile.career_goals or "",
            "location_preferences": profile.location_preferences or "",
            "certifications": profile.certifications or "",
            "experience_projects": profile.experience_projects or "",
            "profile_completion_pct": profile.profile_completion_pct or 75.0
        }
    }

@router.put("/me")
def update_user_profile(
    update_data: schemas.UserProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if update_data.full_name:
        current_user.full_name = update_data.full_name

    profile = current_user.profile
    if not profile:
        profile = models.UserProfile(user_id=current_user.id)
        db.add(profile)

    update_dict = update_data.model_dump(exclude_unset=True)
    if "full_name" in update_dict:
        del update_dict["full_name"]

    for k, v in update_dict.items():
        if hasattr(profile, k):
            setattr(profile, k, v)

    # Recalculate profile completion percentage
    profile.profile_completion_pct = calculate_completion_percentage(current_user, profile)
    db.commit()
    db.refresh(profile)
    db.refresh(current_user)

    # Dynamically update recommendations and risk scores based on updated profile!
    all_opps = db.query(models.Opportunity).all()
    for opp in all_opps:
        # Update match
        match_info = calculate_profile_match(profile, opp)
        rec = db.query(models.OpportunityRecommendation).filter(
            models.OpportunityRecommendation.user_id == current_user.id,
            models.OpportunityRecommendation.opportunity_id == opp.id
        ).first()
        if rec:
            rec.match_percentage = match_info["overall_match"]
            rec.reason = match_info["reason"]
        else:
            rec = models.OpportunityRecommendation(
                user_id=current_user.id,
                opportunity_id=opp.id,
                match_percentage=match_info["overall_match"],
                reason=match_info["reason"]
            )
            db.add(rec)

        # Update risk
        risk_info = calculate_risk_score(opp, profile)
        assessment = db.query(models.RiskAssessment).filter(
            models.RiskAssessment.user_id == current_user.id,
            models.RiskAssessment.opportunity_id == opp.id
        ).first()
        if assessment:
            assessment.risk_score = risk_info["risk_score"]
            assessment.risk_level = risk_info["risk_level"]
            assessment.deadline_urgency_score = risk_info["deadline_urgency_score"]
            assessment.eligibility_mismatch_score = risk_info["eligibility_mismatch_score"]
            assessment.preparation_burden_score = risk_info["preparation_burden_score"]
            assessment.missing_info_score = risk_info["missing_info_score"]
            assessment.reasons_json = json.dumps(risk_info["reasons"])
            assessment.suggested_actions_json = json.dumps(risk_info["suggested_actions"])
        else:
            assessment = models.RiskAssessment(
                user_id=current_user.id,
                opportunity_id=opp.id,
                risk_score=risk_info["risk_score"],
                risk_level=risk_info["risk_level"],
                deadline_urgency_score=risk_info["deadline_urgency_score"],
                eligibility_mismatch_score=risk_info["eligibility_mismatch_score"],
                preparation_burden_score=risk_info["preparation_burden_score"],
                missing_info_score=risk_info["missing_info_score"],
                reasons_json=json.dumps(risk_info["reasons"]),
                suggested_actions_json=json.dumps(risk_info["suggested_actions"])
            )
            db.add(assessment)

    db.commit()

    return {
        "message": "Profile updated successfully",
        "profile_completion_pct": profile.profile_completion_pct,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name
        }
    }
