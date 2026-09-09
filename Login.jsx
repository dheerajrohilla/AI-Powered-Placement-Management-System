import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [role, setRole] = useState("Student");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (role === "Student") {
      navigate("/student");
    } else if (role === "Company") {
      navigate("/company");
    } else if (role === "TPO") {
      navigate("/tpo");
    } else if (role === "Admin") {
      navigate("/admin");
    }
  };

  const handleForgotPassword = () => {
    alert("Password reset option will be connected to the backend soon.");
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

            <h2>Welcome Back</h2>

            <p>
              Sign in to continue to your placement dashboard
            </p>

          </div>


          <form onSubmit={handleLogin}>

            <div className="form-group">

              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your email"
                required
              />

            </div>


            <div className="form-group">

              <div className="password-label">

                <label>Password</label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>

              </div>

              <input
                type="password"
                placeholder="Enter your password"
                required
              />

            </div>


            <div className="form-group">

              <label>Login As</label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >

                <option>Student</option>
                <option>Company</option>
                <option>TPO</option>
                <option>Admin</option>

              </select>

            </div>


            <button
              type="submit"
              className="login-button"
            >
              Sign In
            </button>

          </form>


          <div className="login-caption">

            <span>New to Placement Portal?</span>

            <button
              type="button"
              className="register-link"
              onClick={() =>
                alert("Registration will be connected to the backend soon.")
              }
            >
              Create an account
            </button>

          </div>


          <p className="security-caption">
            🔒 Your account information is protected and secure.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;