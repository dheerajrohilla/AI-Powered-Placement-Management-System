function AdminNavbar() {
  return (
    <header className="navbar">

      <div>
        <h2>Admin Dashboard</h2>
        <p>Welcome back, Admin!</p>
      </div>

      <div className="navbar-profile">

        <div className="profile-circle">
          A
        </div>

        <div>
          <strong>System Administrator</strong>
          <span>Admin</span>
        </div>

      </div>

    </header>
  );
}

export default AdminNavbar;