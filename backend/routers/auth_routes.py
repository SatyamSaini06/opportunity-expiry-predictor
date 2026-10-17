from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.TokenResponse)
def register(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user = models.User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        is_active=True
    )
    db.add(user)
    db.flush()

    # Create initial blank/default profile
    profile = models.UserProfile(
        user_id=user.id,
        educational_qualification="Bachelor of Technology",
        college_university="",
        degree_branch="Computer Science",
        graduation_year=2027,
        cgpa=8.0,
        technical_skills="Python, Web Development",
        areas_of_interest="Software Engineering",
        preferred_categories="Internship, Scholarship, Hackathon",
        preferred_job_roles="Software Engineer Intern",
        career_goals="",
        location_preferences="Remote",
        certifications="",
        experience_projects="",
        profile_completion_pct=60.0
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "profile": {
                "degree_branch": profile.degree_branch,
                "college_university": profile.college_university,
                "profile_completion_pct": profile.profile_completion_pct
            }
        }
    }

@router.post("/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = create_access_token({"sub": str(user.id), "email": user.email})
    profile_data = {}
    if user.profile:
        profile_data = {
            "degree_branch": user.profile.degree_branch,
            "college_university": user.profile.college_university,
            "profile_completion_pct": user.profile.profile_completion_pct,
            "cgpa": user.profile.cgpa
        }

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "profile": profile_data
        }
    }
