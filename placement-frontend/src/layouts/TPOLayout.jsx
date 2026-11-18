import { useState } from "react";
import TPOSidebar from "../components/TPOSidebar";
import TPONavbar from "../components/TPONavbar";

function TPOLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <TPOSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="main-content">
        <TPONavbar onToggleMenu={() => setMobileOpen(!mobileOpen)} />

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default TPOLayout;