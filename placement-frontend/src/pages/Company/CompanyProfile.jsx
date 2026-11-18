import { useEffect, useState } from "react";
import CompanyLayout from "../../layouts/CompanyLayout";
import { useAuth } from "../../context/useAuth";
import { companyAPI } from "../../services/api";

function CompanyProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    hrName: "",
    hrEmail: "",
    hrPhone: "",
    website: "",
    location: "",
    industry: "",
    description: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await companyAPI.getProfile();
      if (res.data) {
        setFormData({
          companyName: res.data.companyName || user?.name || "",
          hrName: res.data.hrName || user?.name || "",
          hrEmail: res.data.hrEmail || user?.email || "",
          hrPhone: res.data.hrPhone || "",
          website: res.data.website || "",
          location: res.data.location || "",
          industry: res.data.industry || "",
          description: res.data.description || ""
        });
      }
    } catch (err) {
      console.error("Failed to load company profile", err);
      setErrorMsg("Could not load organization details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMsg("");
    try {
      await companyAPI.updateProfile(formData);
      setMessage("Company profile updated successfully.");
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CompanyLayout>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Organization Profile & Recruitment Settings
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
            Manage your company details, primary point of contact, and enterprise recruitment preferences.
          </p>
        </div>

        {message && (
          <div style={{
            padding: "12px 16px",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: "8px",
            color: "#065f46",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "20px"
          }}>
            ✓ {message}
          </div>
        )}

        {errorMsg && (
          <div style={{
            padding: "12px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#991b1b",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "20px"
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            Loading organization profile...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            padding: "28px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#1e293b", marginBottom: "18px" }}>
              🏢 Enterprise Identity
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px", marginBottom: "22px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
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
                  Official Website
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
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
                  Headquarters / Office Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore, India"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                  Industry Vertical
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software & Cloud, Fintech, Automotive"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
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

            <div style={{ marginBottom: "26px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                About Company
              </label>
              <textarea
                rows="4"
                placeholder="Brief description of the organization and workplace culture..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px"
                }}
              />
            </div>

            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#1e293b", marginBottom: "18px" }}>
              👤 Primary Recruiter Contact
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px", marginBottom: "28px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                  HR / Recruiter Name
                </label>
                <input
                  type="text"
                  value={formData.hrName}
                  onChange={(e) => setFormData({ ...formData, hrName: e.target.value })}
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
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.hrEmail}
                  onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.hrPhone}
                  onChange={(e) => setFormData({ ...formData, hrPhone: e.target.value })}
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

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                  color: "#ffffff",
                  padding: "11px 24px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
                }}
              >
                {saving ? "Saving Changes..." : "Save Profile Details"}
              </button>
            </div>
          </form>
        )}
      </div>
    </CompanyLayout>
  );
}

export default CompanyProfile;
