import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faGraduationCap,
  faCode,
  faBriefcase,
  faBullseye,
  faCheck,
  faFloppyDisk
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../services/api";

export default function MyProfile({ onProfileUpdated }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    educational_qualification: "Bachelor of Technology",
    college_university: "",
    degree_branch: "Computer Science & Engineering",
    graduation_year: 2027,
    cgpa: 8.5,
    technical_skills: "",
    areas_of_interest: "",
    preferred_categories: "Internship, Scholarship, Hackathon",
    preferred_job_roles: "Software Engineer Intern, AI Research Fellow",
    career_goals: "",
    location_preferences: "Remote, Bangalore, Hyderabad",
    certifications: "",
    experience_projects: "",
    profile_completion_pct: 75.0
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getUserProfile();
      setFormData({
        full_name: data.full_name || "",
        email: data.email || "",
        educational_qualification: data.profile.educational_qualification || "",
        college_university: data.profile.college_university || "",
        degree_branch: data.profile.degree_branch || "",
        graduation_year: data.profile.graduation_year || 2027,
        cgpa: data.profile.cgpa || 8.0,
        technical_skills: data.profile.technical_skills || "",
        areas_of_interest: data.profile.areas_of_interest || "",
        preferred_categories: data.profile.preferred_categories || "",
        preferred_job_roles: data.profile.preferred_job_roles || "",
        career_goals: data.profile.career_goals || "",
        location_preferences: data.profile.location_preferences || "",
        certifications: data.profile.certifications || "",
        experience_projects: data.profile.experience_projects || "",
        profile_completion_pct: data.profile.profile_completion_pct || 75.0
      });
    } catch (err) {
      console.error("Failed to load user profile:", err);
      setErrorMessage("Could not fetch user profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "graduation_year" ? parseInt(value) || 2027 : name === "cgpa" ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await api.updateUserProfile(formData);
      setSuccessMessage("Profile saved successfully! AI opportunity matching and risk scores have been recalculated.");
      setFormData((prev) => ({
        ...prev,
        profile_completion_pct: res.profile_completion_pct || prev.profile_completion_pct
      }));
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setErrorMessage(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
        Loading user profile details...
      </div>
    );
  }

  const completion = Math.round(formData.profile_completion_pct || 75);

  return (
    <div style={{ padding: "28px", maxWidth: "980px", margin: "0 auto" }}>
      {/* Page Title & Profile Completion Bar */}
      <div className="content-card-box" style={{ marginBottom: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1E293B" }}>My Profile & Preferences</h1>
            <p style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
              Configure your academic standing, technical competencies, and career goals for precision opportunity matching.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "12px", color: "#64748B" }}>Profile Completeness</span>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#2563EB" }}>{completion}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: "100%", height: "8px", backgroundColor: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
          <div
            style={{
              width: `${completion}%`,
              height: "100%",
              backgroundColor: "#2563EB",
              borderRadius: "999px",
              transition: "width 0.4s ease"
            }}
          />
        </div>
      </div>

      {successMessage && (
        <div style={{ padding: "12px 16px", backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46", borderRadius: "8px", marginBottom: "20px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FontAwesomeIcon icon={faCheck} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: "12px 16px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", borderRadius: "8px", marginBottom: "20px", fontSize: "13px" }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        {/* Section 1: Personal & Basic Info */}
        <div className="content-card-box">
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <FontAwesomeIcon icon={faUser} style={{ color: "#2563EB" }} />
            Personal & Contact Details
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                required
                className="table-filter-input"
                style={{ width: "100%" }}
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                className="table-filter-input"
                style={{ width: "100%", backgroundColor: "#F8FAFC", cursor: "not-allowed" }}
                value={formData.email}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Education & Academic Records */}
        <div className="content-card-box">
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <FontAwesomeIcon icon={faGraduationCap} style={{ color: "#2563EB" }} />
            Academic Background
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                Educational Qualification *
              </label>
              <select
                name="educational_qualification"
                className="table-filter-select"
                style={{ width: "100%" }}
                value={formData.educational_qualification}
                onChange={handleChange}
              >
                <option value="Bachelor of Technology">Bachelor of Technology (B.Tech / B.E.)</option>
                <option value="Bachelor of Science">Bachelor of Science (B.Sc)</option>
                <option value="Bachelor of Computer Applications">Bachelor of Computer Applications (BCA)</option>
                <option value="Master of Technology">Master of Technology (M.Tech)</option>
                <option value="Master of Science">Master of Science (M.Sc / MS)</option>
                <option value="Doctor of Philosophy">Doctor of Philosophy (Ph.D.)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                College or University *
              </label>
              <input
                type="text"
                name="college_university"
                required
                className="table-filter-input"
                style={{ width: "100%" }}
                placeholder="e.g. National Institute of Technology"
                value={formData.college_university}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                Degree & Branch *
              </label>
              <input
                type="text"
                name="degree_branch"
                required
                className="table-filter-input"
                style={{ width: "100%" }}
                placeholder="e.g. Computer Science & Engineering"
                value={formData.degree_branch}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                Graduation Year *
              </label>
              <input
                type="number"
                name="graduation_year"
                min="2024"
                max="2032"
                required
                className="table-filter-input"
                style={{ width: "100%" }}
                value={formData.graduation_year}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                CGPA / Percentage (out of 10) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="cgpa"
                required
                className="table-filter-input"
                style={{ width: "100%" }}
                value={formData.cgpa}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                Location Preferences
              </label>
              <input
                type="text"
                name="location_preferences"
                className="table-filter-input"
                style={{ width: "100%" }}
                placeholder="e.g. Remote, Bangalore, Delhi"
                value={formData.location_preferences}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Technical Skills & Certifications */}
        <div className="content-card-box">
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <FontAwesomeIcon icon={faCode} style={{ color: "#2563EB" }} />
            Technical Competencies & Certifications
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                Technical Skills (Comma separated) *
              </label>
              <input
                type="text"
                name="technical_skills"
                required
                className="table-filter-input"
                style={{ width: "100%" }}
                placeholder="Python, React, Machine Learning, Data Structures, SQL, Cloud Architecture"
                value={formData.technical_skills}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                Certifications & Achievements
              </label>
              <input
                type="text"
                name="certifications"
                className="table-filter-input"
                style={{ width: "100%" }}
                placeholder="AWS Certified Cloud Practitioner, DeepLearning.AI Specialization"
                value={formData.certifications}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                Experience & Significant Projects
              </label>
              <textarea
                name="experience_projects"
                rows={3}
                className="table-filter-input"
                style={{ width: "100%", padding: "8px" }}
                placeholder="Built AI opportunity predictor dashboard, contributed to open-source libraries..."
                value={formData.experience_projects}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Preferences & Career Goals */}
        <div className="content-card-box">
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <FontAwesomeIcon icon={faBullseye} style={{ color: "#2563EB" }} />
            Opportunity Preferences & Career Goals
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                Preferred Opportunity Categories
              </label>
              <input
                type="text"
                name="preferred_categories"
                className="table-filter-input"
                style={{ width: "100%" }}
                placeholder="Internship, Scholarship, Hackathon, Fellowship"
                value={formData.preferred_categories}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                Preferred Job / Internship Roles
              </label>
              <input
                type="text"
                name="preferred_job_roles"
                className="table-filter-input"
                style={{ width: "100%" }}
                placeholder="Software Engineer Intern, AI Research Fellow"
                value={formData.preferred_job_roles}
                onChange={handleChange}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                Career Goals & Aspirations
              </label>
              <input
                type="text"
                name="career_goals"
                className="table-filter-input"
                style={{ width: "100%" }}
                placeholder="Build cutting-edge AI systems and lead high-impact engineering teams"
                value={formData.career_goals}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={saving}
            className="btn-solid-blue"
            style={{ padding: "10px 24px", fontSize: "14px" }}
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
            <span>{saving ? "Saving Profile..." : "Save Profile"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
