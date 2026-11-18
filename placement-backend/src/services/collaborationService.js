import { generateJSON, isGeminiConfigured } from './geminiService.js';
import { calculatePeerBenchmark as fallbackBenchmark } from '../utils/peerBenchmarkEngine.js';

/**
 * Anonymously interprets peer benchmark metrics and recommends gap-closing actions
 */
export const interpretPeerBenchmarkWithAI = async ({ currentStudent = {}, allStudents = [] }) => {
  const baseBenchmark = fallbackBenchmark({ currentStudent, allStudents });

  if (!isGeminiConfigured()) {
    return { ...baseBenchmark, isAiPowered: false };
  }

  const { overallPercentile, dimensions } = baseBenchmark;

  const prompt = `
Provide an anonymous, supportive interpretation of an engineering student's cohort benchmark metrics:

Cohort Percentile: ${overallPercentile}th percentile

Dimension Breakdowns:
- DSA: Student ${dimensions.dsa?.userValue} vs Cohort Avg ${dimensions.dsa?.cohortAverage} (Top 10%: ${dimensions.dsa?.top10Benchmark})
- Projects: Student ${dimensions.projects?.userValue} vs Cohort Avg ${dimensions.projects?.cohortAverage} (Top 10%: ${dimensions.projects?.top10Benchmark})
- Resume / ATS: Student ${dimensions.resume?.userValue} vs Cohort Avg ${dimensions.resume?.cohortAverage}
- Mock Interview Readiness: Student ${dimensions.interview?.userValue} vs Cohort Avg ${dimensions.interview?.cohortAverage}

Privacy & Guidance Rules:
1. STRICT ZERO-PII: Never reference or request names, roll numbers, or private student identities.
2. Highlight areas where the student is currently outperforming cohort average.
3. Highlight the #1 highest-leverage dimension they can improve to break into the Top 10%.
4. Provide 3 specific peer study tactics (e.g. mock coding rounds with classmates, GitHub open source contributions).

Return JSON in this format:
{
  "benchmarkInterpretation": "...",
  "leadingDimensions": ["..."],
  "highLeverageOpportunity": "...",
  "peerStudyRecommendations": ["...", "..."]
}
`;

  try {
    const aiData = await generateJSON({ prompt });
    return {
      ...baseBenchmark,
      isAiPowered: true,
      aiInsights: aiData
    };
  } catch (err) {
    console.warn(`[Collaboration Service] Benchmark interpretation failed (${err.message}).`);
    return { ...baseBenchmark, isAiPowered: false };
  }
};

/**
 * Generates collaborative peer study exercises for two students preparing together
 */
export const generateCollaborativeExerciseWithAI = async ({
  focusArea = 'System Design & DSA',
  senderSkills = [],
  receiverSkills = []
}) => {
  if (!isGeminiConfigured()) {
    return {
      focusArea,
      exerciseTitle: `Collaborative Deep Dive: ${focusArea}`,
      role1Instructions: "Student A acts as the interviewer: ask about time complexity, space complexity, and concurrency.",
      role2Instructions: "Student B acts as the candidate: articulate the high-level architecture and trade-offs.",
      discussionQuestions: [
        "What are the main bottlenecks when scaling this system to 100,000 active users?",
        "How would you handle network partitions or database failover?"
      ],
      isAiPowered: false
    };
  }

  const prompt = `
Generate an interactive, high-impact peer preparation exercise for two college classmates studying together for tech placements.

Focus Area: ${focusArea}
Student A Skills: ${senderSkills.slice(0, 4).join(', ') || 'Core Programming'}
Student B Skills: ${receiverSkills.slice(0, 4).join(', ') || 'Problem Solving'}

Instructions:
1. Create a paired mock interview / coding challenge scenario.
2. Detail explicit roles: Student A (Lead Interviewer / Architecture Critic) and Student B (Implementer / System Architect).
3. Provide 3 core discussion and edge-case questions.
4. Give a checklist of key takeaways they should confirm together before ending the session.

Return JSON in this format:
{
  "exerciseTitle": "...",
  "objective": "...",
  "roleAInstructions": "...",
  "roleBInstructions": "...",
  "discussionQuestions": ["...", "...", "..."],
  "takeawaysChecklist": ["...", "..."]
}
`;

  try {
    const aiExercise = await generateJSON({ prompt });
    return {
      focusArea,
      ...aiExercise,
      isAiPowered: true
    };
  } catch (err) {
    return {
      focusArea,
      exerciseTitle: `Peer Collaboration Session: ${focusArea}`,
      roleAInstructions: "Lead the technical discussion and challenge assumptions.",
      roleBInstructions: "Present the solution and detail trade-offs.",
      discussionQuestions: ["Explain the chosen data structure", "Analyze worst-case time complexity"],
      isAiPowered: false
    };
  }
};
