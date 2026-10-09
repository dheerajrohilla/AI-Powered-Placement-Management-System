import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ChatbotWidget from "../components/ChatbotWidget";

function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="main-content">

        <Navbar />

        <div className="page-content">
          {children}
        </div>

      </main>

      <ChatbotWidget />

    </div>
  );
}

export default DashboardLayout;