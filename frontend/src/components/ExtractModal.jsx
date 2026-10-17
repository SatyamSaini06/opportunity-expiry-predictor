import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faUpload,
  faFileLines,
  faLink,
  faPaste,
  faCheck,
  faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../services/api";

export default function ExtractModal({ onClose, onExtractedSaved }) {
  const [activeTab, setActiveTab] = useState("text"); // 'file', 'text', 'url'
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [url, setUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const sampleNotices = [
    {
      label: "Fellowship Sample",
      text: "NATIONAL QUANTUM INITIATIVE FELLOWSHIP 2027\nOrganization: Department of Science & Technology\nCategory: Fellowship\nEligibility: B.Tech / M.Sc graduates in Physics or Computer Science with minimum 8.0 CGPA.\nRequired Skills: Quantum Computing, Python, Linear Algebra, Algorithms\nRequired Documents: Research Statement, Official Transcripts, 2 Letters of Recommendation\nDeadline: November 15, 2026\nOfficial Portal: https://dst.gov.in/quantum-fellowship"
    },
    {
      label: "Hackathon Sample",
      text: "AI FOR INDIA BUILDATHON\nOrganization: NITI Aayog & Cloud Foundation\nCategory: Hackathon\nStudents from all engineering years are eligible. Teams of 2 to 4 members.\nRequired Skills: Full Stack, React, Machine Learning, APIs\nDocuments: Pitch Deck, Institute ID Cards\nLast Date of Application: October 28, 2026\nApply: https://buildathon.gov.in"
    }
  ];

  const handleExtract = async () => {
    setIsExtracting(true);
    setErrorMsg("");
    setExtractedData(null);
    setIsSaved(false);

    try {
      const formData = new FormData();
      if (activeTab === "file" && file) {
        formData.append("file", file);
      } else if (activeTab === "url" && url) {
        formData.append("source_url", url);
      } else if (activeTab === "text" && pastedText) {
        formData.append("pasted_text", pastedText);
      } else {
        throw new Error("Please select a file, paste text, or enter a URL.");
      }

      const res = await api.uploadAndExtract(formData);
      setExtractedData(res.extracted_data);
    } catch (err) {
      setErrorMsg(err.message || "Failed to extract opportunity details.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!extractedData) return;
    try {
      const formData = new FormData();
      if (activeTab === "file" && file) formData.append("file", file);
      if (activeTab === "url" && url) formData.append("source_url", url);
      if (activeTab === "text" && pastedText) formData.append("pasted_text", pastedText);
      formData.append("auto_save", "true");

      await api.uploadAndExtract(formData);
      setIsSaved(true);
      if (onExtractedSaved) onExtractedSaved();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || "Failed to save extracted opportunity.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" style={{ maxWidth: "700px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FontAwesomeIcon icon={faUpload} style={{ color: "#2563EB" }} />
            <h2 className="modal-title">AI Opportunity Extraction</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <p style={{ fontSize: "12px", color: "#64748B" }}>
          Upload official PDF notices, paste announcement circulars, or provide authorized URLs. The AI NLP parser extracts deadlines, eligibility, and required documents.
        </p>

        {/* Tab Selection */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "10px" }}>
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: activeTab === "text" ? "#2563EB" : "#F1F5F9",
              color: activeTab === "text" ? "#FFFFFF" : "#475569"
            }}
          >
            <FontAwesomeIcon icon={faPaste} style={{ marginRight: "6px" }} />
            Paste Notice Text
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("file")}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: activeTab === "file" ? "#2563EB" : "#F1F5F9",
              color: activeTab === "file" ? "#FFFFFF" : "#475569"
            }}
          >
            <FontAwesomeIcon icon={faFileLines} style={{ marginRight: "6px" }} />
            Upload PDF / Document
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("url")}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: activeTab === "url" ? "#2563EB" : "#F1F5F9",
              color: activeTab === "url" ? "#FFFFFF" : "#475569"
            }}
          >
            <FontAwesomeIcon icon={faLink} style={{ marginRight: "6px" }} />
            Official Webpage URL
          </button>
        </div>

        {/* Tab Inputs */}
        {activeTab === "text" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#1E293B" }}>
                Notice or Circular Text
              </label>
              <div style={{ display: "flex", gap: "6px" }}>
                {sampleNotices.map((sn, idx) => (
                  <button
                    key={idx}
                    type="button"
                    style={{ fontSize: "11px", color: "#2563EB", textDecoration: "underline" }}
                    onClick={() => setPastedText(sn.text)}
                  >
                    Load {sn.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={6}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #CBD5E1",
                borderRadius: "8px",
                fontSize: "12px",
                lineHeight: 1.5,
                fontFamily: "inherit"
              }}
              placeholder="Paste notification, circular text, or scholarship bulletin here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />
          </div>
        )}

        {activeTab === "file" && (
          <div
            style={{
              border: "2px dashed #CBD5E1",
              borderRadius: "8px",
              padding: "24px",
              textAlign: "center",
              backgroundColor: "#F8FAFC"
            }}
          >
            <FontAwesomeIcon icon={faFileLines} style={{ fontSize: "28px", color: "#94A3B8", marginBottom: "8px" }} />
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#1E293B" }}>
              Choose a PDF document to parse
            </div>
            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
              PyMuPDF extraction will parse tables, dates, and requirements
            </div>
            <input
              type="file"
              accept=".pdf,.txt"
              style={{ marginTop: "12px" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
        )}

        {activeTab === "url" && (
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#1E293B", display: "block", marginBottom: "6px" }}>
              Permitted Webpage URL
            </label>
            <input
              type="url"
              placeholder="https://example.org/opportunity-announcement"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #CBD5E1",
                borderRadius: "6px",
                fontSize: "12px"
              }}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        )}

        {/* Action Button */}
        <div>
          <button
            type="button"
            className="btn-solid-blue"
            onClick={handleExtract}
            disabled={isExtracting}
            style={{ width: "100%", padding: "10px" }}
          >
            {isExtracting ? "Running AI NLP Extraction..." : "Extract Opportunity Information"}
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: "8px 12px", backgroundColor: "#FEF2F2", color: "#991B1B", borderRadius: "6px", fontSize: "12px" }}>
            {errorMsg}
          </div>
        )}

        {/* Extracted Preview */}
        {extractedData && (
          <div style={{ border: "1px solid #E2E8F0", borderRadius: "8px", padding: "16px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FontAwesomeIcon icon={faCheck} style={{ color: "#10B981" }} />
                <strong style={{ fontSize: "14px", color: "#1E293B" }}>Extracted Information</strong>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  backgroundColor: extractedData.confidence_score >= 80 ? "#D1FAE5" : "#FEF3C7",
                  color: extractedData.confidence_score >= 80 ? "#065F46" : "#92400E",
                  padding: "3px 8px",
                  borderRadius: "999px"
                }}
              >
                Confidence: {extractedData.confidence_score}%
              </span>
            </div>

            {extractedData.uncertain_deadline && (
              <div style={{ padding: "8px", backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "6px", fontSize: "11px", color: "#92400E", marginBottom: "10px" }}>
                <FontAwesomeIcon icon={faTriangleExclamation} style={{ marginRight: "6px" }} />
                Deadline date was uncertain in text. Verified manual confirmation recommended before publishing.
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", fontSize: "12px" }}>
              <div>
                <span style={{ color: "#64748B" }}>Title:</span> <strong style={{ color: "#1E293B" }}>{extractedData.title}</strong>
              </div>
              <div>
                <span style={{ color: "#64748B" }}>Organization:</span> <strong style={{ color: "#1E293B" }}>{extractedData.organization}</strong>
              </div>
              <div>
                <span style={{ color: "#64748B" }}>Category:</span> <span style={{ fontWeight: 600, color: "#2563EB" }}>{extractedData.category}</span>
              </div>
              <div>
                <span style={{ color: "#64748B" }}>Extracted Deadline:</span>{" "}
                <strong style={{ color: "#DC2626" }}>
                  {extractedData.application_deadline ? new Date(extractedData.application_deadline).toLocaleDateString() : "Not detected"}
                </strong>
              </div>
            </div>

            <div style={{ marginTop: "10px", fontSize: "12px" }}>
              <span style={{ color: "#64748B" }}>Identified Documents:</span>{" "}
              <span style={{ color: "#1E293B" }}>{extractedData.required_documents?.join(", ") || "None"}</span>
            </div>

            <div style={{ marginTop: "6px", fontSize: "12px" }}>
              <span style={{ color: "#64748B" }}>Key Skills:</span>{" "}
              <span style={{ color: "#1E293B" }}>{extractedData.required_skills?.join(", ") || "None"}</span>
            </div>

            <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              {isSaved ? (
                <div style={{ color: "#059669", fontWeight: 700, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FontAwesomeIcon icon={faCheck} /> Saved to Database!
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-solid-blue"
                  onClick={handleSaveToDatabase}
                >
                  Confirm & Save Opportunity to DB
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
