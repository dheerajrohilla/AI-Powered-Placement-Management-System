import apiClient from './apiClient';

// ==================== AUTH SERVICES ====================
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  getMe: () => apiClient.get('/auth/me'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (email, token, password) => apiClient.post('/auth/reset-password', { email, token, password }),
};

// ==================== STUDENT SERVICES ====================
export const studentAPI = {
  getDashboard: () => apiClient.get('/student/dashboard'),
  getProfile: () => apiClient.get('/student/profile'),
  updateProfile: (data) => apiClient.put('/student/profile', data),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return apiClient.post('/student/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getPlacementDrives: () => apiClient.get('/student/drives'),
  applyForDrive: (driveId) => apiClient.post('/student/apply', { driveId }),
  getApplications: () => apiClient.get('/student/applications'),
  getInterviews: () => apiClient.get('/student/interviews'),
  getATSAnalysis: () => apiClient.get('/student/ats-analysis'),
  checkResumeText: (text, targetDriveId) => apiClient.post('/student/ats-check-text', { text, targetDriveId }),
  getSkillAnalysis: () => apiClient.get('/student/skill-analysis'),
  syncSkills: (skills) => apiClient.post('/student/sync-skills', { skills }),
  chatWithBot: (message) => apiClient.post('/student/chatbot', { message }),
  getChatHistory: () => apiClient.get('/student/chatbot/history'),
  clearChatHistory: () => apiClient.delete('/student/chatbot/history'),

  // Feature 1: AI Resume Consistency / Credibility Checker
  getCredibilityAnalysis: () => apiClient.get('/student/credibility-analysis'),

  // Feature 2: AI Mock Interview → Placement Score
  generateMockInterview: (data) => apiClient.post('/student/mock-interview/generate', data),
  submitMockAnswer: (interviewId, data) => apiClient.post(`/student/mock-interview/${interviewId}/answer`, data),
  completeMockInterview: (interviewId) => apiClient.post(`/student/mock-interview/${interviewId}/complete`),
  getMockInterviews: () => apiClient.get('/student/mock-interviews'),
  getMockInterviewById: (id) => apiClient.get(`/student/mock-interview/${id}`),

  // Feature 3: Placement Journey & Skill Roadmap
  getPlacementJourney: () => apiClient.get('/student/placement-journey'),

  // Feature 4: "Why Am I Not Getting Shortlisted?" Analyzer
  getRejectionAnalysis: () => apiClient.get('/student/rejection-analysis'),

  // Feature 5: Company-Specific Preparation Mode
  getCompanyPrepMode: (driveId = 'default') => apiClient.get(`/student/company-prep/${driveId}`),

  // Feature 6: Anonymous Peer Benchmarking
  getPeerBenchmark: () => apiClient.get('/student/peer-benchmark'),

  // Feature 7: Skill-Based Student Collaboration
  getCollaborationMatches: () => apiClient.get('/student/collaborate/matches'),
  sendCollaborationRequest: (data) => apiClient.post('/student/collaborate/request', data),
  getCollaborationRequests: () => apiClient.get('/student/collaborate/requests'),
  updateCollaborationRequest: (id, status) => apiClient.patch(`/student/collaborate/request/${id}`, { status }),
  getNotifications: () => apiClient.get('/student/notifications'),
  markNotificationRead: (notificationId) => apiClient.patch(`/student/notifications/${notificationId}/read`),
};

// ==================== COMPANY SERVICES ====================
export const companyAPI = {
  getDashboard: () => apiClient.get('/company/dashboard'),
  createDrive: (data) => apiClient.post('/company/drives', data),
  getDrives: () => apiClient.get('/company/drives'),
  getApplicants: () => apiClient.get('/company/applicants'),
  getShortlisted: () => apiClient.get('/company/shortlisted'),
  updateApplicationStatus: (applicationId, status) => apiClient.patch(`/company/applications/${applicationId}/status`, { status }),
  scheduleInterview: (data) => apiClient.post('/company/interviews', data),
  getInterviews: () => apiClient.get('/company/interviews'),
};

// ==================== TPO SERVICES ====================
export const tpoAPI = {
  getProfile: () => apiClient.get('/tpo/profile'),
  updateProfile: (data) => apiClient.put('/tpo/profile', data),
  changePassword: (data) => apiClient.put('/tpo/change-password', data),
  getDashboard: () => apiClient.get('/tpo/dashboard'),
  getStudents: () => apiClient.get('/tpo/students'),
  getCompanies: () => apiClient.get('/tpo/companies'),
  verifyCompany: (companyId, isVerified) => apiClient.post('/tpo/verify-company', { companyId, isVerified }),
  getDrives: () => apiClient.get('/tpo/drives'),
  createDrive: (data) => apiClient.post('/tpo/drives', data),
  updateDrive: (driveId, data) => apiClient.put(`/tpo/drives/${driveId}`, data),
  toggleDriveStatus: (driveId, status) => apiClient.patch(`/tpo/drives/${driveId}/status`, { status }),
  getApplications: () => apiClient.get('/tpo/applications'),
  updateApplicationStatus: (applicationId, status) => apiClient.patch(`/tpo/applications/${applicationId}/status`, { status }),
  getInterviews: () => apiClient.get('/tpo/interviews'),
  getAnalytics: () => apiClient.get('/tpo/analytics'),
  generateReports: () => apiClient.get('/tpo/reports'),
  getNotifications: () => apiClient.get('/tpo/notifications'),
  markNotificationRead: (notificationId) => apiClient.patch(`/tpo/notifications/${notificationId}/read`),

  // Feature 8: Placement Conflict Detector
  getPlacementConflicts: () => apiClient.get('/tpo/conflicts'),
  resolveConflictSlot: (data) => apiClient.post('/tpo/conflicts/resolve', data),
};

// ==================== ADMIN SERVICES ====================
export const adminAPI = {
  getProfile: () => apiClient.get('/admin/profile'),
  updateProfile: (data) => apiClient.put('/admin/profile', data),
  changePassword: (data) => apiClient.put('/admin/change-password', data),
  getDashboard: () => apiClient.get('/admin/dashboard'),
  getUsers: () => apiClient.get('/admin/users'),
  createUser: (data) => apiClient.post('/admin/users', data),
  toggleUserStatus: (userId, isActive) => apiClient.patch(`/admin/users/${userId}/status`, { isActive }),
  resetUserPassword: (userId, newPassword) => apiClient.post(`/admin/users/${userId}/reset-password`, { newPassword }),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
  getRolesPermissions: () => apiClient.get('/admin/roles-permissions'),
  getSystemConfig: () => apiClient.get('/admin/configuration'),
  updateSystemConfig: (data) => apiClient.put('/admin/configuration', data),
  getMonitoring: () => apiClient.get('/admin/monitoring'),
  getAnalytics: () => apiClient.get('/admin/analytics'),
  getStudents: () => apiClient.get('/admin/students'),
  getCompanies: () => apiClient.get('/admin/companies'),
  verifyCompany: (companyId) => apiClient.post('/admin/verify-company', { companyId }),
  getDrives: () => apiClient.get('/admin/drives'),
  getInterviews: () => apiClient.get('/admin/interviews'),
  generateReports: () => apiClient.get('/admin/reports'),
  getNotifications: () => apiClient.get('/admin/notifications'),
  markNotificationRead: (notificationId) => apiClient.patch(`/admin/notifications/${notificationId}/read`),
};
