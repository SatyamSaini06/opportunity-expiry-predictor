import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faFilter,
  faPlus,
  faBookmark,
  faCalendarDays,
  faArrowUpRightFromSquare,
  faBuilding,
  faTable,
  faGrip
} from "@fortawesome/free-solid-svg-icons";
import OpportunityTable from "../components/OpportunityTable";
import OpportunityDetailModal from "../components/OpportunityDetailModal";
import ExtractModal from "../components/ExtractModal";
import RiskBadge from "../components/RiskBadge";
import { api } from "../services/api";

function formatDate(dateStr) {
  if (!dateStr) return "Not specified";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [showExtractModal, setShowExtractModal] = useState(false);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [activeFilterCategory, setActiveFilterCategory] = useState("All");

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.getOpportunities({ limit: 100 });
      setOpportunities(res.items || []);
    } catch (err) {
      console.error("Failed to fetch opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const handleBookmarkToggle = async (oppId) => {
    const opp = opportunities.find((o) => o.id === oppId);
    if (!opp) return;
    try {
      if (opp.is_bookmarked) {
        await api.removeBookmark(oppId);
      } else {
        await api.addBookmark(oppId);
      }
      setOpportunities((prev) =>
        prev.map((o) => (o.id === oppId ? { ...o, is_bookmarked: !o.is_bookmarked } : o))
      );
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    }
  };

  const categories = ["All", "Internship", "Scholarship", "Exam", "Fellowship", "Hackathon", "Job"];

  const filteredOpportunities = opportunities.filter((opp) => {
    if (activeFilterCategory === "All") return true;
    return opp.category.toLowerCase() === activeFilterCategory.toLowerCase();
  });

  return (
    <div style={{ padding: "28px" }}>
      {/* Top Header & Extract Trigger */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1E293B" }}>Explore Opportunities</h1>
          <p style={{ fontSize: "12px", color: "#64748B" }}>
            Discover and evaluate verified internships, scholarships, fellowships, hackathons, and exams.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Toggle View Mode */}
          <div style={{ display: "flex", border: "1px solid #E2E8F0", borderRadius: "8px", overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                backgroundColor: viewMode === "cards" ? "#2563EB" : "#FFFFFF",
                color: viewMode === "cards" ? "#FFFFFF" : "#64748B"
              }}
              title="Card Grid View"
            >
              <FontAwesomeIcon icon={faGrip} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                backgroundColor: viewMode === "table" ? "#2563EB" : "#FFFFFF",
                color: viewMode === "table" ? "#FFFFFF" : "#64748B"
              }}
              title="Table View"
            >
              <FontAwesomeIcon icon={faTable} />
            </button>
          </div>

          {/* Upload / AI Extract Button */}
          <button
            type="button"
            className="btn-solid-blue"
            onClick={() => setShowExtractModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>AI Notice Extractor</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "14px", marginBottom: "10px" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveFilterCategory(cat)}
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: activeFilterCategory === cat ? "#2563EB" : "#FFFFFF",
              color: activeFilterCategory === cat ? "#FFFFFF" : "#64748B",
              border: activeFilterCategory === cat ? "1px solid #2563EB" : "1px solid #E2E8F0",
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main View Area */}
      {viewMode === "table" ? (
        <OpportunityTable
          opportunities={filteredOpportunities}
          loading={loading}
          onViewDetails={(opp) => setSelectedOpp(opp)}
        />
      ) : (
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "50px", color: "#64748B" }}>
              Loading opportunities...
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="content-card-box" style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontWeight: 600, fontSize: "15px", color: "#1E293B" }}>
                No opportunities found in this category
              </div>
              <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
                Try selecting "All" or upload a new opportunity notice using the AI extractor.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
                gap: "18px"
              }}
            >
              {filteredOpportunities.map((opp) => {
                const days = opp.days_left;
                let daysBadgeColor = "#D1FAE5";
                let daysTextColor = "#065F46";
                if (days < 0) {
                  daysBadgeColor = "#FEE2E2";
                  daysTextColor = "#991B1B";
                } else if (days <= 2) {
                  daysBadgeColor = "#FEE2E2";
                  daysTextColor = "#991B1B";
                } else if (days <= 7) {
                  daysBadgeColor = "#FEF3C7";
                  daysTextColor = "#92400E";
                }

                return (
                  <div
                    key={opp.id}
                    className="content-card-box"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "12px",
                      transition: "transform 0.18s ease, box-shadow 0.18s ease"
                    }}
                  >
                    <div>
                      {/* Card Top: Category & Bookmark */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#2563EB",
                            backgroundColor: "#EAF3FF",
                            padding: "2px 8px",
                            borderRadius: "6px"
                          }}
                        >
                          {opp.category}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleBookmarkToggle(opp.id)}
                          style={{ color: opp.is_bookmarked ? "#2563EB" : "#94A3B8", fontSize: "15px" }}
                          title={opp.is_bookmarked ? "Remove Bookmark" : "Save Opportunity"}
                        >
                          <FontAwesomeIcon icon={faBookmark} />
                        </button>
                      </div>

                      {/* Title & Organization */}
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B", lineHeight: 1.3, marginBottom: "4px" }}>
                        {opp.title}
                      </h3>
                      <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "10px" }}>
                        {opp.organization}
                      </div>

                      {/* Description preview */}
                      <p style={{ fontSize: "12px", color: "#475569", lineHeight: 1.45, marginBottom: "12px" }}>
                        {opp.description.slice(0, 120)}...
                      </p>

                      {/* Deadline & Remaining Badge */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "#64748B", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <FontAwesomeIcon icon={faCalendarDays} style={{ color: "#2563EB" }} />
                          <span>{formatDate(opp.application_deadline)}</span>
                        </div>

                        <span
                          style={{
                            backgroundColor: daysBadgeColor,
                            color: daysTextColor,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "999px"
                          }}
                        >
                          {days < 0 ? "Expired" : days === 0 ? "Closes Today" : `${days}d left`}
                        </span>
                      </div>

                      {/* Badges: Risk & Match */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <RiskBadge level={opp.risk_level} score={opp.risk_score} />
                        <span className="badge-match">{Math.round(opp.match_percentage)}% Match</span>
                      </div>
                    </div>

                    {/* Footer Button */}
                    <div style={{ display: "flex", gap: "8px", borderTop: "1px solid #F1F5F9", paddingTop: "12px" }}>
                      <button
                        type="button"
                        className="btn-solid-blue"
                        style={{ flex: 1, padding: "6px" }}
                        onClick={() => setSelectedOpp(opp)}
                      >
                        View Full Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Opportunity Detail Modal */}
      {selectedOpp && (
        <OpportunityDetailModal
          opportunity={selectedOpp}
          onClose={() => setSelectedOpp(null)}
          onBookmarkToggle={(oppId, status) => {
            setOpportunities((prev) =>
              prev.map((o) => (o.id === oppId ? { ...o, is_bookmarked: status } : o))
            );
          }}
        />
      )}

      {/* Extract Modal */}
      {showExtractModal && (
        <ExtractModal
          onClose={() => setShowExtractModal(false)}
          onExtractedSaved={() => {
            loadOpportunities();
          }}
        />
      )}
    </div>
  );
}
