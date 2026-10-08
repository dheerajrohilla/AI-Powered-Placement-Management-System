import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function TPOSidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/tpo" && location.pathname === "/tpo") return "active";
    return location.pathname.startsWith(path) && path !== "/tpo" ? "active" : "";
  };

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <h2>Placement Portal</h2>
        <p>TPO Operations Control</p>
      </div>

      <nav className="sidebar-menu">

        <Link to="/tpo" className={isActive("/tpo")}>
          🏠 Dashboard
        </Link>

        <Link to="/tpo/profile" className={isActive("/tpo/profile")}>
          👤 My Profile
        </Link>

        <Link to="/tpo/students" className={isActive("/tpo/students")}>
          👨‍🎓 Students Directory
        </Link>

        <Link to="/tpo/companies" className={isActive("/tpo/companies")}>
          🏢 Companies & JDs
        </Link>

        <Link to="/tpo/drives" className={isActive("/tpo/drives")}>
          📢 Placement Drives
        </Link>

        <Link to="/tpo/applications" className={isActive("/tpo/applications")}>
          📋 Application Monitor
        </Link>

        <Link to="/tpo/interviews" className={isActive("/tpo/interviews")}>
          📅 Interviews
        </Link>

        <Link to="/tpo/analytics" className={isActive("/tpo/analytics")}>
          📈 Placement Analytics
        </Link>

        <Link to="/tpo/reports" className={isActive("/tpo/reports")}>
          📊 Export Reports
        </Link>

        <Link to="/tpo/notifications" className={isActive("/tpo/notifications")}>
          🔔 Notifications
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

export default TPOSidebar;