import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user_optional, get_current_user
from risk_engine import calculate_days_left, get_urgency_status, calculate_risk_score, calculate_profile_match
from extractor import process_opportunity_text, extract_from_pdf, extract_from_url

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])

def format_opportunity_response(
    opp: models.Opportunity,
    user: Optional[models.User] = None,
    db: Session = None
) -> Dict[str, Any]:
    days_left = calculate_days_left(opp.application_deadline)
    urgency_status = get_urgency_status(days_left)
    
    profile = user.profile if user else None
    
    # Calculate or retrieve risk score
    risk_info = calculate_risk_score(opp, profile)
    match_info = calculate_profile_match(profile, opp)
    
    # Check bookmark
    is_bookmarked = False
    app_status = "Not Applied"
    if user:
        bm = db.query(models.UserBookmark).filter(
            models.UserBookmark.user_id == user.id,
            models.UserBookmark.opportunity_id == opp.id
        ).first()
        is_bookmarked = bm is not None
        
        tracking = db.query(models.ApplicationTracking).filter(
            models.ApplicationTracking.user_id == user.id,
            models.ApplicationTracking.opportunity_id == opp.id
        ).first()
        if tracking:
            app_status = tracking.status

    # Status adjustments
    status_str = opp.status
    if days_left < 0:
        status_str = "Expired"
    elif days_left <= 3 and status_str == "Open":
        status_str = "Closing Soon"

    # Criteria & Documents
    criteria_list = [
        {"id": c.id, "type": c.criteria_type, "description": c.description, "value": c.required_value, "mandatory": c.is_mandatory}
        for c in opp.criteria
    ]
    docs_list = [
        {"id": d.id, "name": d.document_name, "description": d.description, "mandatory": d.is_mandatory}
        for d in opp.documents
    ]

    return {
        "id": opp.id,
        "title": opp.title,
        "organization": opp.organization,
        "category": opp.category,
        "description": opp.description,
        "official_url": opp.official_url or "",
        "application_start_date": opp.application_start_date.isoformat() if opp.application_start_date else None,
        "application_deadline": opp.application_deadline.isoformat(),
        "days_left": days_left,
        "urgency_status": urgency_status,
        "eligibility_summary": opp.eligibility_summary or "",
        "education_level": opp.education_level or "Undergraduate / Graduate",
        "min_cgpa": opp.min_cgpa or 0.0,
        "required_skills": opp.required_skills or "",
        "is_verified": opp.is_verified,
        "verification_status": opp.verification_status,
        "status": status_str,
        "prep_time_days": opp.prep_time_days or 3,
        "match_percentage": match_info["overall_match"],
        "match_reason": match_info["reason"],
        "risk_score": risk_info["risk_score"],
        "risk_level": risk_info["risk_level"],
        "risk_reasons": risk_info["reasons"],
        "suggested_actions": risk_info["suggested_actions"],
        "is_bookmarked": is_bookmarked,
        "application_status": app_status,
        "criteria": criteria_list,
        "documents": docs_list
    }

@router.get("", response_model=Dict[str, Any])
def get_opportunities(
    search: Optional[str] = Query(None, description="Search by title, organization, or category"),
    category: Optional[str] = Query(None, description="Filter by category"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    sort_by: Optional[str] = Query("deadline", description="Sort by: deadline, risk_score, match, title"),
    sort_order: Optional[str] = Query("asc", description="Sort order: asc, desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(models.Opportunity)

    if category and category.lower() != "all":
        query = query.filter(models.Opportunity.category.ilike(f"%{category}%"))

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (models.Opportunity.title.ilike(search_fmt)) |
            (models.Opportunity.organization.ilike(search_fmt)) |
            (models.Opportunity.category.ilike(search_fmt)) |
            (models.Opportunity.required_skills.ilike(search_fmt))
        )

    all_opps = query.all()
    
    # Format and enrich with calculated risk and match
    formatted_list = [format_opportunity_response(opp, current_user, db) for opp in all_opps]

    # Filter by risk level if requested
    if risk_level and risk_level.lower() != "all":
        formatted_list = [o for o in formatted_list if o["risk_level"].lower() == risk_level.lower()]

    # Sort
    reverse = (sort_order.lower() == "desc")
    if sort_by == "risk_score":
        formatted_list.sort(key=lambda x: x["risk_score"], reverse=reverse)
    elif sort_by == "match":
        formatted_list.sort(key=lambda x: x["match_percentage"], reverse=reverse)
    elif sort_by == "title":
        formatted_list.sort(key=lambda x: x["title"].lower(), reverse=reverse)
    else: # default: deadline
        formatted_list.sort(key=lambda x: x["days_left"], reverse=reverse)

    total_count = len(formatted_list)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_items = formatted_list[start_idx:end_idx]

    return {
        "items": paginated_items,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": max(1, (total_count + limit - 1) // limit)
    }

@router.get("/urgent", response_model=List[Dict[str, Any]])
def get_urgent_opportunities(
    limit: int = Query(4, ge=1, le=10),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Returns top urgent opportunities for the dashboard 'Top Urgent Opportunities' section.
    Ordered by urgency (days left ascending, prioritized by high risk score).
    """
    all_opps = db.query(models.Opportunity).all()
    formatted = [format_opportunity_response(opp, current_user, db) for opp in all_opps]
    
    # Filter only unexpired and prioritize <= 7 days or high risk
    valid_opps = [o for o in formatted if o["days_left"] >= 0]
    valid_opps.sort(key=lambda x: (x["days_left"], -x["risk_score"]))
    
    return valid_opps[:limit]

@router.get("/recommended", response_model=List[Dict[str, Any]])
def get_recommended_opportunities(
    category: Optional[str] = Query(None),
    min_match: float = Query(60.0),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    all_opps = db.query(models.Opportunity).all()
    formatted = [format_opportunity_response(opp, current_user, db) for opp in all_opps]
    
    recommended = [o for o in formatted if o["match_percentage"] >= min_match and o["days_left"] >= 0]
    if category and category.lower() != "all":
        recommended = [o for o in recommended if o["category"].lower() == category.lower()]
        
    recommended.sort(key=lambda x: (-x["match_percentage"], x["days_left"]))
    return recommended

@router.get("/{opportunity_id}", response_model=Dict[str, Any])
def get_opportunity_by_id(
    opportunity_id: int,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    return format_opportunity_response(opp, current_user, db)

@router.post("", response_model=Dict[str, Any])
def create_opportunity(
    opp_in: schemas.OpportunityCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    opp = models.Opportunity(
        title=opp_in.title,
        organization=opp_in.organization,
        category=opp_in.category,
        description=opp_in.description,
        official_url=opp_in.official_url,
        application_start_date=opp_in.application_start_date,
        application_deadline=opp_in.application_deadline,
        eligibility_summary=opp_in.eligibility_summary,
        education_level=opp_in.education_level or "Undergraduate / Graduate",
        min_cgpa=opp_in.min_cgpa or 0.0,
        required_skills=opp_in.required_skills or "",
        prep_time_days=opp_in.prep_time_days or 5,
        is_verified=True,
        verification_status="Verified",
        status="Open"
    )
    db.add(opp)
    db.flush()

    if opp_in.criteria:
        for c in opp_in.criteria:
            crit = models.EligibilityCriteria(
                opportunity_id=opp.id,
                criteria_type=c.criteria_type,
                description=c.description,
                required_value=c.required_value,
                is_mandatory=c.is_mandatory
            )
            db.add(crit)

    if opp_in.documents:
        for d in opp_in.documents:
            doc = models.RequiredDocument(
                opportunity_id=opp.id,
                document_name=d.document_name,
                description=d.description,
                is_mandatory=d.is_mandatory
            )
            db.add(doc)

    db.commit()
    db.refresh(opp)
    return format_opportunity_response(opp, current_user, db)

@router.post("/upload", response_model=Dict[str, Any])
async def upload_and_extract_opportunity(
    file: Optional[UploadFile] = File(None),
    pasted_text: Optional[str] = Form(None),
    source_url: Optional[str] = Form(None),
    auto_save: Optional[bool] = Form(False),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    raw_text = ""
    source_type = "Pasted Text"
    source_id = "Manual Input"

    if file:
        source_type = "PDF" if file.filename.lower().endswith(".pdf") else "Uploaded File"
        source_id = file.filename
        content = await file.read()
        if file.filename.lower().endswith(".pdf"):
            raw_text = extract_from_pdf(content)
        else:
            raw_text = content.decode('utf-8', errors='ignore')
    elif source_url:
        source_type = "Webpage"
        source_id = source_url
        raw_text = extract_from_url(source_url)
    elif pasted_text:
        source_type = "Pasted Text"
        source_id = "User Input Form"
        raw_text = pasted_text
    else:
        raise HTTPException(status_code=400, detail="No document file, URL, or pasted text provided.")

    if not raw_text or len(raw_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Unable to extract text from provided input.")

    extracted = process_opportunity_text(raw_text, source_type, source_id)
    
    # Check for duplicate
    existing_opp = db.query(models.Opportunity).filter(
        models.Opportunity.title.ilike(f"%{extracted['title'][:30]}%")
    ).first()
    if existing_opp:
        extracted["is_duplicate"] = True

    # If auto_save is requested or user commits it
    saved_opportunity_id = None
    if auto_save:
        deadline_dt = datetime.fromisoformat(extracted["application_deadline"])
        new_opp = models.Opportunity(
            title=extracted["title"],
            organization=extracted["organization"],
            category=extracted["category"],
            description=extracted["description"],
            official_url=extracted["application_link"] or source_url,
            application_deadline=deadline_dt,
            eligibility_summary="; ".join(extracted["eligibility_criteria"]),
            education_level=extracted["education_requirements"],
            min_cgpa=0.0,
            required_skills=", ".join(extracted["required_skills"]),
            is_verified=not extracted["uncertain_deadline"],
            verification_status="Pending Verification" if extracted["uncertain_deadline"] else "Verified",
            status="Open",
            prep_time_days=4
        )
        db.add(new_opp)
        db.flush()

        for doc_name in extracted["required_documents"]:
            db.add(models.RequiredDocument(opportunity_id=new_opp.id, document_name=doc_name, is_mandatory=True))

        for crit in extracted["eligibility_criteria"]:
            db.add(models.EligibilityCriteria(opportunity_id=new_opp.id, criteria_type="Eligibility", description=crit, is_mandatory=True))

        # Save source record
        src = models.OpportunitySource(
            opportunity_id=new_opp.id,
            source_type=source_type,
            source_url=source_url,
            original_filename=file.filename if file else None,
            raw_content=raw_text[:2000],
            confidence_score=extracted["confidence_score"]
        )
        db.add(src)
        db.commit()
        db.refresh(new_opp)
        saved_opportunity_id = new_opp.id

    return {
        "extracted_data": extracted,
        "saved_opportunity_id": saved_opportunity_id,
        "raw_text_snippet": raw_text[:500]
    }
