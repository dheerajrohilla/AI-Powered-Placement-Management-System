import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function AdminSidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/admin" && location.pathname === "/admin") return "active";
    return location.pathname.startsWith(path) && path !== "/admin" ? "active" : "";
  };

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <h2>Placement Portal</h2>
        <p>System Administration</p>
      </div>

      <nav className="sidebar-menu">

        <Link to="/admin" className={isActive("/admin")}>
          🏠 System Overview
        </Link>

        <Link to="/admin/profile" className={isActive("/admin/profile")}>
          👤 Admin Profile
        </Link>

        <Link to="/admin/users" className={isActive("/admin/users")}>
          👥 User Management
        </Link>

        <Link to="/admin/roles-permissions" className={isActive("/admin/roles-permissions")}>
          🔐 Roles & Permissions
        </Link>

        <Link to="/admin/configuration" className={isActive("/admin/configuration")}>
          ⚙️ System Configuration
        </Link>

        <Link to="/admin/monitoring" className={isActive("/admin/monitoring")}>
          🖥️ Audit & Monitoring
        </Link>

        <Link to="/admin/analytics" className={isActive("/admin/analytics")}>
          📊 Platform Usage Stats
        </Link>

        <Link to="/admin/notifications" className={isActive("/admin/notifications")}>
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

export default AdminSidebar;