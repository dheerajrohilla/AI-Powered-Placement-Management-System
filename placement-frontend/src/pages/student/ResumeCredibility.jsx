import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI } from "../../services/api";
import { Link } from "react-router-dom";

function ResumeCredibility() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchCredibility = async (isManual = false) => {
    try {
      if (isManual) {
        setRefreshing(true);
      }
      const res = await studentAPI.getCredibilityAnalysis();
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load credibility analysis:", err);
      setError("Unable to compute resume consistency. Please ensure you have uploaded a resume or completed your profile.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCredibility(false);
  }, []);

  const getSeverityBadge = (severity) => {
    if (severity === "high") return <span className="badge badge-danger">High Scrutiny Risk</span>;
    if (severity === "medium") return <span className="badge badge-warning">Moderate Discrepancy</span>;
    return <span className="badge badge-info">Minor Notice</span>;
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "#10b981";
    if (score >= 70) return "#3b82f6";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', color: '#111827', fontWeight: 700 }}>AI Resume Consistency & Credibility Checker</h1>
          <p style={{ color: '#6b7280', fontSize: '15px', marginTop: '4px' }}>
            Cross-verifies claims across your Resume, Portal Profile, GitHub, Coding stats, and Certifications.
          </p>
        </div>
        <button
          onClick={() => fetchCredibility(true)}
          className="btn-primary"
          style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
          disabled={refreshing}
        >
          {refreshing ? "Re-Scanning..." : "🔄 Run Consistency Audit"}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="spinner" style={{ margin: "0 auto 15px" }}></div>
          <p style={{ color: "#6b7280" }}>Auditing resume claims against GitHub, certifications, and academic records...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: "30px", textAlign: "center", background: "#fff" }}>
          <p style={{ color: "#ef4444", marginBottom: "15px" }}>{error}</p>
          <Link to="/student/resume" className="btn-primary">Upload PDF Resume</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Hero Credibility Score Card */}
          <div className="card" style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            color: "white",
            padding: "30px",
            borderRadius: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px"
          }}>
            <div style={{ maxWidth: "600px" }}>
              <span style={{
                background: "rgba(255,255,255,0.2)",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase"
              }}>
                Authenticity Verification
              </span>
              <h2 style={{ fontSize: "28px", marginTop: "12px", marginBottom: "8px" }}>
                {data.rating}
              </h2>
              <p style={{ opacity: 0.9, fontSize: "15px", lineHeight: "1.5" }}>
                {data.summary}
              </p>
              <div style={{ display: "flex", gap: "20px", marginTop: "18px" }}>
                <div>
                  <div style={{ fontSize: "22px", fontWeight: 700 }}>{data.verifiedClaims?.length || 0}</div>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>Verified Claims</div>
                </div>
                <div style={{ borderLeft: "1px solid rgba(255,255,255,0.3)", paddingLeft: "20px" }}>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: data.highSeverityCount > 0 ? "#fca5a5" : "#86efac" }}>
                    {data.totalDiscrepancies || 0}
                  </div>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>Discrepancies Flagged</div>
                </div>
              </div>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.15)",
              padding: "25px",
              borderRadius: "50%",
              width: "140px",
              height: "140px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backdropFilter: "blur(5px)",
              border: "3px solid rgba(255,255,255,0.3)"
            }}>
              <span style={{ fontSize: "38px", fontWeight: 800 }}>{data.score}%</span>
              <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Credibility</span>
            </div>
          </div>

          {/* Category Scores Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div className="card" style={{ padding: "18px", background: "#fff", borderRadius: "12px" }}>
              <div style={{ color: "#6b7280", fontSize: "13px", fontWeight: 600 }}>PROJECTS & CODE</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: getScoreColor(data.categoryScores?.projects || 80), marginTop: "4px" }}>
                {data.categoryScores?.projects || 80}%
              </div>
              <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>Resume vs GitHub Repos</p>
            </div>

            <div className="card" style={{ padding: "18px", background: "#fff", borderRadius: "12px" }}>
              <div style={{ color: "#6b7280", fontSize: "13px", fontWeight: 600 }}>SKILLS GROUNDING</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: getScoreColor(data.categoryScores?.skills || 80), marginTop: "4px" }}>
                {data.categoryScores?.skills || 80}%
              </div>
              <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>Claims vs Project Tech</p>
            </div>

            <div className="card" style={{ padding: "18px", background: "#fff", borderRadius: "12px" }}>
              <div style={{ color: "#6b7280", fontSize: "13px", fontWeight: 600 }}>ACADEMIC TIMELINE</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: getScoreColor(data.categoryScores?.academics || 90), marginTop: "4px" }}>
                {data.categoryScores?.academics || 90}%
              </div>
              <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>CGPA & College Record</p>
            </div>

            <div className="card" style={{ padding: "18px", background: "#fff", borderRadius: "12px" }}>
              <div style={{ color: "#6b7280", fontSize: "13px", fontWeight: 600 }}>CERTIFICATION PROOF</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: getScoreColor(data.categoryScores?.certifications || 85), marginTop: "4px" }}>
                {data.categoryScores?.certifications || 85}%
              </div>
              <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>Issuer & Year Verification</p>
            </div>
          </div>

          {/* Discrepancies Breakdown */}
          <div className="card" style={{ padding: "24px", background: "#fff", borderRadius: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                🚩 Flagged Inconsistencies ({data.discrepancies?.length || 0})
              </h3>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>Cross-verification findings</span>
            </div>

            {(!data.discrepancies || data.discrepancies.length === 0) ? (
              <div style={{ padding: "24px", textAlign: "center", background: "#f0fdf4", borderRadius: "8px", color: "#166534" }}>
                ✓ Zero discrepancies detected! Your resume, GitHub, and institutional profile align seamlessly.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {data.discrepancies.map((disc, idx) => (
                  <div key={idx} style={{
                    padding: "16px",
                    borderRadius: "10px",
                    border: "1px solid #fee2e2",
                    background: "#fef2f2"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontWeight: 700, color: "#991b1b", fontSize: "15px" }}>{disc.category}</span>
                      {getSeverityBadge(disc.severity)}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "10px", fontSize: "14px" }}>
                      <div style={{ background: "white", padding: "10px", borderRadius: "6px", border: "1px solid #fecaca" }}>
                        <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600, display: "block" }}>RESUME CLAIM</span>
                        <span style={{ color: "#111827", fontWeight: 500 }}>{disc.claim}</span>
                      </div>
                      <div style={{ background: "white", padding: "10px", borderRadius: "6px", border: "1px solid #fecaca" }}>
                        <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600, display: "block" }}>DETECTED EVIDENCE</span>
                        <span style={{ color: "#111827", fontWeight: 500 }}>{disc.evidence}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: "13px", color: "#7f1d1d", marginBottom: "6px" }}>
                      <strong>Risk:</strong> {disc.issue}
                    </div>
                    <div style={{ fontSize: "13px", color: "#15803d", background: "#f0fdf4", padding: "8px 12px", borderRadius: "6px" }}>
                      💡 <strong>Fix:</strong> {disc.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verified Claims Section */}
          <div className="card" style={{ padding: "24px", background: "#fff", borderRadius: "14px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "14px" }}>
              ✅ Verified Authentic Claims ({data.verifiedClaims?.length || 0})
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
              {(data.verifiedClaims || []).map((claim, idx) => (
                <div key={idx} style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <span style={{ color: "#10b981", fontSize: "16px" }}>✓</span>
                  <div>
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{claim.category}</div>
                    <div style={{ fontSize: "14px", color: "#1e293b", fontWeight: 500 }}>{claim.claim}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}

export default ResumeCredibility;
