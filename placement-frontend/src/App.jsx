import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// ================= STUDENT PAGES =================
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import StudentResume from "./pages/student/StudentResume";
import PlacementDrives from "./pages/student/PlacementDrives";
import Applications from "./pages/student/Applications";
import StudentInterviews from "./pages/student/Interviews";
import AIResumeAnalysis from "./pages/student/AIResumeAnalysis";
import SkillAnalysis from "./pages/student/SkillAnalysis";
import ChatbotPage from "./pages/student/ChatbotPage";

// Innovative Features (1 - 7)
import ResumeCredibility from "./pages/student/ResumeCredibility";
import MockInterview from "./pages/student/MockInterview";
import PlacementJourney from "./pages/student/PlacementJourney";
import RejectionAnalyzer from "./pages/student/RejectionAnalyzer";
import CompanyPrepMode from "./pages/student/CompanyPrepMode";
import PeerBenchmarking from "./pages/student/PeerBenchmarking";
import StudentCollaboration from "./pages/student/StudentCollaboration";

// ================= COMPANY PAGES =================
import CompanyDashboard from "./pages/Company/CompanyDashboard";
import CreateDrive from "./pages/Company/CreateDrive";
import CompanyDrives from "./pages/Company/CompanyDrives";
import Applicants from "./pages/Company/Applicants";
import Shortlisted from "./pages/Company/Shortlisted";
import CompanyInterviews from "./pages/Company/Interviews";

// ================= TPO PAGES =================
import TPODashboard from "./pages/TPO/TPODashboard";
import TPOProfile from "./pages/TPO/TPOProfile";
import TPOStudents from "./pages/TPO/Students";
import TPOCompanies from "./pages/TPO/Companies";
import TPOPlacementDrives from "./pages/TPO/PlacementDrives";
import TPOApplications from "./pages/TPO/Applications";
import TPOInterviews from "./pages/TPO/Interviews";
import TPOAnalytics from "./pages/TPO/Analytics";
import TPOReports from "./pages/TPO/Reports";
import TPONotifications from "./pages/TPO/Notifications";
import PlacementConflicts from "./pages/TPO/PlacementConflicts";

// ================= ADMIN PAGES =================
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProfile from "./pages/Admin/AdminProfile";
import AdminUsers from "./pages/Admin/Users";
import AdminRolesPermissions from "./pages/Admin/RolesPermissions";
import AdminSystemConfig from "./pages/Admin/SystemConfig";
import AdminMonitoring from "./pages/Admin/Monitoring";
import AdminAnalytics from "./pages/Admin/AdminAnalytics";
import AdminNotifications from "./pages/Admin/Notifications";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= LOGIN ================= */}
        <Route path="/" element={<Login />} />

        {/* ================= STUDENT ROUTES ================= */}
        <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>} />
        <Route path="/student/resume" element={<ProtectedRoute allowedRoles={['student']}><StudentResume /></ProtectedRoute>} />
        <Route path="/student/jobs" element={<ProtectedRoute allowedRoles={['student']}><PlacementDrives /></ProtectedRoute>} />
        <Route path="/student/applications" element={<ProtectedRoute allowedRoles={['student']}><Applications /></ProtectedRoute>} />
        <Route path="/student/interviews" element={<ProtectedRoute allowedRoles={['student']}><StudentInterviews /></ProtectedRoute>} />
        <Route path="/student/ats" element={<ProtectedRoute allowedRoles={['student']}><AIResumeAnalysis /></ProtectedRoute>} />
        <Route path="/student/skills" element={<ProtectedRoute allowedRoles={['student']}><SkillAnalysis /></ProtectedRoute>} />
        <Route path="/student/chatbot" element={<ProtectedRoute allowedRoles={['student']}><ChatbotPage /></ProtectedRoute>} />

        {/* 8 Innovative Features */}
        <Route path="/student/credibility" element={<ProtectedRoute allowedRoles={['student']}><ResumeCredibility /></ProtectedRoute>} />
        <Route path="/student/mock-interview" element={<ProtectedRoute allowedRoles={['student']}><MockInterview /></ProtectedRoute>} />
        <Route path="/student/journey" element={<ProtectedRoute allowedRoles={['student']}><PlacementJourney /></ProtectedRoute>} />
        <Route path="/student/rejection-analyzer" element={<ProtectedRoute allowedRoles={['student']}><RejectionAnalyzer /></ProtectedRoute>} />
        <Route path="/student/company-prep" element={<ProtectedRoute allowedRoles={['student']}><CompanyPrepMode /></ProtectedRoute>} />
        <Route path="/student/company-prep/:driveId" element={<ProtectedRoute allowedRoles={['student']}><CompanyPrepMode /></ProtectedRoute>} />
        <Route path="/student/benchmarking" element={<ProtectedRoute allowedRoles={['student']}><PeerBenchmarking /></ProtectedRoute>} />
        <Route path="/student/collaborate" element={<ProtectedRoute allowedRoles={['student']}><StudentCollaboration /></ProtectedRoute>} />

        {/* ================= COMPANY ROUTES ================= */}
        <Route path="/company" element={<ProtectedRoute allowedRoles={['company']}><CompanyDashboard /></ProtectedRoute>} />
        <Route path="/company/create-drive" element={<ProtectedRoute allowedRoles={['company']}><CreateDrive /></ProtectedRoute>} />
        <Route path="/company/drives" element={<ProtectedRoute allowedRoles={['company']}><CompanyDrives /></ProtectedRoute>} />
        <Route path="/company/applicants" element={<ProtectedRoute allowedRoles={['company']}><Applicants /></ProtectedRoute>} />
        <Route path="/company/shortlisted" element={<ProtectedRoute allowedRoles={['company']}><Shortlisted /></ProtectedRoute>} />
        <Route path="/company/interviews" element={<ProtectedRoute allowedRoles={['company']}><CompanyInterviews /></ProtectedRoute>} />

        {/* ================= TPO ROUTES ================= */}
        <Route path="/tpo" element={<ProtectedRoute allowedRoles={['tpo', 'admin']}><TPODashboard /></ProtectedRoute>} />
        <Route path="/tpo/dashboard" element={<Navigate to="/tpo" replace />} />
        <Route path="/tpo/profile" element={<ProtectedRoute allowedRoles={['tpo', 'admin']}><TPOProfile /></ProtectedRoute>} />
        <Route path="/tpo/students" element={<ProtectedRoute allowedRoles={['tpo', 'admin']}><TPOStudents /></ProtectedRoute>} />
        <Route path="/tpo/companies" element={<ProtectedRoute allowedRoles={['tpo', 'admin']}><TPOCompanies /></ProtectedRoute>} />
        <Route path="/tpo/drives" element={<ProtectedRoute allowedRoles={['tpo', 'admin']}><TPOPlacementDrives /></ProtectedRoute>} />
        <Route path="/tpo/applications" element={<ProtectedRoute allowedRoles={['tpo', 'admin']}><TPOApplications /></ProtectedRoute>} />
        <Route path="/tpo/interviews" element={<ProtectedRoute allowedRoles={['tpo', 'admin']}><TPOInterviews /></ProtectedRoute>} />
        <Route path="/tpo/conflicts" element={<ProtectedRoute allowedRoles={['tpo', 'admin']}><PlacementConflicts /></ProtectedRoute>} />
        <Route path="/tpo/analytics" element={<ProtectedRoute allowedRoles={['tpo', 'admin']}><TPOAnalytics /></ProtectedRoute>} />
        <Route path="/tpo/reports" element={<ProtectedRoute allowedRoles={['tpo', 'admin']}><TPOReports /></ProtectedRoute>} />
        <Route path="/tpo/notifications" element={<ProtectedRoute allowedRoles={['tpo', 'admin']}><TPONotifications /></ProtectedRoute>} />

        {/* ================= ADMIN ROUTES ================= */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><AdminProfile /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/roles-permissions" element={<ProtectedRoute allowedRoles={['admin']}><AdminRolesPermissions /></ProtectedRoute>} />
        <Route path="/admin/configuration" element={<ProtectedRoute allowedRoles={['admin']}><AdminSystemConfig /></ProtectedRoute>} />
        <Route path="/admin/monitoring" element={<ProtectedRoute allowedRoles={['admin']}><AdminMonitoring /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['admin']}><AdminNotifications /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;