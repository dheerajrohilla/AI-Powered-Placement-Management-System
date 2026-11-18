import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CompanyLayout from "../../layouts/CompanyLayout";
import { companyAPI } from "../../services/api";

function CreateDrive() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    jobRole: "",
    positions: 5,
    packageLPA: "",
    location: "Bangalore / Hybrid",
    jobType: "Full-Time",
    minCgpa: "7.0",
    allowedDepartments: "Computer Science, Information Technology, Electronics & Communication",
    skills: "React, Node.js, JavaScript, Data Structures, System Design",
    driveDate: "",
    lastDate: "",
    description: "",
    benefits: "Health Insurance, Performance Bonus, Flexible Hours, Learning Stipend"
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreate = async (submitForApproval = true) => {
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const salaryNum = Number(formData.packageLPA.replace(/[^0-9.]/g, "")) * 100000;
      if (!formData.title || !formData.packageLPA) {
        setError("Please provide at least a Job Title and Compensation package.");
        setSaving(false);
        return;
      }

      const res = await companyAPI.createDrive({
        title: formData.title,
        jobRole: formData.jobRole || formData.title,
        salary: salaryNum || 600000,
        positions: Number(formData.positions) || 1,
        location: formData.location,
        jobType: formData.jobType,
        eligibility: {
          minCgpa: Number(formData.minCgpa) || 6.0,
          allowedDepartments: formData.allowedDepartments
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean),
          backlogsAllowed: false
        },
        requirements: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        benefits: formData.benefits
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean),
        driveDate: formData.driveDate || undefined,
        registrationDeadline: formData.lastDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        description: formData.description,
        approvalStatus: submitForApproval ? "pending_approval" : "draft"
      });

      const driveId = res.data?._id;
      if (submitForApproval && driveId) {
        try {
          await companyAPI.submitDriveForApproval(driveId);
        } catch {
          // Drive was already created with pending_approval by backend
        }
      }

      setSuccessMsg(
        submitForApproval
          ? "Placement Drive created and submitted to TPO for campus review!"
          : "Placement Drive saved as Draft. You can submit it for approval whenever ready."
      );

      setTimeout(() => {
        navigate("/company/drives");
      }, 1500);
    } catch (err) {
      console.error("Create drive error:", err);
      setError(err.response?.data?.error || "Failed to create placement drive.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CompanyLayout>
      <div style={{ maxWidth: "980px", margin: "0 auto", paddingBottom: "40px" }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Create Placement Drive
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              Publish campus hiring opportunities. All drives are routed to the TPO for verification before going live to students.
            </p>
          </div>

          <Link
            to="/company/drives"
            style={{
              background: "#f1f5f9",
              color: "#475569",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "13px",
              textDecoration: "none"
            }}
          >
            ← Back to Drives
          </Link>
        </div>

        {error && (
          <div style={{
            padding: "14px 18px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            color: "#991b1b",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "20px"
          }}>
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: "14px 18px",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: "10px",
            color: "#065f46",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "20px"
          }}>
            ✓ {successMsg}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate(true);
          }}
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            padding: "32px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          {/* SECTION 1: ROLE & COMPENSATION */}
          <div style={{ marginBottom: "28px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>💼</span> Position & Compensation
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Drive Title / Posting Headline *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Graduate Software Development Engineer 2026"
                  value={formData.title}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Job Designation / Role *
                </label>
                <input
                  type="text"
                  name="jobRole"
                  required
                  placeholder="e.g. Full-Stack Developer"
                  value={formData.jobRole}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Annual Package (LPA in ₹) *
                </label>
                <input
                  type="text"
                  name="packageLPA"
                  required
                  placeholder="e.g. 12 (or 12.5)"
                  value={formData.packageLPA}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Number of Positions Available
                </label>
                <input
                  type="number"
                  name="positions"
                  min="1"
                  value={formData.positions}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Employment Type
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    background: "#ffffff"
                  }}
                >
                  <option value="Full-Time">Full-Time (FTE)</option>
                  <option value="Internship">6-Month Internship</option>
                  <option value="Internship + FTE">Internship followed by FTE</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Work Location
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Bangalore / Hyderabad / Remote"
                  value={formData.location}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px"
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: ELIGIBILITY CRITERIA */}
          <div style={{ marginBottom: "28px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🎯</span> Student Eligibility Criteria
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Minimum Cutoff CGPA
                </label>
                <input
                  type="number"
                  name="minCgpa"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="e.g. 7.5"
                  value={formData.minCgpa}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Eligible Academic Departments
                </label>
                <input
                  type="text"
                  name="allowedDepartments"
                  placeholder="Comma-separated: CSE, IT, ECE, ME"
                  value={formData.allowedDepartments}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Registration Deadline *
                </label>
                <input
                  type="date"
                  name="lastDate"
                  value={formData.lastDate}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Drive / Assessment Date
                </label>
                <input
                  type="date"
                  name="driveDate"
                  value={formData.driveDate}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px"
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: SKILLS & DESCRIPTION */}
          <div style={{ marginBottom: "28px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📝</span> Skills & Job Description
            </h3>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                Required Technical Skills (Comma-separated)
              </label>
              <input
                type="text"
                name="skills"
                placeholder="e.g. React, Python, SQL, REST APIs, Docker"
                value={formData.skills}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                Job Description & Expectations
              </label>
              <textarea
                name="description"
                rows="4"
                placeholder="Describe day-to-day responsibilities, project scopes, team structure, and prerequisites..."
                value={formData.description}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                Perks & Benefits (Comma-separated)
              </label>
              <input
                type="text"
                name="benefits"
                placeholder="e.g. Health Insurance, Hybrid Mode, Relocation Assistance"
                value={formData.benefits}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px"
                }}
              />
            </div>
          </div>

          {/* SUBMIT BUTTONS */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleCreate(false)}
              style={{
                background: "#f1f5f9",
                color: "#475569",
                padding: "11px 20px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontWeight: 600,
                fontSize: "14px",
                cursor: saving ? "not-allowed" : "pointer"
              }}
            >
              Save as Draft
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                color: "#ffffff",
                padding: "11px 26px",
                borderRadius: "8px",
                border: "none",
                fontWeight: 600,
                fontSize: "14px",
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: "0 2px 4px rgba(37, 99, 235, 0.25)"
              }}
            >
              {saving ? "Submitting..." : "Submit to TPO for Approval 🚀"}
            </button>
          </div>
        </form>
      </div>
    </CompanyLayout>
  );
}

export default CreateDrive;