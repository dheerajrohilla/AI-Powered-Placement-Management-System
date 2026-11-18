import { generateJSON, isGeminiConfigured } from './geminiService.js';
import { analyzeATS as fallbackAnalyzeATS, matchResumeWithDrive as fallbackMatchDrive } from '../utils/atsAnalyzer.js';
import { checkResumeCredibility as fallbackCheckCredibility } from '../utils/credibilityChecker.js';
import { analyzeShortlistingHistory as fallbackAnalyzeShortlist } from '../utils/rejectionAnalyzer.js';

export const ATS_DISCLAIMER = "Notice: This match score is an AI-powered preparation estimate based on common campus recruitment algorithms and does not guarantee employer ATS decisions or interview selection.";

/**
 * Real ATS Checker: Deep semantic analysis of resume vs Job Description
 */
export const analyzeResumeWithAI = async ({
  resumeText = '',
  jobDescription = '',
  jobTitle = 'Software Engineer',
  targetDrive = null
}) => {
  const baseResult = fallbackAnalyzeATS(resumeText);

  if (!isGeminiConfigured()) {
    return {
      ...baseResult,
      isAiPowered: false,
      disclaimer: ATS_DISCLAIMER
    };
  }

  const jdText = jobDescription || (targetDrive ? `${targetDrive.title}\nRole: ${targetDrive.jobRole}\nRequirements: ${(targetDrive.requirements || []).join(', ')}\nDescription: ${targetDrive.description || ''}` : '');

  const prompt = `
Act as a senior technical recruiter and ATS parsing engine. Analyze this student's resume${jdText ? ' against the provided Job Description (JD)' : ' for general campus software engineering placements'}.

Resume Text:
"""
${resumeText.slice(0, 5000)}
"""

${jdText ? `Target Job Description:\n"""\n${jdText.slice(0, 3000)}\n"""` : ''}

Analysis Instructions:
1. Extract and assess:
   - Technical & soft skills explicitly mentioned in the resume.
   - Project relevance, impact metrics, action verbs, and technology stack.
   - Academic details (Degree, CGPA/marks, graduation year).
   - Experience / Internships if present.
2. If JD is provided, identify:
   - Matched skills and keywords.
   - Missing required & preferred keywords/skills.
   - Semantic alignment between resume projects and JD responsibilities.
3. Calculate an estimated match score (0-100) and break it down across:
   - Skills match (weight 35%)
   - Experience & Projects impact (weight 30%)
   - Education & Academics (weight 15%)
   - Keyword density & ATS readability (weight 20%)
4. Suggest specific, actionable improvements to enhance ATS ranking (e.g. phrasing, metric quantification, section order).
5. CRITICAL ETHICAL RULE: Never fabricate or invent experience, projects, or certifications that the candidate did not have. Keep recommendations truthful.

Return JSON in this format:
{
  "estimatedAtsScore": <number 0-100>,
  "calculationExplanation": "Detailed explanation of how the score was calculated across skills, projects, keywords, and formatting",
  "matchedSkills": ["..."],
  "missingSkills": ["..."],
  "missingKeywords": ["..."],
  "highImpactStrengths": ["..."],
  "priorityImprovements": ["..."],
  "formattingFeedback": ["..."],
  "projectImpactAssessment": "...",
  "scoreBreakdown": {
    "skills": { "score": <0-100>, "feedback": "..." },
    "projects": { "score": <0-100>, "feedback": "..." },
    "education": { "score": <0-100>, "feedback": "..." },
    "formatting": { "score": <0-100>, "feedback": "..." }
  }
}
`;

  try {
    const aiAnalysis = await generateJSON({
      prompt,
      systemInstruction: 'You are an expert ATS optimization consultant and technical campus hiring specialist. Provide truthful, high-signal resume analysis.',
      timeoutMs: 10000
    });

    return {
      ...baseResult,
      score: Number(aiAnalysis.estimatedAtsScore) || baseResult.score,
      overallScore: Number(aiAnalysis.estimatedAtsScore) || baseResult.score,
      grade: aiAnalysis.estimatedAtsScore >= 80 ? 'A+' : aiAnalysis.estimatedAtsScore >= 75 ? 'A' : aiAnalysis.estimatedAtsScore >= 60 ? 'B' : 'C',
      statusText: aiAnalysis.estimatedAtsScore >= 75 ? 'Strong ATS Match' : 'Actionable Gaps Identified',
      isAiPowered: true,
      disclaimer: ATS_DISCLAIMER,
      calculationExplanation: aiAnalysis.calculationExplanation,
      matchedSkills: aiAnalysis.matchedSkills?.length ? aiAnalysis.matchedSkills : (baseResult.breakdown?.skills?.skills || []),
      missingSkills: aiAnalysis.missingSkills || [],
      missingKeywords: aiAnalysis.missingKeywords?.length ? aiAnalysis.missingKeywords : baseResult.missingKeywords,
      strengths: aiAnalysis.highImpactStrengths?.length ? aiAnalysis.highImpactStrengths : baseResult.strengths,
      improvements: aiAnalysis.priorityImprovements?.length ? aiAnalysis.priorityImprovements : baseResult.improvements,
      actionableSuggestions: aiAnalysis.priorityImprovements?.length ? aiAnalysis.priorityImprovements : baseResult.actionableSuggestions,
      scoreBreakdown: aiAnalysis.scoreBreakdown || baseResult.sectionBreakdown,
      projectImpactAssessment: aiAnalysis.projectImpactAssessment,
      analyzedAt: new Date()
    };
  } catch (err) {
    console.warn(`[Resume Service] Gemini ATS analysis failed (${err.message}). Using fallback ATS analyzer.`);
    return {
      ...baseResult,
      isAiPowered: false,
      disclaimer: ATS_DISCLAIMER
    };
  }
};

/**
 * Shortlist Analyzer: "Why Am I Not Getting Shortlisted?"
 */
export const analyzeShortlistWithAI = async ({
  student = {},
  applications = [],
  allDrives = [],
  interviews = []
}) => {
  const baseResult = fallbackAnalyzeShortlist({ student, applications, allDrives, interviews });

  if (!isGeminiConfigured() || applications.length === 0) {
    return {
      ...baseResult,
      isAiPowered: false
    };
  }

  const prompt = `
Analyze the campus placement shortlisting performance for this engineering student to diagnose why applications are stalled or rejected.

Student Profile:
- Department: ${student.department || 'Engineering'}
- CGPA: ${student.cgpa || 'Not stated'}
- Verified Skills: ${(student.skills || []).join(', ')}
- ATS Score: ${student.atsScore || 0}%
- Total Applications: ${applications.length}
- Shortlisted: ${applications.filter(a => a.status === 'shortlisted').length}
- Rejected: ${applications.filter(a => a.status === 'rejected').length}
- Selected: ${applications.filter(a => a.status === 'selected').length}

Recent Applications & Target Drives:
${applications.slice(0, 5).map(a => `- Company: ${a.company?.companyName || 'Recruiter'} | Role: ${a.placementDrive?.jobRole || 'SDE'} | Status: ${a.status} | Required Skills: ${(a.placementDrive?.requirements || []).join(', ')}`).join('\n')}

Diagnostic Instructions:
1. Pinpoint the primary bottleneck (e.g. initial screening/CGPA, ATS keyword deficit, missing core technologies like System Design or Cloud, or lack of competitive coding evidence).
2. Clearly distinguish between verified resume facts and AI inferences.
3. Provide an actionable turnaround action plan with 3-5 high priority steps.
4. Emphasize that this is an analytical diagnostic, not a prediction or guarantee of future recruiter decisions.

Return JSON in this format:
{
  "diagnosticSummary": "...",
  "primaryBottleneck": "...",
  "keySkillGaps": ["..."],
  "verifiedStrengths": ["..."],
  "aiInferences": ["..."],
  "actionableTurnaroundPlan": [
    { "step": "...", "timeline": "...", "expectedImpact": "..." }
  ],
  "recommendedTargetRoles": ["..."]
}
`;

  try {
    const aiDiagnosis = await generateJSON({
      prompt,
      systemInstruction: 'You are an expert university placement officer diagnosing application hurdles.'
    });

    return {
      ...baseResult,
      isAiPowered: true,
      diagnosticSummary: aiDiagnosis.diagnosticSummary,
      primaryBottleneck: aiDiagnosis.primaryBottleneck,
      keySkillGaps: aiDiagnosis.keySkillGaps,
      verifiedStrengths: aiDiagnosis.verifiedStrengths,
      aiInferences: aiDiagnosis.aiInferences,
      actionableTurnaroundPlan: aiDiagnosis.actionableTurnaroundPlan,
      recommendedTargetRoles: aiDiagnosis.recommendedTargetRoles
    };
  } catch (err) {
    console.warn(`[Resume Service] Shortlist analysis with Gemini failed (${err.message}). Returning base analysis.`);
    return {
      ...baseResult,
      isAiPowered: false
    };
  }
};

/**
 * Credibility Checker: Cross-references claims across Resume and Profile
 */
export const checkCredibilityWithAI = async (student = {}, options = {}) => {
  const baseResult = fallbackCheckCredibility(student, options);

  if (!isGeminiConfigured()) {
    return {
      ...baseResult,
      isAiPowered: false
    };
  }

  const resumeText = student.resumeParsedText || options.resumeText || '';
  if (!resumeText || resumeText.length < 50) {
    return {
      ...baseResult,
      isAiPowered: false
    };
  }

  const prompt = `
Conduct an audit of the consistency and credibility of claims in this student's resume against their profile data.

Profile Data:
- Listed Skills: ${(student.skills || []).join(', ')}
- Documented Projects: ${(student.projects || []).map(p => `${p.title} (Tech: ${(p.techStack || []).join(', ')})`).join('; ') || 'None documented in portal'}
- Social/Coding Links: GitHub: ${student.socialLinks?.github || 'None'}, LeetCode: ${student.socialLinks?.leetcode || 'None'}
- Verified Certifications: ${(student.certifications || []).map(c => c.title).join(', ') || 'None'}

Resume Text:
"""
${resumeText.slice(0, 4000)}
"""

Audit Guidelines:
1. Look for unsupported claims (e.g. claiming mastery of advanced distributed systems or Kubernetes without any supporting project/repository evidence).
2. Look for timeline inconsistencies or unrealistic metric claims (e.g. "increased company revenue by 400%" for a college project).
3. Treat all findings strictly as "potential flags requiring verification" rather than accusations of dishonesty.
4. Highlight verified claims that are well-substantiated by projects or GitHub profiles.
5. Provide actionable suggestions on how the student can provide tangible proof of work.

Return JSON in this format:
{
  "credibilityScore": <number 0-100>,
  "auditSummary": "...",
  "verifiedClaims": [
    { "claim": "...", "evidence": "...", "status": "verified" }
  ],
  "potentialFlags": [
    {
      "category": "...",
      "severity": "low" | "medium" | "high",
      "claim": "...",
      "concern": "...",
      "recommendation": "..."
    }
  ],
  "verificationRecommendations": ["..."]
}
`;

  try {
    const aiAudit = await generateJSON({
      prompt,
      systemInstruction: 'You are a university placement auditor checking resume consistency and proof of work.'
    });

    const finalScore = Number(aiAudit.credibilityScore) || baseResult.score || 85;
    let finalRating = baseResult.rating || 'High Credibility / Verified';
    if (finalScore < 50) finalRating = 'High Risk Discrepancies';
    else if (finalScore < 70) finalRating = 'Attention Needed - Inconsistent Claims';
    else if (finalScore < 85) finalRating = 'Moderate Credibility - Minor Discrepancies';

    return {
      ...baseResult,
      score: finalScore,
      rating: finalRating,
      credibilityScore: finalScore,
      auditSummary: aiAudit.auditSummary || baseResult.summary,
      summary: aiAudit.auditSummary || baseResult.summary,
      verifiedClaims: Array.isArray(aiAudit.verifiedClaims) && aiAudit.verifiedClaims.length > 0 ? aiAudit.verifiedClaims : baseResult.verifiedClaims,
      discrepancies: Array.isArray(aiAudit.potentialFlags) && aiAudit.potentialFlags.length > 0 ? aiAudit.potentialFlags : baseResult.discrepancies,
      verificationRecommendations: aiAudit.verificationRecommendations || [],
      isAiPowered: true,
      lastAudited: new Date()
    };
  } catch (err) {
    console.warn(`[Resume Service] Credibility check with Gemini failed (${err.message}). Using rule-based fallback.`);
    return {
      ...baseResult,
      isAiPowered: false
    };
  }
};
