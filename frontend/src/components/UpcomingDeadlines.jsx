import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faArrowRight,
  faBriefcase,
  faAward,
  faBuildingColumns,
  faCode,
  faGraduationCap
} from "@fortawesome/free-solid-svg-icons";

function getCategoryIcon(cat) {
  const c = (cat || "").toLowerCase();
  if (c.includes("internship")) return faBriefcase;
  if (c.includes("scholarship")) return faAward;
  if (c.includes("exam")) return faBuildingColumns;
  if (c.includes("hackathon")) return faCode;
  return faGraduationCap;
}

export default function UpcomingDeadlines({ items = [], onSelectOpp }) {
  // Take next 4 sorted by days_left
  const nextDeadlines = items
    .filter((opp) => opp.days_left >= 0)
    .sort((a, b) => a.days_left - b.days_left)
    .slice(0, 4);

  return (
    <div className="right-panel-card">
      <div className="right-card-header">
        <span className="right-card-title">
          <FontAwesomeIcon icon={faCalendarCheck} style={{ color: "#2563EB", fontSize: "12px" }} />
          Upcoming Deadlines
        </span>
        <Link to="/opportunities" className="view-all-link" style={{ fontSize: "11px" }}>
          <span>View All</span>
          <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: "9px" }} />
        </Link>
      </div>

      <div className="upcoming-deadlines-list">
        {nextDeadlines.length === 0 ? (
          <div style={{ fontSize: "11px", color: "#94A3B8", textAlign: "center", padding: "10px 0" }}>
            No upcoming deadlines
          </div>
        ) : (
          nextDeadlines.map((opp) => {
            const days = opp.days_left;
            let badgeBg = "#D1FAE5";
            let badgeColor = "#065F46";

            if (days <= 2) {
              badgeBg = "#FEE2E2";
              badgeColor = "#991B1B";
            } else if (days <= 7) {
              badgeBg = "#FEF3C7";
              badgeColor = "#92400E";
            }

            return (
              <div
                key={opp.id}
                className="upcoming-mini-row"
                style={{ cursor: "pointer", padding: "4px 0" }}
                onClick={() => onSelectOpp && onSelectOpp(opp)}
                title={`Click to view details for ${opp.title}`}
              >
                <div style={{ display: "flex", alignitems: "center", gap: "6px", minWidth: 0 }}>
                  <FontAwesomeIcon
                    icon={getCategoryIcon(opp.category)}
                    style={{ color: "#64748B", fontSize: "11px", flexShrink: 0, marginTop: "2px" }}
                  />
                  <span className="upcoming-mini-title">{opp.title}</span>
                </div>

                <span
                  style={{
                    backgroundColor: badgeBg,
                    color: badgeColor,
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "999px",
                    whiteSpace: "nowrap"
                  }}
                >
                  {days === 0 ? "Today" : `${days} days left`}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
