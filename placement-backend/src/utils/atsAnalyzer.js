import { SKILL_CATEGORIES } from './skillTaxonomy.js';

// Power action verbs commonly looked for by ATS and recruiters
const POWER_ACTION_VERBS = [
  'developed', 'built', 'created', 'designed', 'implemented', 'engineered', 'architected',
  'optimized', 'spearheaded', 'automated', 'deployed', 'orchestrated', 'integrated',
  'refactored', 'accelerated', 'reduced', 'improved', 'scaled', 'enhanced', 'collaborated',
  'led', 'mentored', 'established', 'formulated', 'debugged', 'configured', 'administered',
  'achieved', 'analyzed', 'streamlined', 'published', 'awarded', 'resolved', 'delivered',
  'constructed', 'initiated', 'monitored', 'secured', 'migrated', 'transformed'
];

// Sections commonly checked in tech resumes
const SECTION_PATTERNS = {
  education: {
    name: 'Education',
    regex: /\b(education|academic\s+background|academics|educational\s+qualification)\b/i,
    weight: 20
  },
  experience: {
    name: 'Experience / Internships',
    regex: /\b(experience|internship|work\s+experience|employment|professional\s+experience)\b/i,
    weight: 20
  },
  projects: {
    name: 'Projects',
    regex: /\b(projects|academic\s+projects|personal\s+projects|key\s+projects)\b/i,
    weight: 25
  },
  skills: {
    name: 'Skills / Technical Competencies',
    regex: /\b(skills|technical\s+skills|core\s+competencies|technologies|tech\s+stack)\b/i,
    weight: 20
  },
  certifications: {
    name: 'Certifications & Achievements',
    regex: /\b(certifications?|licenses|achievements|honors?|awards?|accomplishments)\b/i,
    weight: 10
  },
  summary: {
    name: 'Professional Summary / Objective',
    regex: /\b(summary|professional\s+summary|profile|about\s+me|career\s+objective)\b/i,
    weight: 5
  }
};

/**
 * Analyzes resume text against comprehensive ATS standards
 * @param {string} resumeText - Normalized raw text from resume
 * @param {Object} [options] - Optional custom drive or target requirements
 */
export const analyzeATS = (resumeText = '', options = {}) => {
  const text = (resumeText || '').trim();
  const lowerText = text.toLowerCase();
  const words = text.match(/\b[A-Za-z0-9+#.-]+\b/g) || [];
  const wordCount = words.length;

  // 1. CONTACT INFORMATION CHECKS
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
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
  const contactFeedback = [];
  if (foundEmail) {
    contactScore += 30;
  } else {
    contactFeedback.push('Email address is missing or not detected.');
  }

  if (foundPhone) {
    contactScore += 30;
  } else {
    contactFeedback.push('Phone number is missing or poorly formatted.');
  }

  if (foundLinkedin) {
    contactScore += 20;
  } else {
    contactFeedback.push('Include a clickable LinkedIn profile link.');
  }

  if (foundGithub) {
    contactScore += 20;
  } else {
    contactFeedback.push('Include a GitHub profile link to showcase code repositories.');
  }
  contactScore = Math.min(100, contactScore);

  // 2. SECTION COMPLETENESS
  const detectedSections = [];
  const missingSections = [];
  let sectionScore = 0;
  let totalSectionWeight = 0;

  for (const [key, section] of Object.entries(SECTION_PATTERNS)) {
    totalSectionWeight += section.weight;
    if (section.regex.test(text)) {
      detectedSections.push(section.name);
      sectionScore += section.weight;
    } else {
      missingSections.push(section.name);
    }
  }
  sectionScore = Math.round((sectionScore / totalSectionWeight) * 100);

  // Education details check
  const degreeRegex = /\b(b\.?tech|b\.?e|m\.?tech|m\.?c\.?a|b\.?c\.?a|b\.?sc|m\.?sc|bachelor|master)\b/i;
  const cgpaRegex = /\b(?:cgpa|gpa|percentage|marks)?\s*[:=-]?\s*([0-9]\.[0-9]{1,2}|10\.0|[5-9][0-9]%(?:\.[0-9])?)\b/i;
  const hasDegree = degreeRegex.test(text);
  const hasCgpa = cgpaRegex.test(text);

  // 3. ACTION VERBS & QUANTIFIABLE METRICS
  const foundActionVerbs = [];
  for (const verb of POWER_ACTION_VERBS) {
    const verbRegex = new RegExp(`\\b${verb}\\b`, 'i');
    if (verbRegex.test(lowerText)) {
      foundActionVerbs.push(verb);
    }
  }

  // Metric detection: numbers followed by %, X, users, latency, scale, etc.
  const metricRegex = /\b(\d+(?:\.\d+)?%|\$\d+(?:k|m)?|\d+x|\d{2,}\+?\s*(?:users|clients|requests|downloads|queries|ms|sec|seconds|records|stars))\b/gi;
  const foundMetrics = text.match(metricRegex) || [];

  let verbScore = 0;
  if (foundActionVerbs.length >= 8) verbScore = 100;
  else if (foundActionVerbs.length >= 5) verbScore = 80;
  else if (foundActionVerbs.length >= 3) verbScore = 60;
  else verbScore = Math.round((foundActionVerbs.length / 5) * 50);

  let metricScore = 0;
  if (foundMetrics.length >= 4) metricScore = 100;
  else if (foundMetrics.length >= 2) metricScore = 75;
  else if (foundMetrics.length === 1) metricScore = 50;
  else metricScore = 20;

  const impactScore = Math.round(verbScore * 0.5 + metricScore * 0.5);

  // 4. SKILLS DETECTION & RELEVANCE
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

  let skillScore = 0;
  if (extractedSkillsList.length >= 10) skillScore = 95;
  else if (extractedSkillsList.length >= 7) skillScore = 85;
  else if (extractedSkillsList.length >= 4) skillScore = 70;
  else if (extractedSkillsList.length >= 2) skillScore = 50;
  else skillScore = 25;

  // 5. FORMATTING & READABILITY
  let formatScore = 80; // base score
  const formattingFeedback = [];

  // Length check
  if (wordCount < 200) {
    formatScore -= 30;
    formattingFeedback.push('Resume is too brief (<200 words). Expand your project descriptions, skills, and coursework.');
  } else if (wordCount < 350) {
    formatScore -= 15;
    formattingFeedback.push('Resume word count is on the lower side. Aim for 400-750 words for optimal 1-page density.');
  } else if (wordCount > 1000) {
    formatScore -= 15;
    formattingFeedback.push('Resume exceeds 1000 words. Keep fresh graduate resumes crisp and strictly within 1-2 pages.');
  } else {
    formatScore += 10;
  }

  // Bullet points check
  const bulletCount = (text.match(/^[\s]*[•\-*]/gm) || []).length;
  if (bulletCount >= 6) {
    formatScore += 10;
  } else {
    formatScore -= 10;
    formattingFeedback.push('Use bullet points under Projects and Experience to make content easy for ATS parsers to scan.');
  }

  formatScore = Math.max(20, Math.min(100, formatScore));

  // 6. OVERALL WEIGHTED ATS SCORE (0 - 100)
  // Weights: Contact (15%), Sections (25%), Impact/Metrics (25%), Skills (20%), Formatting (15%)
  const overallScore = Math.round(
    contactScore * 0.15 +
    sectionScore * 0.25 +
    impactScore * 0.25 +
    skillScore * 0.20 +
    formatScore * 0.15
  );

  // Determine grade & level
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

  // 7. COMPILE STRENGTHS & IMPROVEMENTS
  const strengths = [];
  const improvements = [];

  if (foundEmail && foundPhone) strengths.push('Clear, accessible contact information (Email and Phone found).');
  if (foundLinkedin) strengths.push('Professional presence linked via LinkedIn.');
  if (foundGithub) strengths.push('Developer portfolio verified via GitHub link.');
  if (hasDegree) strengths.push('Academic qualifications and degree clearly stated.');
  if (hasCgpa) strengths.push('Academic grading (CGPA / Percentage) included.');
  if (foundActionVerbs.length >= 5) strengths.push(`Strong vocabulary with ${foundActionVerbs.length} action verbs detected.`);
  if (foundMetrics.length >= 2) strengths.push(`Demonstrated measurable business or performance impact with ${foundMetrics.length} quantified metrics.`);
  if (extractedSkillsList.length >= 6) strengths.push(`Diverse technical skill palette with ${extractedSkillsList.length} relevant technologies.`);

  if (!foundGithub) improvements.push('Add your GitHub profile URL at the top so recruiters can review your repositories.');
  if (!foundLinkedin) improvements.push('Include your LinkedIn profile link to increase recruiter outreach.');
  if (missingSections.length > 0) improvements.push(`Add standard section headers: ${missingSections.join(', ')}.`);
  if (foundActionVerbs.length < 5) improvements.push('Start every bullet point in Projects with a strong action verb (e.g., Engineered, Spearheaded, Accelerated).');
  if (foundMetrics.length < 2) improvements.push('Quantify your project outcomes: include metrics like "Improved API latency by 35%", "Supported 500+ users", or "Reduced bundle size by 20%".');
  if (extractedSkillsList.length < 6) improvements.push('List key in-demand tools and frameworks explicitly in a dedicated Skills section.');
  if (formattingFeedback.length > 0) improvements.push(...formattingFeedback);

  // Ensure minimum items
  if (strengths.length === 0) strengths.push('Readable PDF format easily processed by ATS scanners.');
  if (improvements.length === 0) improvements.push('Tailor your bullet points specifically for each job description you apply to.');

  return {
    score: overallScore,
    grade,
    statusText,
    badgeColor,
    wordCount,
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
        },
        feedback: contactFeedback
      },
      sections: {
        score: sectionScore,
        status: sectionScore >= 80 ? 'pass' : sectionScore >= 60 ? 'warning' : 'fail',
        detected: detectedSections,
        missing: missingSections
      },
      impact: {
        score: impactScore,
        status: impactScore >= 75 ? 'pass' : impactScore >= 50 ? 'warning' : 'fail',
        actionVerbsCount: foundActionVerbs.length,
        actionVerbs: foundActionVerbs.slice(0, 10),
        metricsCount: foundMetrics.length,
        metrics: foundMetrics.slice(0, 5)
      },
      skills: {
        score: skillScore,
        status: skillScore >= 70 ? 'pass' : skillScore >= 50 ? 'warning' : 'fail',
        count: extractedSkillsList.length,
        skills: extractedSkillsList
      },
      formatting: {
        score: formatScore,
        status: formatScore >= 75 ? 'pass' : 'warning',
        wordCount,
        bulletCount,
        feedback: formattingFeedback
      }
    },
    strengths,
    improvements,
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
