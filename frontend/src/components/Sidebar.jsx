import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faUser,
  faBriefcase,
  faStar,
  faBell,
  faGear,
  faCalendarDays,
  faServer,
  faRightFromBracket
} from "@fortawesome/free-solid-svg-icons";

export default function Sidebar({ unreadAlertsCount = 0, onLogout }) {
  const navItems = [
    { name: "Dashboard", path: "/", icon: faHouse },
    { name: "My Profile", path: "/profile", icon: faUser },
    { name: "Opportunities", path: "/opportunities", icon: faBriefcase },
    { name: "Recommendations", path: "/recommendations", icon: faStar },
    { name: "Alerts", path: "/alerts", icon: faBell, badge: unreadAlertsCount },
    { name: "Settings", path: "/settings", icon: faGear },
  ];

  return (
    <aside className="app-sidebar" aria-label="Sidebar Navigation">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-wrapper">
          <FontAwesomeIcon icon={faCalendarDays} />
        </div>
        <div className="brand-title">
          <span className="brand-name-1">Opportunity</span>
          <span className="brand-name-2">Expiry Predictor</span>
        </div>
      </div>

      {/* Navigation Links in Exact Order */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}
            end={item.path === "/"}
          >
            <FontAwesomeIcon icon={item.icon} className="nav-icon" />
            <span>{item.name}</span>
            {item.badge > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  background: "#EF4444",
                  color: "#FFFFFF",
                  fontSize: "10px",
                  fontWeight: "700",
                  padding: "1px 6px",
                  borderRadius: "999px"
                }}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="nav-link-item"
            style={{
              marginTop: "auto",
              marginBottom: "8px",
              width: "100%",
              cursor: "pointer",
              color: "#F87171",
              border: "none",
              background: "transparent"
            }}
            title="Sign out of Opportunity Expiry Predictor"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="nav-icon" style={{ color: "#EF4444" }} />
            <span style={{ color: "#FCA5A5" }}>Log Out</span>
          </button>
        )}
      </nav>

      {/* Footer Informational Panel */}
      <div className="sidebar-footer-panel">
        <div className="footer-panel-header">
          <FontAwesomeIcon icon={faServer} />
          <span>IBM Z / LinuxONE</span>
        </div>
        <div className="footer-panel-text">
          Deployed on IBM Z for a smarter tomorrow.
        </div>
      </div>
    </aside>
  );
}
