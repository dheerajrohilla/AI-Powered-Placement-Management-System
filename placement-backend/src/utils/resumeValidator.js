import { detectFileFormat } from './resumeParser.js';

/**
 * Intelligent Multi-Signal Resume Content Validator
 * Validates whether an uploaded document is genuinely a resume/CV or an unrelated file
 * (research paper, assignment, certificate, general article, empty/corrupted file).
 */

// Core regex patterns for contact information
const CONTACT_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
  phone: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b[6-9]\d{9}\b/,
  linkedin: /linkedin\.com\/(?:in\/)?[\w.-]+/i,
  github: /github\.com\/[\w.-]+/i,
  portfolio: /(?:https?:\/\/)?(?:www\.)?[\w-]+\.(?:dev|me|io|app|tech|portfolio|site)\b/i
};

// Recognized Resume Section Headers
const RESUME_SECTIONS = [
  { name: 'education', regex: /\b(education|academic\s+background|academics|educational\s+qualifications?|qualifications?)\b/i, weight: 20 },
  { name: 'skills', regex: /\b(technical\s+skills|skills\s*(?:&|and)?\s*abilities|core\s+competencies|technologies|tech\s+stack|programming\s+languages|skills)\b/i, weight: 20 },
  { name: 'projects', regex: /\b(projects|academic\s+projects|personal\s+projects|key\s+projects|capstone\s+project|technical\s+projects)\b/i, weight: 20 },
  { name: 'experience', regex: /\b(work\s+experience|professional\s+experience|employment\s+history|internships?|work\s+history)\b|(?:\n|^)\s*experience\s*(?:\n|:|$)/i, weight: 15 },
  { name: 'certifications', regex: /\b(certifications?|licenses|achievements|honors?|awards?|accomplishments)\b/i, weight: 10 },
  { name: 'summary', regex: /\b(professional\s+summary|career\s+objective|summary|profile|about\s+me)\b/i, weight: 10 }
];

// Degree & Academic terms
const DEGREE_PATTERNS = [
  /\b(b\.?tech|b\.?e|m\.?tech|m\.?c\.?a|b\.?c\.?a|b\.?sc|m\.?sc|bachelor|master|diploma|ph\.?d|high\s+school|secondary|higher\s+secondary)\b/i,
  /\b(computer\s+science|information\s+technology|electrical|mechanical|civil|electronics|engineering)\b/i,
  /\b(cgpa|gpa|percentage|marks\s*obtained|score|grade)\s*[:=-]?\s*([0-9]\.[0-9]{1,2}|10\.0|[5-9][0-9]%(?:\.[0-9])?)\b/i
];

// Common tech keywords indicating tech resume context
const TECH_KEYWORDS = [
  'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'c programming', 'ruby', 'golang', 'rust', 'php',
  'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'django', 'flask', 'spring boot', 'fastapi',
  'sql', 'mysql', 'postgresql', 'mongodb', 'sqlite', 'redis', 'firebase', 'cassandra',
  'git', 'github', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'linux', 'ci/cd', 'html', 'css', 'tailwind',
  'data structures', 'algorithms', 'rest api', 'machine learning', 'deep learning', 'pandas', 'numpy', 'scikit-learn'
];

// Negative Patterns: Research Paper Indicators
const RESEARCH_PAPER_PATTERNS = [
  /\babstract\b/i,
  /\b(introduction|related\s+work|methodology|proposed\s+(?:system|method|architecture)|experimental\s+results|conclusion\s+(?:&|and)\s+future\s+work)\b/i,
  /\breferences\b/i,
  /\b(?:ieee|acm|elsevier|springer|arxiv|doi:\s*10\.\d+|issn|isbn)\b/i,
  /\[\d{1,3}\],\s*\[\d{1,3}\]|\[\d{1,3}\]\s+[\w\s.,]+(?:“|").+?(?:”|")/,
  /\bet\s+al\./i,
  /\b(fig(?:ure)?\.?\s*\d+|table\s*\d+|equation\s*\(\d+\))\b/i
];

// Negative Patterns: Academic Assignment / Lab Manual Indicators
const ASSIGNMENT_PATTERNS = [
  /\bassignment\s*(?:no\.?|number|\d+)?\b/i,
  /\b(homework|problem\s+statement|question\s*\d+|solution\s*:)\b/i,
  /\b(submitted\s+(?:to|by)\s*:|course\s+code\s*:|lab\s+manual|experiment\s+no\.?)\b/i
];

// Negative Patterns: Standalone Certificate Indicators
const CERTIFICATE_PATTERNS = [
  /\bcertificate\s+of\s+(?:completion|achievement|appreciation|excellence|participation)\b/i,
  /\bthis\s+is\s+to\s+(?:proudly\s+)?certify\s+that\b/i,
  /\bhas\s+successfully\s+completed\s+(?:the\s+course|training|masterclass)\b/i,
  /\b(authorized\s+signat(?:ure|ory)|credential\s+id\s*:|awarded\s+(?:on|to))\b/i
];

/**
 * Validates if the given text represents a genuine candidate resume.
 *
 * @param {string} text - Cleaned extracted text from document
 * @param {Object} [meta] - Optional file metadata (filename, size, mimetype)
 * @returns {Object} Validation result { isValidResume, confidence, documentType, message, details, matchedSections }
 */
export const validateResumeContent = (text, meta = {}) => {
  const normalized = (text || '').trim();
  const lowerText = normalized.toLowerCase();

  // 1. Minimum Content Sanity Check
  if (!normalized || normalized.length < 80) {
    return {
      isValidResume: false,
      isValid: false,
      confidence: 0,
      confidenceScore: 0,
      documentType: 'empty_or_too_short',
      detectedType: 'empty_or_too_short',
      message: 'The uploaded document does not appear to be a resume. Please upload a valid resume in PDF or DOCX format.',
      rejectionReason: 'The uploaded document does not appear to be a resume. Please upload a valid resume in PDF or DOCX format.',
      details: 'Document contains insufficient or empty text (less than 80 characters).'
    };
  }

  const words = normalized.match(/\b[A-Za-z0-9+#.-]+\b/g) || [];
  if (words.length < 35) {
    return {
      isValidResume: false,
      isValid: false,
      confidence: 0.05,
      confidenceScore: 0.05,
      documentType: 'insufficient_content',
      detectedType: 'insufficient_content',
      message: 'The uploaded document does not appear to be a resume. Please upload a valid resume in PDF or DOCX format.',
      rejectionReason: 'The uploaded document does not appear to be a resume. Please upload a valid resume in PDF or DOCX format.',
      details: `Document has only ${words.length} words, which is insufficient for a professional resume.`
    };
  }

  // 2. Evaluate Positive Resume Signals
  let positiveScore = 0;
  const detectedSignals = [];
  const detectedSections = [];

  // Contact Info Signals
  const hasEmail = CONTACT_PATTERNS.email.test(normalized);
  const hasPhone = CONTACT_PATTERNS.phone.test(normalized);
  const hasLinkedin = CONTACT_PATTERNS.linkedin.test(normalized);
  const hasGithub = CONTACT_PATTERNS.github.test(normalized);
  const hasPortfolio = CONTACT_PATTERNS.portfolio.test(normalized);

  if (hasEmail) {
    positiveScore += 20;
    detectedSignals.push('Email address');
  }
  if (hasPhone) {
    positiveScore += 18;
    detectedSignals.push('Phone number');
  }
  if (hasLinkedin || hasGithub || hasPortfolio) {
    positiveScore += 10;
    detectedSignals.push('Professional/Code Profile Link');
  }

  // Section Headers
  for (const sec of RESUME_SECTIONS) {
    if (sec.regex.test(normalized)) {
      positiveScore += sec.weight;
      detectedSections.push(sec.name);
      detectedSignals.push(`Section: ${sec.name}`);
    }
  }

  // Degree & Academic Credentials
  let degreeMatches = 0;
  for (const degRegex of DEGREE_PATTERNS) {
    if (degRegex.test(normalized)) {
      degreeMatches++;
    }
  }
  if (degreeMatches > 0) {
    positiveScore += Math.min(25, degreeMatches * 10);
    detectedSignals.push('Academic Degree/GPA details');
  }

  // Technical Skills Density
  const matchedTechSkills = TECH_KEYWORDS.filter(k => {
    const rx = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return rx.test(lowerText);
  });
  if (matchedTechSkills.length >= 3) {
    positiveScore += Math.min(25, 10 + matchedTechSkills.length * 2);
    detectedSignals.push(`Technical skills (${matchedTechSkills.length} detected)`);
  } else if (matchedTechSkills.length > 0) {
    positiveScore += 5;
  }

  // Project / Work Action Verbs
  const actionVerbs = ['developed', 'built', 'created', 'designed', 'implemented', 'optimized', 'engineered', 'led', 'managed'];
  const matchedVerbs = actionVerbs.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(lowerText));
  if (matchedVerbs.length >= 2) {
    positiveScore += 10;
    detectedSignals.push('Action verbs in achievements');
  }

  // 3. Evaluate Negative / Disqualifier Signals
  let negativeScore = 0;
  const negativeSignals = [];

  // Research Paper Checks
  let researchPaperHits = 0;
  for (const rp of RESEARCH_PAPER_PATTERNS) {
    if (rp.test(normalized)) {
      researchPaperHits++;
    }
  }
  if (researchPaperHits >= 3) {
    negativeScore += 45 + (researchPaperHits * 5);
    negativeSignals.push('Academic research paper structure (Abstract, References, Citations, IEEE/ACM/DOI)');
  }

  // Academic Assignment Checks
  let assignmentHits = 0;
  for (const asg of ASSIGNMENT_PATTERNS) {
    if (asg.test(normalized)) {
      assignmentHits++;
    }
  }
  if (assignmentHits >= 1 && !detectedSections.includes('experience') && !detectedSections.includes('projects')) {
    negativeScore += 50;
    negativeSignals.push('Course assignment / homework template without resume sections');
  }

  // Certificate Checks
  let certHits = 0;
  for (const cert of CERTIFICATE_PATTERNS) {
    if (cert.test(normalized)) {
      certHits++;
    }
  }
  if (certHits >= 1 && words.length < 350 && !detectedSections.includes('experience') && !detectedSections.includes('skills')) {
    negativeScore += 55;
    negativeSignals.push('Standalone completion certificate');
  }

  // 4. Fresher vs. Non-Resume Distinction
  // A fresher resume might lack professional experience, but MUST have:
  // (Email OR Phone) + (Education OR Degree) + (Skills OR Projects)
  const hasBasicContact = hasEmail || hasPhone;
  const hasEducation = detectedSections.includes('education') || degreeMatches > 0;
  const hasTechnicalContent = detectedSections.includes('skills') || detectedSections.includes('projects') || matchedTechSkills.length >= 3;
  const isFresherResumeProfile = hasBasicContact && hasEducation && hasTechnicalContent;

  if (isFresherResumeProfile) {
    // Boost score for genuine fresher profiles
    positiveScore += 20;
    detectedSignals.push('Fresher Profile Qualified (Contact + Education + Technical Projects/Skills)');
  }

  // 5. Compute Net Confidence (0 to 100)
  const netScore = Math.max(0, Math.min(100, positiveScore - negativeScore));
  const confidence = Math.round(netScore) / 100;

  // Validation decision threshold
  // Requirements:
  // - Minimum confidence >= 0.45
  // - Must have contact info (email or phone)
  // - Must have at least 2 distinct resume sections or technical skills
  // - Negative score must not overwhelm positive score
  const hasRequiredSections = (detectedSections.length >= 2) || (isFresherResumeProfile);
  const isNotDisqualified = negativeScore < 40 || (positiveScore > (negativeScore * 1.6));

  const isValidResume = (netScore >= 45) && hasBasicContact && hasRequiredSections && isNotDisqualified;

  // Classify Document Type if rejected
  let documentType = 'resume';
  if (!isValidResume) {
    if (researchPaperHits >= 3) {
      documentType = 'research_paper';
    } else if (assignmentHits >= 1) {
      documentType = 'academic_assignment';
    } else if (certHits >= 1) {
      documentType = 'certificate';
    } else if (words.length > 2500 && !hasBasicContact) {
      documentType = 'general_article';
    } else {
      documentType = 'unrelated_document';
    }
  }

  return {
    isValidResume,
    isValid: isValidResume,
    confidence,
    confidenceScore: confidence,
    netScore,
    documentType,
    detectedType: documentType,
    isFresher: isFresherResumeProfile,
    hasContactInfo: hasBasicContact,
    detectedSections,
    detectedSignals,
    matchedSignals: detectedSignals,
    negativeSignals,
    matchedSkillsCount: matchedTechSkills.length,
    message: isValidResume
      ? 'Resume validation successful.'
      : 'The uploaded document does not appear to be a resume. Please upload a valid resume in PDF or DOCX format.',
    rejectionReason: isValidResume
      ? null
      : 'The uploaded document does not appear to be a resume. Please upload a valid resume in PDF or DOCX format.',
    details: isValidResume
      ? `Verified ${detectedSections.length} resume sections and contact information.`
      : `Document identified as ${documentType.replace('_', ' ')}. Missing essential resume components (Contact info, Education, Skills, or Projects).`
  };
};

