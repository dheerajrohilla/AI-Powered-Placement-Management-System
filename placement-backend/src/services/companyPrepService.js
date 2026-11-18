import { generateJSON, isGeminiConfigured } from './geminiService.js';
import { generateCompanyPrepPlan as fallbackCompanyPrep } from '../utils/companyPrepEngine.js';

/**
 * Builds a company-specific preparation playbook with Gemini and verified company facts
 */
export const generateCompanyPrepWithAI = async ({
  student = {},
  drive = null
}) => {
  const basePlan = fallbackCompanyPrep({ student, drive });

  if (!isGeminiConfigured() || !drive) {
    return { ...basePlan, isAiPowered: false };
  }

  const companyName = drive.company?.companyName || drive.title || 'Recruiter';
  const role = drive.jobRole || drive.title || 'Software Development Engineer';
  const requirements = drive.requirements || [];
  const studentSkills = student.skills || [];

  const prompt = `
Create an in-depth, verified interview preparation playbook for a student preparing for a placement drive at "${companyName}" for the role of "${role}".

Verified Drive Information from University Portal:
- Job Role: ${role}
- Verified Technical Requirements: ${requirements.join(', ')}
- Location: ${drive.location || 'Pan India'}
- Min CGPA: ${drive.eligibility?.minCGPA || 6.0}
- Verified Description: ${drive.description || 'Campus recruitment drive'}

Candidate's Current Skills:
${studentSkills.join(', ')}

Guidelines:
1. Clearly distinguish general interview advice from verified company-specific facts.
2. Formulate 3 distinct interview rounds based on standard engineering hiring patterns for this role (e.g. Online Assessment, Technical Deep-Dive, Cultural & HR).
3. Generate 3 role-specific Technical practice questions (with key points to answer) and 2 Behavioral/HR questions.
4. Highlight the student's matched skills and specific skill gaps that need immediate practice.
5. Provide a realistic 7-day sprint preparation checklist.
6. STRICT COMPLIANCE: Do not invent undisclosed internal salary policies or unverified corporate secrets. Keep guidance realistic and professional.

Return JSON in this format:
{
  "companyOverview": "...",
  "verifiedFacts": ["..."],
  "generalPreparationAdvice": ["..."],
  "skillAlignment": {
    "matchedSkills": ["..."],
    "immediateGapsToBridge": ["..."]
  },
  "expectedRounds": [
    { "roundName": "...", "focusAreas": "...", "preparationStrategy": "..." }
  ],
  "targetedPracticeQuestions": [
    { "type": "technical" | "behavioral", "question": "...", "keyPointsToAddress": "..." }
  ],
  "sevenDaySprintChecklist": [
    { "day": 1, "topic": "...", "action": "..." }
  ]
}
`;

  try {
    const aiPrep = await generateJSON({
      prompt,
      systemInstruction: 'You are a campus placement director specializing in corporate technical hiring patterns.'
    });

    return {
      ...basePlan,
      isAiPowered: true,
      companyOverview: aiPrep.companyOverview,
      verifiedFacts: aiPrep.verifiedFacts || [],
      generalPreparationAdvice: aiPrep.generalPreparationAdvice || [],
      skillAlignment: aiPrep.skillAlignment || basePlan.skillGapAnalysis,
      expectedRounds: aiPrep.expectedRounds || basePlan.companyIntel?.rounds,
      targetedPracticeQuestions: aiPrep.targetedPracticeQuestions || basePlan.practiceQuestions,
      sevenDaySprintChecklist: aiPrep.sevenDaySprintChecklist || basePlan.actionPlan
    };
  } catch (err) {
    console.warn(`[Company Prep Service] Gemini generation failed (${err.message}). Using fallback intel.`);
    return { ...basePlan, isAiPowered: false };
  }
};
