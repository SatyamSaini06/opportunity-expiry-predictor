import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faBuilding,
  faCalendarDays,
  faClock,
  faGraduationCap,
  faFileLines,
  faListCheck,
  faShieldHalved,
  faBookmark,
  faArrowUpRightFromSquare,
  faCircleCheck,
  faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons";
import RiskBadge from "./RiskBadge";
import { api } from "../services/api";

function formatDate(dateStr) {
  if (!dateStr) return "Not specified";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function OpportunityDetailModal({ opportunity, onClose, onBookmarkToggle }) {
  if (!opportunity) return null;

  const [isBookmarked, setIsBookmarked] = useState(opportunity.is_bookmarked || false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const handleToggleBookmark = async () => {
    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await api.removeBookmark(opportunity.id);
        setIsBookmarked(false);
      } else {
        await api.addBookmark(opportunity.id);
        setIsBookmarked(true);
      }
      if (onBookmarkToggle) onBookmarkToggle(opportunity.id, !isBookmarked);
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const days = opportunity.days_left;
  const riskScore = Math.round(opportunity.risk_score || 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                backgroundColor: "#EAF3FF",
                color: "#2563EB",
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "6px"
              }}
            >
              {opportunity.category}
            </span>
            <span style={{ fontSize: "12px", color: "#64748B" }}>
              {opportunity.organization}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              onClick={handleToggleBookmark}
              disabled={bookmarkLoading}
              style={{ color: isBookmarked ? "#2563EB" : "#94A3B8", fontSize: "16px" }}
              title={isBookmarked ? "Remove Bookmark" : "Save Opportunity"}
            >
              <FontAwesomeIcon icon={faBookmark} />
            </button>
            <button type="button" className="modal-close-btn" onClick={onClose}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>

        {/* Title & Organization */}
        <div>
          <h2 className="modal-title">{opportunity.title}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "6px", fontSize: "12px", color: "#64748B" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FontAwesomeIcon icon={faCalendarDays} style={{ color: "#2563EB" }} />
              <span>Deadline: <strong>{formatDate(opportunity.application_deadline)}</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FontAwesomeIcon icon={faClock} style={{ color: days <= 3 ? "#EF4444" : "#F59E0B" }} />
              <span style={{ fontWeight: 600, color: days <= 3 ? "#DC2626" : "#475569" }}>
                {days < 0 ? "Application Overdue" : days === 0 ? "Closes Today" : `${days} days remaining`}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ fontSize: "13px", color: "#334155", lineHeight: 1.6, backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px" }}>
          {opportunity.description}
        </div>

        {/* Explainable AI Risk Scoring Engine Breakdown */}
        <div
          style={{
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            padding: "14px",
            backgroundColor: "#FFFFFF"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FontAwesomeIcon icon={faShieldHalved} style={{ color: "#2563EB" }} />
              <strong style={{ fontSize: "13px", color: "#1E293B" }}>AI Risk Assessment & Urgency Analysis</strong>
            </div>
            <RiskBadge level={opportunity.risk_level} score={riskScore} />
          </div>

          <p style={{ fontSize: "11px", color: "#64748B", marginBottom: "12px" }}>
            Configured Application-Priority Formula: 40% Deadline Urgency + 30% Eligibility Match + 20% Prep Burden + 10% Verification.
          </p>

          {/* Contributing Reasons */}
          {opportunity.risk_reasons && opportunity.risk_reasons.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                Contributing Factors:
              </span>
              <ul style={{ listStyleType: "disc", paddingLeft: "18px", marginTop: "4px", fontSize: "12px", color: "#334155" }}>
                {opportunity.risk_reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Actions */}
          {opportunity.suggested_actions && opportunity.suggested_actions.length > 0 && (
            <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #DCFCE7", padding: "10px", borderRadius: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>
                Recommended Actions:
              </span>
              <ul style={{ listStyleType: "circle", paddingLeft: "18px", marginTop: "4px", fontSize: "12px", color: "#15803D" }}>
                {opportunity.suggested_actions.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Required Documents */}
        {opportunity.documents && opportunity.documents.length > 0 && (
          <div>
            <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#1E293B", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <FontAwesomeIcon icon={faFileLines} style={{ color: "#2563EB", fontSize: "12px" }} />
              Required Documents ({opportunity.documents.length})
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
              {opportunity.documents.map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "8px 10px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    backgroundColor: "#F8FAFC",
                    fontSize: "12px"
                  }}
                >
                  <strong style={{ color: "#1E293B" }}>{doc.name || doc.document_name}</strong>
                  {doc.description && (
                    <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                      {doc.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #E2E8F0", paddingTop: "14px", marginTop: "4px" }}>
          <div style={{ fontSize: "11px", color: "#64748B" }}>
            Verified Source Status: <strong style={{ color: opportunity.is_verified ? "#059669" : "#D97706" }}>{opportunity.verification_status || "Verified"}</strong>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" className="btn-outline-blue" onClick={onClose}>
              Close
            </button>
            {opportunity.official_url ? (
              <a
                href={opportunity.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-solid-blue"
              >
                <span>Apply on Official Portal</span>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: "10px" }} />
              </a>
            ) : (
              <button disabled className="btn-solid-blue" style={{ opacity: 0.6, cursor: "not-allowed" }}>
                Application Link Not Specified
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
