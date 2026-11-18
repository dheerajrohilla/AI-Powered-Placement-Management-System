import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ChatbotWidget from "../components/ChatbotWidget";

function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="main-content">
        <Navbar onToggleMenu={() => setMobileOpen(!mobileOpen)} />
        <div className="page-content">
          {children}
        </div>
      </main>
      <ChatbotWidget />
    </div>
  );
}

export default DashboardLayout;