import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheckDouble,
  faTriangleExclamation,
  faCircleCheck,
  faCalendarDays,
  faServer,
  faClock
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../services/api";

function formatTimestamp(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Alerts({ onAlertsChanged }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // 'all', 'unread', 'deadline'

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setAlerts(data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setAlerts((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      if (onAlertsChanged) onAlertsChanged();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setAlerts((prev) => prev.map((n) => ({ ...n, is_read: true })));
      if (onAlertsChanged) onAlertsChanged();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const filtered = alerts.filter((n) => {
    if (filterType === "unread") return !n.is_read;
    if (filterType === "deadline") return n.notification_type === "Deadline";
    return true;
  });

  const unreadCount = alerts.filter((n) => !n.is_read).length;

  return (
    <div style={{ padding: "28px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FontAwesomeIcon icon={faBell} style={{ color: "#2563EB", fontSize: "20px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1E293B" }}>
              Notification & Alert Center
            </h1>
          </div>
          <p style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
            Real-time deadline tracking, critical urgency warnings, and matching alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="btn-outline-blue"
            onClick={handleMarkAllRead}
            style={{ fontSize: "12px" }}
          >
            <FontAwesomeIcon icon={faCheckDouble} style={{ marginRight: "6px" }} />
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          type="button"
          onClick={() => setFilterType("all")}
          style={{
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            backgroundColor: filterType === "all" ? "#2563EB" : "#FFFFFF",
            color: filterType === "all" ? "#FFFFFF" : "#64748B",
            border: "1px solid #E2E8F0"
          }}
        >
          All Alerts ({alerts.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType("unread")}
          style={{
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            backgroundColor: filterType === "unread" ? "#2563EB" : "#FFFFFF",
            color: filterType === "unread" ? "#FFFFFF" : "#64748B",
            border: "1px solid #E2E8F0"
          }}
        >
          Unread ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterType("deadline")}
          style={{
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            backgroundColor: filterType === "deadline" ? "#2563EB" : "#FFFFFF",
            color: filterType === "deadline" ? "#FFFFFF" : "#64748B",
            border: "1px solid #E2E8F0"
          }}
        >
          Deadlines
        </button>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
          Loading alerts...
        </div>
      ) : filtered.length === 0 ? (
        <div className="content-card-box" style={{ textAlign: "center", padding: "40px" }}>
          <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: "28px", color: "#10B981", marginBottom: "8px" }} />
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B" }}>All caught up!</h3>
          <p style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
            No notifications matching this filter.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              className="content-card-box"
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "14px",
                padding: "14px 18px",
                backgroundColor: item.is_read ? "#FFFFFF" : "#F0F7FF",
                borderLeft: item.notification_type === "Deadline" ? "4px solid #EF4444" : "4px solid #2563EB"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: item.notification_type === "Deadline" ? "#FEE2E2" : "#DBEAFE",
                    color: item.notification_type === "Deadline" ? "#DC2626" : "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    flexShrink: 0
                  }}
                >
                  <FontAwesomeIcon icon={item.notification_type === "Deadline" ? faClock : faBell} />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#1E293B" }}>
                      {item.title}
                    </h3>
                    {!item.is_read && (
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          backgroundColor: "#2563EB",
                          color: "#FFFFFF",
                          padding: "1px 6px",
                          borderRadius: "999px"
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "12px", color: "#475569", marginTop: "2px", lineHeight: 1.45 }}>
                    {item.message}
                  </p>
                  <span style={{ fontSize: "10px", color: "#94A3B8", marginTop: "4px", display: "inline-block" }}>
                    {formatTimestamp(item.created_at)}
                  </span>
                </div>
              </div>

              {!item.is_read && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(item.id)}
                  style={{
                    fontSize: "11px",
                    color: "#2563EB",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    cursor: "pointer"
                  }}
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
