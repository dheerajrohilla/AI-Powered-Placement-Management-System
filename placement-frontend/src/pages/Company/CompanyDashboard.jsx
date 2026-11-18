import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CompanyLayout from "../../layouts/CompanyLayout";
import { companyAPI } from "../../services/api";
import { useAuth } from "../../context/useAuth";

function CompanyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [drives, setDrives] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, drivesRes, applicantsRes] = await Promise.all([
        companyAPI.getDashboard(),
        companyAPI.getDrives(),
        companyAPI.getApplicants()
      ]);
      setStats(statsRes.data || null);
      setDrives(drivesRes.data || []);
      setApplicants(applicantsRes.data || []);
    } catch (err) {
      console.error("Error loading company dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const funnel = stats?.funnel || {
    applied: stats?.applications || 0,
    underReview: stats?.underReview || 0,
    shortlisted: stats?.shortlisted || 0,
    interviewed: stats?.interviewed || 0,
    selected: stats?.selected || 0
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return { label: "Approved by TPO", bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" };
      case "pending_approval":
        return { label: "Pending TPO Approval", bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" };
      case "changes_requested":
        return { label: "Changes Requested", bg: "#fffbeb", color: "#d97706", border: "#fde68a" };
      case "rejected":
        return { label: "Rejected by TPO", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" };
      default:
        return { label: "Draft", bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" };
    }
  };

  const getApplicantBadge = (status) => {
    switch (status) {
      case "selected":
        return { label: "Selected / Offered", bg: "#ecfdf5", color: "#059669" };
      case "interview_scheduled":
        return { label: "Interview Scheduled", bg: "#f5f3ff", color: "#7c3aed" };
      case "shortlisted":
        return { label: "Shortlisted", bg: "#eff6ff", color: "#2563eb" };
      case "under_review":
        return { label: "Under Review", bg: "#fffbeb", color: "#d97706" };
      case "rejected":
        return { label: "Rejected", bg: "#fef2f2", color: "#dc2626" };
      default:
        return { label: "Submitted", bg: "#f1f5f9", color: "#475569" };
    }
  };

  return (
    <CompanyLayout>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* HEADER & QUICK ACTIONS */}
        <div
          style={{
            background: "linear-gradient(135deg, #0b132b 0%, #1c2541 60%, #1e1b4b 100%)",
            borderRadius: "16px",
            padding: "28px 32px",
            color: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            boxShadow: "0 10px 25px -5px rgba(11, 19, 43, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "#38bdf8",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  border: "1px solid rgba(56, 189, 248, 0.3)"
                }}
              >
                ENTERPRISE RECRUITMENT SUITE
              </span>
              {stats?.companyInfo?.isVerified && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    background: "rgba(52, 211, 153, 0.15)",
                    color: "#34d399",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    border: "1px solid rgba(52, 211, 153, 0.3)"
                  }}
                >
                  ✓ TPO VERIFIED
                </span>
              )}
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
              Welcome back, {user?.name || "Corporate Partner"}!
            </h1>
            <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "14px" }}>
              Manage recruitment drives, review candidate profiles, and schedule multi-round interviews.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              to="/company/create-drive"
              style={{
                background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                color: "#ffffff",
                padding: "10px 20px",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "14px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)"
              }}
            >
              <span>➕</span>
              <span>Post New Drive</span>
            </Link>

            <Link
              to="/company/applicants"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                padding: "10px 18px",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "14px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                border: "1px solid rgba(255, 255, 255, 0.15)"
              }}
            >
              <span>👥</span>
              <span>Review Pipeline</span>
            </Link>
          </div>
        </div>

        {/* METRICS ROW */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px"
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                Total Drives
              </span>
              <span style={{ fontSize: "18px" }}>📢</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>
              {stats ? stats.totalDrives : "--"}
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px", fontSize: "11px", color: "#64748b" }}>
              <span style={{ color: "#059669", fontWeight: 700 }}>{stats?.approvedDrives || 0} approved</span>
              <span>•</span>
              <span style={{ color: "#2563eb", fontWeight: 700 }}>{stats?.pendingDrives || 0} pending</span>
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                Total Applicants
              </span>
              <span style={{ fontSize: "18px" }}>👥</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>
              {stats ? stats.applications : "--"}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px" }}>
              Across all published placement drives
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                Shortlisted
              </span>
              <span style={{ fontSize: "18px" }}>⭐</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#2563eb" }}>
              {stats ? stats.shortlisted : "--"}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px" }}>
              Qualified for interview evaluation
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                Offers / Selected
              </span>
              <span style={{ fontSize: "18px" }}>🎉</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#059669" }}>
              {stats ? stats.selected : "--"}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px" }}>
              Candidates extended placement offers
            </div>
          </div>
        </div>

        {/* RECRUITMENT FUNNEL */}
        <div
          style={{
            background: "#ffffff",
            padding: "24px 28px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Recruitment Funnel Progression
              </h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0" }}>
                Track how candidates advance from initial application through final placement offers
              </p>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#2563eb",
                background: "#eff6ff",
                padding: "4px 10px",
                borderRadius: "8px"
              }}
            >
              Conversion Rate: {funnel.applied > 0 ? ((funnel.selected / funnel.applied) * 100).toFixed(1) : 0}%
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "12px",
              padding: "16px 0 0"
            }}
          >
            {[
              { label: "1. Applied", count: funnel.applied, color: "#3b82f6", step: "Initial Pool" },
              { label: "2. Under Review", count: stats?.underReview || 0, color: "#f59e0b", step: "Profile Screening" },
              { label: "3. Shortlisted", count: funnel.shortlisted, color: "#8b5cf6", step: "Round 1 Pass" },
              { label: "4. Interviewed", count: stats?.interviewed || 0, color: "#06b6d4", step: "Technical / HR" },
              { label: "5. Selected", count: funnel.selected, color: "#10b981", step: "Offer Extended" }
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "16px",
                  borderLeft: `4px solid ${f.color}`,
                  border: "1px solid #f1f5f9"
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                  {f.label}
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                  {f.count}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                  {f.step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TWO COLUMN GRID: ACTIVE DRIVES & RECENT APPLICANTS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px" }}>
          {/* DRIVES SECTION */}
          <div
            style={{
              background: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Active Placement Drives
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
                  Status and student visibility
                </p>
              </div>
              <Link to="/company/drives" style={{ fontSize: "13px", fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
                View All ({drives.length}) →
              </Link>
            </div>

            {drives.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                <p style={{ margin: 0, fontWeight: 500 }}>No placement drives created yet.</p>
                <Link
                  to="/company/create-drive"
                  style={{
                    display: "inline-block",
                    marginTop: "10px",
                    color: "#2563eb",
                    fontWeight: 600,
                    fontSize: "13px",
                    textDecoration: "none"
                  }}
                >
                  + Post your first drive
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {drives.slice(0, 4).map((drive) => {
                  const badge = getStatusBadge(drive.approvalStatus || (drive.status === "upcoming" ? "approved" : "draft"));
                  return (
                    <div
                      key={drive._id}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px"
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                          {drive.jobRole || drive.title}
                        </h4>
                        <div style={{ display: "flex", gap: "10px", fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                          <span>₹{(drive.salary / 100000).toFixed(1)} LPA</span>
                          <span>•</span>
                          <span>{drive.positions} openings</span>
                          <span>•</span>
                          <span>{drive.location || "Multiple"}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "10px",
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`
                          }}
                        >
                          {badge.label}
                        </span>
                        <Link
                          to={`/company/applicants?driveId=${drive._id}`}
                          style={{ fontSize: "11px", color: "#2563eb", textDecoration: "none", fontWeight: 600 }}
                        >
                          Review applicants →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RECENT APPLICANTS SECTION */}
          <div
            style={{
              background: "#ffffff",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Recent Candidates
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
                  Latest applications received
                </p>
              </div>
              <Link to="/company/applicants" style={{ fontSize: "13px", fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
                Pipeline ({applicants.length}) →
              </Link>
            </div>

            {applicants.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                <p style={{ margin: 0, fontWeight: 500 }}>No candidate applications yet.</p>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                  Applications will appear once your approved drives are live for students.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {applicants.slice(0, 4).map((app) => {
                  const studentName = app.student?.userId?.name || "Student Candidate";
                  const initial = studentName.charAt(0).toUpperCase();
                  const badge = getApplicantBadge(app.status);

                  return (
                    <div
                      key={app._id}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "13px"
                          }}
                        >
                          {initial}
                        </div>
                        <div>
                          <h4 style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                            {studentName}
                          </h4>
                          <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                            {app.placementDrive?.jobRole || app.placementDrive?.title || "Drive"} • CGPA: {app.student?.cgpa ?? "N/A"}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {app.student?.atsScore != null && (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "#f0fdf4",
                              color: "#16a34a",
                              border: "1px solid #bbf7d0",
                              padding: "2px 8px",
                              borderRadius: "6px"
                            }}
                          >
                            ATS {app.student.atsScore}%
                          </span>
                        )}

                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            background: badge.bg,
                            color: badge.color,
                            padding: "3px 8px",
                            borderRadius: "6px"
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
}

export default CompanyDashboard;