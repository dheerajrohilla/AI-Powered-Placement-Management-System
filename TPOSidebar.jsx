import { Link } from "react-router-dom";

function TPOSidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <h2>Placement Portal</h2>
        <p>TPO Panel</p>
      </div>

      <nav className="sidebar-menu">

        <Link to="/tpo">
          🏠 Dashboard
        </Link>

        <Link to="/tpo/students">
          👨‍🎓 Students
        </Link>

        <Link to="/tpo/companies">
          🏢 Companies
        </Link>

        <Link to="/tpo/drives">
          📢 Placement Drives
        </Link>

        <Link to="/tpo/interviews">
          📅 Interviews
        </Link>

        <Link to="/tpo/reports">
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

export default TPOSidebar;