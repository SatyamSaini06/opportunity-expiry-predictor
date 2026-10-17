import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faUser,
  faEnvelope,
  faLock,
  faGraduationCap,
  faEye,
  faEyeSlash,
  faUserPlus,
  faServer,
  faCircleExclamation,
  faCheck
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../services/api";

export default function Register({ onLoginSuccess }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [degreeBranch, setDegreeBranch] = useState("Computer Science & Engineering");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    if (!agreeTerms) {
      setErrorMsg("Please accept the terms to continue.");
      return;
    }

    setLoading(true);

    try {
      const data = await api.register(fullName.trim(), email.trim(), password);
      
      // Update profile with degree branch if provided
      if (degreeBranch) {
        await api.updateUserProfile({
          full_name: fullName.trim(),
          degree_branch: degreeBranch
        }).catch(() => {});
      }

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
      navigate("/");
    } catch (err) {
      setErrorMsg(err.message || "Registration failed. This email may already be registered.");
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
      {/* Brand Header */}
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

      {/* Main Registration Card */}
      <div
        className="content-card-box"
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "32px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1E293B" }}>Create Your Student Profile</h2>
          <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
            Start prioritizing scholarships, internships, hackathons, and exams.
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

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Full Name */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
              Full Name *
            </label>
            <div style={{ position: "relative" }}>
              <FontAwesomeIcon
                icon={faUser}
                style={{ position: "absolute", left: "12px", top: "11px", color: "#94A3B8", fontSize: "13px" }}
              />
              <input
                type="text"
                required
                placeholder="e.g. Maya Sharma"
                className="table-filter-input"
                style={{ width: "100%", paddingLeft: "34px", paddingRight: "12px", height: "38px" }}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
              Email Address *
            </label>
            <div style={{ position: "relative" }}>
              <FontAwesomeIcon
                icon={faEnvelope}
                style={{ position: "absolute", left: "12px", top: "11px", color: "#94A3B8", fontSize: "13px" }}
              />
              <input
                type="email"
                required
                placeholder="maya@college.edu"
                className="table-filter-input"
                style={{ width: "100%", paddingLeft: "34px", paddingRight: "12px", height: "38px" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Degree & Branch */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
              Degree & Branch
            </label>
            <div style={{ position: "relative" }}>
              <FontAwesomeIcon
                icon={faGraduationCap}
                style={{ position: "absolute", left: "12px", top: "11px", color: "#94A3B8", fontSize: "13px" }}
              />
              <input
                type="text"
                placeholder="e.g. Computer Science, Mechanical, Electronics"
                className="table-filter-input"
                style={{ width: "100%", paddingLeft: "34px", paddingRight: "12px", height: "38px" }}
                value={degreeBranch}
                onChange={(e) => setDegreeBranch(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
              Password (at least 6 characters) *
            </label>
            <div style={{ position: "relative" }}>
              <FontAwesomeIcon
                icon={faLock}
                style={{ position: "absolute", left: "12px", top: "11px", color: "#94A3B8", fontSize: "13px" }}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="Create password"
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

          {/* Confirm Password */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
              Confirm Password *
            </label>
            <div style={{ position: "relative" }}>
              <FontAwesomeIcon
                icon={faLock}
                style={{ position: "absolute", left: "12px", top: "11px", color: "#94A3B8", fontSize: "13px" }}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="Re-enter password"
                className="table-filter-input"
                style={{ width: "100%", paddingLeft: "34px", paddingRight: "12px", height: "38px" }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "11px", color: "#64748B", cursor: "pointer", marginTop: "2px" }}>
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ accentColor: "#2563EB", marginTop: "2px" }}
            />
            <span>
              I agree to the Opportunity Expiry Predictor terms and privacy guidelines.
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-solid-blue"
            style={{ height: "40px", fontSize: "13px", width: "100%", justifyContent: "center", marginTop: "6px" }}
          >
            <FontAwesomeIcon icon={faUserPlus} />
            <span>{loading ? "Creating Account..." : "Create Account & Sign In"}</span>
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#64748B" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#2563EB", fontWeight: 600 }}>
            Sign In here
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
