/**
 * Placement Journey & Skill Roadmap Engine
 * Visual 9-stage pipeline progression tracking:
 * Profile → Resume → Skill Assessment → Eligible Companies → Preparation → Mock Interview → Application → Interview → Selection
 */

export const calculatePlacementJourney = ({
  student = {},
  user = {},
  applications = [],
  interviews = [],
  drives = [],
  mockInterviews = []
}) => {
  // 1. Profile
  const hasProfileBasics = Boolean(student.department && student.batch && student.rollNumber);
  const profileComplete = hasProfileBasics && (student.skills?.length > 0 || student.bio);
  const profileProgress = profileComplete ? 100 : hasProfileBasics ? 70 : 40;

  // 2. Resume
  const hasResume = Boolean(student.resume);
  const atsScore = student.atsScore || (student.resumeAnalysis?.score || 0);
  const resumeProgress = hasResume ? 100 : (student.resumeParsedText ? 80 : 20);

  // 3. Skill Assessment
  const skillsCount = (student.skills || []).length;
  const skillsComplete = skillsCount >= 3;
  const skillsProgress = skillsCount >= 5 ? 100 : skillsCount >= 3 ? 75 : skillsCount > 0 ? 50 : 10;

  // 4. Eligible Companies
  const studentCGPA = student.cgpa || 0;
  const studentDept = student.department || '';
  const eligibleDrives = drives.filter(d => {
    const minCGPA = d.eligibility?.minCGPA || 0;
    const depts = d.eligibility?.departments || [];
    const cgpaOk = studentCGPA >= minCGPA || studentCGPA === 0;
    const deptOk = depts.length === 0 || depts.includes(studentDept);
    return cgpaOk && deptOk;
  });
  const eligibleComplete = eligibleDrives.length > 0;
  const eligibleProgress = eligibleDrives.length >= 3 ? 100 : eligibleDrives.length > 0 ? 70 : 20;

  // 5. Preparation
  // Checks if student has prepared (mock interviews attempted, or profile skills aligned with drives)
  const prepComplete = mockInterviews.length > 0 || skillsCount >= 6;
  const prepProgress = mockInterviews.length > 0 ? 100 : skillsCount >= 4 ? 65 : 30;

  // 6. Mock Interview
  const completedMocks = mockInterviews.filter(m => m.status === 'completed');
  const highestMockScore = completedMocks.length > 0
    ? Math.max(...completedMocks.map(m => m.placementReadinessScore || m.overallScore || 0))
    : 0;
  const mockComplete = completedMocks.length > 0;
  const mockProgress = mockComplete ? 100 : mockInterviews.length > 0 ? 50 : 0;

  // 7. Application
  const appliedCount = applications.length;
  const applicationComplete = appliedCount > 0;
  const applicationProgress = appliedCount >= 3 ? 100 : appliedCount > 0 ? 75 : 0;

  // 8. Interview
  const scheduledInterviews = interviews.filter(i => ['scheduled', 'completed', 'passed'].includes(i.status));
  const interviewComplete = scheduledInterviews.length > 0;
  const interviewProgress = scheduledInterviews.some(i => i.status === 'passed') ? 100 : scheduledInterviews.length > 0 ? 70 : 0;

  // 9. Selection
  const isSelected = student.isPlaced || applications.some(a => a.status === 'selected');
  const selectionProgress = isSelected ? 100 : scheduledInterviews.length > 0 ? 40 : 0;

  // Compile Stages
  const stages = [
    {
      id: 'profile',
      number: 1,
      name: 'Profile Setup',
      status: profileComplete ? 'completed' : 'in_progress',
      progress: profileProgress,
      metricLabel: `${student.profileStrength || 80}% Complete`,
      description: 'Institutional credentials, department, and social links configured.',
      actionText: profileComplete ? 'Review Profile' : 'Complete Profile',
      actionLink: '/student/profile'
    },
    {
      id: 'resume',
      number: 2,
      name: 'Resume & ATS Optimization',
      status: resumeProgress === 100 ? 'completed' : (hasResume ? 'in_progress' : 'in_progress'),
      progress: resumeProgress,
      metricLabel: hasResume ? `ATS Score: ${atsScore}/100` : 'Resume Missing',
      description: 'Upload PDF resume and verify ATS keyword extraction & formatting.',
      actionText: hasResume ? 'Inspect ATS Score' : 'Upload Resume',
      actionLink: '/student/ats'
    },
    {
      id: 'skills',
      number: 3,
      name: 'Skill Assessment',
      status: skillsComplete ? 'completed' : 'in_progress',
      progress: skillsProgress,
      metricLabel: `${skillsCount} Verified Skills`,
      description: 'Taxonomy classification across frontend, backend, databases, and DevOps.',
      actionText: 'Analyze Skills',
      actionLink: '/student/skills'
    },
    {
      id: 'companies',
      number: 4,
      name: 'Eligible Companies Discovery',
      status: eligibleComplete ? 'completed' : 'in_progress',
      progress: eligibleProgress,
      metricLabel: `${eligibleDrives.length} Active Drives`,
      description: 'Filtered placement drives matching your CGPA and department eligibility.',
      actionText: 'View Eligible Drives',
      actionLink: '/student/jobs'
    },
    {
      id: 'preparation',
      number: 5,
      name: 'Company-Specific Prep Mode',
      status: prepComplete ? 'completed' : 'in_progress',
      progress: prepProgress,
      metricLabel: 'Playbook Active',
      description: 'Deep-dive into target company interview rounds, difficulty, and skill gaps.',
      actionText: 'Launch Prep Mode',
      actionLink: '/student/company-prep'
    },
    {
      id: 'mock_interview',
      number: 6,
      name: 'AI Mock Interview',
      status: mockComplete ? 'completed' : (mockInterviews.length > 0 ? 'in_progress' : 'pending'),
      progress: mockProgress,
      metricLabel: mockComplete ? `Placement Score: ${highestMockScore}%` : 'Take Mock Round',
      description: 'Simulated technical interview tailored to company JD with real-time grading.',
      actionText: mockComplete ? 'Retake Mock Interview' : 'Start Mock Interview',
      actionLink: '/student/mock-interview'
    },
    {
      id: 'application',
      number: 7,
      name: 'Drive Application',
      status: applicationComplete ? 'completed' : 'pending',
      progress: applicationProgress,
      metricLabel: `${appliedCount} Applied`,
      description: 'Submit verified applications for upcoming campus recruitment drives.',
      actionText: 'Track Applications',
      actionLink: '/student/applications'
    },
    {
      id: 'interview',
      number: 8,
      name: 'Live Company Interview',
      status: interviewComplete ? 'completed' : (appliedCount > 0 ? 'in_progress' : 'pending'),
      progress: interviewProgress,
      metricLabel: `${scheduledInterviews.length} Scheduled`,
      description: 'Online coding assessments, technical panels, and HR discussions.',
      actionText: 'View Schedule',
      actionLink: '/student/interviews'
    },
    {
      id: 'selection',
      number: 9,
      name: 'Final Offer / Selection',
      status: isSelected ? 'completed' : 'pending',
      progress: selectionProgress,
      metricLabel: isSelected ? 'Offer Confirmed 🎉' : 'In Progress',
      description: 'Campus placement offer issued with CTC confirmation & onboarding.',
      actionText: isSelected ? 'View Placement Details' : 'View Pipeline',
      actionLink: '/student'
    }
  ];

  // Overall milestone calculation
  const completedStages = stages.filter(s => s.status === 'completed').length;
  const overallPercentage = Math.round((completedStages / stages.length) * 100);

  // Determine current active milestone
  const currentStageIndex = stages.findIndex(s => s.status !== 'completed');
  const currentStage = currentStageIndex !== -1 ? stages[currentStageIndex] : stages[stages.length - 1];

  let nextActionGuidance = `Next step: Focus on ${currentStage.name} to maximize your placement readiness.`;
  if (currentStage.id === 'mock_interview') {
    nextActionGuidance = "Take an AI Mock Interview tailored to your target company to generate your placement readiness score.";
  } else if (currentStage.id === 'preparation') {
    nextActionGuidance = "Activate Company Preparation Mode for your dream company to review past topics and skill gaps.";
  } else if (currentStage.id === 'application') {
    nextActionGuidance = `You are eligible for ${eligibleDrives.length} active campus drives. Submit your applications before registration deadlines!`;
  }

  return {
    overallPercentage,
    completedStagesCount: completedStages,
    totalStagesCount: stages.length,
    currentStage,
    nextActionGuidance,
    stages,
    stats: {
      atsScore,
      eligibleDrivesCount: eligibleDrives.length,
      appliedCount,
      scheduledInterviewsCount: scheduledInterviews.length,
      highestMockScore,
      isPlaced: isSelected
    },
    evaluatedAt: new Date()
  };
};
