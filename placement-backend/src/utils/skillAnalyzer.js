import { SKILL_CATEGORIES, ROLE_PROFILES } from './skillTaxonomy.js';

/**
 * Extracts and categorizes all skills detected in resume text
 * @param {string} resumeText - Normalized raw resume text
 * @returns {Object} Categorized skills and summary
 */
export const extractCategorizedSkills = (resumeText = '') => {
  const text = (resumeText || '').trim();
  if (!text) {
    return {
      categorized: {
        languages: [],
        frontend: [],
        backend: [],
        databases: [],
        cloudDevops: [],
        aiMlData: [],
        coreCs: [],
        tools: []
      },
      allSkills: [],
      evidence: {},
      totalCount: 0
    };
  }

  const categorized = {
    languages: [],
    frontend: [],
    backend: [],
    databases: [],
    cloudDevops: [],
    aiMlData: [],
    coreCs: [],
    tools: []
  };

  const allSkills = [];
  const evidence = {};

  for (const [catKey, category] of Object.entries(SKILL_CATEGORIES)) {
    for (const skill of category.skills) {
      let isMatch = false;
      let matchSnippet = '';

      if (skill.regex) {
        const m = skill.regex.exec(text);
        if (m) {
          isMatch = true;
          const start = Math.max(0, m.index - 30);
          const end = Math.min(text.length, m.index + m[0].length + 40);
          matchSnippet = text.slice(start, end).replace(/\s+/g, ' ').trim();
        }
      } else {
        const patterns = skill.aliases || [skill.name.toLowerCase()];
        for (const pattern of patterns) {
          const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escaped}\\b`, 'i');
          const m = regex.exec(text);
          if (m) {
            isMatch = true;
            const start = Math.max(0, m.index - 30);
            const end = Math.min(text.length, m.index + m[0].length + 40);
            matchSnippet = text.slice(start, end).replace(/\s+/g, ' ').trim();
            break;
          }
        }
      }

      if (isMatch) {
        if (!categorized[catKey].includes(skill.name)) {
          categorized[catKey].push(skill.name);
        }
        if (!allSkills.includes(skill.name)) {
          allSkills.push(skill.name);
        }
        if (matchSnippet && !evidence[skill.name]) {
          evidence[skill.name] = matchSnippet;
        }
      }
    }
  }

  return {
    categorized,
    allSkills,
    detectedSkills: allSkills,
    evidence,
    totalCount: allSkills.length
  };
};

/**
 * Calculates role readiness benchmarks based on detected skills
 * @param {string[]} extractedSkills - List of skill names found in resume
 */
export const calculateRoleReadiness = (extractedSkills = []) => {
  const safeSkills = (extractedSkills || []).filter(Boolean);
  const skillsSet = new Set(safeSkills.map(s => s.toLowerCase().trim()));

  if (safeSkills.length === 0) {
    return ROLE_PROFILES.map(profile => ({
      role: profile.role,
      description: profile.description,
      readinessScore: 0,
      matchedSkills: [],
      missingSkills: Object.keys(profile.weightings),
      recommendedNextSkills: Object.entries(profile.weightings)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name),
      isTopMatch: false
    }));
  }

  return ROLE_PROFILES.map(profile => {
    let earnedWeight = 0;
    let totalWeight = 0;
    const matched = [];
    const missing = [];

    for (const [skill, weight] of Object.entries(profile.weightings)) {
      totalWeight += weight;
      if (skillsSet.has(skill.toLowerCase())) {
        earnedWeight += weight;
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    }

    const readinessScore = Math.min(100, Math.round((earnedWeight / (totalWeight || 1)) * 100));

    // Recommend top missing skills with highest weight
    const recommendedNextSkills = missing
      .sort((a, b) => (profile.weightings[b] || 0) - (profile.weightings[a] || 0))
      .slice(0, 3);

    return {
      role: profile.role,
      description: profile.description,
      readinessScore,
      matchedSkills: matched,
      missingSkills: missing,
      recommendedNextSkills,
      isTopMatch: false
    };
  }).sort((a, b) => b.readinessScore - a.readinessScore)
    .map((item, idx) => ({ ...item, isTopMatch: idx === 0 && item.readinessScore > 0 }));
};

/**
 * Compares candidate skills against active placement drives
 * @param {string[]} candidateSkills - List of student skills
 * @param {Array} drives - Active placement drives from database
 */
export const matchSkillsWithDrives = (candidateSkills = [], drives = []) => {
  const cSkillSet = new Set((candidateSkills || []).map(s => s.toLowerCase().trim()));

  return (drives || []).map(drive => {
    const requirements = (drive.requirements || []).map(r => r.trim()).filter(Boolean);
    const matched = [];
    const missing = [];

    for (const req of requirements) {
      const lowerReq = req.toLowerCase();
      // Check if candidate has skill matching or included in requirement
      let found = false;
      for (const cs of cSkillSet) {
        if (lowerReq.includes(cs) || cs.includes(lowerReq)) {
          found = true;
          break;
        }
      }

      if (found) {
        matched.push(req);
      } else {
        missing.push(req);
      }
    }

    const matchPercent = requirements.length > 0
      ? Math.round((matched.length / requirements.length) * 100)
      : 80; // default if no specific requirements

    return {
      driveId: drive._id,
      title: drive.title,
      jobRole: drive.jobRole || drive.title,
      companyName: drive.company?.companyName || 'Company',
      salary: drive.salary,
      location: drive.location,
      minCGPA: drive.eligibility?.minCGPA || 0,
      matchPercent,
      matchedSkills: matched,
      missingSkills: missing,
      deadline: drive.registrationDeadline
    };
  }).sort((a, b) => b.matchPercent - a.matchPercent);
};

/**
 * Generates personalized skill improvement recommendations and roadmaps
 */
export const generateSkillRoadmap = (extractedSkills = [], roleReadiness = []) => {
  const topRole = roleReadiness[0] || null;
  const missingInTopRole = topRole ? topRole.missingSkills.slice(0, 4) : [];

  const roadmapItems = [
    {
      skill: 'Docker & Containerization',
      category: 'DevOps / Cloud',
      estimatedDays: '5-7 days',
      priority: 'High',
      reason: '70% of companies look for containerization skills for software engineering roles.',
      keyTopics: ['Dockerfile basics', 'Multi-stage builds', 'Docker Compose', 'Container networking']
    },
    {
      skill: 'System Design Basics',
      category: 'Core Computer Science',
      estimatedDays: '10-14 days',
      priority: 'High',
      reason: 'Commonly asked in Technical Round 2 for campus software developer roles.',
      keyTopics: ['Scalability & Load Balancers', 'Database sharding & replication', 'Caching with Redis', 'CAP theorem']
    },
    {
      skill: 'TypeScript',
      category: 'Programming Languages',
      estimatedDays: '4-6 days',
      priority: 'Medium',
      reason: 'Standard in modern enterprise full-stack and frontend development.',
      keyTopics: ['Types & Interfaces', 'Generics', 'Type narrowing', 'TS with React/Express']
    },
    {
      skill: 'REST API Optimization & Testing',
      category: 'Backend & APIs',
      estimatedDays: '3-5 days',
      priority: 'Medium',
      reason: 'Shows high production engineering maturity during technical interviews.',
      keyTopics: ['Pagination & Filtering', 'Rate limiting', 'Postman test suites', 'Swagger/OpenAPI docs']
    }
  ];

  // Adjust priorities based on what's already known
  const existingSet = new Set(extractedSkills.map(s => s.toLowerCase()));
  return roadmapItems.filter(item => !existingSet.has(item.skill.toLowerCase()));
};
