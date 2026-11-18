import { generateJSON, generateText, isGeminiConfigured } from './geminiService.js';

/**
 * Summarizes verified job description and compares with student's skills
 */
export const summarizeDriveAndAlignment = async ({
  drive = {},
  student = {}
}) => {
  const companyName = drive.company?.companyName || drive.title || 'Recruiter';
  const role = drive.jobRole || drive.title || 'Software Engineer';
  const requirements = drive.requirements || [];
  const studentSkills = (student.skills || []).map(s => s.toLowerCase());

  const matched = [];
  const missing = [];
  for (const req of requirements) {
    const clean = req.toLowerCase();
    if (studentSkills.some(s => s.includes(clean) || clean.includes(s))) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  }

  const baseResult = {
    companyName,
    role,
    verifiedRequirements: requirements,
    matchedSkills: matched,
    missingSkills: missing,
    eligibilitySummary: `Min CGPA: ${drive.eligibility?.minCGPA || 'None'} | Departments: ${(drive.eligibility?.departments || ['All']).join(', ')}`,
    salary: drive.salary ? `₹${(drive.salary / 100000).toFixed(1)} LPA` : 'Competitive',
    isAiPowered: false
  };

  if (!isGeminiConfigured()) {
    return baseResult;
  }

  const prompt = `
Summarize this verified placement drive for a campus candidate and analyze their profile fit.

Verified Drive Information:
- Company: ${companyName}
- Job Role: ${role}
- Description: ${drive.description || 'Campus hiring'}
- Requirements: ${requirements.join(', ')}
- Eligibility: Min CGPA ${drive.eligibility?.minCGPA || 0}, Allowed Batches: ${(drive.eligibility?.batches || []).join(', ')}

Candidate Profile:
- Skills: ${(student.skills || []).join(', ')}
- CGPA: ${student.cgpa || 'N/A'}
- Department: ${student.department || 'Engineering'}

Instructions:
1. Provide a concise 2-sentence summary of what this role entails.
2. Outline key responsibilities.
3. Explain why the candidate's skills make them competitive, and what 1-2 gaps they should be prepared to address.
4. Do NOT fabricate facts, internal emails, or undisclosed policies.

Return JSON in this format:
{
  "roleSummary": "...",
  "keyResponsibilities": ["...", "..."],
  "fitAnalysis": "...",
  "interviewTips": ["...", "..."]
}
`;

  try {
    const aiData = await generateJSON({ prompt });
    return {
      ...baseResult,
      isAiPowered: true,
      ...aiData
    };
  } catch (err) {
    console.warn(`[Application Assistant] Gemini summary failed (${err.message}).`);
    return baseResult;
  }
};

/**
 * Drafts a personalized cover letter using actual resume & target JD
 */
export const draftCoverLetterWithAI = async ({
  student = {},
  user = {},
  drive = {},
  customTone = 'Professional'
}) => {
  const studentName = user.name || 'Candidate';
  const companyName = drive.company?.companyName || drive.title || 'Hiring Team';
  const role = drive.jobRole || drive.title || 'Software Development Engineer';
  const resumeText = student.resumeParsedText || '';
  const skills = (student.skills || []).join(', ');

  if (!isGeminiConfigured()) {
    return {
      subject: `Application for ${role} — ${studentName}`,
      body: `Dear Hiring Team at ${companyName},\n\nI am writing to express my strong enthusiasm for the ${role} position. With a background in ${student.department || 'Computer Science'} (CGPA: ${student.cgpa || '7.5+'}) and hands-on experience in ${skills || 'modern software technologies'}, I am eager to contribute to your team.\n\nThroughout my coursework and projects, I have developed technical skills and problem-solving abilities that align with your requirements. I would welcome the opportunity to discuss how my qualifications meet your needs.\n\nThank you for your consideration.\n\nSincerely,\n${studentName}`,
      isAiPowered: false,
      editableNotice: "This cover letter was generated as an editable draft. Please review and tailor before submitting."
    };
  }

  const prompt = `
Draft a compelling, personalized cover letter for ${studentName} applying for "${role}" at "${companyName}".

Candidate Details:
- Name: ${studentName}
- Department: ${student.department || 'Engineering'}
- Skills: ${skills}
- Resume Highlights:
"""
${resumeText.slice(0, 3000) || `Projects: ${(student.projects || []).map(p => p.title).join(', ')}`}
"""

Target Role & JD:
- Company: ${companyName}
- Role: ${role}
- Requirements: ${(drive.requirements || []).join(', ')}

Guidelines:
1. Highlight real projects, technologies, and achievements from the candidate's resume that match the job requirements.
2. Maintain a ${customTone.toLowerCase()} and authentic tone.
3. NEVER invent work experiences, past employers, degrees, or certifications not in the resume.
4. Keep the draft concise (around 250-320 words).
5. Output format: JSON with "subject" and "body".

Return JSON in this format:
{
  "subject": "Application for ${role} — ${studentName}",
  "body": "..."
}
`;

  try {
    const letter = await generateJSON({ prompt });
    return {
      subject: letter.subject || `Application for ${role} — ${studentName}`,
      body: letter.body,
      isAiPowered: true,
      editableNotice: "This cover letter was generated as an editable draft. You can edit any sentence before saving or submitting."
    };
  } catch (err) {
    console.warn(`[Application Assistant] Cover letter generation failed (${err.message}).`);
    return {
      subject: `Application for ${role} — ${studentName}`,
      body: `Dear Hiring Manager at ${companyName},\n\nI am applying for the ${role} role. My technical background includes ${skills}.\n\nSincerely,\n${studentName}`,
      isAiPowered: false
    };
  }
};

/**
 * Drafts a personalized recruiter outreach / follow-up email
 */
export const draftRecruiterEmailWithAI = async ({
  student = {},
  user = {},
  drive = {},
  emailType = 'initial_outreach' // 'initial_outreach' | 'interview_followup' | 'thank_you'
}) => {
  const studentName = user.name || 'Candidate';
  const companyName = drive.company?.companyName || drive.title || 'Hiring Team';
  const role = drive.jobRole || drive.title || 'Software Development Engineer';

  if (!isGeminiConfigured()) {
    return {
      subject: `Inquiry regarding ${role} Campus Drive — ${studentName}`,
      body: `Hello ${companyName} Recruitment Team,\n\nI hope this email finds you well. I recently applied for the ${role} position through our university placement cell and wanted to reiterate my strong interest in joining your engineering organization.\n\nMy profile highlights hands-on experience in ${(student.skills || []).slice(0, 4).join(', ')}. Please let me know if any additional documentation or code samples are needed.\n\nBest regards,\n${studentName}`,
      isAiPowered: false,
      editableNotice: "Draft email ready for your review. No email has been sent."
    };
  }

  const prompt = `
Draft a polite, professional, and concise recruiter email for ${studentName} regarding the "${role}" campus recruitment drive at "${companyName}".

Email Purpose: ${emailType}
Candidate Skills: ${(student.skills || []).slice(0, 5).join(', ')}

Guidelines:
1. Keep the email under 150 words.
2. Clear subject line.
3. Respectful, professional tone suitable for campus hiring.
4. Do not invent recruiter contact names if unknown.

Return JSON in this format:
{
  "subject": "...",
  "body": "..."
}
`;

  try {
    const email = await generateJSON({ prompt });
    return {
      subject: email.subject,
      body: email.body,
      isAiPowered: true,
      editableNotice: "Draft email generated. Review and copy to send at your discretion."
    };
  } catch (err) {
    return {
      subject: `Application for ${role} — ${studentName}`,
      body: `Dear Campus Recruiting Team at ${companyName},\n\nI am writing to express my enthusiasm for the ${role} position.\n\nBest regards,\n${studentName}`,
      isAiPowered: false
    };
  }
};
