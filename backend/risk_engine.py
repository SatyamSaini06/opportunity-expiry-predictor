from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple
import models

def calculate_days_left(deadline: datetime) -> int:
    if not deadline:
        return 0
    now = datetime.now(timezone.utc)
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)
    delta = deadline - now
    # Return days, rounding down or negative if overdue
    return delta.days if delta.total_seconds() > 0 else -1

def get_urgency_status(days_left: int) -> str:
    if days_left < 0:
        return "Overdue"
    elif days_left <= 2:
        return "Critical Urgency" # Due within 48 hours
    elif days_left <= 3:
        return "High Urgency"
    elif days_left <= 7:
        return "Medium Urgency"
    else:
        return "Normal Urgency"

def calculate_profile_match(profile: models.UserProfile, opp: models.Opportunity) -> Dict[str, Any]:
    if not profile:
        return {
            "overall_match": 75.0,
            "education_match": 80.0,
            "skills_match": 70.0,
            "interests_match": 75.0,
            "career_goals_match": 75.0,
            "matched_skills": [],
            "reason": "General match with undergraduate opportunities"
        }

    # 1. Education Match
    education_score = 90.0
    if opp.min_cgpa and opp.min_cgpa > 0:
        if profile.cgpa >= opp.min_cgpa:
            education_score = 95.0
        else:
            education_score = max(40.0, 95.0 - (opp.min_cgpa - profile.cgpa) * 30)

    # 2. Skills Match
    user_skills = [s.strip().lower() for s in (profile.technical_skills or "").split(",") if s.strip()]
    opp_skills = [s.strip().lower() for s in (opp.required_skills or "").split(",") if s.strip()]
    
    matched_skills = []
    if opp_skills:
        for os in opp_skills:
            if any(os in us or us in os for us in user_skills):
                matched_skills.append(os)
        skills_score = min(100.0, (len(matched_skills) / max(1, len(opp_skills))) * 100.0)
        skills_score = max(50.0, skills_score) # Baseline reasonable match
    else:
        skills_score = 80.0

    # 3. Interests Match
    user_interests = [i.strip().lower() for i in (profile.areas_of_interest or "").split(",") if i.strip()]
    user_cats = [c.strip().lower() for c in (profile.preferred_categories or "").split(",") if c.strip()]
    opp_cat = (opp.category or "").lower()
    
    cat_match = any(opp_cat in c for c in user_cats)
    interests_score = 90.0 if cat_match else 70.0

    # 4. Career Goals Match
    goals_score = 85.0 if cat_match else 75.0

    # Weighted Overall Match
    overall = (education_score * 0.3) + (skills_score * 0.35) + (interests_score * 0.2) + (goals_score * 0.15)
    overall_rounded = round(overall, 1)

    # Reason generation
    reasons = []
    reasons.append(f"Your {profile.degree_branch or 'degree'} matches eligibility criteria")
    if matched_skills:
        reasons.append(f"Skills in {', '.join([s.title() for s in matched_skills[:3]])} directly align")
    if cat_match:
        reasons.append(f"{opp.category} is in your preferred opportunity domains")

    reason_str = "Recommended because " + ", ".join(reasons) + "."

    return {
        "overall_match": overall_rounded,
        "education_match": round(education_score, 1),
        "skills_match": round(skills_score, 1),
        "interests_match": round(interests_score, 1),
        "career_goals_match": round(goals_score, 1),
        "matched_skills": matched_skills,
        "reason": reason_str
    }

def calculate_risk_score(
    opp: models.Opportunity,
    profile: models.UserProfile = None,
    user_docs: List[str] = None
) -> Dict[str, Any]:
    """
    Transparent application-priority heuristic risk engine:
    Risk Score = 40% deadline urgency + 30% eligibility mismatch + 20% prep burden + 10% missing info
    Higher score = higher risk that the user may miss or fail to apply in time.
    """
    days_left = calculate_days_left(opp.application_deadline)
    prep_time = opp.prep_time_days or 3
    reasons = []
    actions = []

    # 1. Deadline Urgency (40%)
    if days_left < 0:
        urgency_score = 100.0
        reasons.append("Opportunity deadline has already expired.")
        actions.append("Check if late submission or next cycle is available.")
    elif days_left == 0:
        urgency_score = 100.0
        reasons.append("Application closes TODAY.")
        actions.append("Submit application immediately.")
    elif days_left <= 1:
        urgency_score = 100.0
        reasons.append(f"Critical urgency: Application deadline is in {days_left} day.")
        actions.append("Submit application immediately within 24 hours.")
    elif days_left <= 2: # Within 48 hours
        urgency_score = 95.0
        reasons.append(f"Critical urgency: Application deadline is in {days_left} days.")
        actions.append("Complete required documents and submit within 48 hours.")
    elif days_left <= 3:
        urgency_score = 88.0
        reasons.append(f"High urgency: Application deadline is in {days_left} days.")
        actions.append("Expedite application submission before cutoff.")
    elif days_left <= 7:
        urgency_score = 65.0
        reasons.append(f"Approaching deadline: {days_left} days remaining.")
        actions.append("Begin draft application and request any required references.")
    elif days_left <= 14:
        urgency_score = 35.0
        reasons.append(f"Moderate timeline: {days_left} days remaining.")
        actions.append("Review prerequisites and schedule preparation.")
    else:
        urgency_score = 15.0
        reasons.append(f"{days_left} days remaining until deadline.")
        actions.append("Bookmark and plan milestones.")

    # Preparation time factor
    if 0 <= days_left < prep_time:
        urgency_score = min(100.0, urgency_score + 20.0)
        reasons.append(f"Estimated prep time ({prep_time} days) exceeds remaining time ({days_left} days).")
        actions.append("Fast-track required forms to meet application window.")

    # 2. Eligibility & Profile Mismatch (30%)
    mismatch_score = 25.0 # Default baseline
    if profile:
        if opp.min_cgpa and opp.min_cgpa > 0:
            if profile.cgpa < opp.min_cgpa:
                mismatch_score += 45.0
                reasons.append(f"Minimum CGPA is {opp.min_cgpa} (Your CGPA is {profile.cgpa}).")
                actions.append("Verify if CGPA relaxation or alternative experience applies.")
            else:
                mismatch_score = max(10.0, mismatch_score - 10.0)

        # Skills mismatch
        user_skills = [s.strip().lower() for s in (profile.technical_skills or "").split(",") if s.strip()]
        opp_skills = [s.strip().lower() for s in (opp.required_skills or "").split(",") if s.strip()]
        if opp_skills:
            missing_skills = [s for s in opp_skills if not any(s in us for us in user_skills)]
            if missing_skills:
                mismatch_score += min(35.0, len(missing_skills) * 12.0)
                reasons.append(f"Missing desired skill focus: {', '.join([s.title() for s in missing_skills[:2]])}.")
                actions.append("Highlight complementary projects or related coursework.")
    mismatch_score = min(100.0, mismatch_score)

    # 3. Application Preparation Burden (20%)
    doc_count = len(opp.documents) if opp.documents else 2
    burden_score = min(100.0, 30.0 + doc_count * 18.0)
    if doc_count >= 3:
        reasons.append(f"High documentation burden ({doc_count} required application documents).")
        actions.append("Gather transcripts, recommendation letters, and ID proofs early.")

    # 4. Missing Information / Verification (10%)
    missing_info_score = 15.0
    if not opp.is_verified or opp.verification_status != "Verified":
        missing_info_score = 75.0
        reasons.append("Official deadline details pending re-verification from source.")
        actions.append("Verify deadline date on official portal.")
    if not opp.official_url:
        missing_info_score += 20.0
        reasons.append("Official application URL not yet specified.")
        actions.append("Check organization announcements.")
    missing_info_score = min(100.0, missing_info_score)

    # Weighted composite score
    total_risk = (
        (urgency_score * 0.40) +
        (mismatch_score * 0.30) +
        (burden_score * 0.20) +
        (missing_info_score * 0.10)
    )
    total_risk = round(total_risk, 1)

    # Risk Level classification
    if total_risk >= 60.0:
        risk_level = "High Risk"
    elif total_risk >= 35.0:
        risk_level = "Medium Risk"
    else:
        risk_level = "Low Risk"

    return {
        "risk_score": total_risk,
        "risk_level": risk_level,
        "deadline_urgency_score": round(urgency_score, 1),
        "eligibility_mismatch_score": round(mismatch_score, 1),
        "preparation_burden_score": round(burden_score, 1),
        "missing_info_score": round(missing_info_score, 1),
        "reasons": reasons,
        "suggested_actions": actions,
        "days_left": days_left
    }
