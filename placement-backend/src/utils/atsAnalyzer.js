import { SKILL_CATEGORIES } from './skillTaxonomy.js';

// Power action verbs commonly looked for by ATS and recruiters
export const POWER_ACTION_VERBS = [
  'developed', 'built', 'created', 'designed', 'implemented', 'engineered', 'architected',
  'optimized', 'spearheaded', 'automated', 'deployed', 'orchestrated', 'integrated',
  'refactored', 'accelerated', 'reduced', 'improved', 'scaled', 'enhanced', 'collaborated',
  'led', 'mentored', 'established', 'formulated', 'debugged', 'configured', 'administered',
  'achieved', 'analyzed', 'streamlined', 'published', 'awarded', 'resolved', 'delivered',
  'constructed', 'initiated', 'monitored', 'secured', 'migrated', 'transformed'
];

// Essential ATS High-Frequency Technical Keywords for Campus Hiring
const CORE_ATS_KEYWORDS = [
  'git', 'data structures', 'algorithms', 'rest api', 'sql', 'database', 'object oriented',
  'debugging', 'agile', 'unit testing', 'problem solving', 'system design', 'ci/cd', 'version control'
];

/**
 * Analyzes genuine resume text across 11 key ATS dimensions
 * Suitable for both freshers and experienced candidates.
 *
 * @param {string} resumeText - Normalized raw text from resume
 * @param {Object} [options] - Optional custom options or target requirements
 */
export const analyzeATS = (resumeText = '', options = {}) => {
  const text = (resumeText || '').trim();
  const lowerText = text.toLowerCase();
  const words = text.match(/\b[A-Za-z0-9+#.-]+\b/g) || [];
  const wordCount = words.length;

  const missingInformation = [];
  const missingKeywords = [];
  const formattingIssues = [];
  const strengths = [];
  const weaknesses = [];
  const actionableSuggestions = [];

  // ==========================================
  // 1. CONTACT INFORMATION (Weight: 10%)
  // ==========================================
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b[6-9]\d{9}\b/;
  const linkedinRegex = /linkedin\.com\/(?:in\/)?[\w.-]+/i;
  const githubRegex = /github\.com\/[\w.-]+/i;
  const portfolioRegex = /(?:https?:\/\/)?(?:www\.)?[\w-]+\.(?:dev|me|io|app|tech|in|org|com)\b/i;

  const foundEmail = (text.match(emailRegex) || [])[0] || null;
  const foundPhone = (text.match(phoneRegex) || [])[0] || null;
  const foundLinkedin = (text.match(linkedinRegex) || [])[0] || null;
  const foundGithub = (text.match(githubRegex) || [])[0] || null;
  const foundPortfolio = (text.match(portfolioRegex) || [])[0] || null;

  let contactScore = 0;
  if (foundEmail) contactScore += 30; else missingInformation.push('Email Address');
  if (foundPhone) contactScore += 30; else missingInformation.push('Phone Number');
  if (foundLinkedin) contactScore += 20; else missingInformation.push('LinkedIn Profile Link');
  if (foundGithub) contactScore += 20; else missingInformation.push('GitHub / Code Repository Link');
  contactScore = Math.min(100, contactScore);

  if (foundEmail && foundPhone) {
    strengths.push('Complete, accessible contact channels (verified Email and Phone).');
  } else {
    weaknesses.push('Missing direct recruiter contact channels (Email or Phone).');
    actionableSuggestions.push('Ensure your phone number and professional email address are placed prominently at the very top of your resume.');
  }

  // ==========================================
  // 2. PROFESSIONAL SUMMARY / OBJECTIVE (Weight: 5%)
  // ==========================================
  const summaryHeaderRegex = /\b(professional\s+summary|career\s+objective|summary|profile|about\s+me)\b/i;
  const hasSummary = summaryHeaderRegex.test(text);
  let summaryScore = hasSummary ? 90 : 40;

  if (hasSummary) {
    strengths.push('Includes a concise Professional Summary orienting the candidate background.');
  } else {
    missingInformation.push('Professional Summary / Career Objective');
    actionableSuggestions.push('Add a 2-3 line Professional Summary at the top highlighting your technical domains, key strengths, and target role.');
  }

  // ==========================================
  // 3. EDUCATION & ACADEMICS (Weight: 15%)
  // ==========================================
  const degreeRegex = /\b(b\.?tech|b\.?e|m\.?tech|m\.?c\.?a|b\.?c\.?a|b\.?sc|m\.?sc|bachelor|master|diploma|ph\.?d)\b/i;
  const cgpaRegex = /\b(?:cgpa|gpa|percentage|marks\s*obtained|score|grade)\s*[:=-]?\s*([0-9]\.[0-9]{1,2}|10\.0|[5-9][0-9]%(?:\.[0-9])?)\b/i;
  const instituteRegex = /\b(institute|university|college|school|campus|technology|engineering)\b/i;

  const hasDegree = degreeRegex.test(text);
  const hasCgpa = cgpaRegex.test(text);
  const hasInstitute = instituteRegex.test(text);

  let educationScore = 30;
  if (hasDegree) educationScore += 35;
  if (hasInstitute) educationScore += 20;
  if (hasCgpa) educationScore += 15;
  educationScore = Math.min(100, educationScore);

  if (hasDegree && hasCgpa) {
    strengths.push('Academic qualifications and grading (Degree, College, CGPA) are clearly stated.');
  } else {
    if (!hasDegree) missingInformation.push('Degree / Branch of Study');
    if (!hasCgpa) missingInformation.push('CGPA / Percentage');
    actionableSuggestions.push('Explicitly list your degree (e.g. B.Tech Computer Science), college name, and CGPA/Percentage.');
  }

  // ==========================================
  // 4. TECHNICAL SKILLS (Weight: 20%)
  // ==========================================
  const extractedSkillsList = [];
  for (const category of Object.values(SKILL_CATEGORIES)) {
    for (const skill of category.skills) {
      let isMatch = false;
      if (skill.regex) {
        isMatch = skill.regex.test(text);
      } else {
        const patterns = skill.aliases || [skill.name.toLowerCase()];
        for (const pattern of patterns) {
          const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escaped}\\b`, 'i');
          if (regex.test(text)) {
            isMatch = true;
            break;
          }
        }
      }
      if (isMatch && !extractedSkillsList.includes(skill.name)) {
        extractedSkillsList.push(skill.name);
      }
    }
  }

  let technicalSkillsScore = 0;
  if (extractedSkillsList.length >= 10) technicalSkillsScore = 100;
  else if (extractedSkillsList.length >= 7) technicalSkillsScore = 85;
  else if (extractedSkillsList.length >= 4) technicalSkillsScore = 70;
  else if (extractedSkillsList.length >= 2) technicalSkillsScore = 50;
  else technicalSkillsScore = 30;

  if (extractedSkillsList.length >= 6) {
    strengths.push(`Rich technical skills portfolio with ${extractedSkillsList.length} verified technologies.`);
  } else {
    weaknesses.push('Technical skill count is low or not properly separated into categorized lists.');
    actionableSuggestions.push('Create a dedicated "Technical Skills" section categorized into Languages, Frameworks, Databases, and Tools.');
  }

  // ==========================================
  // 5 & 6. WORK EXPERIENCE & INTERNSHIPS (Weight: 15%)
  // ==========================================
  const experienceRegex = /\b(work\s+experience|professional\s+experience|employment\s+history|career\s+history)\b|(?:\n|^)\s*experience\s*(?:\n|:|$)/i;
  const internshipRegex = /\b(intern(?:ship)?|trainee|apprentice|summer\s+intern)\b/i;

  const hasExperienceSection = experienceRegex.test(text);
  const hasInternship = internshipRegex.test(text);

  // Distinguish freshers vs experienced: if options.isFresher is explicitly specified, honor it, otherwise detect
  const isFresher = options.isFresher !== undefined
    ? Boolean(options.isFresher)
    : (!hasExperienceSection);
  let workExperienceScore = 0;
  let internshipScore = 0;

  if (hasExperienceSection) {
    workExperienceScore = 85;
  }
  if (hasInternship) {
    internshipScore = 90;
    strengths.push('Practical industry internship experience documented.');
  }

  // ==========================================
  // 7. PROJECTS (Weight: 20%)
  // ==========================================
  const projectHeaderRegex = /\b(projects|academic\s+projects|personal\s+projects|key\s+projects|technical\s+projects)\b/i;
  const hasProjects = projectHeaderRegex.test(text);

  // Count bullets or project mentions
  const actionVerbsFound = [];
  for (const verb of POWER_ACTION_VERBS) {
    if (new RegExp(`\\b${verb}\\b`, 'i').test(lowerText)) {
      actionVerbsFound.push(verb);
    }
  }

  // Extract quantified metrics and impact numbers
  const metricsRegex = /\b(?:\d{1,3}(?:\.\d+)?%|\d+(?:\.\d+)?(?:k|m|\+)?\s*(?:users|clients|requests|qps|stars|downloads|latency|ms|sec|seconds|records|fps|reduction|increase|boost|improvement)\b|\b\d{2,}\+?\s*(?:concurrent|active|daily|weekly|monthly)\b|\b\d+\+\b)/gi;
  const rawMetricsMatches = text.match(metricsRegex) || [];
  const metricsFound = Array.from(new Set(rawMetricsMatches.map(m => m.trim())));

  let projectsScore = 0;
  if (hasProjects) {
    projectsScore += 50;
    if (actionVerbsFound.length >= 5) projectsScore += 25;
    if (text.includes('github') || text.includes('http') || text.includes('live')) projectsScore += 25;
    projectsScore = Math.min(100, projectsScore);
  } else {
    projectsScore = 30;
    missingInformation.push('Projects Section');
    weaknesses.push('No dedicated Projects section identified.');
    actionableSuggestions.push('Add at least 2 significant technical projects detailing your tech stack, architecture, and outcomes.');
  }

  // ==========================================
  // 8. CERTIFICATIONS (Weight: 5%)
  // ==========================================
  const certHeaderRegex = /\b(certifications?|certificates?|licenses|achievements|awards|honors)\b/i;
  const hasCertifications = certHeaderRegex.test(text);
  const certificationsScore = hasCertifications ? 90 : 40;

  if (hasCertifications) {
    strengths.push('Industry certifications or competitive achievements included.');
  } else {
    actionableSuggestions.push('Include relevant certifications (e.g. AWS, HackerRank, Oracle, Coursera) to bolster technical credibility.');
  }

  // ==========================================
  // 9. RELEVANT KEYWORDS & POWER ACTION VERBS (Weight: 10%)
  // ==========================================
  for (const kw of CORE_ATS_KEYWORDS) {
    if (!lowerText.includes(kw)) {
      missingKeywords.push(kw);
    }
  }

  let keywordsScore = 0;
  const matchedCoreCount = CORE_ATS_KEYWORDS.length - missingKeywords.length;
  keywordsScore = Math.round((matchedCoreCount / CORE_ATS_KEYWORDS.length) * 100);

  if (actionVerbsFound.length >= 5) {
    strengths.push(`Strong action verbs usage (${actionVerbsFound.length} power verbs found: ${actionVerbsFound.slice(0, 4).join(', ')}).`);
  } else {
    weaknesses.push('Few power action verbs detected in descriptions.');
    actionableSuggestions.push('Begin project and experience bullet points with strong verbs (e.g., "Engineered", "Implemented", "Architected", "Optimized").');
  }

  // ==========================================
  // 10. FORMATTING & READABILITY (Weight: 10%)
  // ==========================================
  let formattingScore = 85;
  const bulletCount = (text.match(/^[\s]*[•\-*]/gm) || []).length;

  if (wordCount < 180) {
    formattingScore -= 30;
    formattingIssues.push('Resume word count is critically low (< 180 words). Expand your projects and skills.');
  } else if (wordCount < 320) {
    formattingScore -= 15;
    formattingIssues.push('Resume is brief. Recommended word count is 400-750 words for optimal 1-page density.');
  } else if (wordCount > 1100) {
    formattingScore -= 15;
    formattingIssues.push('Resume exceeds 1100 words. Condense content to maintain 1-page conciseness.');
  }

  if (bulletCount < 5) {
    formattingScore -= 15;
    formattingIssues.push('Lack of bullet points. Use clean bullet points rather than paragraphs for easy ATS scanning.');
  } else {
    strengths.push(`Structured bullet point formatting (${bulletCount} bullet items detected).`);
  }

  formattingScore = Math.max(25, Math.min(100, formattingScore));

  // ==========================================
  // 11. ATS COMPATIBILITY (Weight: 5%)
  // ==========================================
  let atsCompatibilityScore = 90;
  // Check for clean plain text readable structure
  if (!foundEmail || !foundPhone) atsCompatibilityScore -= 20;
  if (!hasProjects && !hasExperienceSection) atsCompatibilityScore -= 20;
  if (formattingIssues.length > 1) atsCompatibilityScore -= 15;
  atsCompatibilityScore = Math.max(30, Math.min(100, atsCompatibilityScore));

  // ==========================================
  // BALANCED OVERALL SCORE CALCULATION
  // ==========================================
  // For freshers, redistribute Work Experience weight into Projects and Skills!
  let overallScore = 0;
  if (isFresher && !hasExperienceSection) {
    // Fresher Weights: Contact (10%), Education (15%), Skills (25%), Projects (25%), Keywords (10%), Formatting (10%), Summary (5%)
    overallScore = Math.round(
      contactScore * 0.10 +
      educationScore * 0.15 +
      technicalSkillsScore * 0.25 +
      projectsScore * 0.25 +
      keywordsScore * 0.10 +
      formattingScore * 0.10 +
      summaryScore * 0.05
    );
  } else {
    // Experienced Weights: Contact (10%), Experience (20%), Projects (15%), Skills (20%), Education (10%), Keywords (10%), Formatting (10%), Summary (5%)
    const expScore = Math.max(workExperienceScore, internshipScore);
    overallScore = Math.round(
      contactScore * 0.10 +
      expScore * 0.20 +
      projectsScore * 0.15 +
      technicalSkillsScore * 0.20 +
      educationScore * 0.10 +
      keywordsScore * 0.10 +
      formattingScore * 0.10 +
      summaryScore * 0.05
    );
  }

  overallScore = Math.max(20, Math.min(100, overallScore));

  // Grade & Status Text
  let grade = 'C';
  let statusText = 'Needs Improvement';
  let badgeColor = 'orange';

  if (overallScore >= 85) {
    grade = 'A+';
    statusText = 'Excellent ATS Compatibility';
    badgeColor = 'emerald';
  } else if (overallScore >= 75) {
    grade = 'A';
    statusText = 'Strong ATS Compatibility';
    badgeColor = 'emerald';
  } else if (overallScore >= 60) {
    grade = 'B';
    statusText = 'Good Compatibility (A few fixes needed)';
    badgeColor = 'blue';
  } else {
    grade = 'C';
    statusText = 'Needs Significant Optimization';
    badgeColor = 'red';
  }

  return {
    score: overallScore,
    overallScore,
    grade,
    statusText,
    badgeColor,
    wordCount,
    isFresherMode: isFresher,
    isFresher,
    sectionBreakdown: {
      contact: { score: contactScore, weight: '10%', status: contactScore >= 80 ? 'pass' : 'warning' },
      contactInformation: { score: contactScore, weight: '10%', status: contactScore >= 80 ? 'pass' : 'warning' },
      summary: { score: summaryScore, weight: '5%', status: summaryScore >= 70 ? 'pass' : 'warning' },
      professionalSummary: { score: summaryScore, weight: '5%', status: summaryScore >= 70 ? 'pass' : 'warning' },
      education: { score: educationScore, weight: '15%', status: educationScore >= 70 ? 'pass' : 'warning' },
      technicalSkills: { score: technicalSkillsScore, weight: isFresher ? '25%' : '20%', status: technicalSkillsScore >= 70 ? 'pass' : 'warning' },
      workExperience: { score: workExperienceScore, weight: isFresher ? '0%' : '15%', status: workExperienceScore >= 70 ? 'pass' : 'neutral' },
      internships: { score: internshipScore, weight: 'Bonus', status: internshipScore >= 70 ? 'pass' : 'neutral' },
      projects: { score: projectsScore, weight: isFresher ? '25%' : '15%', status: projectsScore >= 70 ? 'pass' : 'warning' },
      certifications: { score: certificationsScore, weight: '5%', status: certificationsScore >= 70 ? 'pass' : 'neutral' },
      relevantKeywords: { score: keywordsScore, weight: '10%', status: keywordsScore >= 60 ? 'pass' : 'warning' },
      formatting: { score: formattingScore, weight: '10%', status: formattingScore >= 70 ? 'pass' : 'warning' },
      formattingReadability: { score: formattingScore, weight: '10%', status: formattingScore >= 70 ? 'pass' : 'warning' },
      atsCompatibility: { score: atsCompatibilityScore, weight: '5%', status: atsCompatibilityScore >= 70 ? 'pass' : 'warning' }
    },
    // Backwards-compatible legacy breakdown object
    breakdown: {
      contact: {
        score: contactScore,
        status: contactScore >= 80 ? 'pass' : contactScore >= 50 ? 'warning' : 'fail',
        details: {
          email: foundEmail,
          phone: foundPhone,
          linkedin: foundLinkedin,
          github: foundGithub,
          portfolio: foundPortfolio
        }
      },
      sections: {
        score: Math.round((educationScore + projectsScore) / 2),
        status: (educationScore + projectsScore) >= 140 ? 'pass' : 'warning',
        detected: [hasDegree && 'Education', hasProjects && 'Projects', hasSummary && 'Summary', hasCertifications && 'Certifications'].filter(Boolean),
        missing: missingInformation
      },
      impact: {
        score: Math.min(100, Math.round((actionVerbsFound.length * 10) + (metricsFound.length * 15))),
        status: (actionVerbsFound.length >= 4 && metricsFound.length >= 1) ? 'pass' : (actionVerbsFound.length >= 2 || metricsFound.length >= 1) ? 'warning' : 'fail',
        actionVerbsCount: actionVerbsFound.length,
        actionVerbs: actionVerbsFound.slice(0, 10),
        metricsCount: metricsFound.length,
        metrics: metricsFound.slice(0, 10)
      },
      skills: {
        score: technicalSkillsScore,
        status: technicalSkillsScore >= 70 ? 'pass' : 'warning',
        count: extractedSkillsList.length,
        skills: extractedSkillsList
      },
      formatting: {
        score: formattingScore,
        status: formattingScore >= 75 ? 'pass' : 'warning',
        wordCount,
        bulletCount,
        feedback: formattingIssues
      }
    },
    missingInformation,
    missingKeywords: missingKeywords.slice(0, 6),
    formattingIssues,
    strengths,
    weaknesses,
    improvements: actionableSuggestions,
    improvementSuggestions: actionableSuggestions,
    actionableSuggestions,
    analyzedAt: new Date()
  };
};

/**
 * Checks resume text match against a specific job drive
 */
export const matchResumeWithDrive = (resumeText = '', driveRequirements = [], driveDescription = '') => {
  const text = (resumeText || '').toLowerCase();
  const requirements = (driveRequirements || []).map(r => r.toLowerCase().trim()).filter(Boolean);

  if (requirements.length === 0 && !driveDescription) {
    return { matchScore: 100, matchedSkills: [], missingSkills: [] };
  }

  const matchedSkills = [];
  const missingSkills = [];

  for (const req of requirements) {
    const escaped = req.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text) || text.includes(req)) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  }

  const total = requirements.length || 1;
  const matchScore = Math.round((matchedSkills.length / total) * 100);

  return {
    matchScore,
    matchedSkills,
    missingSkills
  };
};

export const analyzeAtsResume = analyzeATS;
