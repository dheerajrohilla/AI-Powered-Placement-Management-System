import { useEffect, useState, useRef } from "react";
import CompanyLayout from "../../layouts/CompanyLayout";
import { useAuth } from "../../context/useAuth";
import { companyAPI, getAssetUrl } from "../../services/api";
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Mail,
  Phone,
  Camera,
  CheckCircle,
  AlertCircle,
  Edit3,
  Save,
  X,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

function CompanyProfile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    location: "",
    headquarters: "",
    officeLocations: "",
    companySize: "501-1000 employees",
    industry: "",
    description: "",
    hrName: "",
    hrPhone: "",
    hrEmail: "",
    linkedin: "",
    logo: "",
    isVerified: true,
    totalPositions: 0,
    filledPositions: 0
  });

  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await companyAPI.getProfile();
      if (res.data) {
        const d = res.data;
        const u = d.userId || {};

        const loaded = {
          companyName: d.companyName || u.name || user?.name || "",
          website: d.website || "",
          location: d.location || "",
          headquarters: d.headquarters || d.location || "",
          officeLocations: d.officeLocations || "",
          companySize: d.companySize || "501-1000 employees",
          industry: d.industry || "",
          description: d.description || "",
          hrName: d.hrName || u.name || user?.name || "",
          hrPhone: d.hrPhone || u.phone || "",
          hrEmail: d.hrEmail || u.email || user?.email || "",
          linkedin: d.linkedin || "",
          logo: d.logo || u.profilePicture || user?.profilePicture || "",
          isVerified: d.isVerified !== false,
          totalPositions: d.totalPositions || 0,
          filledPositions: d.filledPositions || 0
        };

        setFormData(loaded);
        setInitialData(loaded);
      }
    } catch (err) {
      console.error("Failed to load company profile", err);
      setErrorMsg("Could not load organization details.");
    } finally {
      setLoading(false);
    }
  };

  const calculateCompleteness = () => {
    let score = 0;
    if (formData.companyName) score += 15;
    if (formData.website) score += 10;
    if (formData.industry) score += 10;
    if (formData.description) score += 15;
    if (formData.headquarters || formData.location) score += 10;
    if (formData.hrName) score += 10;
    if (formData.hrEmail) score += 10;
    if (formData.hrPhone) score += 10;
    if (formData.logo) score += 10;
    return Math.min(100, Math.max(20, score));
  };

  const completeness = calculateCompleteness();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (JPG, PNG, WEBP, GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Logo file size cannot exceed 5MB.");
      return;
    }

    try {
      setUploadingLogo(true);
      setMessage("");
      setErrorMsg("");

      const res = await companyAPI.uploadLogo(file);
      const newLogo = res.data?.logo;

      if (newLogo) {
        setFormData(prev => ({ ...prev, logo: newLogo }));
        if (updateUser) {
          updateUser({ profilePicture: newLogo });
        }
        setMessage("Company logo uploaded successfully!");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to upload company logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCancel = () => {
    if (initialData) {
      setFormData(initialData);
    }
    setEditing(false);
    setMessage("");
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMsg("");

    try {
      await companyAPI.updateProfile({
        companyName: formData.companyName,
        website: formData.website,
        location: formData.location,
        headquarters: formData.headquarters,
        officeLocations: formData.officeLocations,
        companySize: formData.companySize,
        industry: formData.industry,
        description: formData.description,
        hrName: formData.hrName,
        hrPhone: formData.hrPhone,
        hrEmail: formData.hrEmail,
        linkedin: formData.linkedin
      });

      setMessage("Company profile updated successfully!");
      setEditing(false);
      setInitialData(formData);

      if (updateUser) {
        updateUser({
          name: formData.companyName,
          phone: formData.hrPhone,
          profilePicture: formData.logo
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const initial = formData.companyName ? formData.companyName.charAt(0).toUpperCase() : "C";

  if (loading) {
    return (
      <CompanyLayout>
        <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748B" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <h2 style={{ fontSize: "18px", color: "#0F172A", margin: "0 0 6px" }}>Loading Organization Profile...</h2>
          <p style={{ margin: 0, fontSize: "14px" }}>Retrieving enterprise recruitment specifications.</p>
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout>
      <div style={{ maxWidth: "1050px", margin: "0 auto", paddingBottom: "40px" }}>

        {/* FEEDBACK BANNERS */}
        {message && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 18px",
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            borderRadius: "12px",
            color: "#065F46",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "20px"
          }}>
            <CheckCircle size={18} color="#059669" />
            <span>{message}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 18px",
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "12px",
            color: "#991B1B",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "20px"
          }}>
            <AlertCircle size={18} color="#DC2626" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TOP HERO BANNER */}
        <div style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0369A1 100%)",
          borderRadius: "20px",
          padding: "30px",
          color: "#FFFFFF",
          marginBottom: "24px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
            position: "relative",
            zIndex: 1
          }}>
            {/* Logo & Basic Identifiers */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, #0284C7, #2563EB)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: "800",
                  color: "#FFFFFF",
                  overflow: "hidden",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
                  border: "3px solid rgba(255, 255, 255, 0.2)"
                }}>
                  {formData.logo ? (
                    <img
                      src={getAssetUrl(formData.logo)}
                      alt={formData.companyName}
                      style={{ width: "100%", height: "100%", objectFit: "contain", background: "#FFFFFF" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    initial
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  title="Upload company logo"
                  style={{
                    position: "absolute",
                    bottom: "-6px",
                    right: "-6px",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#0284C7",
                    border: "2px solid #0F172A",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                  }}
                >
                  <Camera size={15} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: "none" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                  <h1 style={{ fontSize: "24px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" }}>
                    {formData.companyName || "Organization"}
                  </h1>
                  <span style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    background: "rgba(56, 189, 248, 0.2)",
                    color: "#38BDF8",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    border: "1px solid rgba(56, 189, 248, 0.4)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    <ShieldCheck size={14} /> Verified Partner
                  </span>
                  {formData.industry && (
                    <span style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#E2E8F0",
                      padding: "3px 10px",
                      borderRadius: "12px"
                    }}>
                      {formData.industry}
                    </span>
                  )}
                </div>

                <p style={{ color: "#BAE6FD", fontSize: "14px", margin: "0 0 6px" }}>
                  Headquarters: {formData.headquarters || formData.location || "Global"} • {formData.companySize}
                </p>
                <p style={{ color: "#E0F2FE", fontSize: "13px", margin: 0, opacity: 0.85 }}>
                  HR Point of Contact: {formData.hrName} ({formData.hrEmail})
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  style={{
                    background: "linear-gradient(135deg, #0284C7, #2563EB)",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "13.5px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)"
                  }}
                >
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#F1F5F9",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      padding: "10px 18px",
                      borderRadius: "10px",
                      fontWeight: "600",
                      fontSize: "13.5px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    style={{
                      background: "linear-gradient(135deg, #059669, #10B981)",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "10px 22px",
                      borderRadius: "10px",
                      fontWeight: "700",
                      fontSize: "13.5px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                    }}
                  >
                    <Save size={16} />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Strength Bar */}
          <div style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px"
          }}>
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12.5px" }}>
                <span style={{ color: "#BAE6FD", fontWeight: "600" }}>Organization Profile Quality</span>
                <span style={{ color: "#38BDF8", fontWeight: "700" }}>{completeness}% Configured</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{
                  width: `${completeness}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #38BDF8, #2563EB)",
                  borderRadius: "10px",
                  transition: "width 0.4s ease"
                }} />
              </div>
            </div>

            <div>
              <span style={{
                fontSize: "12px",
                color: "#E2E8F0",
                background: "rgba(255, 255, 255, 0.08)",
                padding: "4px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.15)"
              }}>
                Portal Visibility: Public to Registered Students & TPO
              </span>
            </div>
          </div>
        </div>

        {/* PROFILE CONTENT */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* SECTION 1: ORGANIZATION DETAILS */}
            <div style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              padding: "28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: "0 0 4px" }}>
                Company & Enterprise Specifications
              </h3>
              <p style={{ color: "#64748B", fontSize: "13.5px", margin: "0 0 20px" }}>
                Corporate identity presented to students across placement drives and interview invitations.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                {/* Company Name */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Company Name *
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="e.g. ABC Technologies"
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  ) : (
                    <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", fontWeight: "700", color: "#0F172A", fontSize: "14px" }}>
                      {formData.companyName || "Organization"}
                    </div>
                  )}
                </div>

                {/* Website */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Official Website URL
                  </label>
                  {editing ? (
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://company.com"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  ) : (
                    <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                      {formData.website ? (
                        <a href={formData.website} target="_blank" rel="noreferrer" style={{ color: "#0284C7", textDecoration: "none", fontWeight: "600", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <Globe size={14} /> {formData.website} <ExternalLink size={13} />
                        </a>
                      ) : (
                        <span style={{ color: "#94A3B8", fontSize: "14px" }}>Not specified</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Industry */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Industry Domain
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      placeholder="e.g. Information Technology & Cloud Services"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  ) : (
                    <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", fontWeight: "600", color: "#0F172A", fontSize: "14px" }}>
                      {formData.industry || "Technology"}
                    </div>
                  )}
                </div>

                {/* Company Size */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Company Size
                  </label>
                  {editing ? (
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        background: "#FFFFFF"
                      }}
                    >
                      <option value="1-50 employees">1-50 employees (Early Stage)</option>
                      <option value="51-200 employees">51-200 employees (Growth)</option>
                      <option value="201-500 employees">201-500 employees (Mid Market)</option>
                      <option value="501-1000 employees">501-1000 employees (Scale-up)</option>
                      <option value="1000-5000 employees">1000-5000 employees (Enterprise)</option>
                      <option value="5000+ employees">5000+ employees (Global MNC)</option>
                    </select>
                  ) : (
                    <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", fontWeight: "600", color: "#0F172A", fontSize: "14px" }}>
                      {formData.companySize || "501-1000 employees"}
                    </div>
                  )}
                </div>

                {/* Headquarters */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Global Headquarters
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="headquarters"
                      value={formData.headquarters}
                      onChange={handleInputChange}
                      placeholder="e.g. Bangalore, India"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  ) : (
                    <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", fontWeight: "600", color: "#0F172A", fontSize: "14px" }}>
                      {formData.headquarters || formData.location || "Not specified"}
                    </div>
                  )}
                </div>

                {/* Office Locations */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Operating Office Locations
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="officeLocations"
                      value={formData.officeLocations}
                      onChange={handleInputChange}
                      placeholder="e.g. Bangalore, Hyderabad, Pune, London"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  ) : (
                    <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", fontWeight: "600", color: "#0F172A", fontSize: "14px" }}>
                      {formData.officeLocations || formData.location || "On-Campus / Hybrid Locations"}
                    </div>
                  )}
                </div>
              </div>

              {/* Company Description */}
              <div style={{ marginTop: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Company Profile & Mission Overview
                </label>
                {editing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Provide an overview of your organization, engineering philosophy, and graduate culture..."
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      lineHeight: "1.5"
                    }}
                  />
                ) : (
                  <div style={{ padding: "14px 16px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", color: "#334155", fontSize: "14px", lineHeight: "1.6" }}>
                    {formData.description || "Corporate partner actively recruiting engineering talent through campus placement drives."}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: HR & RECRUITER CONTACT */}
            <div style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              padding: "28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: "0 0 4px" }}>
                Campus HR Liaison & Point of Contact
              </h3>
              <p style={{ color: "#64748B", fontSize: "13.5px", margin: "0 0 20px" }}>
                Direct recruitment coordinator details used for official communications with the TPO cell and interview scheduling.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                {/* HR Name */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    HR / Recruiter Full Name *
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="hrName"
                      value={formData.hrName}
                      onChange={handleInputChange}
                      placeholder="e.g. Priya Nair"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  ) : (
                    <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", fontWeight: "600", color: "#0F172A", fontSize: "14px" }}>
                      {formData.hrName || "Hiring Manager"}
                    </div>
                  )}
                </div>

                {/* HR Email */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Official HR Email *
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      name="hrEmail"
                      value={formData.hrEmail}
                      onChange={handleInputChange}
                      placeholder="e.g. campus.recruitment@company.com"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  ) : (
                    <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", fontWeight: "600", color: "#0F172A", fontSize: "14px" }}>
                      <Mail size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                      {formData.hrEmail || user?.email || "Not specified"}
                    </div>
                  )}
                </div>

                {/* HR Phone */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    HR Contact Phone
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="hrPhone"
                      value={formData.hrPhone}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 9876543210"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  ) : (
                    <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", fontWeight: "600", color: "#0F172A", fontSize: "14px" }}>
                      <Phone size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                      {formData.hrPhone || "Not specified"}
                    </div>
                  )}
                </div>

                {/* LinkedIn Page */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Corporate LinkedIn Page
                  </label>
                  {editing ? (
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/company/organization"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  ) : (
                    <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                      {formData.linkedin ? (
                        <a href={formData.linkedin} target="_blank" rel="noreferrer" style={{ color: "#0284C7", textDecoration: "none", fontWeight: "600", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <Linkedin size={14} /> {formData.linkedin} <ExternalLink size={13} />
                        </a>
                      ) : (
                        <span style={{ color: "#94A3B8", fontSize: "14px" }}>Not linked</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </form>

      </div>
    </CompanyLayout>
  );
}

export default CompanyProfile;
