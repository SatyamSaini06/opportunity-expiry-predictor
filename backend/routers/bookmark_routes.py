from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
from auth import get_current_user
from routers.opportunity_routes import format_opportunity_response

router = APIRouter(prefix="/bookmarks", tags=["Bookmarks"])

@router.get("", response_model=List[Dict[str, Any]])
def get_user_bookmarks(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bookmarks = db.query(models.UserBookmark).filter(
        models.UserBookmark.user_id == current_user.id
    ).all()
    
    results = []
    for bm in bookmarks:
        if bm.opportunity:
            results.append(format_opportunity_response(bm.opportunity, current_user, db))
    return results

@router.post("/{opportunity_id}")
def add_bookmark(
    opportunity_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    existing = db.query(models.UserBookmark).filter(
        models.UserBookmark.user_id == current_user.id,
        models.UserBookmark.opportunity_id == opportunity_id
    ).first()

    if not existing:
        bm = models.UserBookmark(user_id=current_user.id, opportunity_id=opportunity_id)
        db.add(bm)
        db.commit()

    return {"message": "Opportunity bookmarked successfully", "bookmarked": True}

@router.delete("/{opportunity_id}")
def remove_bookmark(
    opportunity_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(models.UserBookmark).filter(
        models.UserBookmark.user_id == current_user.id,
        models.UserBookmark.opportunity_id == opportunity_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()

    return {"message": "Bookmark removed", "bookmarked": False}
