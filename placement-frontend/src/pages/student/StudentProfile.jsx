import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/useAuth";
import { studentAPI, getAssetUrl } from "../../services/api";
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Compass, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  Edit3, 
  Save, 
  X, 
  ExternalLink,
  Plus,
  Trash2,
  FileText
} from "lucide-react";

function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  // Profile state matching backend schema
  const [profile, setProfile] = useState({
    // Personal Details
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    bio: "",
    profilePicture: user?.profilePicture || "",

    // Academic Details
    rollNumber: "",
    university: "National Institute of Technology",
    campus: "Main Campus",
    degree: "Bachelor of Technology",
    department: "",
    currentSemester: "7th Semester",
    batch: "",
    cgpa: "",
    activeBacklogs: 0,
    education: [],

    // Professional Details
    skills: [],
    programmingLanguages: [],
    certifications: [],
    projects: [],
    experience: [],
    resume: null,
    socialLinks: {
      github: "",
      linkedin: "",
      portfolio: "",
      leetcode: ""
    },

    // Career Preferences
    careerObjective: "",
    preferredRoles: [],
    preferredLocations: [],
    profileStrength: 0
  });

  // Staging for tag inputs in edit mode
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newLocation, setNewLocation] = useState("");

  // Staging for complex sub-items in edit mode
  const [newProject, setNewProject] = useState({ title: "", description: "", techStack: "", link: "" });
  const [newCert, setNewCert] = useState({ title: "", issuer: "", issueDate: "" });
  const [newExp, setNewExp] = useState({ role: "", company: "", duration: "", description: "" });

  // Backup of profile state for canceling edits
  const [initialProfile, setInitialProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await studentAPI.getProfile();
      if (res.data) {
        const d = res.data;
        const u = d.userId || {};

        const loadedProfile = {
          // Personal Details
          name: u.name || user?.name || "",
          email: u.email || user?.email || "",
          phone: d.phone || u.phone || "",
          dob: d.dob || "",
          gender: d.gender || "",
          address: d.address || "",
          city: d.city || "",
          state: d.state || "",
          country: d.country || "India",
          bio: d.bio || "",
          profilePicture: u.profilePicture || user?.profilePicture || "",

          // Academic Details
          rollNumber: d.rollNumber || "",
          university: d.university || "National Institute of Technology",
          campus: d.campus || "Main Campus",
          degree: d.degree || "Bachelor of Technology",
          department: d.department || "",
          currentSemester: d.currentSemester || "7th Semester",
          batch: d.batch ? d.batch.toString() : "",
          cgpa: d.cgpa != null && d.cgpa > 0 ? d.cgpa.toString() : "",
          activeBacklogs: d.activeBacklogs || 0,
          education: Array.isArray(d.education) ? d.education : [],

          // Professional Details
          skills: Array.isArray(d.skills) ? d.skills : [],
          programmingLanguages: Array.isArray(d.programmingLanguages) ? d.programmingLanguages : [],
          certifications: Array.isArray(d.certifications) ? d.certifications : [],
          projects: Array.isArray(d.projects) ? d.projects : [],
          experience: Array.isArray(d.experience) ? d.experience : [],
          resume: d.resume || null,
          socialLinks: {
            github: d.socialLinks?.github || "",
            linkedin: d.socialLinks?.linkedin || "",
            portfolio: d.socialLinks?.portfolio || "",
            leetcode: d.socialLinks?.leetcode || ""
          },

          // Career Preferences
          careerObjective: d.careerObjective || "",
          preferredRoles: Array.isArray(d.preferredRoles) ? d.preferredRoles : [],
          preferredLocations: Array.isArray(d.preferredLocations) ? d.preferredLocations : [],
          profileStrength: d.profileStrength || 0
        };

        setProfile(loadedProfile);
        setInitialProfile(loadedProfile);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setErrorMessage("Could not load profile from database. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate profile completeness %
  const calculateCompleteness = () => {
    let score = 0;
    if (profile.name) score += 5;
    if (profile.phone) score += 5;
    if (profile.rollNumber) score += 5;
    if (profile.dob || profile.gender) score += 5;
    if (profile.city || profile.address) score += 5;
    if (profile.department) score += 10;
    if (profile.degree) score += 5;
    if (profile.batch) score += 5;
    if (profile.cgpa && Number(profile.cgpa) > 0) score += 15;
    if (profile.skills.length > 0) score += 10;
    if (profile.programmingLanguages.length > 0) score += 5;
    if (profile.resume) score += 10;
    if (profile.projects.length > 0 || profile.certifications.length > 0) score += 5;
    if (profile.careerObjective) score += 5;
    if (profile.socialLinks.github || profile.socialLinks.linkedin) score += 5;
    return Math.min(100, Math.max(15, score));
  };

  const completeness = calculateCompleteness();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value }
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Only image files (JPG, PNG, WEBP, GIF) are accepted.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size cannot exceed 5MB.");
      return;
    }

    try {
      setUploadingPhoto(true);
      setMessage("");
      setErrorMessage("");

      const res = await studentAPI.uploadPhoto(file);
      const newPhotoUrl = res.data?.profilePicture;

      if (newPhotoUrl) {
        setProfile(prev => ({ ...prev, profilePicture: newPhotoUrl }));
        if (updateUser) {
          updateUser({ profilePicture: newPhotoUrl });
        }
        setMessage("Profile photo updated successfully!");
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to upload profile photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCancel = () => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
    setEditing(false);
    setMessage("");
    setErrorMessage("");
  };

  const handleSave = async () => {
    setMessage("");
    setErrorMessage("");

    // Validate CGPA strictly between 0 and 10
    if (profile.cgpa !== "" && profile.cgpa !== null && profile.cgpa !== undefined) {
      const parsed = parseFloat(profile.cgpa);
      if (isNaN(parsed) || parsed < 0 || parsed > 10) {
        setErrorMessage("CGPA must be a valid number between 0.00 and 10.00");
        setActiveTab("academic");
        return;
      }
    }

    setSaving(true);
    try {
      const updatePayload = {
        name: profile.name,
        phone: profile.phone,
        dob: profile.dob,
        gender: profile.gender,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        bio: profile.bio,

        rollNumber: profile.rollNumber,
        university: profile.university,
        campus: profile.campus,
        degree: profile.degree,
        department: profile.department,
        currentSemester: profile.currentSemester,
        batch: profile.batch,
        cgpa: profile.cgpa !== "" ? Number(profile.cgpa) : undefined,
        activeBacklogs: Number(profile.activeBacklogs) || 0,
        education: profile.education,

        skills: profile.skills,
        programmingLanguages: profile.programmingLanguages,
        certifications: profile.certifications,
        projects: profile.projects,
        experience: profile.experience,
        socialLinks: profile.socialLinks,

        careerObjective: profile.careerObjective,
        preferredRoles: profile.preferredRoles,
        preferredLocations: profile.preferredLocations
      };

      const res = await studentAPI.updateProfile(updatePayload);
      if (res.data) {
        setMessage("Profile changes saved successfully!");
        setEditing(false);
        setInitialProfile(profile);

        // Synchronize AuthContext so top bar and sidebar reflect changes immediately
        if (updateUser) {
          updateUser({
            name: profile.name,
            phone: profile.phone,
            profilePicture: profile.profilePicture
          });
        }
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  // Helper methods for list additions/removals
  const addSkill = () => {
    const val = newSkill.trim();
    if (val && !profile.skills.includes(val)) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, val] }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const addLanguage = () => {
    const val = newLanguage.trim();
    if (val && !profile.programmingLanguages.includes(val)) {
      setProfile(prev => ({ ...prev, programmingLanguages: [...prev.programmingLanguages, val] }));
      setNewLanguage("");
    }
  };

  const removeLanguage = (langToRemove) => {
    setProfile(prev => ({
      ...prev,
      programmingLanguages: prev.programmingLanguages.filter(l => l !== langToRemove)
    }));
  };

  const addRole = () => {
    const val = newRole.trim();
    if (val && !profile.preferredRoles.includes(val)) {
      setProfile(prev => ({ ...prev, preferredRoles: [...prev.preferredRoles, val] }));
      setNewRole("");
    }
  };

  const removeRole = (roleToRemove) => {
    setProfile(prev => ({
      ...prev,
      preferredRoles: prev.preferredRoles.filter(r => r !== roleToRemove)
    }));
  };

  const addLocation = () => {
    const val = newLocation.trim();
    if (val && !profile.preferredLocations.includes(val)) {
      setProfile(prev => ({ ...prev, preferredLocations: [...prev.preferredLocations, val] }));
      setNewLocation("");
    }
  };

  const removeLocation = (locToRemove) => {
    setProfile(prev => ({
      ...prev,
      preferredLocations: prev.preferredLocations.filter(l => l !== locToRemove)
    }));
  };

  const addProject = () => {
    if (!newProject.title.trim()) return;
    const techArray = newProject.techStack.split(",").map(t => t.trim()).filter(Boolean);
    const item = {
      title: newProject.title.trim(),
      description: newProject.description.trim(),
      techStack: techArray,
      link: newProject.link.trim()
    };
    setProfile(prev => ({ ...prev, projects: [...prev.projects, item] }));
    setNewProject({ title: "", description: "", techStack: "", link: "" });
  };

  const removeProject = (index) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    if (!newCert.title.trim()) return;
    const item = {
      title: newCert.title.trim(),
      issuer: newCert.issuer.trim(),
      issueDate: newCert.issueDate.trim()
    };
    setProfile(prev => ({ ...prev, certifications: [...prev.certifications, item] }));
    setNewCert({ title: "", issuer: "", issueDate: "" });
  };

  const removeCertification = (index) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    if (!newExp.company.trim() || !newExp.role.trim()) return;
    const item = {
      role: newExp.role.trim(),
      company: newExp.company.trim(),
      duration: newExp.duration.trim(),
      description: newExp.description.trim()
    };
    setProfile(prev => ({ ...prev, experience: [...prev.experience, item] }));
    setNewExp({ role: "", company: "", duration: "", description: "" });
  };

  const removeExperience = (index) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const userInitials = profile.name
    ? profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "ST";

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748B" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <h2 style={{ fontSize: "18px", color: "#0F172A", margin: "0 0 6px" }}>Loading Student Profile...</h2>
          <p style={{ margin: 0, fontSize: "14px" }}>Synchronizing verified academic and placement records.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1150px", margin: "0 auto", paddingBottom: "40px" }}>

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

        {errorMessage && (
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
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TOP HERO PROFILE BANNER */}
        <div style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          borderRadius: "20px",
          padding: "30px",
          color: "#FFFFFF",
          marginBottom: "24px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Subtle Ambient Light */}
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none"
          }} />

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
            position: "relative",
            zIndex: 1
          }}>
            {/* Avatar & Identifiers */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, #2563EB, #7C3AED)",
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
                  {profile.profilePicture ? (
                    <img
                      src={getAssetUrl(profile.profilePicture)}
                      alt={profile.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    userInitials
                  )}
                </div>

                {/* Upload Photo Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  title="Upload new profile photograph"
                  style={{
                    position: "absolute",
                    bottom: "-6px",
                    right: "-6px",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#2563EB",
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
                  onChange={handlePhotoUpload}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: "none" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                  <h1 style={{ fontSize: "24px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" }}>
                    {profile.name || "Student"}
                  </h1>
                  <span style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    background: "rgba(56, 189, 248, 0.15)",
                    color: "#38BDF8",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    border: "1px solid rgba(56, 189, 248, 0.3)"
                  }}>
                    {profile.rollNumber || "ID: Pending"}
                  </span>
                  <span style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#34D399",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    border: "1px solid rgba(16, 185, 129, 0.3)"
                  }}>
                    🎓 CGPA: {profile.cgpa ? Number(profile.cgpa).toFixed(2) : "Not Provided"}
                  </span>
                </div>

                <p style={{ color: "#94A3B8", fontSize: "14px", margin: "0 0 6px" }}>
                  {profile.degree} • {profile.department || "Engineering"} ({profile.batch || "Class of 2026"})
                </p>
                <p style={{ color: "#64748B", fontSize: "13px", margin: 0 }}>
                  {profile.university} • {profile.email}
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
                    background: "linear-gradient(135deg, #2563EB, #3B82F6)",
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
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                    transition: "all 0.2s"
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
                    onClick={handleSave}
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

          {/* Profile Completion Bar */}
          <div style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px"
          }}>
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12.5px" }}>
                <span style={{ color: "#94A3B8", fontWeight: "600" }}>Profile Completion Strength</span>
                <span style={{ color: "#38BDF8", fontWeight: "700" }}>{completeness}% Completed</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{
                  width: `${completeness}%`,
                  height: "100%",
                  background: completeness >= 80 ? "linear-gradient(90deg, #10B981, #34D399)" : completeness >= 50 ? "linear-gradient(90deg, #3B82F6, #38BDF8)" : "linear-gradient(90deg, #F59E0B, #FBBF24)",
                  borderRadius: "10px",
                  transition: "width 0.4s ease"
                }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <Link to="/student/ats" style={{ textDecoration: "none" }}>
                <span style={{
                  fontSize: "12px",
                  color: "#94A3B8",
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "5px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px"
                }}>
                  <FileText size={13} /> {profile.resume ? "Resume Uploaded" : "Resume Missing"}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid #E2E8F0",
          marginBottom: "24px",
          overflowX: "auto",
          paddingBottom: "2px"
        }}>
          {[
            { id: "personal", label: "Personal Information", icon: User },
            { id: "academic", label: "Academic Details", icon: GraduationCap },
            { id: "professional", label: "Professional & Skills", icon: Briefcase },
            { id: "preferences", label: "Career Preferences", icon: Compass }
          ].map(tab => {
            const IconComponent = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 18px",
                  background: active ? "#FFFFFF" : "transparent",
                  color: active ? "#2563EB" : "#64748B",
                  border: "none",
                  borderBottom: active ? "3px solid #2563EB" : "3px solid transparent",
                  fontWeight: active ? "700" : "600",
                  fontSize: "14px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease"
                }}
              >
                <IconComponent size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PERSONAL INFORMATION */}
        {activeTab === "personal" && (
          <div style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            padding: "28px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: "0 0 4px" }}>
                  Personal Identification & Contact
                </h3>
                <p style={{ color: "#64748B", fontSize: "13.5px", margin: 0 }}>
                  Official student identity details shared with verified recruiters and placement coordinators.
                </p>
              </div>
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
                    value={profile.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
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
                    {profile.name || "Not specified"}
                  </div>
                )}
              </div>

              {/* Official Email */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Official Email Address (Account Identifier)
                </label>
                <div style={{ padding: "10px 14px", background: "#F1F5F9", borderRadius: "8px", border: "1px solid #E2E8F0", color: "#64748B", fontSize: "14px", fontWeight: "500" }}>
                  {profile.email} <span style={{ fontSize: "11px", color: "#059669", fontWeight: "700" }}>• Verified</span>
                </div>
              </div>

              {/* Phone / Mobile Number */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Mobile Number
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
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
                    {profile.phone || "Not specified"}
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Date of Birth
                </label>
                {editing ? (
                  <input
                    type="date"
                    name="dob"
                    value={profile.dob}
                    onChange={handleInputChange}
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
                    {profile.dob || "Not specified"}
                  </div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Gender
                </label>
                {editing ? (
                  <select
                    name="gender"
                    value={profile.gender}
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
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                ) : (
                  <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", fontWeight: "600", color: "#0F172A", fontSize: "14px" }}>
                    {profile.gender || "Not specified"}
                  </div>
                )}
              </div>

              {/* Country */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Country
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="country"
                    value={profile.country}
                    onChange={handleInputChange}
                    placeholder="e.g. India"
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
                    {profile.country || "India"}
                  </div>
                )}
              </div>

              {/* City */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  City
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="city"
                    value={profile.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Pune"
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
                    {profile.city || "Not specified"}
                  </div>
                )}
              </div>

              {/* State */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  State / Province
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="state"
                    value={profile.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Maharashtra"
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
                    {profile.state || "Not specified"}
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div style={{ marginTop: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                Residential Address
              </label>
              {editing ? (
                <textarea
                  name="address"
                  value={profile.address}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Street address, apartment or hostel room..."
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
                <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", fontWeight: "500", color: "#0F172A", fontSize: "14px" }}>
                  {profile.address || "No residential address provided."}
                </div>
              )}
            </div>

            {/* Biography */}
            <div style={{ marginTop: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                Professional Summary / Bio
              </label>
              {editing ? (
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Brief summary of your career focus, engineering background, and core achievements..."
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
                <div style={{ padding: "12px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", fontWeight: "400", color: "#334155", fontSize: "14px", lineHeight: "1.6" }}>
                  {profile.bio || "Student engineer actively seeking campus placement and internship opportunities."}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ACADEMIC DETAILS */}
        {activeTab === "academic" && (
          <div style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            padding: "28px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: "0 0 4px" }}>
                  Academic Credentials & Placement Standing
                </h3>
                <p style={{ color: "#64748B", fontSize: "13.5px", margin: 0 }}>
                  Institutional qualifications, verified cumulative grade point average (CGPA), and backlog records.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {/* Registration / Roll Number */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Registration / Roll Number *
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="rollNumber"
                    value={profile.rollNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. 2021001"
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
                    {profile.rollNumber || "Not specified"}
                  </div>
                )}
              </div>

              {/* CGPA - CRITICAL FIELD */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: "700", color: "#2563EB", marginBottom: "6px" }}>
                  <span>Cumulative GPA (CGPA) (0.00 - 10.00 scale) *</span>
                  <span style={{ fontSize: "11px", color: "#059669", fontWeight: "600" }}>Direct Placement Filter</span>
                </label>
                {editing ? (
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      name="cgpa"
                      value={profile.cgpa}
                      onChange={handleInputChange}
                      placeholder="e.g. 8.50"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "2px solid #3B82F6",
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#0F172A",
                        boxSizing: "border-box",
                        background: "#EFF6FF"
                      }}
                    />
                    <small style={{ color: "#64748B", fontSize: "11px", marginTop: "4px", display: "block" }}>
                      Enter your current verified cumulative GPA. Valid range: 0.00 to 10.00.
                    </small>
                  </div>
                ) : (
                  <div style={{
                    padding: "10px 14px",
                    background: profile.cgpa ? "#EFF6FF" : "#F8FAFC",
                    borderRadius: "8px",
                    border: profile.cgpa ? "1px solid #BFDBFE" : "1px solid #E2E8F0",
                    fontWeight: "800",
                    color: profile.cgpa ? "#1E40AF" : "#64748B",
                    fontSize: "15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    <span>{profile.cgpa ? `${Number(profile.cgpa).toFixed(2)} / 10.00` : "Not Provided"}</span>
                    {profile.cgpa && (
                      <span style={{ fontSize: "11px", background: "#DBEAFE", color: "#1E40AF", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" }}>
                        Verified Score
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Department / Branch */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Department / Branch *
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="department"
                    value={profile.department}
                    onChange={handleInputChange}
                    placeholder="e.g. Computer Science and Engineering"
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
                    {profile.department || "Not specified"}
                  </div>
                )}
              </div>

              {/* Degree */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Degree Program
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="degree"
                    value={profile.degree}
                    onChange={handleInputChange}
                    placeholder="e.g. Bachelor of Technology"
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
                    {profile.degree || "Bachelor of Technology"}
                  </div>
                )}
              </div>

              {/* Current Semester */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Current Semester
                </label>
                {editing ? (
                  <select
                    name="currentSemester"
                    value={profile.currentSemester}
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
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                ) : (
                  <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", fontWeight: "600", color: "#0F172A", fontSize: "14px" }}>
                    {profile.currentSemester || "7th Semester"}
                  </div>
                )}
              </div>

              {/* Graduation Batch Year */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Graduation Year (Batch) *
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="batch"
                    value={profile.batch}
                    onChange={handleInputChange}
                    placeholder="e.g. 2026"
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
                    {profile.batch || "Not specified"}
                  </div>
                )}
              </div>

              {/* Backlog Status */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Active Backlogs
                </label>
                {editing ? (
                  <input
                    type="number"
                    min="0"
                    name="activeBacklogs"
                    value={profile.activeBacklogs}
                    onChange={handleInputChange}
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
                  <div style={{
                    padding: "10px 14px",
                    background: Number(profile.activeBacklogs) === 0 ? "#ECFDF5" : "#FEF2F2",
                    borderRadius: "8px",
                    border: Number(profile.activeBacklogs) === 0 ? "1px solid #A7F3D0" : "1px solid #FECACA",
                    fontWeight: "700",
                    color: Number(profile.activeBacklogs) === 0 ? "#065F46" : "#991B1B",
                    fontSize: "14px"
                  }}>
                    {Number(profile.activeBacklogs) === 0 ? "0 Active Backlogs (Clean Track Record)" : `${profile.activeBacklogs} Backlogs`}
                  </div>
                )}
              </div>

              {/* University */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  University / Institution
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="university"
                    value={profile.university}
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
                    {profile.university || "National Institute of Technology"}
                  </div>
                )}
              </div>

              {/* Campus */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Campus
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="campus"
                    value={profile.campus}
                    onChange={handleInputChange}
                    placeholder="e.g. Main Campus"
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
                    {profile.campus || "Main Campus"}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROFESSIONAL DETAILS */}
        {activeTab === "professional" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Technical Skills & Languages Card */}
            <div style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              padding: "28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: "0 0 16px" }}>
                Technical Stack & Programming Languages
              </h3>

              {/* Technical Skills */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "8px" }}>
                  Technical Skills & Frameworks
                </label>

                {editing && (
                  <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                      placeholder="e.g. React, Node.js, Docker, Kubernetes"
                      style={{
                        flex: 1,
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "13.5px"
                      }}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      style={{
                        background: "#2563EB",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "0 16px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <Plus size={16} /> Add Skill
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {profile.skills.length > 0 ? (
                    profile.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          background: "#EFF6FF",
                          color: "#1D4ED8",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: "600",
                          border: "1px solid #BFDBFE"
                        }}
                      >
                        {skill}
                        {editing && (
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#1D4ED8",
                              cursor: "pointer",
                              padding: 0,
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <p style={{ color: "#94A3B8", fontSize: "13px", margin: 0 }}>No technical skills added yet.</p>
                  )}
                </div>
              </div>

              {/* Programming Languages */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "8px" }}>
                  Programming Languages
                </label>

                {editing && (
                  <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLanguage(); } }}
                      placeholder="e.g. Python, Java, C++, TypeScript"
                      style={{
                        flex: 1,
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "13.5px"
                      }}
                    />
                    <button
                      type="button"
                      onClick={addLanguage}
                      style={{
                        background: "#059669",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "0 16px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <Plus size={16} /> Add Language
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {profile.programmingLanguages.length > 0 ? (
                    profile.programmingLanguages.map((lang, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          background: "#ECFDF5",
                          color: "#047857",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: "600",
                          border: "1px solid #A7F3D0"
                        }}
                      >
                        {lang}
                        {editing && (
                          <button
                            type="button"
                            onClick={() => removeLanguage(lang)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#047857",
                              cursor: "pointer",
                              padding: 0,
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <p style={{ color: "#94A3B8", fontSize: "13px", margin: 0 }}>No programming languages specified.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Social & Professional Links */}
            <div style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              padding: "28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: "0 0 16px" }}>
                Public Profiles & Portfolio Links
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                {/* LinkedIn */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    LinkedIn Profile URL
                  </label>
                  {editing ? (
                    <input
                      type="url"
                      name="linkedin"
                      value={profile.socialLinks.linkedin}
                      onChange={handleSocialChange}
                      placeholder="https://linkedin.com/in/username"
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
                      {profile.socialLinks.linkedin ? (
                        <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" style={{ color: "#0284C7", textDecoration: "none", fontWeight: "600", fontSize: "13.5px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          {profile.socialLinks.linkedin} <ExternalLink size={13} />
                        </a>
                      ) : (
                        <span style={{ color: "#94A3B8", fontSize: "13.5px" }}>Not linked</span>
                      )}
                    </div>
                  )}
                </div>

                {/* GitHub */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    GitHub Profile URL
                  </label>
                  {editing ? (
                    <input
                      type="url"
                      name="github"
                      value={profile.socialLinks.github}
                      onChange={handleSocialChange}
                      placeholder="https://github.com/username"
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
                      {profile.socialLinks.github ? (
                        <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" style={{ color: "#0F172A", textDecoration: "none", fontWeight: "600", fontSize: "13.5px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          {profile.socialLinks.github} <ExternalLink size={13} />
                        </a>
                      ) : (
                        <span style={{ color: "#94A3B8", fontSize: "13.5px" }}>Not linked</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Portfolio Website */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    Personal Portfolio / Website
                  </label>
                  {editing ? (
                    <input
                      type="url"
                      name="portfolio"
                      value={profile.socialLinks.portfolio}
                      onChange={handleSocialChange}
                      placeholder="https://yourdomain.com"
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
                      {profile.socialLinks.portfolio ? (
                        <a href={profile.socialLinks.portfolio} target="_blank" rel="noreferrer" style={{ color: "#2563EB", textDecoration: "none", fontWeight: "600", fontSize: "13.5px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          {profile.socialLinks.portfolio} <ExternalLink size={13} />
                        </a>
                      ) : (
                        <span style={{ color: "#94A3B8", fontSize: "13.5px" }}>Not linked</span>
                      )}
                    </div>
                  )}
                </div>

                {/* LeetCode / Coding Profile */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                    LeetCode / Coding Profile URL
                  </label>
                  {editing ? (
                    <input
                      type="url"
                      name="leetcode"
                      value={profile.socialLinks.leetcode}
                      onChange={handleSocialChange}
                      placeholder="https://leetcode.com/username"
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
                      {profile.socialLinks.leetcode ? (
                        <a href={profile.socialLinks.leetcode} target="_blank" rel="noreferrer" style={{ color: "#D97706", textDecoration: "none", fontWeight: "600", fontSize: "13.5px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          {profile.socialLinks.leetcode} <ExternalLink size={13} />
                        </a>
                      ) : (
                        <span style={{ color: "#94A3B8", fontSize: "13.5px" }}>Not linked</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Projects & Portfolio Items */}
            <div style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              padding: "28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: "0 0 16px" }}>
                Key Technical Projects
              </h3>

              {editing && (
                <div style={{ background: "#F8FAFC", padding: "16px", borderRadius: "10px", border: "1px solid #E2E8F0", marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A", margin: "0 0 12px" }}>
                    + Add New Project
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "10px" }}>
                    <input
                      type="text"
                      placeholder="Project Title *"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                    />
                    <input
                      type="text"
                      placeholder="Tech Stack (comma-separated, e.g. React, Node, Docker)"
                      value={newProject.techStack}
                      onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                      style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "10px" }}>
                    <input
                      type="text"
                      placeholder="Short Project Description..."
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                    />
                    <input
                      type="url"
                      placeholder="Repository or Demo Link (Optional)"
                      value={newProject.link}
                      onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                      style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addProject}
                    style={{
                      background: "#2563EB",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "12.5px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Add Project to Profile
                  </button>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {profile.projects.length > 0 ? (
                  profile.projects.map((proj, idx) => (
                    <div key={idx} style={{
                      padding: "16px 20px",
                      borderRadius: "10px",
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start"
                    }}>
                      <div>
                        <h4 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#0F172A" }}>
                          {proj.title}
                          {proj.link && (
                            <a href={proj.link} target="_blank" rel="noreferrer" style={{ marginLeft: "8px", color: "#2563EB", fontSize: "12px" }}>
                              <ExternalLink size={12} style={{ display: "inline" }} />
                            </a>
                          )}
                        </h4>
                        <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#475569" }}>
                          {proj.description}
                        </p>
                        {proj.techStack && proj.techStack.length > 0 && (
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {proj.techStack.map((tech, tIdx) => (
                              <span key={tIdx} style={{ fontSize: "11px", fontWeight: "600", background: "#E2E8F0", color: "#334155", padding: "2px 8px", borderRadius: "6px" }}>
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {editing && (
                        <button
                          type="button"
                          onClick={() => removeProject(idx)}
                          style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#94A3B8", fontSize: "13.5px", margin: 0 }}>No projects recorded yet.</p>
                )}
              </div>
            </div>

            {/* Certifications & Internships Card */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {/* Certifications */}
              <div style={{
                background: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                padding: "24px"
              }}>
                <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: "0 0 14px" }}>
                  Certifications
                </h4>

                {editing && (
                  <div style={{ background: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0", marginBottom: "14px" }}>
                    <input
                      type="text"
                      placeholder="Certification Title *"
                      value={newCert.title}
                      onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12.5px", marginBottom: "8px", boxSizing: "border-box" }}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                      <input
                        type="text"
                        placeholder="Issuer (e.g. AWS, Oracle)"
                        value={newCert.issuer}
                        onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                        style={{ padding: "7px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12.5px" }}
                      />
                      <input
                        type="text"
                        placeholder="Year (e.g. 2024)"
                        value={newCert.issueDate}
                        onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                        style={{ padding: "7px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12.5px" }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addCertification}
                      style={{ background: "#2563EB", color: "#FFFFFF", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                    >
                      Add Certificate
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {profile.certifications.length > 0 ? (
                    profile.certifications.map((cert, cIdx) => (
                      <div key={cIdx} style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong style={{ fontSize: "13.5px", color: "#0F172A", display: "block" }}>{cert.title}</strong>
                          <span style={{ fontSize: "12px", color: "#64748B" }}>{cert.issuer} {cert.issueDate ? `(${cert.issueDate})` : ""}</span>
                        </div>
                        {editing && (
                          <button type="button" onClick={() => removeCertification(cIdx)} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer" }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#94A3B8", fontSize: "13px", margin: 0 }}>No certifications added.</p>
                  )}
                </div>
              </div>

              {/* Internship Experience */}
              <div style={{
                background: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                padding: "24px"
              }}>
                <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: "0 0 14px" }}>
                  Internships & Work Experience
                </h4>

                {editing && (
                  <div style={{ background: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0", marginBottom: "14px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                      <input
                        type="text"
                        placeholder="Role / Title *"
                        value={newExp.role}
                        onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                        style={{ padding: "7px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12.5px" }}
                      />
                      <input
                        type="text"
                        placeholder="Company / Organization *"
                        value={newExp.company}
                        onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                        style={{ padding: "7px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12.5px" }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Duration (e.g. May 2024 - Jul 2024)"
                      value={newExp.duration}
                      onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12.5px", marginBottom: "8px", boxSizing: "border-box" }}
                    />
                    <button
                      type="button"
                      onClick={addExperience}
                      style={{ background: "#2563EB", color: "#FFFFFF", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                    >
                      Add Experience
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {profile.experience.length > 0 ? (
                    profile.experience.map((exp, eIdx) => (
                      <div key={eIdx} style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong style={{ fontSize: "13.5px", color: "#0F172A", display: "block" }}>{exp.role}</strong>
                          <span style={{ fontSize: "12px", color: "#64748B" }}>{exp.company} {exp.duration ? `• ${exp.duration}` : ""}</span>
                        </div>
                        {editing && (
                          <button type="button" onClick={() => removeExperience(eIdx)} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer" }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#94A3B8", fontSize: "13px", margin: 0 }}>No internship experience recorded.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: CAREER PREFERENCES */}
        {activeTab === "preferences" && (
          <div style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            padding: "28px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: "0 0 16px" }}>
              Placement Aspirations & Target Roles
            </h3>

            {/* Career Objective */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                Career Objective
              </label>
              {editing ? (
                <textarea
                  name="careerObjective"
                  value={profile.careerObjective}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="State your immediate recruitment focus, ideal work culture, and long-term career aspirations..."
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
                  {profile.careerObjective || "Seeking a challenging full-time software engineering role in an agile, innovation-driven environment."}
                </div>
              )}
            </div>

            {/* Preferred Job Roles */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "8px" }}>
                Target Job Roles
              </label>

              {editing && (
                <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRole(); } }}
                    placeholder="e.g. Software Development Engineer, Frontend Engineer, DevOps"
                    style={{
                      flex: 1,
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13.5px"
                    }}
                  />
                  <button
                    type="button"
                    onClick={addRole}
                    style={{
                      background: "#2563EB",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "0 16px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    + Add Role
                  </button>
                </div>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {profile.preferredRoles.length > 0 ? (
                  profile.preferredRoles.map((role, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        background: "#F5F3FF",
                        color: "#7C3AED",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "600",
                        border: "1px solid #DDD6FE"
                      }}
                    >
                      {role}
                      {editing && (
                        <button
                          type="button"
                          onClick={() => removeRole(role)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#7C3AED",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p style={{ color: "#94A3B8", fontSize: "13px", margin: 0 }}>No target roles specified.</p>
                )}
              </div>
            </div>

            {/* Preferred Locations */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "8px" }}>
                Preferred Job Locations
              </label>

              {editing && (
                <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLocation(); } }}
                    placeholder="e.g. Bangalore, Hyderabad, Pune, Remote"
                    style={{
                      flex: 1,
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13.5px"
                    }}
                  />
                  <button
                    type="button"
                    onClick={addLocation}
                    style={{
                      background: "#059669",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "0 16px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    + Add Location
                  </button>
                </div>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {profile.preferredLocations.length > 0 ? (
                  profile.preferredLocations.map((loc, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        background: "#ECFDF5",
                        color: "#059669",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "600",
                        border: "1px solid #A7F3D0"
                      }}
                    >
                      {loc}
                      {editing && (
                        <button
                          type="button"
                          onClick={() => removeLocation(loc)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#059669",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p style={{ color: "#94A3B8", fontSize: "13px", margin: 0 }}>No location preferences set (Open to anywhere / Remote).</p>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default StudentProfile;
