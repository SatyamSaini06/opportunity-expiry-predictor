import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faChevronRight } from "@fortawesome/free-solid-svg-icons";

export default function QuickInsights({ insights = [] }) {
  const navigate = useNavigate();

  return (
    <div className="right-panel-card">
      <div className="right-card-header">
        <span className="right-card-title">
          <FontAwesomeIcon icon={faLightbulb} style={{ color: "#F59E0B", fontSize: "13px" }} />
          Quick Insights
        </span>
      </div>

      <div className="insights-bullet-list">
        {insights.length === 0 ? (
          <div style={{ color: "#94A3B8", fontSize: "11px" }}>
            Add opportunities or update your profile to generate AI insights.
          </div>
        ) : (
          insights.slice(0, 4).map((text, i) => (
            <div key={i} className="insights-bullet-item">
              <span className="insights-bullet-icon">•</span>
              <span>{text}</span>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        className="btn-solid-blue"
        style={{ width: "100%", marginTop: "4px", fontSize: "11px", padding: "6px 12px" }}
        onClick={() => navigate("/recommendations")}
      >
        <span>View Recommendations</span>
        <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: "9px" }} />
      </button>
    </div>
  );
}
