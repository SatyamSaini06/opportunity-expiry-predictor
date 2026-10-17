import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListCheck,
  faArrowRight,
  faCalendarDays,
  faBriefcase,
  faGraduationCap,
  faAward,
  faCode,
  faBuildingColumns
} from "@fortawesome/free-solid-svg-icons";
import RiskBadge from "./RiskBadge";

function getCategoryIcon(cat) {
  const c = (cat || "").toLowerCase();
  if (c.includes("internship")) return faBriefcase;
  if (c.includes("scholarship")) return faAward;
  if (c.includes("exam")) return faBuildingColumns;
  if (c.includes("hackathon")) return faCode;
  return faGraduationCap;
}

function formatDate(dateStr) {
  if (!dateStr) return "Not specified";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function UrgentOpportunitySection({ items = [], onViewDetails }) {
  return (
    <div className="content-card-box">
      <div className="content-card-header">
        <div className="section-title-wrapper">
          <FontAwesomeIcon icon={faListCheck} className="section-icon" />
          <h2 className="section-heading-text">Top Urgent Opportunities</h2>
        </div>
        <Link to="/opportunities" className="view-all-link">
          <span>View All</span>
          <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: "10px" }} />
        </Link>
      </div>

      <div className="urgent-items-list">
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#64748B", fontSize: "12px" }}>
            No urgent opportunities at this time. All tracked deadlines are well ahead!
          </div>
        ) : (
          items.slice(0, 4).map((opp) => {
            const days = opp.days_left;
            let daysClass = "normal";
            let daysText = `${days} days left`;

            if (days < 0) {
              daysClass = "critical";
              daysText = "Overdue";
            } else if (days <= 2) {
              daysClass = "critical";
              daysText = days === 0 ? "Closes Today" : `${days} day${days > 1 ? "s" : ""} left`;
            } else if (days <= 7) {
              daysClass = "warning";
              daysText = `${days} days left`;
            }

            return (
              <div key={opp.id} className="urgent-row-card">
                {/* Left Group: Icon + Title + Org */}
                <div className="urgent-left-group">
                  <div className="category-icon-bubble">
                    <FontAwesomeIcon icon={getCategoryIcon(opp.category)} />
                  </div>
                  <div className="urgent-info-meta">
                    <span className="urgent-title-text" title={opp.title}>{opp.title}</span>
                    <span className="urgent-org-tag">{opp.category} • {opp.organization}</span>
                  </div>
                </div>

                {/* Deadline Info */}
                <div className="urgent-deadline-group">
                  <FontAwesomeIcon icon={faCalendarDays} style={{ color: "#94A3B8" }} />
                  <span>{formatDate(opp.application_deadline)}</span>
                </div>

                {/* Days remaining badge */}
                <span className={`urgent-days-badge ${daysClass}`}>
                  {daysText}
                </span>

                {/* Risk Level Badge */}
                <RiskBadge level={opp.risk_level} score={opp.risk_score} />

                {/* Profile Match % */}
                <span className="badge-match">
                  {Math.round(opp.match_percentage)}% Match
                </span>

                {/* Outlined Blue View Button */}
                <button
                  type="button"
                  className="btn-outline-blue"
                  onClick={() => onViewDetails(opp)}
                >
                  View
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
