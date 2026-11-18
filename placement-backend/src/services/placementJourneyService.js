import { generateJSON, isGeminiConfigured } from './geminiService.js';
import { calculatePlacementJourney as fallbackPlacementJourney } from '../utils/placementJourneyEngine.js';

/**
 * Builds a personalized placement roadmap using student's actual performance and goals
 */
export const generatePlacementJourneyWithAI = async ({
  student = {},
  user = {},
  applications = [],
  interviews = [],
  drives = [],
  mockInterviews = [],
  assessmentSessions = [],
  weeksAvailable = 8
}) => {
  const baseJourney = fallbackPlacementJourney({
    student,
    user,
    applications,
    interviews,
    drives,
    mockInterviews
  });

  if (!isGeminiConfigured()) {
    return { ...baseJourney, isAiPowered: false };
  }

  const targetRole = student.targetRole || 'Software Development Engineer';
  const skills = student.skills || [];
  const cgpa = student.cgpa || 7.5;
  const atsScore = student.atsScore || 70;

  const prompt = `
Create a realistic, weekly personalized placement preparation roadmap for an engineering student.

Student Profile:
- Target Role: ${targetRole}
- Current Skills: ${skills.join(', ')}
- CGPA: ${cgpa}
- Current ATS Resume Score: ${atsScore}%
- Completed Mocks: ${mockInterviews.length}
- Preparation Timeframe: ${weeksAvailable} weeks

Roadmap Specifications:
1. Divide into 4 actionable milestone phases across ${weeksAvailable} weeks (e.g. Weeks 1-2: Foundations & Resume, Weeks 3-4: DSA & Core CS, Weeks 5-6: System Design & Projects, Weeks 7-${weeksAvailable}: Mock Interviews & Company Drives).
2. For each phase, specify:
   - Weekly learning goals
   - DSA & technical topics to solve
   - Aptitude practice topics
   - Resume refinement checklist item
   - Mock interview milestone
   - Project enhancement advice (how to level up existing GitHub projects with metrics, tests, or deployment)
3. Include revision strategy and continuous progress checkpoints.

Return JSON in this format:
{
  "targetRole": "${targetRole}",
  "totalWeeks": ${weeksAvailable},
  "overallStrategy": "...",
  "weeklyPhases": [
    {
      "phaseName": "...",
      "weeksRange": "Weeks 1-2",
      "weeklyGoals": ["..."],
      "dsaFocus": ["..."],
      "coreCsFocus": ["..."],
      "aptitudeFocus": ["..."],
      "resumeMilestone": "...",
      "mockInterviewMilestone": "...",
      "projectEnhancement": "..."
    }
  ],
  "revisionCheckpoints": ["..."],
  "recommendedDailySchedule": {
    "dsaHours": 2,
    "coreCsHours": 1.5,
    "projectOrAptitudeHours": 1.5
  }
}
`;

  try {
    const aiRoadmap = await generateJSON({
      prompt,
      systemInstruction: 'You are an elite placement trainer and career coach for top engineering universities.'
    });

    return {
      ...baseJourney,
      isAiPowered: true,
      personalizedRoadmap: aiRoadmap,
      generatedAt: new Date()
    };
  } catch (err) {
    console.warn(`[Placement Journey Service] Gemini roadmap failed (${err.message}). Using base journey.`);
    return { ...baseJourney, isAiPowered: false };
  }
};
