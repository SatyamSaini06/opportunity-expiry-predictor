import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faClock,
  faTriangleExclamation,
  faCircleCheck
} from "@fortawesome/free-solid-svg-icons";

export default function StatCardsRow({ summary }) {
  const cards = [
    {
      type: "blue",
      label: "Total Opportunities",
      value: summary?.total_opportunities ?? 0,
      subtext: "in your profile match",
      icon: faBriefcase
    },
    {
      type: "yellow",
      label: "Expiring Soon",
      value: summary?.expiring_soon ?? 0,
      subtext: "need your action",
      icon: faClock
    },
    {
      type: "red",
      label: "High Risk",
      value: summary?.high_risk ?? 0,
      subtext: "check immediately",
      icon: faTriangleExclamation
    },
    {
      type: "green",
      label: "Recommended for You",
      value: summary?.recommended_count ?? 0,
      subtext: "good match with your profile",
      icon: faCircleCheck
    }
  ];

  return (
    <div className="summary-cards-row">
      {cards.map((card, idx) => (
        <div key={idx} className={`summary-card ${card.type}`}>
          <div className="summary-card-header">
            <span className="summary-card-label">{card.label}</span>
            <div className="summary-card-icon">
              <FontAwesomeIcon icon={card.icon} />
            </div>
          </div>
          <div className="summary-card-number">{card.value}</div>
          <div className="summary-card-subtext">{card.subtext}</div>
        </div>
      ))}
    </div>
  );
}
