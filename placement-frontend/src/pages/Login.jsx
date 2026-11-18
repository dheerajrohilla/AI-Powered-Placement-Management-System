import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { authAPI } from "../services/api";

function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [registerData, setRegisterData] = useState({
    name: "",
    rollNumber: "",
    department: "",
    batch: "",
    companyName: "",
    hrName: "",
    hrEmail: "",
    employeeId: "",
    tpoDepartment: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { user, token, login, register, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user?.role) {
      const roleRoute = user.role.toLowerCase();
      navigate(`/${roleRoute}`, { replace: true });
    }
  }, [token, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(email, password);
      
      // Navigate based on role
      const roleRoute = userData.role.toLowerCase();
      navigate(`/${roleRoute}`);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const updateRegisterData = (field, value) => {
    setRegisterData((current) => ({ ...current, [field]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== registerData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      let additionalData = {};
      if (role === "student") {
        additionalData = { rollNumber: registerData.rollNumber, department: registerData.department, batch: registerData.batch };
      } else if (role === "company") {
        additionalData = { companyName: registerData.companyName, hrName: registerData.hrName, hrEmail: registerData.hrEmail };
      } else if (role === "tpo") {
        additionalData = { employeeId: registerData.employeeId, department: registerData.tpoDepartment };
      }

      const userData = await register(registerData.name, email, password, role, additionalData);
      navigate(`/${userData.role}`);
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setResetLoading(true);
    try {
      const response = await authAPI.forgotPassword(email);
      setForgotStep(2);
      setMessage(response.data?.message || "A 6-digit verification code has been sent to your registered email.");
    } catch (err) {
      console.error("Forgot password error:", err);
      const serverError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.code === "ECONNABORTED" ? "Request timed out. Please check your network and try again." : null) ||
        (err.message === "Network Error" ? "Unable to contact the server. Please verify the backend service is running." : null) ||
        err.message ||
        "Unable to contact the server. Please try again.";
      setMessage(serverError);
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetWithOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!resetOtp || resetOtp.trim().length !== 6) {
      setMessage("Please enter the 6-digit verification code sent to your email.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return;
    }
    setResetLoading(true);
    try {
      const response = await authAPI.resetPassword(email, null, newPassword, resetOtp.trim());
      setMessage(response.data?.message || "Password reset successful! You can now sign in.");
      setMode("login");
      setForgotStep(1);
      setResetOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      console.error("Reset password error:", err);
      const serverError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid or expired verification code. Please try again.";
      setMessage(serverError);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="professional-login">

      {/* LEFT SECTION */}
      <div className="login-brand-section">

        <div className="brand-content">

          <div className="brand-logo">
            PP
          </div>

          <h1>Placement Portal</h1>

          <p className="brand-tagline">
            AI-Powered Placement Management System
          </p>

          <p className="brand-description">
            Connecting students, companies and placement teams
            through one intelligent platform.
          </p>

          <div className="brand-features">

            <div className="brand-feature">
              <span>✓</span>
              <p>Manage placement opportunities</p>
            </div>

            <div className="brand-feature">
              <span>✓</span>
              <p>Track applications and interviews</p>
            </div>

            <div className="brand-feature">
              <span>✓</span>
              <p>AI-powered resume analysis</p>
            </div>

          </div>

        </div>

        <div className="brand-footer">
          © 2026 Placement Portal
        </div>

      </div>


      {/* RIGHT LOGIN SECTION */}
      <div className="login-form-section">

        <div className="login-card-modern">

          <div className="login-header">

            <h2>{mode === "login" ? "Welcome Back" : mode === "register" ? "Create Account" : "Reset Password"}</h2>

            <p>
              {mode === "login" && "Sign in to continue to your placement dashboard"}
              {mode === "register" && "Create your placement portal account"}
              {mode === "forgot" && (forgotStep === 1 ? "Enter your registered email to receive a 6-digit OTP code" : "Enter the 6-digit verification code sent to your email")}
            </p>

          </div>

          {(error || message) && (() => {
            const text = error || message;
            const isSuccess = text.includes("sent") || text.includes("successful") || text.includes("success");
            return (
              <div
                style={{
                  padding: "11px 14px",
                  borderRadius: "8px",
                  marginBottom: "18px",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  backgroundColor: isSuccess ? "#f0fdf4" : "#fef2f2",
                  color: isSuccess ? "#166534" : "#991b1b",
                  border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <span>{isSuccess ? "✅" : "⚠️"}</span>
                <span>{text}</span>
              </div>
            );
          })()}

          {mode === "login" && <form onSubmit={handleLogin}>

            <div className="form-group">

              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>


            <div className="form-group">

              <div className="password-label">

                <label>Password</label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => { setMode("forgot"); setMessage(""); }}
                >
                  Forgot Password?
                </button>

              </div>

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: "100%", paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#64748b"
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>

            </div>


            <div className="form-group">

              <label>Login As</label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >

                <option value="student">Student</option>
                <option value="company">Company</option>
                <option value="tpo">TPO</option>
                <option value="admin">Admin</option>

              </select>

            </div>


            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

          </form>}

          {mode === "forgot" && forgotStep === 1 && (
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label>Registered Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="login-button" disabled={resetLoading}>
                {resetLoading ? "Sending Code..." : "Send 6-Digit OTP Code 📧"}
              </button>
            </form>
          )}

          {mode === "forgot" && forgotStep === 2 && (
            <form onSubmit={handleResetWithOtp}>
              <div className="form-group">
                <label>6-Digit Verification Code (OTP)</label>
                <input
                  type="text"
                  placeholder="e.g. 123456"
                  maxLength="6"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  style={{ letterSpacing: '4px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}
                  required
                />
                <small style={{ color: '#64748b', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  Sent to {email}. Code is valid for 15 minutes.
                </small>
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password (min. 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength="6"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  minLength="6"
                  required
                />
              </div>
              <button type="submit" className="login-button" disabled={resetLoading}>
                {resetLoading ? "Updating Password..." : "Reset Password & Sign In 🔒"}
              </button>
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                  onClick={() => { setForgotStep(1); setMessage(""); }}
                >
                  ← Resend code / Change email
                </button>
              </div>
            </form>
          )}

          {mode === "register" && <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={registerData.name} onChange={(e) => updateRegisterData("name", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="company">Company</option>
                <option value="tpo">TPO (Placement Officer)</option>
                <option value="admin">Admin (System Administrator)</option>
              </select>
            </div>
            {role === "student" && <>
              <div className="form-group"><label>Roll Number</label><input value={registerData.rollNumber} onChange={(e) => updateRegisterData("rollNumber", e.target.value)} required /></div>
              <div className="form-group"><label>Department</label><input value={registerData.department} onChange={(e) => updateRegisterData("department", e.target.value)} required /></div>
              <div className="form-group"><label>Batch Year</label><input value={registerData.batch} onChange={(e) => updateRegisterData("batch", e.target.value)} required /></div>
            </>}
            {role === "company" && <>
              <div className="form-group"><label>Company Name</label><input value={registerData.companyName} onChange={(e) => updateRegisterData("companyName", e.target.value)} required /></div>
              <div className="form-group"><label>HR Name</label><input value={registerData.hrName} onChange={(e) => updateRegisterData("hrName", e.target.value)} required /></div>
              <div className="form-group"><label>HR Email</label><input type="email" value={registerData.hrEmail} onChange={(e) => updateRegisterData("hrEmail", e.target.value)} required /></div>
            </>}
            {role === "tpo" && <>
              <div className="form-group"><label>Employee ID</label><input value={registerData.employeeId} onChange={(e) => updateRegisterData("employeeId", e.target.value)} placeholder="e.g. EMP-101" required /></div>
              <div className="form-group"><label>Department / Cell</label><input value={registerData.tpoDepartment} onChange={(e) => updateRegisterData("tpoDepartment", e.target.value)} placeholder="e.g. Training & Placement Cell" required /></div>
            </>}
            <div className="form-group"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength="6" required /></div>
            <div className="form-group"><label>Confirm Password</label><input type="password" value={registerData.confirmPassword} onChange={(e) => updateRegisterData("confirmPassword", e.target.value)} minLength="6" required /></div>
            <button type="submit" className="login-button" disabled={loading}>{loading ? "Creating Account..." : "Create Account"}</button>
          </form>}


          <div className="login-caption">

              <span>{mode === "login" ? "New to Placement Portal?" : "Already have an account?"}</span>

            <button
              type="button"
              className="register-link"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setMessage(""); }}
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>

          </div>

          {mode === "forgot" && (
            <button
              type="button"
              className="register-link"
              onClick={() => { setMode("login"); setForgotStep(1); setMessage(""); }}
            >
              Back to sign in
            </button>
          )}


          <p className="security-caption">
            🔒 Your account information is protected and secure.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;