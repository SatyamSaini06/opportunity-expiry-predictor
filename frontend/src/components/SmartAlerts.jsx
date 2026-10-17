import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faArrowRight, faCircle } from "@fortawesome/free-solid-svg-icons";

export default function SmartAlerts({ alerts = [], onMarkRead }) {
  const navigate = useNavigate();

  const latestAlert = alerts.length > 0 ? alerts[0] : {
    title: "New Opportunities Added",
    message: "New opportunities matching your profile have been added.",
    type: "Recommendation",
    is_read: false
  };

  return (
    <div className="right-panel-card soft-blue">
      <div className="right-card-header">
        <span className="right-card-title" style={{ color: "#1E3A8A" }}>
          <FontAwesomeIcon icon={faBell} style={{ color: "#2563EB", fontSize: "12px" }} />
          Smart Alerts
        </span>
        <Link to="/alerts" className="view-all-link" style={{ fontSize: "11px" }}>
          <span>View all</span>
          <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: "9px" }} />
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          cursor: "pointer"
        }}
        onClick={() => navigate("/alerts")}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#1E293B" }}>
            {latestAlert.title}
          </span>
          {!latestAlert.is_read && (
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "#2563EB",
                display: "inline-block"
              }}
              title="Unread notification"
            />
          )}
        </div>
        <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.4 }}>
          {latestAlert.message}
        </p>
      </div>

      {alerts.length > 1 && (
        <div style={{ fontSize: "10px", color: "#64748B", marginTop: "2px" }}>
          + {alerts.length - 1} more alert{alerts.length > 2 ? "s" : ""} pending
        </div>
      )}
    </div>
  );
}
