import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="main-content">
        <AdminNavbar onToggleMenu={() => setMobileOpen(!mobileOpen)} />

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;