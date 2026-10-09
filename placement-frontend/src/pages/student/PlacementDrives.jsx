import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI } from "../../services/api";

function PlacementDrives() {
  const [applied, setApplied] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [profileStrength, setProfileStrength] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [successNotice, setSuccessNotice] = useState(null);

  useEffect(() => {
    studentAPI.getPlacementDrives()
      .then((response) => setJobs(response.data))
      .catch(() => setMessage("Unable to load placement drives."))
      .finally(() => setLoading(false));

    studentAPI.getApplications()
      .then((response) => {
        const ids = (response.data || [])
          .map((a) => a.placementDrive?._id || a.placementDrive)
          .filter(Boolean);
        setApplied(ids);
      })
      .catch(() => {});

    studentAPI.getDashboard()
      .then((response) => setProfileStrength(response.data?.profileStrength ?? null))
      .catch(() => {});
  }, []);

  const handleApply = async (id) => {
    try {
      const res = await studentAPI.applyForDrive(id);
      setApplied((current) =>
        current.includes(id) ? current : [...current, id]
      );
      const targetJob = jobs.find((j) => j._id === id);
      setSuccessNotice({
        companyName: targetJob?.company?.companyName || "Company",
        jobRole: targetJob?.jobRole || targetJob?.title || "Role",
        recipient: res.data?.emailNotification?.recipient,
        message: res.data?.emailNotification?.message || "Application submitted successfully! Check your registered email for test details.",
        driveId: id
      });
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.error || "Unable to apply for this drive.");
    }
  };

  return (
    <DashboardLayout>
      <div className="drives-page">
        <div className="drives-heading">
          <div>
            <h1>Placement Drives</h1>
            <p>Explore companies and apply for suitable opportunities.</p>
          </div>
        </div>

        {successNotice && (
          <div style={{
            background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
            border: "1px solid #86efac",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "24px",
            boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "22px" }}>📬</span>
                  <h3 style={{ margin: 0, color: "#166534", fontSize: "17px", fontWeight: 700 }}>
                    Application Submitted & Confirmation Email Dispatched!
                  </h3>
                  <span style={{ background: "#bbf7d0", color: "#14532d", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "12px" }}>
                    ✓ Email Sent
                  </span>
                </div>
                <p style={{ margin: "0 0 12px 0", color: "#15803d", fontSize: "14px", lineHeight: 1.5 }}>
                  You have successfully applied for <strong>{successNotice.companyName}</strong> ({successNotice.jobRole}). A confirmation email has been delivered to your registered email address <strong>{successNotice.recipient}</strong> with the official notice: <em style={{ fontWeight: 600 }}>"Get ready for the test! All the best!"</em>
                </p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <Link to={`/student/company-prep/${successNotice.driveId}`} style={{ textDecoration: "none" }}>
                    <button className="btn-primary" style={{ padding: "8px 14px", fontSize: "12px", background: "#16a34a", border: "none" }}>
                      🎯 Open {successNotice.companyName} Prep Mode
                    </button>
                  </Link>
                  <Link to={`/student/mock-interview?driveId=${successNotice.driveId}`} style={{ textDecoration: "none" }}>
                    <button className="btn-secondary" style={{ padding: "8px 14px", fontSize: "12px" }}>
                      🎙️ Take AI Mock Interview
                    </button>
                  </Link>
                  <Link to="/student/applications" style={{ textDecoration: "none" }}>
                    <button className="btn-secondary" style={{ padding: "8px 14px", fontSize: "12px" }}>
                      📋 View Application Status
                    </button>
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setSuccessNotice(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "18px", color: "#166534", padding: "4px" }}
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="drive-summary">
          <div><span>Available Drives</span><strong>{jobs.length}</strong></div>
          <div><span>Applications</span><strong>{applied.length}</strong></div>
          <div>
            <span>Profile Strength</span>
            <strong>{profileStrength !== null ? `${profileStrength}%` : "--"}</strong>
          </div>
        </div>

        <div className="drives-list">
          {loading && <p>Loading placement drives...</p>}
          {!loading && jobs.length === 0 && <p>{message || "No placement drives are available right now."}</p>}
          {message && jobs.length > 0 && <p>{message}</p>}

          {jobs.map((job) => (
            <div className="drive-card" key={job._id}>
              <div className="company-logo">{job.company?.companyName?.charAt(0) || "C"}</div>
              <div className="drive-main">
                <div className="drive-top">
                  <div>
                    <h2>{job.jobRole || job.title}</h2>
                    <h3>{job.company?.companyName || "Company"}</h3>
                  </div>
                  <span className="job-type">{job.jobType || "Full Time"}</span>
                </div>
                <div className="drive-details">
                  <span>Salary: ₹{job.salary?.toLocaleString() || "Not specified"}</span>
                  <span>Location: {job.location || "Not specified"}</span>
                  <span>Eligibility: CGPA {job.eligibility?.minCGPA || 0}+</span>
                </div>
                <div className="drive-skills">
                  <strong>Required Skills:</strong>
                  <span>{job.requirements?.join(", ") || "See job description"}</span>
                </div>
              </div>
              <div className="drive-action" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  className={applied.includes(job._id) ? "applied-btn" : "apply-btn"}
                  onClick={() => handleApply(job._id)}
                  disabled={applied.includes(job._id)}
                >
                  {applied.includes(job._id) ? "Applied" : "Apply Now"}
                </button>
                <Link to={`/student/company-prep/${job._id}`}>
                  <button className="btn-secondary" style={{ width: "100%", padding: "7px 12px", fontSize: "12px" }}>
                    🎯 Prep Mode
                  </button>
                </Link>
                <Link to={`/student/mock-interview?driveId=${job._id}`}>
                  <button className="btn-secondary" style={{ width: "100%", padding: "7px 12px", fontSize: "12px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                    🎙️ Mock Interview
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PlacementDrives;