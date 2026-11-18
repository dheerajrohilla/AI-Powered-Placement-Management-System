import apiClient, { getAssetUrl } from './apiClient';

export { getAssetUrl };

// ==================== AUTH SERVICES ====================
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  getMe: () => apiClient.get('/auth/me'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  verifyResetOtp: (email, otp) => apiClient.post('/auth/verify-reset-otp', { email, otp }),
  resetPassword: (email, token, password, otp) => apiClient.post('/auth/reset-password', { email, token, password, otp }),
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
  withdrawApplication: (applicationId) => apiClient.patch(`/student/applications/${applicationId}/withdraw`),
  getApplications: () => apiClient.get('/student/applications'),
  getInterviews: () => apiClient.get('/student/interviews'),
  getATSAnalysis: () => apiClient.get('/student/ats-analysis'),
  checkResumeText: (text, targetDriveId) => apiClient.post('/student/ats-check-text', { text, targetDriveId }),
  getSkillAnalysis: () => apiClient.get('/student/skill-analysis'),
  syncSkills: (skills) => apiClient.post('/student/sync-skills', { skills }),
  chatWithBot: (message, config) => apiClient.post('/student/chatbot', { message }, config),
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

  // Feature 7: Skill-Based Student Collaboration & Workspaces
  getCollaborationMatches: () => apiClient.get('/student/collaborate/matches'),
  sendCollaborationRequest: (data) => apiClient.post('/student/collaborate/request', data),
  getCollaborationRequests: () => apiClient.get('/student/collaborate/requests'),
  updateCollaborationRequest: (id, status) => apiClient.patch(`/student/collaborate/request/${id}`, { status }),
  generateCollaborativeExercise: (focusArea, peerId) => apiClient.post('/student/collaborate/exercise', { focusArea, peerId }),
  getNotifications: () => apiClient.get('/student/notifications'),
  markNotificationRead: (notificationId) => apiClient.patch(`/student/notifications/${notificationId}/read`),

  // Industry-Grade Peer Collaboration Workspaces
  getWorkspaces: (params) => apiClient.get('/student/workspaces', { params }),
  createWorkspace: (data) => apiClient.post('/student/workspaces', data),
  getWorkspaceById: (id) => apiClient.get(`/student/workspaces/${id}`),
  updateWorkspace: (id, data) => apiClient.put(`/student/workspaces/${id}`, data),
  deleteWorkspace: (id) => apiClient.delete(`/student/workspaces/${id}`),
  joinWorkspace: (id, inviteCode) => apiClient.post(`/student/workspaces/${id}/join`, { inviteCode }),
  inviteToWorkspace: (id, recipientStudentId, message) => apiClient.post(`/student/workspaces/${id}/invite`, { recipientStudentId, message }),
  getWorkspaceInvitations: () => apiClient.get('/student/workspaces/invitations'),
  respondToWorkspaceInvitation: (invitationId, action) => apiClient.post(`/student/workspaces/invitations/${invitationId}/respond`, { action }),
  getChannelMessages: (workspaceId, channelId, page = 1) => apiClient.get(`/student/workspaces/${workspaceId}/channels/${channelId}/messages?page=${page}`),
  sendWorkspaceMessage: (workspaceId, channelId, data) => apiClient.post(`/student/workspaces/${workspaceId}/channels/${channelId}/messages`, data),
  editWorkspaceMessage: (workspaceId, messageId, content) => apiClient.put(`/student/workspaces/${workspaceId}/messages/${messageId}`, { content }),
  deleteWorkspaceMessage: (workspaceId, messageId) => apiClient.delete(`/student/workspaces/${workspaceId}/messages/${messageId}`),
  getWorkspaceTasks: (workspaceId) => apiClient.get(`/student/workspaces/${workspaceId}/tasks`),
  createWorkspaceTask: (workspaceId, data) => apiClient.post(`/student/workspaces/${workspaceId}/tasks`, data),
  updateWorkspaceTaskStatus: (workspaceId, taskId, status) => apiClient.patch(`/student/workspaces/${workspaceId}/tasks/${taskId}`, { status }),
  getWorkspaceResources: (workspaceId) => apiClient.get(`/student/workspaces/${workspaceId}/resources`),
  createWorkspaceResource: (workspaceId, data) => apiClient.post(`/student/workspaces/${workspaceId}/resources`, data),
  getCodeSession: (workspaceId) => apiClient.get(`/student/workspaces/${workspaceId}/code-session`),
  updateCodeSession: (workspaceId, data) => apiClient.put(`/student/workspaces/${workspaceId}/code-session`, data),
  runCollaborativeCode: (workspaceId, data) => apiClient.post(`/student/workspaces/${workspaceId}/code-session/run`, data),

  // Gemini AI Executive Readiness & Application Assistant
  getAiReadinessSummary: () => apiClient.get('/student/dashboard/ai-summary'),
  getGeminiStatus: () => apiClient.get('/student/gemini-status'),
  generateCoverLetter: (driveId, customTone = 'Professional') => apiClient.post('/student/application-assistant/cover-letter', { driveId, customTone }),
  generateRecruiterEmail: (driveId, emailType = 'initial_outreach') => apiClient.post('/student/application-assistant/recruiter-email', { driveId, emailType }),
  summarizeDrive: (driveId) => apiClient.get(`/student/application-assistant/summarize/${driveId}`),
};

// ==================== AI PREPARATION & ASSESSMENT SERVICES ====================
export const aiPrepAPI = {
  getPatterns: () => apiClient.get('/student/ai-prep/patterns'),
  createSession: (config) => apiClient.post('/student/ai-prep/create', config),
  getSession: (sessionId) => apiClient.get(`/student/ai-prep/session/${sessionId}`),
  saveAnswer: (sessionId, data) => apiClient.post(`/student/ai-prep/session/${sessionId}/save-answer`, data),
  submitAnswer: (sessionId, data) => apiClient.post(`/student/ai-prep/session/${sessionId}/submit-answer`, data),
  getFollowUp: (sessionId, questionId) => apiClient.post(`/student/ai-prep/session/${sessionId}/follow-up`, { questionId }),
  runCode: (sessionId, data) => apiClient.post(`/student/ai-prep/session/${sessionId}/run-code`, data),
  submitSession: (sessionId, timeTakenSeconds) => apiClient.post(`/student/ai-prep/session/${sessionId}/submit`, { timeTakenSeconds }),
  getSessionReport: (sessionId) => apiClient.get(`/student/ai-prep/session/${sessionId}/report`),
  getHistory: () => apiClient.get('/student/ai-prep/history'),
};

// ==================== COMPANY SERVICES ====================
export const companyAPI = {
  getProfile: () => apiClient.get('/company/profile'),
  updateProfile: (data) => apiClient.put('/company/profile', data),
  getDashboard: () => apiClient.get('/company/dashboard'),
  createDrive: (data) => apiClient.post('/company/drives', data),
  getDrives: () => apiClient.get('/company/drives'),
  submitDriveForApproval: (driveId) => apiClient.post(`/company/drives/${driveId}/submit-approval`),
  getApplicants: (params) => apiClient.get('/company/applicants', { params }),
  getShortlisted: () => apiClient.get('/company/shortlisted'),
  getInterviewCandidates: () => apiClient.get('/company/interview-candidates'),
  updateApplicationStatus: (applicationId, status, feedback) => apiClient.patch(`/company/applications/${applicationId}/status`, { status, feedback }),
  scheduleInterview: (data) => apiClient.post('/company/interviews', data),
  getInterviews: () => apiClient.get('/company/interviews'),
  exportApplicants: (driveId) => apiClient.get('/company/applicants/export', { params: { driveId }, responseType: 'blob' }),
  getNotifications: () => apiClient.get('/company/notifications'),
  markNotificationRead: (notificationId) => apiClient.patch(`/company/notifications/${notificationId}/read`),
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
  getPendingDrives: () => apiClient.get('/tpo/drives/pending'),
  approveDrive: (driveId, feedback) => apiClient.post(`/tpo/drives/${driveId}/approve`, { feedback }),
  rejectDrive: (driveId, feedback) => apiClient.post(`/tpo/drives/${driveId}/reject`, { feedback }),
  requestDriveChanges: (driveId, feedback) => apiClient.post(`/tpo/drives/${driveId}/request-changes`, { feedback }),
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

  // Centralized Email System & Diagnostics
  getEmailDiagnostics: () => apiClient.get('/admin/email/diagnostics'),
  verifyEmailConnection: () => apiClient.get('/admin/email/verify-connection'),
  sendTestEmail: (targetEmail) => apiClient.post('/admin/email/test-send', { targetEmail }),
  getEmailLogs: (limit = 50) => apiClient.get(`/admin/email/logs?limit=${limit}`),
};

// ==================== STUDY MATERIAL SERVICES ====================
export const studyMaterialAPI = {
  getSubjects: () => apiClient.get('/study-materials/subjects'),
  getSubjectMaterials: (subjectId) => apiClient.get(`/study-materials/subjects/${subjectId}`),
  getPdfMetadata: (fileId) => apiClient.get(`/study-materials/pdf/${fileId}/metadata`),
  getPdfStreamUrl: (fileId) => {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    return `${baseUrl}/study-materials/pdf/${fileId}/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
  getPdfDownloadUrl: (fileId) => {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    return `${baseUrl}/study-materials/pdf/${fileId}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  }
};

// ==================== SUBJECT QUIZ & ASSESSMENT SERVICES ====================
export const quizAPI = {
  getConfig: () => apiClient.get('/quiz/config'),
  startQuiz: (data) => apiClient.post('/quiz/start', data),
  submitQuiz: (data) => apiClient.post('/quiz/submit', data),
  getDashboard: () => apiClient.get('/quiz/dashboard'),
  getAttemptDetails: (attemptId) => apiClient.get(`/quiz/attempts/${attemptId}`),
  generateAIQuestions: (data) => apiClient.post('/quiz/generate-ai', data)
};

// ==================== WEBRTC VIRTUAL INTERVIEW SERVICES ====================
export const interviewAPI = {
  getRoomAccess: (interviewId) => apiClient.get(`/interviews/${interviewId}/room-access`),
  updateStatus: (interviewId, data) => apiClient.patch(`/interviews/${interviewId}/status`, data),
  getInterviewDetails: (interviewId) => apiClient.get(`/interviews/${interviewId}`)
};




