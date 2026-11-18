import { generateJSON, isGeminiConfigured } from './geminiService.js';
import {
  extractCategorizedSkills,
  calculateRoleReadiness,
  matchSkillsWithDrives,
  generateSkillRoadmap
} from '../utils/skillAnalyzer.js';

/**
 * Skill Analysis Engine: Deterministic calculations + Gemini interpretation
 */
export const analyzeSkillsWithAI = async ({
  student = {},
  drives = [],
  assessmentSessions = [],
  mockInterviews = []
}) => {
  const hasResume = Boolean(student.resume && student.resumeParsedText);
  const textToScan = student.resumeParsedText || '';
  const extracted = extractCategorizedSkills(textToScan);

  const allExtractedSkills = extracted.allSkills;
  const profileSkills = Array.isArray(student.skills) ? student.skills : [];

  // Active verified skills: if resume exists, extracted skills are authoritative; otherwise student's profile skills
  const activeSkills = hasResume
    ? (allExtractedSkills.length > 0 ? allExtractedSkills : profileSkills)
    : profileSkills;

  // Deterministic calculations
  const roleReadiness = calculateRoleReadiness(activeSkills);
  const driveMatches = matchSkillsWithDrives(activeSkills, drives);
  const baseRoadmap = generateSkillRoadmap(activeSkills, roleReadiness);

  // Derive empirical performance from assessments & mock interviews
  const completedAssessments = assessmentSessions.filter(s => s.status === 'completed');
  const completedMocks = mockInterviews.filter(m => m.status === 'completed');

  const avgAssessmentScore = completedAssessments.length > 0
    ? Math.round(completedAssessments.reduce((sum, s) => sum + (s.percentageScore || 0), 0) / completedAssessments.length)
    : null;

  const avgMockScore = completedMocks.length > 0
    ? Math.round(completedMocks.reduce((sum, m) => sum + (m.placementReadinessScore || m.overallScore || 0), 0) / completedMocks.length)
    : null;

  const baseResult = {
    hasResume: Boolean(student.resume),
    resumeVersion: student.resumeVersion || (student.resume ? 1 : 0),
    resumeProcessingStatus: student.resumeProcessingStatus || (student.resume ? 'completed' : 'idle'),
    resumeProcessingError: student.resumeProcessingError || null,
    resumeMetadata: student.resumeMetadata || null,
    lastSkillSyncAt: student.lastSkillSyncAt || null,
    allExtractedSkills,
    profileSkills,
    activeSkills,
    categorizedSkills: extracted.categorized,
    evidence: extracted.evidence || {},
    roleReadiness,
    driveMatches,
    roadmap: baseRoadmap,
    analytics: {
      totalExtractedCount: allExtractedSkills.length,
      totalProfileCount: profileSkills.length,
      totalActiveCount: activeSkills.length,
      averageAssessmentScore: avgAssessmentScore,
      averageMockScore: avgMockScore,
      assessmentsCount: completedAssessments.length,
      mocksCount: completedMocks.length
    }
  };

  if (!isGeminiConfigured()) {
    return { ...baseResult, isAiPowered: false };
  }

  const prompt = `
Act as a chief university career advisor and tech lead. Interpret this engineering student's real skills, portal assessments, and mock interview scores:

Student Profile:
- Department: ${student.department || 'Computer Science'}
- Verified Skills: ${activeSkills.join(', ')}
- Role Readiness: ${JSON.stringify(roleReadiness)}
- Completed Assessments: ${completedAssessments.length} (Average Score: ${avgAssessmentScore !== null ? `${avgAssessmentScore}%` : 'No assessments completed yet'})
- Completed Mock Interviews: ${completedMocks.length} (Average Score: ${avgMockScore !== null ? `${avgMockScore}%` : 'No mocks completed yet'})

Instructions:
1. Synthesize verified strengths based on skills and performance data.
2. Identify the most critical skill gaps for modern software engineering placements (e.g. system design, async backend, testing).
3. Recommend the top 3 specific topics the student should study next.
4. Generate 2 concrete, personalized practice exercises (e.g. build a specific mini-feature or solve a specific class of DSA problem).
5. Outline 2 short-term goals (next 2 weeks) and 2 long-term goals (next 2 months).

Return JSON in this format:
{
  "strengthsSummary": ["..."],
  "skillGaps": ["..."],
  "nextTopicsToStudy": [
    { "topic": "...", "reason": "...", "recommendedResource": "..." }
  ],
  "personalizedPracticeExercises": [
    { "title": "...", "description": "...", "skillsTrained": ["..."] }
  ],
  "shortTermGoals": ["..."],
  "longTermGoals": ["..."]
}
`;

  try {
    const aiRecommendations = await generateJSON({
      prompt,
      systemInstruction: 'You are an expert tech mentor analyzing placement skill profiles.'
    });

    return {
      ...baseResult,
      isAiPowered: true,
      aiRecommendations: {
        strengths: aiRecommendations.strengthsSummary || [],
        skillGaps: aiRecommendations.skillGaps || [],
        nextTopicsToStudy: aiRecommendations.nextTopicsToStudy || [],
        personalizedPracticeExercises: aiRecommendations.personalizedPracticeExercises || [],
        shortTermGoals: aiRecommendations.shortTermGoals || [],
        longTermGoals: aiRecommendations.longTermGoals || []
      }
    };
  } catch (err) {
    console.warn(`[Skill Analysis Service] Gemini recommendations failed (${err.message}). Using base analytics.`);
    return { ...baseResult, isAiPowered: false };
  }
};
