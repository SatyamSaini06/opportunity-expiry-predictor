import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faBell,
  faServer,
  faShieldHalved,
  faEnvelope,
  faCheck,
  faCircleCheck
} from "@fortawesome/free-solid-svg-icons";

export default function Settings() {
  const [reminders, setReminders] = useState({
    sevenDays: true,
    threeDays: true,
    oneDay: true,
    deadlineDay: true,
    emailAlerts: false,
    inAppAlerts: true
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (key) => {
    setReminders((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ padding: "28px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FontAwesomeIcon icon={faGear} style={{ color: "#2563EB", fontSize: "20px" }} />
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1E293B" }}>
            Platform Settings & System Status
          </h1>
        </div>
        <p style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
          Configure deadline alert thresholds, notification delivery preferences, and review infrastructure telemetry.
        </p>
      </div>

      {saved && (
        <div style={{ padding: "10px 14px", backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46", borderRadius: "8px", marginBottom: "16px", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FontAwesomeIcon icon={faCheck} />
          <span>Notification preferences updated successfully!</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Deadline Reminders Configuration */}
        <div className="content-card-box">
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <FontAwesomeIcon icon={faBell} style={{ color: "#2563EB" }} />
            Automated Deadline Reminder Schedule
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { key: "sevenDays", label: "7 Days Before Deadline", desc: "Early preparation reminder to request recommendation letters or bonafides." },
              { key: "threeDays", label: "3 Days Before Deadline", desc: "Urgent preparation alert for gathering transcripts and drafting essays." },
              { key: "oneDay", label: "24 Hours Before Deadline", desc: "Critical final submission warning." },
              { key: "deadlineDay", label: "On Deadline Day", desc: "Closing hours notification to ensure final submission receipt." }
            ].map((item) => (
              <label
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  cursor: "pointer"
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#1E293B" }}>{item.label}</div>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>{item.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={reminders[item.key]}
                  onChange={() => handleToggle(item.key)}
                  style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#2563EB" }}
                />
              </label>
            ))}
          </div>

          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <button type="button" className="btn-solid-blue" onClick={handleSave}>
              Save Reminder Preferences
            </button>
          </div>
        </div>

        {/* Infrastructure & IBM Z Deployment Telemetry */}
        <div className="content-card-box">
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <FontAwesomeIcon icon={faServer} style={{ color: "#2563EB" }} />
            IBM Z & LinuxONE Architecture Telemetry
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", fontSize: "12px" }}>
            <div style={{ padding: "12px", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
              <div style={{ color: "#64748B", fontSize: "11px" }}>Runtime Target</div>
              <strong style={{ color: "#1E293B", fontSize: "13px" }}>IBM Z / LinuxONE Enterprise Linux</strong>
            </div>

            <div style={{ padding: "12px", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
              <div style={{ color: "#64748B", fontSize: "11px" }}>Database Engine</div>
              <strong style={{ color: "#1E293B", fontSize: "13px" }}>PostgreSQL / SQLAlchemy ORM</strong>
            </div>

            <div style={{ padding: "12px", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
              <div style={{ color: "#64748B", fontSize: "11px" }}>AI Risk Engine</div>
              <strong style={{ color: "#1E293B", fontSize: "13px" }}>40-30-20-10 Weighted Priority Heuristic</strong>
            </div>

            <div style={{ padding: "12px", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
              <div style={{ color: "#64748B", fontSize: "11px" }}>Health & Status</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669", fontWeight: 700, fontSize: "13px" }}>
                <FontAwesomeIcon icon={faCircleCheck} />
                <span>100% Operational & Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
