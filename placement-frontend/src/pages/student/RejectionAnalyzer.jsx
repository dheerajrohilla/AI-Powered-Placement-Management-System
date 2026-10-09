import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI } from "../../services/api";
import { Link } from "react-router-dom";

function RejectionAnalyzer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const res = await studentAPI.getRejectionAnalysis();
        setData(res.data);
      } catch (err) {
        console.error("Failed to load rejection analysis:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "26px", color: "#111827", fontWeight: 700 }}>
          "Why Am I Not Getting Shortlisted?" Diagnostic Analyzer
        </h1>
        <p style={{ color: "#6b7280", fontSize: "15px", marginTop: "4px" }}>
          AI deep-dive analyzing your recruitment history, screening drop-offs, and resume-to-JD bottleneck points.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="spinner" style={{ margin: "0 auto 15px" }}></div>
          <p style={{ color: "#6b7280" }}>Diagnosing your recruitment funnel drop-offs...</p>
        </div>
      ) : !data || !data.hasData ? (
        <div className="card" style={{ padding: "40px", textAlign: "center", background: "#fff", borderRadius: "14px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
          <h3 style={{ fontSize: "18px", color: "#111827", marginBottom: "8px" }}>No Application History Found</h3>
          <p style={{ color: "#6b7280", marginBottom: "20px" }}>
            Apply to active campus drives to generate your automated shortlisting bottleneck diagnosis.
          </p>
          <Link to="/student/jobs" className="btn-primary">Browse Active Drives</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* AI Bottleneck Diagnosis Hero Card */}
          <div className="card" style={{
            background: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)",
            color: "white",
            padding: "28px",
            borderRadius: "16px"
          }}>
            <span style={{
              background: "rgba(255,255,255,0.2)",
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase"
            }}>
              Core Bottleneck Detected
            </span>

            <h2 style={{ fontSize: "24px", marginTop: "10px", marginBottom: "8px" }}>
              {data.primaryBottleneck}
            </h2>

            <p style={{ fontSize: "15px", opacity: 0.95, lineHeight: "1.6", maxWidth: "800px" }}>
              {data.bottleneckDescription}
            </p>

            <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
              <div style={{ background: "rgba(255,255,255,0.15)", padding: "12px 20px", borderRadius: "8px" }}>
                <div style={{ fontSize: "22px", fontWeight: 800 }}>{data.totalApplied}</div>
                <div style={{ fontSize: "12px", opacity: 0.8 }}>Total Applied</div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.15)", padding: "12px 20px", borderRadius: "8px" }}>
                <div style={{ fontSize: "22px", fontWeight: 800 }}>{data.shortlistedCount}</div>
                <div style={{ fontSize: "12px", opacity: 0.8 }}>Shortlisted</div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.15)", padding: "12px 20px", borderRadius: "8px" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#fca5a5" }}>
                  {data.funnel?.screeningRejected || 0}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.8 }}>Resume Screening Rejections</div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.15)", padding: "12px 20px", borderRadius: "8px" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#fed7aa" }}>
                  {data.funnel?.codingRejected || 0}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.8 }}>Coding Round Rejections</div>
              </div>
            </div>
          </div>

          {/* Funnel Drop-off Rate Bars */}
          <div className="card" style={{ padding: "24px", background: "#fff", borderRadius: "14px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "16px" }}>
              📊 Application Funnel & Drop-off Breakdown
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px" }}>
                  <span style={{ fontWeight: 600, color: "#374151" }}>Resume Screening Drop-off Rate</span>
                  <span style={{ fontWeight: 700, color: "#ef4444" }}>{data.conversionRates?.screeningDropoffRate}%</span>
                </div>
                <div style={{ background: "#f1f5f9", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ background: "#ef4444", height: "100%", width: `${data.conversionRates?.screeningDropoffRate || 0}%` }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px" }}>
                  <span style={{ fontWeight: 600, color: "#374151" }}>Online Coding Assessment Drop-off Rate</span>
                  <span style={{ fontWeight: 700, color: "#f59e0b" }}>{data.conversionRates?.codingDropoffRate}%</span>
                </div>
                <div style={{ background: "#f1f5f9", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ background: "#f59e0b", height: "100%", width: `${data.conversionRates?.codingDropoffRate || 0}%` }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px" }}>
                  <span style={{ fontWeight: 600, color: "#374151" }}>Interview Round Drop-off Rate</span>
                  <span style={{ fontWeight: 700, color: "#3b82f6" }}>{data.conversionRates?.interviewDropoffRate}%</span>
                </div>
                <div style={{ background: "#f1f5f9", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ background: "#3b82f6", height: "100%", width: `${data.conversionRates?.interviewDropoffRate || 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Missing Skills Grid & Turnaround Plan */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>

            {/* Top Missing Keywords Across Drives */}
            <div className="card" style={{ padding: "24px", background: "#fff", borderRadius: "14px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827", marginBottom: "14px" }}>
                🔑 Top Recurring Missing JD Keywords
              </h3>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "14px" }}>
                These required technologies appeared in rejected drives but were absent from your resume/profile:
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {(data.topMissingSkills || []).map((sk, idx) => (
                  <span key={idx} style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    background: "#fee2e2",
                    color: "#991b1b",
                    fontSize: "13px",
                    fontWeight: 600
                  }}>
                    {sk.skill} (Needed in {sk.count} drives)
                  </span>
                ))}
              </div>
            </div>

            {/* Turnaround Action Plan */}
            <div className="card" style={{ padding: "24px", background: "#fff", borderRadius: "14px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827", marginBottom: "14px" }}>
                🚀 AI Turnaround Strategy Plan
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {(data.turnaroundPlan || []).map((step, idx) => (
                  <div key={idx} style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#166534" }}>{step.title}</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", background: "#dcfce7", padding: "2px 8px", borderRadius: "6px" }}>
                        {step.priority}
                      </span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#374151", margin: 0 }}>{step.action}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Drive Autopsy List */}
          <div className="card" style={{ padding: "24px", background: "#fff", borderRadius: "14px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "16px" }}>
              🔍 Drive-by-Drive Outcome Autopsy
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(data.driveDiagnoses || []).map((d, idx) => (
                <div key={idx} style={{
                  padding: "14px 18px",
                  borderRadius: "8px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px"
                }}>
                  <div>
                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b" }}>
                      {d.companyName} — {d.role}
                    </h4>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                      CGPA Cutoff: {d.cgpaCutoff} | Your CGPA: {d.studentCGPA}
                      {d.isCgpaDeficit && <span style={{ color: "#ef4444", marginLeft: "6px" }}>(Cutoff Not Met)</span>}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className={
                      d.status === "selected" ? "badge badge-success" :
                      d.status === "shortlisted" ? "badge badge-info" :
                      "badge badge-danger"
                    }>
                      {d.status === "rejected" ? `Rejected (${d.rejectionStage || "screening"})` : d.status}
                    </span>
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

export default RejectionAnalyzer;
