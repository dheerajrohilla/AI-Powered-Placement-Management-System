import { useState } from "react";
import CompanySidebar from "../components/CompanySidebar";
import CompanyNavbar from "../components/CompanyNavbar";

function CompanyLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <CompanySidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="main-content">
        <CompanyNavbar onToggleMenu={() => setMobileOpen(!mobileOpen)} />

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default CompanyLayout;