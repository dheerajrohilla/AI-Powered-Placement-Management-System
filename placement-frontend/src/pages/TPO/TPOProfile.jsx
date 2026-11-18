import { useEffect, useState, useRef } from "react";
import TPOLayout from "../../layouts/TPOLayout";
import { useAuth } from "../../context/useAuth";
import { tpoAPI, getAssetUrl } from "../../services/api";
import {
  User,
  Shield,
  Building,
  KeyRound,
  Camera,
  CheckCircle,
  AlertCircle,
  Edit3,
  Save,
  X
} from "lucide-react";

function TPOProfile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    department: "Training & Placement Cell",
    designation: "Head Training & Placement Officer",
    collegeName: "National Institute of Technology",
    university: "National Institute of Technology",
    officeLocation: "Placement Cell, Main Block",
    employeeId: "",
    bio: "",
    profilePicture: user?.profilePicture || ""
  });

  const [initialData, setInitialData] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await tpoAPI.getProfile();
      if (res.data) {
        const u = res.data.user || {};
        const t = res.data.tpoProfile || {};
        const loaded = {
          name: u.name || user?.name || "",
          email: u.email || user?.email || "",
          phone: u.phone || t.phone || "",
          department: t.department || "Training & Placement Cell",
          designation: t.designation || "Head Training & Placement Officer",
          collegeName: t.collegeName || "National Institute of Technology",
          university: t.university || t.collegeName || "National Institute of Technology",
          officeLocation: t.officeLocation || "Placement Cell, Main Block",
          employeeId: t.employeeId || "",
          bio: t.bio || "",
          profilePicture: u.profilePicture || user?.profilePicture || ""
        };
        setFormData(loaded);
        setInitialData(loaded);
      }
    } catch (err) {
      console.error("Error loading TPO profile:", err);
      setErrorMsg("Failed to load officer profile records.");
    } finally {
      setLoading(false);
    }
  };

  const calculateCompleteness = () => {
    let score = 0;
    if (formData.name) score += 15;
    if (formData.email) score += 15;
    if (formData.phone) score += 15;
    if (formData.designation) score += 15;
    if (formData.department) score += 10;
    if (formData.employeeId) score += 10;
    if (formData.officeLocation) score += 10;
    if (formData.bio) score += 10;
    return Math.min(100, Math.max(20, score));
  };

  const completeness = calculateCompleteness();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (JPG, PNG, WEBP, GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size exceeds maximum 5MB limit.");
      return;
    }

    try {
      setUploadingPhoto(true);
      setMessage("");
      setErrorMsg("");

      const res = await tpoAPI.uploadPhoto(file);
      const newPhoto = res.data?.profilePicture;
      if (newPhoto) {
        setFormData(prev => ({ ...prev, profilePicture: newPhoto }));
        if (updateUser) {
          updateUser({ profilePicture: newPhoto });
        }
        setMessage("Officer photograph uploaded successfully!");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMsg("");

    try {
      await tpoAPI.updateProfile({
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        collegeName: formData.collegeName,
        university: formData.university,
        officeLocation: formData.officeLocation,
        employeeId: formData.employeeId,
        bio: formData.bio
      });

      setMessage("Placement officer profile details saved successfully!");
      setEditing(false);
      setInitialData(formData);

      if (updateUser) {
        updateUser({
          name: formData.name,
          phone: formData.phone,
          profilePicture: formData.profilePicture
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to update profile details.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMsg("");

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setErrorMsg("Please provide your current and new password.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await tpoAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage("Security password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const initial = formData.name ? formData.name.charAt(0).toUpperCase() : "T";

  if (loading) {
    return (
      <TPOLayout>
        <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748B" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <h2 style={{ fontSize: "18px", color: "#0F172A", margin: "0 0 6px" }}>Loading Officer Profile...</h2>
          <p style={{ margin: 0, fontSize: "14px" }}>Retrieving institutional placement authorization records.</p>
        </div>
      </TPOLayout>
    );
  }

  return (
    <TPOLayout>
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
          background: "linear-gradient(135deg, #064E3B 0%, #065F46 50%, #0F172A 100%)",
          borderRadius: "20px",
          padding: "30px",
          color: "#FFFFFF",
          marginBottom: "24px",
          boxShadow: "0 10px 30px rgba(6, 78, 59, 0.2)",
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
            {/* Officer Avatar & Identity */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "30px",
                  fontWeight: "800",
                  color: "#FFFFFF",
                  overflow: "hidden",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
                  border: "3px solid rgba(255, 255, 255, 0.2)"
                }}>
                  {formData.profilePicture ? (
                    <img
                      src={getAssetUrl(formData.profilePicture)}
                      alt={formData.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    initial
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  title="Upload officer photograph"
                  style={{
                    position: "absolute",
                    bottom: "-6px",
                    right: "-6px",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#10B981",
                    border: "2px solid #064E3B",
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
                  onChange={handlePhotoUpload}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: "none" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                  <h1 style={{ fontSize: "24px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" }}>
                    {formData.name || "Placement Officer"}
                  </h1>
                  <span style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    background: "rgba(52, 211, 153, 0.2)",
                    color: "#6EE7B7",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    border: "1px solid rgba(52, 211, 153, 0.4)"
                  }}>
                    🛡️ TPO Officer
                  </span>
                  {formData.employeeId && (
                    <span style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#E2E8F0",
                      padding: "3px 10px",
                      borderRadius: "12px"
                    }}>
                      ID: {formData.employeeId}
                    </span>
                  )}
                </div>

                <p style={{ color: "#A7F3D0", fontSize: "14px", margin: "0 0 6px" }}>
                  {formData.designation} • {formData.department}
                </p>
                <p style={{ color: "#D1FAE5", fontSize: "13px", margin: 0, opacity: 0.85 }}>
                  {formData.university} • {formData.email}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {activeTab === "profile" && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    style={{
                      background: "linear-gradient(135deg, #10B981, #059669)",
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
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
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
                      onClick={handleProfileSubmit}
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
            )}
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
                <span style={{ color: "#A7F3D0", fontWeight: "600" }}>Institutional Profile Completeness</span>
                <span style={{ color: "#6EE7B7", fontWeight: "700" }}>{completeness}% Completed</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{
                  width: `${completeness}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #10B981, #34D399)",
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
                Institutional Security Level: Placement Administrator
              </span>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid #E2E8F0",
          marginBottom: "24px"
        }}>
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: activeTab === "profile" ? "#FFFFFF" : "transparent",
              color: activeTab === "profile" ? "#059669" : "#64748B",
              border: "none",
              borderBottom: activeTab === "profile" ? "3px solid #059669" : "3px solid transparent",
              fontWeight: activeTab === "profile" ? "700" : "600",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            <User size={16} />
            <span>Officer Details & Institution</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("password")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: activeTab === "password" ? "#FFFFFF" : "transparent",
              color: activeTab === "password" ? "#059669" : "#64748B",
              border: "none",
              borderBottom: activeTab === "password" ? "3px solid #059669" : "3px solid transparent",
              fontWeight: activeTab === "password" ? "700" : "600",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            <KeyRound size={16} />
            <span>Security & Password</span>
          </button>
        </div>

        {/* TAB 1: OFFICER PROFILE DETAILS */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit}>
            <div style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              padding: "28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "24px"
            }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: "0 0 4px" }}>
                  Institutional Officer Information
                </h3>
                <p style={{ color: "#64748B", fontSize: "13.5px", margin: 0 }}>
                  Authorized liaison credentials displayed on corporate placement invitations and campus drives.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Full Name *
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Dr. Rajesh Kumar"
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
                      {formData.name || "Not specified"}
                    </div>
                  )}
                </div>

                {/* Official Email */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Official Email (Account Username)
                  </label>
                  <div style={{ padding: "10px 14px", background: "#F1F5F9", borderRadius: "8px", border: "1px solid #E2E8F0", color: "#64748B", fontSize: "14px", fontWeight: "500" }}>
                    {formData.email} <span style={{ fontSize: "11px", color: "#059669", fontWeight: "700" }}>• Institutional Primary</span>
                  </div>
                </div>

                {/* Contact Number */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Direct Contact Number
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
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
                      {formData.phone || "Not specified"}
                    </div>
                  )}
                </div>

                {/* Designation */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Designation
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      placeholder="e.g. Head Training & Placement Officer"
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
                      {formData.designation || "Head Training & Placement Officer"}
                    </div>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Department
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="e.g. Training & Placement Office"
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
                      {formData.department || "Training & Placement Cell"}
                    </div>
                  )}
                </div>

                {/* University / College */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    University / Institution
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      placeholder="e.g. National Institute of Technology"
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
                      {formData.university || "National Institute of Technology"}
                    </div>
                  )}
                </div>

                {/* Employee ID */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Employee / Faculty ID
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      placeholder="e.g. TPO-1042"
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
                      {formData.employeeId || "Pending Verification"}
                    </div>
                  )}
                </div>

                {/* Office Location */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Physical Office Location
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="officeLocation"
                      value={formData.officeLocation}
                      onChange={handleInputChange}
                      placeholder="e.g. Placement Cell, Main Academic Block, Room 204"
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
                      {formData.officeLocation || "Placement Cell, Main Block"}
                    </div>
                  )}
                </div>
              </div>

              {/* Biography */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Officer Biography & Placement Vision
                </label>
                {editing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Brief background on placement cell initiatives, campus engagement, and recruiter liaisons..."
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
                  <div style={{ padding: "12px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", color: "#334155", fontSize: "14px", lineHeight: "1.6" }}>
                    {formData.bio || "Dedicated to facilitating seamless corporate engagements, student placement coaching, and industry recruitment drives."}
                  </div>
                )}
              </div>

              {/* Protected Authorization Notice */}
              <div style={{
                padding: "14px 18px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}>
                <Shield size={20} color="#059669" />
                <span style={{ fontSize: "13px", color: "#475569" }}>
                  <strong>Security Note:</strong> Placement privileges, drive authorization quotas, and student data access are system-protected and cannot be modified via profile editing.
                </span>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: SECURITY & PASSWORD */}
        {activeTab === "password" && (
          <form onSubmit={handlePasswordSubmit}>
            <div style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              padding: "28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              maxWidth: "600px"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: "0 0 6px" }}>
                Update Officer Password
              </h3>
              <p style={{ color: "#64748B", fontSize: "13.5px", margin: "0 0 20px" }}>
                Ensure your account maintains a strong credential to safeguard student and corporate records.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
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
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    New Password (min 6 characters) *
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
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
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
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
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  style={{
                    background: "linear-gradient(135deg, #059669, #10B981)",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer",
                    marginTop: "8px",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                  }}
                >
                  {savingPassword ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </TPOLayout>
  );
}

export default TPOProfile;
