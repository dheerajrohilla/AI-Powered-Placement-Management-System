import { useEffect, useState } from "react";
import TPOLayout from "../../layouts/TPOLayout";
import { tpoAPI } from "../../services/api";

function PlacementDrives() {
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'pending'
  const [drives, setDrives] = useState([]);
  const [pendingDrives, setPendingDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [reviewModalDrive, setReviewModalDrive] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    companyId: "",
    jobRole: "",
    jobType: "Full Time",
    salary: "",
    location: "",
    minCGPA: "6.5",
    departments: "CSE, ECE, IT",
    batches: "2025, 2026",
    registrationDeadline: "",
    driveDate: "",
    description: "",
    requirements: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [drivesRes, pendingRes, compRes] = await Promise.all([
        tpoAPI.getDrives(),
        tpoAPI.getPendingDrives(),
        tpoAPI.getCompanies()
      ]);
      setDrives(drivesRes.data || []);
      setPendingDrives(pendingRes.data || []);
      setCompanies(compRes.data || []);
    } catch (err) {
      console.error("Error loading placement drives:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMsg("");
    try {
      await tpoAPI.createDrive({
        title: formData.title,
        companyId: formData.companyId,
        jobRole: formData.jobRole || formData.title,
        jobType: formData.jobType,
        salary: Number(formData.salary),
        location: formData.location,
        eligibility: {
          minCGPA: Number(formData.minCGPA),
          departments: formData.departments.split(",").map(s => s.trim()).filter(Boolean),
          batches: formData.batches.split(",").map(s => s.trim()).filter(Boolean)
        },
        registrationDeadline: formData.registrationDeadline,
        driveDate: formData.driveDate,
        description: formData.description,
        requirements: formData.requirements.split(",").map(s => s.trim()).filter(Boolean)
      });

      setShowCreateModal(false);
      setFormData({ title: "", companyId: "", jobRole: "", jobType: "Full Time", salary: "", location: "", minCGPA: "6.5", departments: "CSE, ECE, IT", batches: "2025, 2026", registrationDeadline: "", driveDate: "", description: "", requirements: "" });
      setActionMsg("Drive successfully created and published.");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create placement drive.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (driveId, newStatus) => {
    try {
      await tpoAPI.toggleDriveStatus(driveId, newStatus);
      fetchData();
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleApprovalAction = async (actionType) => {
    if (!reviewModalDrive) return;
    setActionLoading(true);
    setActionMsg("");

    try {
      if (actionType === "approve") {
        await tpoAPI.approveDrive(reviewModalDrive._id, reviewFeedback || "Approved by TPO for campus recruitment.");
        setActionMsg(`Drive "${reviewModalDrive.title || reviewModalDrive.jobRole}" approved and published to eligible students! 🎉`);
      } else if (actionType === "reject") {
        await tpoAPI.rejectDrive(reviewModalDrive._id, reviewFeedback || "Drive proposal rejected by TPO.");
        setActionMsg(`Drive "${reviewModalDrive.title || reviewModalDrive.jobRole}" rejected.`);
      } else if (actionType === "request_changes") {
        await tpoAPI.requestDriveChanges(reviewModalDrive._id, reviewFeedback || "Please revise eligibility or salary criteria.");
        setActionMsg(`Requested changes sent to recruiter for "${reviewModalDrive.title || reviewModalDrive.jobRole}".`);
      }

      setReviewModalDrive(null);
      setReviewFeedback("");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${actionType} drive.`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDrives = drives.filter((d) => {
    const title = d.title || "";
    const company = d.company?.companyName || "";
    const location = d.location || "";
    const matchesSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      company.toLowerCase().includes(search.toLowerCase()) ||
      location.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDrives = drives.length;
  const activeDrives = drives.filter(d => d.status === 'upcoming' || d.status === 'ongoing').length;
  const totalApplicants = drives.reduce((sum, d) => sum + (d.applicantCount || 0), 0);

  return (
    <TPOLayout>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Placement Drive Operations
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              Approve recruiter proposals, configure campus eligibility cutoffs, and monitor institutional hiring drives.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#ffffff",
              padding: "10px 20px",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)"
            }}
          >
            <span>➕</span>
            <span>Post Institutional Drive</span>
          </button>
        </div>

        {/* FEEDBACK NOTICE */}
        {actionMsg && (
          <div style={{ padding: "12px 18px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "10px", color: "#065f46", fontSize: "14px", fontWeight: 600 }}>
            ✓ {actionMsg}
          </div>
        )}

        {/* METRICS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
              Total Drives
            </span>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
              {totalDrives}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>All institutional campaigns</div>
          </div>

          <div
            onClick={() => setActiveTab("pending")}
            style={{
              background: pendingDrives.length > 0 ? "#eff6ff" : "#ffffff",
              padding: "20px",
              borderRadius: "14px",
              border: pendingDrives.length > 0 ? "1px solid #93c5fd" : "1px solid #e2e8f0",
              cursor: "pointer"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb", textTransform: "uppercase" }}>
                Awaiting TPO Approval
              </span>
              {pendingDrives.length > 0 && <span style={{ fontSize: "16px" }}>⚡</span>}
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#2563eb", marginTop: "4px" }}>
              {pendingDrives.length}
            </div>
            <div style={{ fontSize: "11px", color: "#2563eb", marginTop: "4px" }}>
              {pendingDrives.length > 0 ? "Click to review pending drives →" : "All recruiter proposals cleared"}
            </div>
          </div>

          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#059669", textTransform: "uppercase" }}>
              Active & Live
            </span>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#059669", marginTop: "4px" }}>
              {activeDrives}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Open for student applications</div>
          </div>

          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
              Total Applicants
            </span>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
              {totalApplicants}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Across all campus drives</div>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: "12px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px" }}>
          <button
            onClick={() => setActiveTab("all")}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "all" ? "#0f172a" : "#f1f5f9",
              color: activeTab === "all" ? "#ffffff" : "#475569",
              fontWeight: 700,
              fontSize: "13.5px",
              cursor: "pointer"
            }}
          >
            All Placement Drives ({drives.length})
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "pending" ? "#2563eb" : pendingDrives.length > 0 ? "#eff6ff" : "#f1f5f9",
              color: activeTab === "pending" ? "#ffffff" : pendingDrives.length > 0 ? "#1d4ed8" : "#475569",
              fontWeight: 700,
              fontSize: "13.5px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span>Drives Awaiting Approval</span>
            {pendingDrives.length > 0 && (
              <span
                style={{
                  background: activeTab === "pending" ? "#ffffff" : "#ef4444",
                  color: activeTab === "pending" ? "#2563eb" : "#ffffff",
                  fontSize: "11px",
                  padding: "1px 7px",
                  borderRadius: "10px",
                  fontWeight: 800
                }}
              >
                {pendingDrives.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: PENDING APPROVALS QUEUE */}
        {activeTab === "pending" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {pendingDrives.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: 0 }}>
                  Approvals Queue Clear!
                </h3>
                <p style={{ color: "#64748b", fontSize: "14px", marginTop: "6px" }}>
                  There are no company-submitted placement drives waiting for TPO verification right now.
                </p>
              </div>
            ) : (
              pendingDrives.map((drive) => (
                <div
                  key={drive._id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #93c5fd",
                    borderLeft: "5px solid #2563eb",
                    padding: "22px 26px",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "18px",
                    boxShadow: "0 2px 6px rgba(37, 99, 235, 0.06)"
                  }}
                >
                  <div style={{ minWidth: "280px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: "10px" }}>
                        COMPANY SUBMISSION
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Submitted {new Date(drive.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                      {drive.jobRole || drive.title}
                    </h3>
                    <div style={{ fontSize: "14px", color: "#475569" }}>
                      <strong>{drive.company?.companyName || "Recruiter"}</strong> • ₹{(drive.salary / 100000).toFixed(1)} LPA • {drive.location || "Multiple"}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "4px" }}>
                      Cutoff: Min CGPA {drive.eligibility?.minCGPA || drive.eligibility?.minCgpa || 6.0} • {drive.positions} Positions
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setSelectedDrive(drive)}
                      style={{
                        background: "#f1f5f9",
                        color: "#334155",
                        border: "1px solid #cbd5e1",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Inspect Full JD
                    </button>

                    <button
                      onClick={() => {
                        setReviewModalDrive(drive);
                        setReviewFeedback("Approved for campus placement drive.");
                      }}
                      style={{
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 18px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(16, 185, 129, 0.25)"
                      }}
                    >
                      ✓ Review & Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: ALL PLACEMENT DRIVES DIRECTORY */}
        {activeTab === "all" && (
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "18px" }}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}>
                <input
                  type="text"
                  placeholder="Search drive title, company, location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ minWidth: "240px", padding: "9px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: "9px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", background: "#ffffff" }}
                >
                  <option value="All">All Statuses</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                {filteredDrives.length} total drives
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "12px 14px", fontSize: "12px", color: "#475569", textTransform: "uppercase" }}>Drive & Company</th>
                    <th style={{ padding: "12px 14px", fontSize: "12px", color: "#475569", textTransform: "uppercase" }}>Eligibility</th>
                    <th style={{ padding: "12px 14px", fontSize: "12px", color: "#475569", textTransform: "uppercase" }}>Package</th>
                    <th style={{ padding: "12px 14px", fontSize: "12px", color: "#475569", textTransform: "uppercase" }}>Applicants</th>
                    <th style={{ padding: "12px 14px", fontSize: "12px", color: "#475569", textTransform: "uppercase" }}>Approval</th>
                    <th style={{ padding: "12px 14px", fontSize: "12px", color: "#475569", textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "12px 14px", fontSize: "12px", color: "#475569", textTransform: "uppercase" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrives.map((d) => (
                    <tr key={d._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px" }}>
                        <strong style={{ display: "block", color: "#0f172a", fontSize: "14px" }}>{d.jobRole || d.title}</strong>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{d.company?.companyName || "Recruiter"} • {d.location || "Multiple"}</span>
                      </td>
                      <td style={{ padding: "14px", fontSize: "13px" }}>
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>Min {d.eligibility?.minCGPA || d.eligibility?.minCgpa || 6.0} CGPA</span>
                      </td>
                      <td style={{ padding: "14px", fontWeight: 700, color: "#059669", fontSize: "13.5px" }}>
                        ₹{(d.salary / 100000).toFixed(1)} LPA
                      </td>
                      <td style={{ padding: "14px" }}>
                        <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 700 }}>
                          {d.applicantCount || 0} Applied
                        </span>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "10px",
                          background: d.approvalStatus === "approved" || !d.approvalStatus ? "#ecfdf5" : d.approvalStatus === "pending_approval" ? "#eff6ff" : "#fef2f2",
                          color: d.approvalStatus === "approved" || !d.approvalStatus ? "#059669" : d.approvalStatus === "pending_approval" ? "#2563eb" : "#dc2626"
                        }}>
                          {d.approvalStatus ? d.approvalStatus.replace("_", " ").toUpperCase() : "APPROVED"}
                        </span>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <select
                          value={d.status}
                          onChange={(e) => handleStatusToggle(d._id, e.target.value)}
                          style={{ padding: "5px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, border: "1px solid #cbd5e1" }}
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <button
                          onClick={() => setSelectedDrive(d)}
                          style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "5px 10px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                        >
                          View JD
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REVIEW & APPROVAL MODAL */}
        {reviewModalDrive && (
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
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: "6px" }}>
                    TPO RECRUITMENT VERIFICATION
                  </span>
                  <h3 style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a", margin: "6px 0 2px" }}>
                    {reviewModalDrive.jobRole || reviewModalDrive.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                    Company: {reviewModalDrive.company?.companyName || "Recruiter"} • Package: ₹{(reviewModalDrive.salary / 100000).toFixed(1)} LPA
                  </p>
                </div>
                <button
                  onClick={() => setReviewModalDrive(null)}
                  style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "14px" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px", color: "#334155" }}>
                <div><strong>Cutoff CGPA:</strong> {reviewModalDrive.eligibility?.minCGPA || reviewModalDrive.eligibility?.minCgpa || 6.0}</div>
                <div style={{ marginTop: "4px" }}><strong>Positions:</strong> {reviewModalDrive.positions}</div>
                <div style={{ marginTop: "4px" }}><strong>Location:</strong> {reviewModalDrive.location || "Multiple"}</div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  TPO Feedback / Direct Note to Recruiter
                </label>
                <textarea
                  rows="3"
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Provide approval notes or specific changes required..."
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleApprovalAction("reject")}
                  style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                >
                  Reject Proposal
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleApprovalAction("request_changes")}
                  style={{ background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                >
                  Request Changes
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleApprovalAction("approve")}
                  style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#ffffff", border: "none", padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 4px rgba(16, 185, 129, 0.25)" }}
                >
                  {actionLoading ? "Processing..." : "✓ Approve & Publish Drive"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW JD MODAL */}
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
                maxWidth: "650px",
                width: "100%",
                padding: "28px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
                maxHeight: "85vh",
                overflowY: "auto"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>{selectedDrive.title}</h2>
                  <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>{selectedDrive.company?.companyName} • {selectedDrive.location}</p>
                </div>
                <button onClick={() => setSelectedDrive(null)} style={{ background: "#f1f5f9", border: "none", fontSize: "14px", padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}>✕</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "16px" }}>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Compensation</span>
                  <p style={{ margin: 0, fontWeight: 700, color: "#059669" }}>₹{(selectedDrive.salary / 100000).toFixed(1)} LPA</p>
                </div>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Min CGPA</span>
                  <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>{selectedDrive.eligibility?.minCGPA || selectedDrive.eligibility?.minCgpa || 0}+ CGPA</p>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "13px", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>Job Description</h4>
                <p style={{ margin: 0, background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "13.5px", color: "#334155", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {selectedDrive.description || "No description provided."}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setSelectedDrive(null)} style={{ background: "#f1f5f9", color: "#475569", padding: "9px 18px", borderRadius: "8px", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* CREATE DRIVE MODAL */}
        {showCreateModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div style={{ background: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "700px", maxHeight: "90vh", overflowY: "auto", padding: "28px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px", marginBottom: "18px" }}>
                <h2 style={{ margin: 0, fontSize: "19px", fontWeight: 800, color: "#0f172a" }}>Post Institutional Placement Drive</h2>
                <button onClick={() => setShowCreateModal(false)} style={{ background: "#f1f5f9", border: "none", fontSize: "14px", padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}>✕</button>
              </div>

              <form onSubmit={handleCreateDrive}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>Drive Title *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>Recruiter Company *</label>
                    <select value={formData.companyId} onChange={(e) => setFormData({ ...formData, companyId: e.target.value })} required style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff" }}>
                      <option value="">Select Company</option>
                      {companies.map(c => (
                        <option key={c._id} value={c._id}>{c.companyName || c.userId?.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>Role Designation *</label>
                    <input type="text" value={formData.jobRole} onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })} required style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>Package (CTC in INR) *</label>
                    <input type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} placeholder="e.g. 1000000" required style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>Location *</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>Min CGPA Cutoff</label>
                    <input type="number" step="0.1" value={formData.minCGPA} onChange={(e) => setFormData({ ...formData, minCGPA: e.target.value })} required style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>Job Description</label>
                    <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>

                <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: "#f1f5f9", color: "#475569", padding: "9px 18px", borderRadius: "8px", border: "none", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                  <button type="submit" disabled={submitting} style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#ffffff", padding: "9px 22px", borderRadius: "8px", border: "none", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer" }}>
                    {submitting ? "Publishing..." : "Publish Institutional Drive"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </TPOLayout>
  );
}

export default PlacementDrives;
