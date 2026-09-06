import { Link } from "react-router-dom";

function AdminSidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <h2>Placement Portal</h2>
        <p>Admin Panel</p>
      </div>

      <nav className="sidebar-menu">

        <Link to="/admin">
          🏠 Dashboard
        </Link>

        <Link to="/admin/students">
          👨‍🎓 Students
        </Link>

        <Link to="/admin/companies">
          🏢 Companies
        </Link>

        <Link to="/admin/drives">
          📢 Placement Drives
        </Link>

        <Link to="/admin/interviews">
          📅 Interviews
        </Link>

        <Link to="/admin/reports">
          📊 Reports & Analytics
        </Link>

      </nav>

      <div className="sidebar-bottom">

        <Link to="/">
          🚪 Logout
        </Link>

      </div>

    </aside>
  );
}

export default AdminSidebar;