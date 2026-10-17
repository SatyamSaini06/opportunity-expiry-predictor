from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from auth import get_current_user_optional
from risk_engine import calculate_days_left, calculate_risk_score, calculate_profile_match

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard", response_model=Dict[str, Any])
def get_dashboard_analytics(
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    profile = current_user.profile if current_user else None
    all_opps = db.query(models.Opportunity).all()

    total_opps = len(all_opps)
    expiring_soon_count = 0
    high_risk_count = 0
    recommended_count = 0
    due_48h_count = 0
    high_skill_match_count = 0

    profile_dims_sum = {
        "education": 0.0,
        "skills": 0.0,
        "interests": 0.0,
        "career_goals": 0.0,
        "overall": 0.0
    }

    for opp in all_opps:
        days_left = calculate_days_left(opp.application_deadline)
        risk_data = calculate_risk_score(opp, profile)
        match_data = calculate_profile_match(profile, opp)

        if 0 <= days_left <= 7:
            expiring_soon_count += 1
        if 0 <= days_left <= 2:
            due_48h_count += 1

        if risk_data["risk_level"] == "High Risk":
            high_risk_count += 1

        if match_data["overall_match"] >= 70.0:
            recommended_count += 1

        if match_data["skills_match"] >= 80.0:
            high_skill_match_count += 1

        profile_dims_sum["education"] += match_data["education_match"]
        profile_dims_sum["skills"] += match_data["skills_match"]
        profile_dims_sum["interests"] += match_data["interests_match"]
        profile_dims_sum["career_goals"] += match_data["career_goals_match"]
        profile_dims_sum["overall"] += match_data["overall_match"]

    divisor = max(1, total_opps)
    avg_profile_match = {
        "overall": round(profile_dims_sum["overall"] / divisor),
        "education": round(profile_dims_sum["education"] / divisor),
        "skills": round(profile_dims_sum["skills"] / divisor),
        "interests": round(profile_dims_sum["interests"] / divisor),
        "career_goals": round(profile_dims_sum["career_goals"] / divisor),
    }

    # Generate Quick Insights from real database state
    insights = []
    if high_risk_count > 0:
        insights.append(f"You have {high_risk_count} high-risk opportunities requiring immediate attention.")
    if due_48h_count > 0:
        insights.append(f"{due_48h_count} application deadline{' is' if due_48h_count == 1 else 's are'} approaching within 48 hours.")
    if high_skill_match_count > 0:
        insights.append(f"{high_skill_match_count} opportunities match your skills above 80%.")
    
    if profile and profile.profile_completion_pct < 90:
        insights.append(f"Profile is {int(profile.profile_completion_pct)}% complete. Add certifications to improve recommendations.")
    else:
        insights.append("Your academic and technical profile is well optimized for top-tier opportunities.")

    # Smart Alerts Preview
    alerts_preview = []
    if current_user:
        user_notifs = db.query(models.Notification).filter(
            models.Notification.user_id == current_user.id
        ).order_by(models.Notification.created_at.desc()).limit(3).all()
        for n in user_notifs:
            alerts_preview.append({
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "type": n.notification_type,
                "is_read": n.is_read
            })

    if not alerts_preview:
        alerts_preview.append({
            "id": 1,
            "title": "New Opportunities Added",
            "message": "New opportunities matching your profile have been added.",
            "type": "Recommendation",
            "is_read": False
        })

    return {
        "summary": {
            "total_opportunities": total_opps,
            "expiring_soon": expiring_soon_count,
            "high_risk": high_risk_count,
            "recommended_count": recommended_count
        },
        "profile_match": avg_profile_match,
        "quick_insights": insights,
        "smart_alerts_preview": alerts_preview
    }

@router.get("/profile-match", response_model=Dict[str, Any])
def get_profile_match_details(
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    profile = current_user.profile if current_user else None
    all_opps = db.query(models.Opportunity).all()
    
    # Calculate dimensional match breakdown
    dims = {"education": 90, "skills": 70, "interests": 80, "career_goals": 75, "overall": 78}
    if all_opps and profile:
        edu_tot = sum(calculate_profile_match(profile, o)["education_match"] for o in all_opps)
        skl_tot = sum(calculate_profile_match(profile, o)["skills_match"] for o in all_opps)
        int_tot = sum(calculate_profile_match(profile, o)["interests_match"] for o in all_opps)
        gol_tot = sum(calculate_profile_match(profile, o)["career_goals_match"] for o in all_opps)
        ovr_tot = sum(calculate_profile_match(profile, o)["overall_match"] for o in all_opps)
        n = len(all_opps)
        dims = {
            "education": round(edu_tot / n),
            "skills": round(skl_tot / n),
            "interests": round(int_tot / n),
            "career_goals": round(gol_tot / n),
            "overall": round(ovr_tot / n)
        }

    return dims

@router.get("/risk", response_model=Dict[str, Any])
def get_risk_analytics(
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    profile = current_user.profile if current_user else None
    all_opps = db.query(models.Opportunity).all()

    high_risk, medium_risk, low_risk = 0, 0, 0
    scores = []
    for opp in all_opps:
        r = calculate_risk_score(opp, profile)
        score = r["risk_score"]
        scores.append(score)
        if r["risk_level"] == "High Risk":
            high_risk += 1
        elif r["risk_level"] == "Medium Risk":
            medium_risk += 1
        else:
            low_risk += 1

    return {
        "high_risk_count": high_risk,
        "medium_risk_count": medium_risk,
        "low_risk_count": low_risk,
        "average_risk_score": round(sum(scores) / max(1, len(scores)), 1),
        "total_evaluated": len(all_opps)
    }
