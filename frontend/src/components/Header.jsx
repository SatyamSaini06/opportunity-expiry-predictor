import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faChevronDown,
  faUser,
  faGear,
  faRightFromBracket
} from "@fortawesome/free-solid-svg-icons";

export default function Header({ user, onSearch, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const navigate = useNavigate();

  const displayName = user?.full_name || "Alex Chen";
  const initial = displayName.charAt(0).toUpperCase();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchVal);
    } else {
      navigate(`/opportunities?search=${encodeURIComponent(searchVal)}`);
    }
  };

  return (
    <header className="top-header">
      {/* Dynamic Greeting */}
      <div className="header-greeting-box">
        <h1 className="greeting-title">Hello, {displayName}!</h1>
        <p className="greeting-subtitle">Here are your personalized opportunities and alerts.</p>
      </div>

      {/* Right Actions */}
      <div className="header-right-actions">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="search-bar-container">
          <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: "#94A3B8", fontSize: "12px" }} />
          <input
            type="text"
            className="search-bar-input"
            placeholder="Search opportunities..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </form>

        {/* User Profile Trigger & Dropdown */}
        <div style={{ position: "relative" }}>
          <div
            className="user-profile-menu-trigger"
            onClick={() => setMenuOpen(!menuOpen)}
            role="button"
            tabIndex={0}
          >
            <div className="user-avatar-circle">{initial}</div>
            <span className="user-name-display">{displayName}</span>
            <FontAwesomeIcon icon={faChevronDown} className="user-menu-chevron" />
          </div>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: "8px",
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                width: "190px",
                zIndex: 200,
                padding: "6px 0"
              }}
            >
              <div
                style={{
                  padding: "8px 14px",
                  fontSize: "12px",
                  borderBottom: "1px solid #F1F5F9",
                  color: "#64748B"
                }}
              >
                Signed in as <br />
                <strong style={{ color: "#1E293B" }}>{user?.email || "student@university.edu"}</strong>
              </div>

              <button
                onClick={() => { setMenuOpen(false); navigate("/profile"); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "8px 14px",
                  fontSize: "12px",
                  color: "#1E293B",
                  textAlign: "left"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <FontAwesomeIcon icon={faUser} style={{ width: "14px", color: "#64748B" }} />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => { setMenuOpen(false); navigate("/settings"); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "8px 14px",
                  fontSize: "12px",
                  color: "#1E293B",
                  textAlign: "left"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <FontAwesomeIcon icon={faGear} style={{ width: "14px", color: "#64748B" }} />
                <span>Settings</span>
              </button>

              <div style={{ height: "1px", backgroundColor: "#F1F5F9", margin: "4px 0" }} />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  if (onLogout) onLogout();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "8px 14px",
                  fontSize: "12px",
                  color: "#DC2626",
                  textAlign: "left"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#FEF2F2"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <FontAwesomeIcon icon={faRightFromBracket} style={{ width: "14px", color: "#DC2626" }} />
                <span style={{ fontWeight: 600 }}>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
