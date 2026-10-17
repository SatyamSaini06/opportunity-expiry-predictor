import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faShieldHalved,
  faCircleCheck
} from "@fortawesome/free-solid-svg-icons";

export default function RiskBadge({ level, score, showIcon = true }) {
  const normLevel = (level || "Medium Risk").toLowerCase();
  
  let badgeClass = "medium";
  let icon = faShieldHalved;

  if (normLevel.includes("high")) {
    badgeClass = "high";
    icon = faTriangleExclamation;
  } else if (normLevel.includes("low")) {
    badgeClass = "low";
    icon = faCircleCheck;
  }

  return (
    <span className={`badge-risk ${badgeClass}`}>
      {showIcon && <FontAwesomeIcon icon={icon} style={{ fontSize: "10px" }} />}
      <span>{level || "Medium Risk"}</span>
      {score !== undefined && score !== null && (
        <span style={{ opacity: 0.85, fontWeight: 700 }}>({Math.round(score)})</span>
      )}
    </span>
  );
}
