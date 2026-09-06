import { Link } from "react-router-dom";

function CompanySidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <h2>Placement Portal</h2>
        <p>Company Panel</p>
      </div>

      <nav className="sidebar-menu">

        <Link to="/company">
          🏠 Dashboard
        </Link>

        <Link to="/company/drives">
          📢 Placement Drives
        </Link>

        <Link to="/company/applicants">
          👥 Applicants
        </Link>

        <Link to="/company/shortlisted">
          ⭐ Shortlisted
        </Link>

        <Link to="/company/interviews">
          📅 Interviews
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

export default CompanySidebar;