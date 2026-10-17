import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import MyProfile from "./pages/MyProfile";
import Opportunities from "./pages/Opportunities";
import Recommendations from "./pages/Recommendations";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { api } from "./services/api";

function AppContent() {
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthRoute = ["/login", "/signin", "/register", "/signup"].includes(location.pathname);

  const fetchUserData = async () => {
    try {
      const data = await api.getUserProfile();
      setCurrentUser(data);
    } catch {
      const stored = api.getCurrentStoredUser();
      setCurrentUser(stored || { full_name: "Alex Chen", email: "student@university.edu" });
    }
  };

  const fetchNotificationsCount = async () => {
    try {
      const notifs = await api.getNotifications();
      const unread = notifs.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch {
      setUnreadCount(2);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchNotificationsCount();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    fetchUserData();
    fetchNotificationsCount();
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    navigate("/login");
  };

  // If on Login / Register / Signin pages, render standalone full-screen auth layout
  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signin" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={<Navigate to="/register" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      {/* Fixed Left Dark Navy Sidebar */}
      <Sidebar unreadAlertsCount={unreadCount} onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header user={currentUser} onLogout={handleLogout} />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/profile"
              element={<MyProfile onProfileUpdated={fetchUserData} />}
            />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route
              path="/alerts"
              element={<Alerts onAlertsChanged={fetchNotificationsCount} />}
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/signin" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<Register onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
