import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faBriefcase,
  faAward,
  faBuildingColumns,
  faCode,
  faGraduationCap,
  faArrowsUpDown,
  faRotateLeft
} from "@fortawesome/free-solid-svg-icons";

function getCategoryIcon(cat) {
  const c = (cat || "").toLowerCase();
  if (c.includes("internship")) return faBriefcase;
  if (c.includes("scholarship")) return faAward;
  if (c.includes("exam")) return faBuildingColumns;
  if (c.includes("hackathon")) return faCode;
  return faGraduationCap;
}

function formatDate(dateStr) {
  if (!dateStr) return "Not specified";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function OpportunityTable({
  opportunities = [],
  loading = false,
  onViewDetails,
  onFilterChange
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [sortField, setSortField] = useState("deadline");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter logic
  let filtered = opportunities.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      categoryFilter === "All" ||
      item.category.toLowerCase() === categoryFilter.toLowerCase();

    const matchesRisk =
      riskFilter === "All" ||
      item.risk_level.toLowerCase() === riskFilter.toLowerCase();

    return matchesSearch && matchesCat && matchesRisk;
  });

  // Sort logic
  filtered.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === "deadline") {
      valA = a.days_left;
      valB = b.days_left;
    } else if (sortField === "risk_score") {
      valA = a.risk_score;
      valB = b.risk_score;
    } else if (sortField === "match") {
      valA = a.match_percentage;
      valB = b.match_percentage;
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setRiskFilter("All");
    setSortField("deadline");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const displayedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="content-card-box">
      {/* Table Header with Title & Filter Controls */}
      <div className="content-card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
        <h2 className="section-heading-text">All Opportunities</h2>

        <div className="table-header-controls">
          <input
            type="text"
            className="table-filter-input"
            placeholder="Search title or category..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ width: "190px" }}
          />

          <select
            className="table-filter-select"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">All Categories</option>
            <option value="Internship">Internship</option>
            <option value="Scholarship">Scholarship</option>
            <option value="Exam">Exam</option>
            <option value="Fellowship">Fellowship</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Job">Job</option>
          </select>

          <select
            className="table-filter-select"
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">All Risk Levels</option>
            <option value="High Risk">High Risk</option>
            <option value="Medium Risk">Medium Risk</option>
            <option value="Low Risk">Low Risk</option>
          </select>

          <button
            type="button"
            className="table-clear-btn"
            onClick={handleClearFilters}
            title="Clear all filters"
          >
            <FontAwesomeIcon icon={faRotateLeft} style={{ marginRight: "4px" }} />
            Clear
          </button>
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="table-responsive-wrapper">
        <table className="opportunity-data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th
                onClick={() => handleSortToggle("deadline")}
                style={{ cursor: "pointer" }}
                title="Sort by deadline"
              >
                Deadline <FontAwesomeIcon icon={faArrowsUpDown} style={{ fontSize: "10px", marginLeft: "4px" }} />
              </th>
              <th>Days Left</th>
              <th
                onClick={() => handleSortToggle("risk_score")}
                style={{ cursor: "pointer" }}
                title="Sort by risk score"
              >
                Risk Score <FontAwesomeIcon icon={faArrowsUpDown} style={{ fontSize: "10px", marginLeft: "4px" }} />
              </th>
              <th
                onClick={() => handleSortToggle("match")}
                style={{ cursor: "pointer" }}
                title="Sort by match %"
              >
                Match % <FontAwesomeIcon icon={faArrowsUpDown} style={{ fontSize: "10px", marginLeft: "4px" }} />
              </th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#64748B" }}>
                  Loading opportunities from database...
                </td>
              </tr>
            ) : displayedItems.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "36px", color: "#64748B" }}>
                  <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
                    No opportunities match your current filters.
                  </div>
                  <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                    Try adjusting the search query or selecting "All Categories".
                  </div>
                </td>
              </tr>
            ) : (
              displayedItems.map((opp) => {
                const days = opp.days_left;
                let daysColor = "#10B981";
                if (days < 0) daysColor = "#EF4444";
                else if (days <= 2) daysColor = "#EF4444";
                else if (days <= 7) daysColor = "#F59E0B";

                let statusClass = "open";
                let statusLabel = opp.status || "Open";
                if (days < 0 || statusLabel === "Expired") {
                  statusClass = "expired";
                  statusLabel = "Expired";
                } else if (days <= 3 || statusLabel === "Closing Soon") {
                  statusClass = "closing";
                  statusLabel = "Closing Soon";
                }

                return (
                  <tr key={opp.id}>
                    {/* Title with small Font Awesome category icon */}
                    <td>
                      <div className="table-title-cell">
                        <FontAwesomeIcon
                          icon={getCategoryIcon(opp.category)}
                          style={{ color: "#2563EB", width: "14px", flexShrink: 0 }}
                        />
                        <span title={opp.title} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {opp.title}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ color: "#64748B" }}>{opp.category}</td>

                    {/* Deadline */}
                    <td style={{ color: "#475569" }}>{formatDate(opp.application_deadline)}</td>

                    {/* Days Left */}
                    <td style={{ fontWeight: 600, color: daysColor }}>
                      {days < 0 ? "Overdue" : `${days}d`}
                    </td>

                    {/* Risk Score */}
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color:
                            opp.risk_score >= 70 ? "#DC2626" : opp.risk_score >= 40 ? "#D97706" : "#059669"
                        }}
                      >
                        {Math.round(opp.risk_score)}
                      </span>
                      <span style={{ fontSize: "10px", color: "#94A3B8" }}>/100</span>
                    </td>

                    {/* Match % */}
                    <td style={{ fontWeight: 600, color: "#2563EB" }}>
                      {Math.round(opp.match_percentage)}%
                    </td>

                    {/* Status Pill */}
                    <td>
                      <span className={`table-status-pill ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>

                    {/* Outlined View Button */}
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="btn-outline-blue"
                        style={{ padding: "4px 10px", fontSize: "11px" }}
                        onClick={() => onViewDetails(opp)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "16px",
            paddingTop: "12px",
            borderTop: "1px solid #F1F5F9",
            fontSize: "12px",
            color: "#64748B"
          }}
        >
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="table-clear-btn"
              style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                style={{
                  padding: "4px 9px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: pg === currentPage ? "700" : "500",
                  backgroundColor: pg === currentPage ? "#2563EB" : "#F1F5F9",
                  color: pg === currentPage ? "#FFFFFF" : "#475569"
                }}
              >
                {pg}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="table-clear-btn"
              style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
