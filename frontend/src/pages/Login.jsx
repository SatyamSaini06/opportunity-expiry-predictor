import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faRightToBracket,
  faServer,
  faBolt,
  faCircleExclamation,
  faCheck
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../services/api";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const data = await api.login(email.trim(), password);
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
      navigate("/");
    } catch (err) {
      setErrorMsg(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("student@university.edu");
    setPassword("password123");
    setLoading(true);
    setErrorMsg("");

    try {
      const data = await api.login("student@university.edu", "password123");
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
      navigate("/");
    } catch (err) {
      setErrorMsg(err.message || "Failed to log in with demo account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F4F7FC",
        padding: "24px 16px"
      }}
    >
      {/* Brand Logo & Name */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #2563EB, #3B82F6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontSize: "17px",
            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.4)"
          }}
        >
          <FontAwesomeIcon icon={faCalendarDays} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#172D50", letterSpacing: "-0.2px" }}>
            Opportunity
          </span>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#2563EB", letterSpacing: "-0.1px" }}>
            Expiry Predictor
          </span>
        </div>
      </div>

      {/* Main Card */}
      <div
        className="content-card-box"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "32px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1E293B" }}>Sign In to Your Account</h2>
          <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
            Track deadlines, evaluate risk scores, and discover opportunities.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#991B1B",
              borderRadius: "8px",
              fontSize: "12px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <FontAwesomeIcon icon={faCircleExclamation} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <FontAwesomeIcon
                icon={faEnvelope}
                style={{ position: "absolute", left: "12px", top: "11px", color: "#94A3B8", fontSize: "13px" }}
              />
              <input
                type="email"
                required
                placeholder="name@university.edu"
                className="table-filter-input"
                style={{ width: "100%", paddingLeft: "34px", paddingRight: "12px", height: "38px" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                Password
              </label>
              <span style={{ fontSize: "11px", color: "#2563EB", cursor: "pointer" }} onClick={handleDemoLogin}>
                Use default password
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <FontAwesomeIcon
                icon={faLock}
                style={{ position: "absolute", left: "12px", top: "11px", color: "#94A3B8", fontSize: "13px" }}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="table-filter-input"
                style={{ width: "100%", paddingLeft: "34px", paddingRight: "36px", height: "38px" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "10px",
                  color: "#94A3B8",
                  fontSize: "13px",
                  cursor: "pointer"
                }}
                tabIndex={-1}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "#475569" }}>
              <input type="checkbox" defaultChecked style={{ accentColor: "#2563EB" }} />
              <span>Remember me</span>
            </label>
            <span style={{ color: "#64748B", fontSize: "11px" }}>
              Demo: student@university.edu
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-solid-blue"
            style={{ height: "40px", fontSize: "13px", width: "100%", justifyContent: "center" }}
          >
            <FontAwesomeIcon icon={faRightToBracket} />
            <span>{loading ? "Signing in..." : "Sign In to Dashboard"}</span>
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#E2E8F0" }} />
          <span style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase", fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#E2E8F0" }} />
        </div>

        {/* One-Click Demo Student Access */}
        <div
          style={{
            backgroundColor: "#EAF3FF",
            border: "1px solid #D3E6FE",
            borderRadius: "8px",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#1E3A8A", fontSize: "12px", fontWeight: 700 }}>
            <FontAwesomeIcon icon={faBolt} style={{ color: "#2563EB" }} />
            <span>One-Click Demo Access</span>
          </div>
          <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.35 }}>
            Instant evaluation login pre-seeded with active opportunities and student profile (Alex Chen).
          </p>
          <button
            type="button"
            className="btn-outline-blue"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{
              backgroundColor: "#FFFFFF",
              width: "100%",
              justifyContent: "center",
              padding: "7px 12px",
              fontSize: "12px"
            }}
          >
            Sign In as Demo Student (Alex Chen)
          </button>
        </div>

        {/* Link to Register */}
        <div style={{ textAlign: "center", marginTop: "22px", fontSize: "12px", color: "#64748B" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#2563EB", fontWeight: 600 }}>
            Create an account
          </Link>
        </div>
      </div>

      {/* Footer Branding */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "#94A3B8",
          fontSize: "11px"
        }}
      >
        <FontAwesomeIcon icon={faServer} style={{ color: "#60A5FA" }} />
        <span>IBM Z / LinuxONE • High security enterprise architecture</span>
      </div>
    </div>
  );
}
