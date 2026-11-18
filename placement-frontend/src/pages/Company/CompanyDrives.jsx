import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CompanyLayout from "../../layouts/CompanyLayout";
import { companyAPI } from "../../services/api";

function CompanyDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [actionMsg, setActionMsg] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const res = await companyAPI.getDrives();
      setDrives(res.data || []);
    } catch (err) {
      console.error("Error loading drives:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async (driveId) => {
    setActionMsg("");
    setActionError("");
    try {
      await companyAPI.submitDriveForApproval(driveId);
      setActionMsg("Placement drive successfully submitted to TPO for campus review!");
      fetchDrives();
    } catch (err) {
      setActionError(err.response?.data?.error || "Failed to submit drive for approval.");
    }
  };

  const getStatusBadge = (approvalStatus, status) => {
    const s = approvalStatus || (status === "upcoming" ? "approved" : "draft");
    switch (s) {
      case "approved":
        return { label: "Approved by TPO", bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" };
      case "pending_approval":
        return { label: "Pending TPO Approval", bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" };
      case "changes_requested":
        return { label: "Changes Requested", bg: "#fffbeb", color: "#d97706", border: "#fde68a" };
      case "rejected":
        return { label: "Rejected by TPO", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" };
      default:
        return { label: "Draft (Not Submitted)", bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" };
    }
  };

  const filteredDrives = drives.filter((d) => {
    if (filter === "all") return true;
    if (filter === "approved") return d.approvalStatus === "approved" || (!d.approvalStatus && d.status === "upcoming");
    if (filter === "pending") return d.approvalStatus === "pending_approval";
    if (filter === "draft") return d.approvalStatus === "draft" || d.approvalStatus === "changes_requested";
    return true;
  });

  const activeApproved = drives.filter((d) => d.approvalStatus === "approved" || (!d.approvalStatus && d.status === "upcoming")).length;
  const pendingApprovals = drives.filter((d) => d.approvalStatus === "pending_approval").length;
  const totalPositions = drives.reduce((sum, d) => sum + (d.positions || 0), 0);

  return (
    <CompanyLayout>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Campus Placement Drives
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              Manage job listings, track institutional TPO verification, and monitor applicant pipelines.
            </p>
          </div>

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
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
            }}
          >
            <span>➕</span>
            <span>Create New Drive</span>
          </Link>
        </div>

        {/* FEEDBACK MESSAGES */}
        {actionMsg && (
          <div style={{
            padding: "12px 18px",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: "10px",
            color: "#065f46",
            fontSize: "14px",
            fontWeight: 600
          }}>
            ✓ {actionMsg}
          </div>
        )}

        {actionError && (
          <div style={{
            padding: "12px 18px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            color: "#991b1b",
            fontSize: "14px",
            fontWeight: 600
          }}>
            ⚠️ {actionError}
          </div>
        )}

        {/* METRICS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
              Total Drives
            </span>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
              {drives.length}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>All created drives</div>
          </div>

          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#059669", textTransform: "uppercase" }}>
              Live & Approved
            </span>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#059669", marginTop: "4px" }}>
              {activeApproved}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Visible to eligible students</div>
          </div>

          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb", textTransform: "uppercase" }}>
              Pending TPO Review
            </span>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#2563eb", marginTop: "4px" }}>
              {pendingApprovals}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Awaiting institutional sign-off</div>
          </div>

          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
              Total Openings
            </span>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
              {totalPositions}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Across all active drives</div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {[
            { id: "all", label: `All Drives (${drives.length})` },
            { id: "approved", label: `Approved (${activeApproved})` },
            { id: "pending", label: `Pending Approval (${pendingApprovals})` },
            { id: "draft", label: "Drafts & Revisions" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: filter === tab.id ? "1px solid #2563eb" : "1px solid #cbd5e1",
                background: filter === tab.id ? "#eff6ff" : "#ffffff",
                color: filter === tab.id ? "#1d4ed8" : "#475569",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* DRIVE CARDS GRID */}
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            Loading placement drives...
          </div>
        ) : filteredDrives.length === 0 ? (
          <div style={{
            padding: "60px 20px",
            textAlign: "center",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📢</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
              No placement drives found
            </h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "6px" }}>
              Click the button above to create and submit a placement drive.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
            {filteredDrives.map((drive) => {
              const badge = getStatusBadge(drive.approvalStatus, drive.status);
              const needsSubmission = drive.approvalStatus === "draft" || drive.approvalStatus === "changes_requested";

              return (
                <div
                  key={drive._id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    padding: "22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: "12px",
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`
                        }}
                      >
                        {badge.label}
                      </span>

                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                        {drive.jobType || "Full-Time"}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
                      {drive.jobRole || drive.title}
                    </h3>

                    <div style={{ fontSize: "13px", color: "#475569", marginBottom: "14px" }}>
                      ₹{(drive.salary / 100000).toFixed(1)} LPA • {drive.location || "Multiple Locations"}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                      <span style={{ fontSize: "11px", background: "#f1f5f9", color: "#334155", padding: "2px 8px", borderRadius: "6px" }}>
                        👥 {drive.positions} Positions
                      </span>
                      <span style={{ fontSize: "11px", background: "#f1f5f9", color: "#334155", padding: "2px 8px", borderRadius: "6px" }}>
                        🎓 Min CGPA: {drive.eligibility?.minCgpa || 6.0}
                      </span>
                      {drive.registrationDeadline && (
                        <span style={{ fontSize: "11px", background: "#f1f5f9", color: "#334155", padding: "2px 8px", borderRadius: "6px" }}>
                          📅 Deadline: {new Date(drive.registrationDeadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {drive.approvalFeedback && (
                      <div style={{
                        padding: "10px 12px",
                        background: drive.approvalStatus === "changes_requested" ? "#fffbeb" : "#f8fafc",
                        border: `1px solid ${drive.approvalStatus === "changes_requested" ? "#fde68a" : "#e2e8f0"}`,
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: drive.approvalStatus === "changes_requested" ? "#92400e" : "#475569",
                        marginBottom: "16px"
                      }}>
                        <strong>TPO Note:</strong> {drive.approvalFeedback}
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                      onClick={() => setSelectedDrive(drive)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#2563eb",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0
                      }}
                    >
                      View Details
                    </button>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {needsSubmission ? (
                        <button
                          onClick={() => handleSubmitForApproval(drive._id)}
                          style={{
                            background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                            color: "#ffffff",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            border: "none",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Submit to TPO 🚀
                        </button>
                      ) : (
                        <Link
                          to={`/company/applicants?driveId=${drive._id}`}
                          style={{
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            textDecoration: "none",
                            border: "1px solid #bfdbfe"
                          }}
                        >
                          Applicants →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DETAILS MODAL */}
        {selectedDrive && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px"
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                maxWidth: "600px",
                width: "100%",
                padding: "28px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
                maxHeight: "85vh",
                overflowY: "auto"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                    {selectedDrive.jobRole || selectedDrive.title}
                  </h2>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
                    Package: ₹{(selectedDrive.salary / 100000).toFixed(1)} LPA • {selectedDrive.location || "Multiple"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDrive(null)}
                  style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "14px" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>
                  Job Description
                </h4>
                <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {selectedDrive.description || "No specific job description provided."}
                </p>
              </div>

              {selectedDrive.requirements && selectedDrive.requirements.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>
                    Required Technical Skills
                  </h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {selectedDrive.requirements.map((req, i) => (
                      <span key={i} style={{ background: "#eff6ff", color: "#1d4ed8", padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500 }}>
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedDrive.approvalFeedback && (
                <div style={{
                  padding: "12px 14px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#334155",
                  marginBottom: "20px"
                }}>
                  <strong>TPO Approval Feedback:</strong> {selectedDrive.approvalFeedback}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  onClick={() => setSelectedDrive(null)}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CompanyLayout>
  );
}

export default CompanyDrives;