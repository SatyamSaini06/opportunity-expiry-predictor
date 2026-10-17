import React, { useState, useEffect } from "react";
import StatCardsRow from "../components/StatCard";
import UrgentOpportunitySection from "../components/UrgentOpportunityCard";
import OpportunityTable from "../components/OpportunityTable";
import ProfileMatchCard from "../components/ProfileMatchCard";
import UpcomingDeadlines from "../components/UpcomingDeadlines";
import QuickInsights from "../components/QuickInsights";
import SmartAlerts from "../components/SmartAlerts";
import OpportunityDetailModal from "../components/OpportunityDetailModal";
import { api } from "../services/api";

export default function Dashboard() {
  const [summaryData, setSummaryData] = useState(null);
  const [profileMatchData, setProfileMatchData] = useState(null);
  const [urgentOpps, setUrgentOpps] = useState([]);
  const [allOpps, setAllOpps] = useState([]);
  const [insights, setInsights] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashAnalytics, urgentRes, allRes, notifs] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getUrgentOpportunities(4),
        api.getOpportunities({ limit: 50 }),
        api.getNotifications().catch(() => [])
      ]);

      setSummaryData(dashAnalytics.summary);
      setProfileMatchData(dashAnalytics.profile_match);
      setInsights(dashAnalytics.quick_insights || []);
      setAlerts(notifs.length > 0 ? notifs : dashAnalytics.smart_alerts_preview || []);
      setUrgentOpps(urgentRes || []);
      setAllOpps(allRes.items || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBookmarkToggle = (oppId, newStatus) => {
    setAllOpps((prev) =>
      prev.map((o) => (o.id === oppId ? { ...o, is_bookmarked: newStatus } : o))
    );
    setUrgentOpps((prev) =>
      prev.map((o) => (o.id === oppId ? { ...o, is_bookmarked: newStatus } : o))
    );
  };

  return (
    <div className="dashboard-page-container">
      {/* Center Main Dashboard Column */}
      <div className="dashboard-main-column">
        {/* Four Pastel Summary Cards */}
        <StatCardsRow summary={summaryData} />

        {/* Top Urgent Opportunities Section */}
        <UrgentOpportunitySection
          items={urgentOpps}
          onViewDetails={(opp) => setSelectedOpportunity(opp)}
        />

        {/* All Opportunities Table */}
        <OpportunityTable
          opportunities={allOpps}
          loading={loading}
          onViewDetails={(opp) => setSelectedOpportunity(opp)}
        />
      </div>

      {/* Right Information Panel (Width ~255px) */}
      <div className="dashboard-right-panel">
        {/* A. Your Profile Match */}
        <ProfileMatchCard matchData={profileMatchData} />

        {/* B. Upcoming Deadlines */}
        <UpcomingDeadlines
          items={allOpps}
          onSelectOpp={(opp) => setSelectedOpportunity(opp)}
        />

        {/* C. Quick Insights */}
        <QuickInsights insights={insights} />

        {/* D. Smart Alerts */}
        <SmartAlerts alerts={alerts} />
      </div>

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          onBookmarkToggle={handleBookmarkToggle}
        />
      )}
    </div>
  );
}
