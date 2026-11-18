import { generateJSON, isGeminiConfigured } from './geminiService.js';

/**
 * Generates concise AI placement-readiness summary for Student Dashboard
 */
export const generateDashboardReadinessSummary = async ({
  student = {},
  user = {},
  applications = [],
  interviews = [],
  drives = [],
  mockInterviews = [],
  assessmentSessions = []
}) => {
  const atsScore = student.atsScore || (student.resumeAnalysis?.score || 0);
  const skillsCount = (student.skills || []).length;
  const completedMocks = mockInterviews.filter(m => m.status === 'completed');
  const completedAssessments = assessmentSessions.filter(s => s.status === 'completed');

  const baseSummary = {
    placementReadinessScore: Math.round((atsScore * 0.4) + (Math.min(10, skillsCount) * 4) + (completedMocks.length > 0 ? 20 : 0)),
    strengths: [
      skillsCount >= 5 ? `Strong technical base with ${skillsCount} documented skills` : 'Documented technical profile',
      atsScore >= 75 ? 'ATS-optimized resume ready for campus drives' : 'Valid resume uploaded'
    ],
    skillGaps: [
      skillsCount < 6 ? 'Expand skills with cloud and system design tools' : 'Deepen DSA problem solving',
      completedMocks.length === 0 ? 'Complete at least 1 mock interview session' : 'Review recent mock feedback'
    ],
    recommendedNextAction: completedMocks.length === 0
      ? 'Take an AI Mock Interview session to benchmark your technical readiness'
      : (applications.length === 0 ? 'Browse and apply to matching campus placement drives' : 'Review scheduled interviews and practice company prep'),
    upcomingGoals: [
      'Solve 5 DSA problems on arrays and graphs',
      'Refine resume bullet points with quantified outcomes',
      'Take a company-specific prep module'
    ],
    isAiPowered: false
  };

  if (!isGeminiConfigured()) {
    return baseSummary;
  }

  const prompt = `
Generate a concise, honest AI Placement-Readiness Executive Summary for this student's dashboard.

Student Data:
- Name: ${user.name || 'Student'}
- Department: ${student.department || 'General'}
- CGPA: ${student.cgpa || 0}
- Verified Skills: ${(student.skills || []).join(', ') || 'None listed'}
- Resume ATS Score: ${atsScore}%
- Applications: ${applications.length} (Shortlisted: ${applications.filter(a => a.status === 'shortlisted').length}, Selected: ${applications.filter(a => a.status === 'selected').length})
- Interviews Scheduled: ${interviews.length}
- Mock Interviews Taken: ${completedMocks.length} (Avg Score: ${completedMocks.length > 0 ? Math.round(completedMocks.reduce((acc, m) => acc + (m.overallScore || 0), 0) / completedMocks.length) : 'None'})
- Assessment Sessions Completed: ${completedAssessments.length}

Instructions:
1. Provide a realistic placement readiness score (0-100) based on verified credentials (do NOT fabricate).
2. List 2-3 genuine current strengths.
3. Identify 2 most critical skill gaps or preparation deficits.
4. Recommend 1 high-priority next action for today.
5. Provide 2-3 actionable upcoming goals for this week.

Return JSON in this format:
{
  "placementReadinessScore": <number 0-100>,
  "headline": "...",
  "strengths": ["...", "..."],
  "skillGaps": ["...", "..."],
  "recommendedNextAction": "...",
  "upcomingGoals": ["...", "..."]
}
`;

  try {
    const aiResult = await generateJSON({
      prompt,
      systemInstruction: 'You are a university placement director. Provide concise, realistic, data-driven readiness summaries.'
    });

    return {
      placementReadinessScore: Number(aiResult.placementReadinessScore) || baseSummary.placementReadinessScore,
      headline: aiResult.headline || 'Placement Readiness Diagnostic',
      strengths: aiResult.strengths || baseSummary.strengths,
      skillGaps: aiResult.skillGaps || baseSummary.skillGaps,
      recommendedNextAction: aiResult.recommendedNextAction || baseSummary.recommendedNextAction,
      upcomingGoals: aiResult.upcomingGoals || baseSummary.upcomingGoals,
      isAiPowered: true,
      lastEvaluated: new Date()
    };
  } catch (err) {
    console.warn(`[Dashboard Service] Gemini summary failed (${err.message}). Using base summary.`);
    return baseSummary;
  }
};
