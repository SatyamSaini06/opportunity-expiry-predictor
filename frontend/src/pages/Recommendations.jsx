import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faWandMagicSparkles,
  faCheck,
  faXmark,
  faBookmark,
  faCalendarDays,
  faClock
} from "@fortawesome/free-solid-svg-icons";
import OpportunityDetailModal from "../components/OpportunityDetailModal";
import RiskBadge from "../components/RiskBadge";
import { api } from "../services/api";

function formatDate(dateStr) {
  if (!dateStr) return "Not specified";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await api.getRecommendedOpportunities({ min_match: 60 });
      setRecommendations(data || []);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleDismiss = (id) => {
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
  };

  const handleBookmarkToggle = async (id) => {
    const opp = recommendations.find((o) => o.id === id);
    if (!opp) return;
    try {
      if (opp.is_bookmarked) {
        await api.removeBookmark(id);
      } else {
        await api.addBookmark(id);
      }
      setRecommendations((prev) =>
        prev.map((o) => (o.id === id ? { ...o, is_bookmarked: !o.is_bookmarked } : o))
      );
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    }
  };

  const filtered = recommendations.filter((r) => {
    if (categoryFilter === "All") return true;
    return r.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  return (
    <div style={{ padding: "28px", maxWidth: "1080px", margin: "0 auto" }}>
      <div style={{ marginBottom: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <FontAwesomeIcon icon={faStar} style={{ color: "#F59E0B", fontSize: "20px" }} />
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1E293B" }}>
            Personalized Opportunity Recommendations
          </h1>
        </div>
        <p style={{ fontSize: "12px", color: "#64748B" }}>
          Ranked by multi-dimensional profile alignment: education qualification, tech skills, career goals, and deadline proximity.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto" }}>
        {["All", "Internship", "Scholarship", "Exam", "Fellowship", "Hackathon"].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: categoryFilter === cat ? "#2563EB" : "#FFFFFF",
              color: categoryFilter === cat ? "#FFFFFF" : "#64748B",
              border: "1px solid #E2E8F0"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
          Evaluating profile matching algorithms...
        </div>
      ) : filtered.length === 0 ? (
        <div className="content-card-box" style={{ textAlign: "center", padding: "40px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B" }}>No recommendations in this category</h3>
          <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
            Update your skills and areas of interest in My Profile to broaden recommendations.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filtered.map((opp) => (
            <div
              key={opp.id}
              className="content-card-box"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                borderLeft: "4px solid #2563EB"
              }}
            >
              {/* Header: Title, Category, Match, Bookmark, Dismiss */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span
                      style={{
                        backgroundColor: "#EAF3FF",
                        color: "#2563EB",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: "4px"
                      }}
                    >
                      {opp.category}
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>{opp.organization}</span>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1E293B" }}>
                    {opp.title}
                  </h3>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      backgroundColor: "#ECFDF5",
                      color: "#059669",
                      padding: "4px 10px",
                      borderRadius: "999px"
                    }}
                  >
                    {Math.round(opp.match_percentage)}% Match
                  </span>

                  <button
                    type="button"
                    onClick={() => handleBookmarkToggle(opp.id)}
                    style={{ color: opp.is_bookmarked ? "#2563EB" : "#94A3B8", fontSize: "16px" }}
                    title={opp.is_bookmarked ? "Remove Bookmark" : "Save Opportunity"}
                  >
                    <FontAwesomeIcon icon={faBookmark} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDismiss(opp.id)}
                    style={{ color: "#94A3B8", fontSize: "14px" }}
                    title="Dismiss Recommendation"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              </div>

              {/* Explainable AI Reasoning Box */}
              <div
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  padding: "10px 14px",
                  fontSize: "12px",
                  color: "#334155"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px", color: "#2563EB", fontWeight: 700, fontSize: "11px", textTransform: "uppercase" }}>
                  <FontAwesomeIcon icon={faWandMagicSparkles} />
                  <span>Why this is recommended for you</span>
                </div>
                <div>{opp.match_reason || `Recommended because your profile qualifications align with ${opp.organization} criteria and required skill competencies.`}</div>
              </div>

              {/* Meta details & Action */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginTop: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "11px", color: "#64748B" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <FontAwesomeIcon icon={faCalendarDays} style={{ color: "#2563EB" }} />
                    <span>Deadline: {formatDate(opp.application_deadline)}</span>
                  </div>
                  <RiskBadge level={opp.risk_level} score={opp.risk_score} />
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="btn-outline-blue"
                    onClick={() => setSelectedOpp(opp)}
                  >
                    View Breakdown & Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOpp && (
        <OpportunityDetailModal
          opportunity={selectedOpp}
          onClose={() => setSelectedOpp(null)}
          onBookmarkToggle={(id, status) => {
            setRecommendations((prev) =>
              prev.map((o) => (o.id === id ? { ...o, is_bookmarked: status } : o))
            );
          }}
        />
      )}
    </div>
  );
}
