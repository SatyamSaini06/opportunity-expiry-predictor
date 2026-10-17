import json
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
import models
from auth import hash_password
from risk_engine import calculate_risk_score, calculate_profile_match

def seed_database(db: Session):
    # Check if database already has users
    user = db.query(models.User).filter(models.User.email == "student@university.edu").first()
    if user:
        return

    print("Seeding initial data...")
    # 1. Create Default User
    user = models.User(
        email="student@university.edu",
        hashed_password=hash_password("password123"),
        full_name="Alex Chen",
        is_active=True
    )
    db.add(user)
    db.flush()

    # 2. Create User Profile
    profile = models.UserProfile(
        user_id=user.id,
        educational_qualification="Bachelor of Technology",
        college_university="National Institute of Technology",
        degree_branch="Computer Science & Engineering",
        graduation_year=2027,
        cgpa=8.8,
        technical_skills="Python, React, Machine Learning, Data Structures, SQL, Cloud Architecture, Git",
        areas_of_interest="Software Engineering, AI Research, Open Source, Cloud Computing",
        preferred_categories="Internship, Scholarship, Hackathon, Fellowship, Exam",
        preferred_job_roles="Software Engineer Intern, AI Research Fellow, Data Scientist",
        career_goals="Build cutting-edge AI systems and lead high-impact engineering teams",
        location_preferences="Remote, Bangalore, Hyderabad, Delhi NCR",
        certifications="AWS Certified Cloud Practitioner, DeepLearning.AI ML Specialization",
        experience_projects="Built AI web apps, contributed to open-source libraries",
        profile_completion_pct=88.0
    )
    db.add(profile)
    db.flush()

    now = datetime.now(timezone.utc)

    # 3. Create Sample Opportunities
    opportunities_data = [
        {
            "title": "Google Summer Internship",
            "organization": "Google",
            "category": "Internship",
            "description": "Work with world-class engineering teams on core scalable infrastructure, machine learning pipelines, and developer platforms. Eligible for pre-final year engineering students.",
            "official_url": "https://careers.google.com/students",
            "application_deadline": now + timedelta(days=2, hours=14), # 2 days left -> Critical / High Risk
            "eligibility_summary": "Pre-final year B.Tech/M.Tech in CS/IT/ECE with CGPA >= 7.5 and strong coding proficiency.",
            "education_level": "Undergraduate / Graduate",
            "min_cgpa": 7.5,
            "required_skills": "Python, Data Structures, Algorithms, Cloud Architecture, Git",
            "is_verified": True,
            "verification_status": "Verified",
            "status": "Closing Soon",
            "prep_time_days": 5,
            "criteria": [
                {"criteria_type": "Education", "description": "Enrolled in accredited B.Tech/M.Tech program", "required_value": "B.Tech/M.Tech", "is_mandatory": True},
                {"criteria_type": "CGPA", "description": "Minimum CGPA 7.5 out of 10", "required_value": "7.5", "is_mandatory": True},
                {"criteria_type": "Graduation", "description": "Graduating year 2026 or 2027", "required_value": "2026/2027", "is_mandatory": True}
            ],
            "documents": [
                {"document_name": "Resume / CV", "description": "1-page technical resume", "is_mandatory": True},
                {"document_name": "Academic Transcript", "description": "Official college transcript showing semesters 1-5", "is_mandatory": True},
                {"document_name": "Statement of Purpose (SOP)", "description": "500-word engineering statement", "is_mandatory": True}
            ]
        },
        {
            "title": "Tata Group Internship Program",
            "organization": "Tata Consultancy Services & Tata Sons",
            "category": "Internship",
            "description": "Industry immersion program across enterprise software, industrial IoT, digital innovation, and agile engineering workflows.",
            "official_url": "https://www.tata.com/careers",
            "application_deadline": now + timedelta(days=5, hours=8), # 5 days left -> Medium Risk
            "eligibility_summary": "All undergraduate STEM branches, minimum 7.0 CGPA.",
            "education_level": "Undergraduate",
            "min_cgpa": 7.0,
            "required_skills": "Java, Python, SQL, Teamwork, Problem Solving",
            "is_verified": True,
            "verification_status": "Verified",
            "status": "Open",
            "prep_time_days": 3,
            "criteria": [
                {"criteria_type": "Education", "description": "Bachelor degree in STEM fields", "required_value": "B.Tech/B.Sc STEM", "is_mandatory": True},
                {"criteria_type": "CGPA", "description": "Minimum CGPA 7.0", "required_value": "7.0", "is_mandatory": True}
            ],
            "documents": [
                {"document_name": "Resume / CV", "description": "Standard CV", "is_mandatory": True},
                {"document_name": "Bonafide Certificate", "description": "College issued no-objection bonafide", "is_mandatory": True}
            ]
        },
        {
            "title": "GATE Examination 2027",
            "organization": "Indian Institute of Science & IITs",
            "category": "Exam",
            "description": "Graduate Aptitude Test in Engineering for postgraduate admissions and PSU recruitment across India.",
            "official_url": "https://gate.iitk.ac.in",
            "application_deadline": now + timedelta(days=10, hours=18), # 10 days left
            "eligibility_summary": "Candidates currently in 3rd year or completed undergraduate degree in Engineering.",
            "education_level": "Undergraduate / Graduate",
            "min_cgpa": 6.0,
            "required_skills": "Engineering Mathematics, CS Core, Algorithms, Operating Systems",
            "is_verified": True,
            "verification_status": "Verified",
            "status": "Open",
            "prep_time_days": 4,
            "criteria": [
                {"criteria_type": "Degree", "description": "Final or pre-final year engineering", "required_value": "B.Tech/B.E.", "is_mandatory": True}
            ],
            "documents": [
                {"document_name": "Passport Photo & Signature", "description": "Standard biometric scans", "is_mandatory": True},
                {"document_name": "Degree / Bonafide Certificate", "description": "Signed by Principal / Dean", "is_mandatory": True},
                {"document_name": "Government ID Proof", "description": "Aadhaar Card or Passport", "is_mandatory": True}
            ]
        },
        {
            "title": "PM YASASVI Scholarship",
            "organization": "Ministry of Social Justice and Empowerment",
            "category": "Scholarship",
            "description": "Pre-matric and post-matric financial fellowship covering full tuition and accommodation for eligible meritorious students.",
            "official_url": "https://yet.nta.ac.in",
            "application_deadline": now + timedelta(days=3, hours=4), # 3 days left -> High Risk
            "eligibility_summary": "Top 10% percentile students from recognized schools and higher education institutes.",
            "education_level": "Undergraduate",
            "min_cgpa": 7.5,
            "required_skills": "Academic Excellence, Community Leadership",
            "is_verified": True,
            "verification_status": "Verified",
            "status": "Closing Soon",
            "prep_time_days": 4,
            "criteria": [
                {"criteria_type": "Income", "description": "Annual household income limits apply", "required_value": "< 2.5 LPA", "is_mandatory": True},
                {"criteria_type": "Academics", "description": "Minimum 75% or 7.5 CGPA in previous year", "required_value": "7.5", "is_mandatory": True}
            ],
            "documents": [
                {"document_name": "Income Certificate", "description": "Issued by Tehsildar/Revenue Authority", "is_mandatory": True},
                {"document_name": "Academic Marksheet", "description": "Previous year semester transcripts", "is_mandatory": True},
                {"document_name": "Bank Passbook Copy", "description": "Aadhaar-seeded student bank account", "is_mandatory": True},
                {"document_name": "Domicile Certificate", "description": "Proof of permanent residence", "is_mandatory": True}
            ]
        },
        {
            "title": "Microsoft Research Fellowship",
            "organization": "Microsoft Research Lab India",
            "category": "Fellowship",
            "description": "Prestigious two-year fellowship working closely with world-leading scientists in Machine Learning, Cryptography, and Distributed Systems.",
            "official_url": "https://www.microsoft.com/en-us/research/academic-program/fellowship",
            "application_deadline": now + timedelta(days=14, hours=12), # 14 days left -> Low Risk
            "eligibility_summary": "Students graduating in 2026/2027 with passion for high-impact computer science research.",
            "education_level": "Undergraduate / Graduate",
            "min_cgpa": 8.5,
            "required_skills": "Machine Learning, Deep Learning, Python, Research Publications, Mathematics",
            "is_verified": True,
            "verification_status": "Verified",
            "status": "Open",
            "prep_time_days": 7,
            "criteria": [
                {"criteria_type": "Research Interest", "description": "Demonstrated interest in ML or CS research", "required_value": "Research Experience", "is_mandatory": True},
                {"criteria_type": "CGPA", "description": "High academic distinction (CGPA >= 8.5)", "required_value": "8.5", "is_mandatory": True}
            ],
            "documents": [
                {"document_name": "Research Statement (SOP)", "description": "Detailed 2-page research interest proposal", "is_mandatory": True},
                {"document_name": "Resume / CV", "description": "Comprehensive academic CV", "is_mandatory": True},
                {"document_name": "Letters of Recommendation (LOR)", "description": "Two recommendation letters from professors", "is_mandatory": True}
            ]
        },
        {
            "title": "Smart India Hackathon",
            "organization": "Ministry of Education Innovation Cell & AICTE",
            "category": "Hackathon",
            "description": "Nationwide digital initiative where student teams solve critical real-world problem statements submitted by Ministries and Industries.",
            "official_url": "https://sih.gov.in",
            "application_deadline": now + timedelta(days=6, hours=16), # 6 days left -> Medium Risk
            "eligibility_summary": "6-member multidisciplinary college teams with at least one female teammate.",
            "education_level": "Undergraduate",
            "min_cgpa": 0.0,
            "required_skills": "React, Python, Cloud, Full Stack Development, Hardware / IoT",
            "is_verified": True,
            "verification_status": "Verified",
            "status": "Open",
            "prep_time_days": 3,
            "criteria": [
                {"criteria_type": "Team Structure", "description": "Team of 6 students from same institute", "required_value": "6 Members", "is_mandatory": True}
            ],
            "documents": [
                {"document_name": "Solution Pitch Deck", "description": "PPT format detailing architecture and tech stack", "is_mandatory": True},
                {"document_name": "College Authorization Letter", "description": "Signed by Principal / Head of Institute", "is_mandatory": True}
            ]
        },
        {
            "title": "AWS AI Cloud Fellowship",
            "organization": "Amazon Web Services",
            "category": "Fellowship",
            "description": "Hands-on immersion with generative AI models, Bedrock, SageMaker, and distributed cloud architectures with AWS mentor guidance.",
            "official_url": "https://aws.amazon.com/training/fellowships",
            "application_deadline": now + timedelta(days=19, hours=6), # 19 days left -> Low Risk
            "eligibility_summary": "Enrolled engineering students with foundational knowledge of cloud and machine learning.",
            "education_level": "Undergraduate / Graduate",
            "min_cgpa": 7.5,
            "required_skills": "Python, Cloud Architecture, AWS, Machine Learning, Git",
            "is_verified": True,
            "verification_status": "Verified",
            "status": "Open",
            "prep_time_days": 4,
            "criteria": [
                {"criteria_type": "Coursework", "description": "Completed coursework in operating systems or networks", "required_value": "Core CS", "is_mandatory": False}
            ],
            "documents": [
                {"document_name": "Technical Portfolio / GitHub", "description": "Links to deployed repositories", "is_mandatory": True},
                {"document_name": "Resume / CV", "description": "Current resume", "is_mandatory": True}
            ]
        },
        {
            "title": "ISRO Young Scientist Programme (YUVIKA)",
            "organization": "Indian Space Research Organisation (ISRO)",
            "category": "Internship",
            "description": "Special program to impart basic knowledge on Space Technology, Space Science, and Space Applications to young talents.",
            "official_url": "https://www.isro.gov.in/YUVIKA.html",
            "application_deadline": now + timedelta(days=1, hours=6), # 1 day left -> Critical Urgency / High Risk!
            "eligibility_summary": "Students with stellar academic records and passion for aerospace, robotics, and applied science.",
            "education_level": "Undergraduate / School",
            "min_cgpa": 8.0,
            "required_skills": "Mathematics, Physics, Python, Embedded Systems",
            "is_verified": True,
            "verification_status": "Verified",
            "status": "Closing Soon",
            "prep_time_days": 3,
            "criteria": [
                {"criteria_type": "Academic Standing", "description": "Top academic grades in previous examination", "required_value": "8.0+", "is_mandatory": True}
            ],
            "documents": [
                {"document_name": "Marksheet of Last Exam", "description": "Attested marksheet copy", "is_mandatory": True},
                {"document_name": "School / College ID Card", "description": "Valid student identity proof", "is_mandatory": True}
            ]
        }
    ]

    created_opps = []
    for o_data in opportunities_data:
        criteria_list = o_data.pop("criteria")
        docs_list = o_data.pop("documents")
        
        opp = models.Opportunity(**o_data)
        db.add(opp)
        db.flush()

        for c in criteria_list:
            crit = models.EligibilityCriteria(opportunity_id=opp.id, **c)
            db.add(crit)

        for d in docs_list:
            doc = models.RequiredDocument(opportunity_id=opp.id, **d)
            db.add(doc)

        created_opps.append(opp)

    db.flush()

    # 4. Generate Risk Assessments & Recommendations for User
    for opp in created_opps:
        # Match
        match_info = calculate_profile_match(profile, opp)
        rec = models.OpportunityRecommendation(
            user_id=user.id,
            opportunity_id=opp.id,
            match_percentage=match_info["overall_match"],
            reason=match_info["reason"],
            is_dismissed=False
        )
        db.add(rec)

        # Risk
        risk_info = calculate_risk_score(opp, profile)
        assessment = models.RiskAssessment(
            user_id=user.id,
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

    # 5. Bookmarks
    if len(created_opps) >= 2:
        bm1 = models.UserBookmark(user_id=user.id, opportunity_id=created_opps[0].id) # Google
        bm2 = models.UserBookmark(user_id=user.id, opportunity_id=created_opps[4].id) # Microsoft
        db.add(bm1)
        db.add(bm2)

    # 6. Notifications
    notifs = [
        models.Notification(
            user_id=user.id,
            opportunity_id=created_opps[7].id, # ISRO
            title="Critical Deadline Alert",
            message="ISRO Young Scientist Programme application closes in 24 hours. Submit today!",
            notification_type="Deadline",
            is_read=False
        ),
        models.Notification(
            user_id=user.id,
            opportunity_id=created_opps[0].id, # Google
            title="High Priority Opportunity Expiring",
            message="Google Summer Internship deadline approaches in 2 days. 3 required documents needed.",
            notification_type="Deadline",
            is_read=False
        ),
        models.Notification(
            user_id=user.id,
            opportunity_id=created_opps[4].id, # Microsoft
            title="Top Profile Match Discovered",
            message="Microsoft Research Fellowship matches your profile at 92%. Review and prepare research statement.",
            notification_type="Recommendation",
            is_read=True
        ),
        models.Notification(
            user_id=user.id,
            opportunity_id=None,
            title="System Alert",
            message="IBM Z / LinuxONE deployment health verified. Opportunity expiry risk models active.",
            notification_type="System",
            is_read=True
        )
    ]
    for n in notifs:
        db.add(n)

    db.commit()
    print("Database seeding completed successfully!")
