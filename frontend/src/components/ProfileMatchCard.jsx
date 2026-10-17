import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faGraduationCap, faCode, faHeart, faBullseye } from "@fortawesome/free-solid-svg-icons";

export default function ProfileMatchCard({ matchData }) {
  const navigate = useNavigate();

  const overall = matchData?.overall ?? 78;
  const education = matchData?.education ?? 90;
  const skills = matchData?.skills ?? 70;
  const interests = matchData?.interests ?? 80;
  const careerGoals = matchData?.career_goals ?? 75;

  // SVG circular progress calculation
  const size = 96;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overall / 100) * circumference;

  return (
    <div
      className="right-panel-card"
      onClick={() => navigate("/profile")}
      style={{ cursor: "pointer" }}
      title="Click to view and edit profile"
    >
      <div className="right-card-header">
        <span className="right-card-title">Your Profile Match</span>
        <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: "11px", color: "#94A3B8" }} />
      </div>

      <div className="circular-match-container">
        <div className="radial-progress-ring">
          <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#E2E8F0"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#2563EB"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div style={{ position: "absolute", textAlign: "center" }}>
            <span className="ring-percent-text">{overall}%</span>
          </div>
        </div>
        <span className="match-subtitle">Overall Match</span>
      </div>

      <div className="profile-dims-list">
        <div className="dim-row">
          <div className="dim-label-with-dot">
            <span className="dim-dot blue"></span>
            <span>Education</span>
          </div>
          <strong style={{ color: "#1E293B" }}>{education}%</strong>
        </div>

        <div className="dim-row">
          <div className="dim-label-with-dot">
            <span className="dim-dot green"></span>
            <span>Skills</span>
          </div>
          <strong style={{ color: "#1E293B" }}>{skills}%</strong>
        </div>

        <div className="dim-row">
          <div className="dim-label-with-dot">
            <span className="dim-dot amber"></span>
            <span>Interests</span>
          </div>
          <strong style={{ color: "#1E293B" }}>{interests}%</strong>
        </div>

        <div className="dim-row">
          <div className="dim-label-with-dot">
            <span className="dim-dot purple"></span>
            <span>Career Goals</span>
          </div>
          <strong style={{ color: "#1E293B" }}>{careerGoals}%</strong>
        </div>
      </div>
    </div>
  );
}
