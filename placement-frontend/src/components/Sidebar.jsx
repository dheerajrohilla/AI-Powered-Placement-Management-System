import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/student" && location.pathname === "/student") return "active";
    return location.pathname.startsWith(path) && path !== "/student" ? "active" : "";
  };

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <h2>Placement Portal</h2>
        <p>Student AI Panel</p>
      </div>

      <nav className="sidebar-menu">

        <Link to="/student" className={isActive("/student")}>
          🏠 Dashboard
        </Link>

        <Link to="/student/journey" className={isActive("/student/journey")}>
          🗺️ Placement Journey
        </Link>

        <Link to="/student/credibility" className={isActive("/student/credibility")}>
          🔍 Credibility Checker
        </Link>

        <Link to="/student/company-prep" className={isActive("/student/company-prep")}>
          🏢 Company Prep Mode
        </Link>

        <Link to="/student/mock-interview" className={isActive("/student/mock-interview")}>
          🎙️ AI Mock Interview
        </Link>

        <Link to="/student/rejection-analyzer" className={isActive("/student/rejection-analyzer")}>
          📉 Shortlist Analyzer
        </Link>

        <Link to="/student/benchmarking" className={isActive("/student/benchmarking")}>
          📊 Peer Benchmarking
        </Link>

        <Link to="/student/collaborate" className={isActive("/student/collaborate")}>
          🤝 Peer Collaboration
        </Link>

        <Link to="/student/jobs" className={isActive("/student/jobs")}>
          💼 Placement Drives
        </Link>

        <Link to="/student/applications" className={isActive("/student/applications")}>
          📋 Applications
        </Link>

        <Link to="/student/interviews" className={isActive("/student/interviews")}>
          📅 Interviews
        </Link>

        <Link to="/student/ats" className={isActive("/student/ats")}>
          🎯 Real ATS Checker
        </Link>

        <Link to="/student/skills" className={isActive("/student/skills")}>
          📊 Skill Analysis
        </Link>

        <Link to="/student/chatbot" className={isActive("/student/chatbot")}>
          💬 AI Chatbot Copilot
        </Link>

      </nav>

      <div className="sidebar-bottom">
        <Link to="/" onClick={logout}>
          🚪 Logout
        </Link>
      </div>

    </aside>
  );
}

export default Sidebar;