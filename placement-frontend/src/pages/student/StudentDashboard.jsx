import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/StatCard";
import { studentAPI } from "../../services/api";
import { useAuth } from "../../context/useAuth";

function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [drives, setDrives] = useState([]);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    studentAPI.getDashboard()
      .then((response) => setStats(response.data))
      .catch((error) => console.error("Unable to load dashboard:", error));

    studentAPI.getPlacementDrives()
      .then((response) => setDrives(response.data || []))
      .catch((error) => console.error("Unable to load drives:", error));

    studentAPI.getInterviews()
      .then((response) => setInterviews(response.data || []))
      .catch((error) => console.error("Unable to load interviews:", error));
  }, []);

  return (
    <DashboardLayout>

      <div className="dashboard-heading">
        <div>
          <h1>Welcome back, {user?.name || "Student"}!</h1>
          <p>Track your placement journey from one place.</p>
        </div>
      </div>

      <div className="stats-grid">

        <StatCard
          title="ATS Score"
          value={stats ? `${stats.atsScore}%` : "--"}
          icon="🤖"
          description="Resume ATS Compatibility"
        />

        <StatCard
          title="Applications"
          value={stats ? stats.applications : "--"}
          icon="📋"
          description="Total active applications"
        />

        <StatCard
          title="Interviews"
          value={stats ? stats.interviews : "--"}
          icon="📅"
          description="Scheduled interviews"
        />

        <StatCard
          title="Profile Strength"
          value={stats ? `${stats.profileStrength}%` : "--"}
          icon="👤"
          description="Overall profile completeness"
        />

      </div>

      {/* AI INTELLIGENCE SUITE BANNER */}
      <div style={{
        margin: "24px 0",
        padding: "20px 24px",
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        borderRadius: "16px",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "20px" }}>🤖</span>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc" }}>AI Placement Intelligence Suite</h3>
          </div>
          <p style={{ fontSize: "14px", color: "#94a3b8" }}>
            Real multi-point ATS scoring, automated resume skill extraction, and real-time CampusAI Copilot.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link to="/student/ats">
            <button style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer"
            }}>
              🎯 Real ATS Checker
            </button>
          </Link>
          <Link to="/student/credibility">
            <button style={{
              background: "#0891b2",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer"
            }}>
              🔍 Credibility Audit
            </button>
          </Link>
          <Link to="/student/mock-interview">
            <button style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer"
            }}>
              🎙️ AI Mock Interview
            </button>
          </Link>
          <Link to="/student/skills">
            <button style={{
              background: "#7c3aed",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer"
            }}>
              📊 Skill Analysis
            </button>
          </Link>
          <Link to="/student/chatbot">
            <button style={{
              background: "#10b981",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer"
            }}>
              💬 Ask AI Copilot
            </button>
          </Link>
        </div>
      </div>

      {/* INNOVATIVE PLACEMENT ACCELERATORS GRID */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "14px" }}>
          🚀 Placement Accelerators & Career Copilot
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          <Link to="/student/journey" style={{ textDecoration: "none" }}>
            <div className="card" style={{ padding: "18px", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", height: "100%", transition: "transform 0.2s" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🗺️</div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>Placement Journey</h4>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Visual 9-stage progression pipeline from onboarding to campus offer.</p>
            </div>
          </Link>

          <Link to="/student/company-prep" style={{ textDecoration: "none" }}>
            <div className="card" style={{ padding: "18px", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", height: "100%", transition: "transform 0.2s" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🏢</div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>Company Prep Mode</h4>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Deep-dive into target company rounds, expected difficulty & skill gaps.</p>
            </div>
          </Link>

          <Link to="/student/rejection-analyzer" style={{ textDecoration: "none" }}>
            <div className="card" style={{ padding: "18px", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", height: "100%", transition: "transform 0.2s" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>📉</div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>Shortlist Bottleneck Analyzer</h4>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>AI funnel diagnosis: why applications get filtered out before interviews.</p>
            </div>
          </Link>

          <Link to="/student/benchmarking" style={{ textDecoration: "none" }}>
            <div className="card" style={{ padding: "18px", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", height: "100%", transition: "transform 0.2s" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>📊</div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>Peer Benchmarking</h4>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Anonymous percentile rankings across DSA, Projects, and ATS scores.</p>
            </div>
          </Link>

          <Link to="/student/collaborate" style={{ textDecoration: "none" }}>
            <div className="card" style={{ padding: "18px", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", height: "100%", transition: "transform 0.2s" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🤝</div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>Study Buddy Matching</h4>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Pair with peers who excel in areas where you want to grow.</p>
            </div>
          </Link>
        </div>
      </div>

      <section className="dashboard-section">

        <div className="section-header">
          <div>
            <h2>Recommended Opportunities</h2>
            <p>Jobs that match your profile and skills</p>
          </div>

          <Link to="/student/jobs">
            <button>View All</button>
          </Link>
        </div>

        <div className="job-list">
          {drives.length > 0 ? (
            drives.slice(0, 3).map((drive) => (
              <div key={drive._id} className="job-card">
                <div>
                  <h3>{drive.jobRole || drive.title}</h3>
                  <p>{drive.company?.companyName || 'Recruiter'}</p>
                  <span>₹{(drive.salary / 100000).toFixed(1)} LPA • {drive.location || 'Remote'}</span>
                </div>

                <div className="match-score">
                  Active Drive
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No placement drives currently active.</p>
          )}
        </div>

      </section>

      <section className="dashboard-section">

        <div className="section-header">
          <div>
            <h2>Upcoming Interview</h2>
            <p>Your next scheduled interview</p>
          </div>
        </div>

        {interviews.length > 0 ? (
          <div className="interview-card">
            <div>
              <h3>{interviews[0].placementDrive?.jobRole || interviews[0].round} — {interviews[0].company?.companyName || 'Company'}</h3>
              <p>{interviews[0].round.toUpperCase()} Round ({interviews[0].status})</p>
            </div>

            <div>
              <strong>{new Date(interviews[0].scheduledDate).toLocaleDateString()}</strong>
              <span>{new Date(interviews[0].scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ) : (
          <p className="no-data">No interviews scheduled yet.</p>
        )}

      </section>

    </DashboardLayout>
  );
}

export default StudentDashboard;