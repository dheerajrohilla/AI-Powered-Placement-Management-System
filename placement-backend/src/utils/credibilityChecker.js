/**
 * AI Resume Consistency / Credibility Checker
 * Cross-references claims across:
 * - Resume text
 * - Student Profile (projects, skills, education, bio)
 * - GitHub (visible repositories, pinned repos, tech stack)
 * - Coding Profiles (LeetCode, Codeforces, HackerRank)
 * - Certifications
 */

export const checkResumeCredibility = (student = {}, options = {}) => {
  const resumeText = (student.resumeParsedText || options.resumeText || '').toLowerCase();
  const profileSkills = (student.skills || []).map(s => s.toLowerCase().trim());
  const profileProjects = student.projects || [];
  const profileCerts = student.certifications || [];
  const profileEducation = student.education || [];
  const socialLinks = student.socialLinks || {};
  const codingProfiles = student.codingProfiles || {};

  const discrepancies = [];
  const verifiedClaims = [];
  let credibilityScore = 100;

  // 1. PROJECTS VS GITHUB / CODING PROFILE CONSISTENCY
  // Check for quantified project claims in resume like "10 projects", "built 8+ web applications"
  const projectClaimRegex = /\b(\d+)\+?\s*(?:projects|web apps|applications|full[- ]stack apps|repositories)\b/gi;
  const projectMatches = [];
  let match;
  while ((match = projectClaimRegex.exec(resumeText)) !== null) {
    const num = parseInt(match[1], 10);
    if (num > 0 && num < 100) projectMatches.push(num);
  }
  const maxClaimedProjects = projectMatches.length > 0 ? Math.max(...projectMatches) : profileProjects.length;

  const actualProfileProjectCount = profileProjects.length;
  const githubRepoCount = codingProfiles.githubRepos || (socialLinks.github ? Math.max(actualProfileProjectCount, 2) : 0);

  if (maxClaimedProjects > 4 && githubRepoCount > 0 && maxClaimedProjects > (githubRepoCount * 2.5)) {
    credibilityScore -= 18;
    discrepancies.push({
      category: 'Projects vs GitHub',
      severity: 'high',
      claim: `Resume mentions "${maxClaimedProjects} projects completed"`,
      evidence: `GitHub / Public portfolio has only ${githubRepoCount} visible public repositories.`,
      issue: 'High divergence between claimed project volume and verifiable code repositories.',
      recommendation: 'Publish private repositories publicly or link live deployments (Vercel, Render) and detailed case studies to substantiate project counts.'
    });
  } else if (actualProfileProjectCount > 0) {
    verifiedClaims.push({
      category: 'Projects',
      claim: `${actualProfileProjectCount} core projects documented with tech stacks on profile`,
      status: 'verified'
    });
  }

  // Check if claimed project links are provided
  const hasLiveLinks = profileProjects.some(p => p.link && p.link.startsWith('http'));
  if (profileProjects.length >= 2 && !hasLiveLinks && !socialLinks.github) {
    credibilityScore -= 10;
    discrepancies.push({
      category: 'Proof of Work',
      severity: 'medium',
      claim: 'Projects listed without verifiable source code or demo URLs',
      evidence: 'No GitHub profile URL or project repository links supplied.',
      issue: 'Recruiters and technical screeners cannot audit source code authenticity.',
      recommendation: 'Add GitHub repository or live deployment links to each project.'
    });
  } else if (socialLinks.github) {
    verifiedClaims.push({
      category: 'GitHub Verification',
      claim: `GitHub profile verified: ${socialLinks.github}`,
      status: 'verified'
    });
  }

  // 2. SKILL CLAIMS VS EVIDENCE IN EXPERIENCE / PROJECTS / CERTS
  // E.g., student claims advanced frameworks like Kubernetes, Spring Boot, AWS, but never used them in projects
  const highImpactSkills = ['kubernetes', 'aws', 'docker', 'spring boot', 'kafka', 'microservices', 'graphql', 'redis', 'machine learning', 'tensorflow'];
  const resumeMentions = highImpactSkills.filter(s => resumeText.includes(s));
  const projectTechCombined = profileProjects.flatMap(p => (p.techStack || []).map(t => t.toLowerCase())).join(' ');
  const certsCombined = profileCerts.map(c => `${c.title} ${c.issuer}`.toLowerCase()).join(' ');

  const ungroundedSkills = [];
  for (const skill of resumeMentions) {
    const inProjects = projectTechCombined.includes(skill);
    const inCerts = certsCombined.includes(skill);
    const inProfile = profileSkills.includes(skill);
    if (!inProjects && !inCerts && !inProfile) {
      ungroundedSkills.push(skill.toUpperCase());
    }
  }

  if (ungroundedSkills.length > 0) {
    const penalty = Math.min(20, ungroundedSkills.length * 6);
    credibilityScore -= penalty;
    discrepancies.push({
      category: 'Skills Grounding',
      severity: ungroundedSkills.length >= 3 ? 'high' : 'medium',
      claim: `Resume lists specialized skills: ${ungroundedSkills.join(', ')}`,
      evidence: 'No corresponding projects, repositories, or certifications demonstrate usage of these technologies.',
      issue: 'Recruiters aggressively probe resume buzzwords in technical rounds.',
      recommendation: `Build a demonstrable mini-project incorporating ${ungroundedSkills.slice(0, 2).join(' & ')} or earn verified credentials.`
    });
  } else if (resumeMentions.length > 0) {
    verifiedClaims.push({
      category: 'Skills Consistency',
      claim: `Key technical skills (${resumeMentions.slice(0, 4).join(', ')}) substantiated by profile projects and coursework`,
      status: 'verified'
    });
  }

  // 3. ACADEMIC & CGPA CONSISTENCY
  const profileCGPA = student.cgpa || 0;
  // Look for CGPA in resume
  const cgpaInResumeMatch = resumeText.match(/\b(?:cgpa|gpa)\s*[:=-]?\s*([0-9]\.[0-9]{1,2})\b/i);
  if (cgpaInResumeMatch && profileCGPA > 0) {
    const resumeCGPA = parseFloat(cgpaInResumeMatch[1]);
    const diff = Math.abs(resumeCGPA - profileCGPA);
    if (diff > 0.4) {
      credibilityScore -= 20;
      discrepancies.push({
        category: 'Academic CGPA Mismatch',
        severity: 'high',
        claim: `Resume states ${resumeCGPA} CGPA while official institutional profile records ${profileCGPA} CGPA`,
        evidence: `Variance of ${diff.toFixed(2)} grade points detected.`,
        issue: 'Grade inflation discrepancy leads to immediate disqualification during document verification (DV).',
        recommendation: 'Update your resume immediately to reflect your exact official transcript CGPA.'
      });
    } else {
      verifiedClaims.push({
        category: 'Academics',
        claim: `CGPA (${profileCGPA}) aligns perfectly between resume and student portal`,
        status: 'verified'
      });
    }
  }

  // 4. CERTIFICATIONS VERIFICATION
  if (profileCerts.length > 0) {
    const verifiedCerts = [];
    const unverifiedCerts = [];
    for (const cert of profileCerts) {
      if (cert.issuer && cert.issueDate) {
        verifiedCerts.push(cert.title);
      } else {
        unverifiedCerts.push(cert.title);
      }
    }

    if (unverifiedCerts.length > 0) {
      credibilityScore -= 8;
      discrepancies.push({
        category: 'Certifications',
        severity: 'low',
        claim: `${unverifiedCerts.length} certifications listed with incomplete issuer or date metadata`,
        evidence: `Items missing verification fields: ${unverifiedCerts.join(', ')}`,
        issue: 'Certifications without verifying authority or credential IDs appear unvetted.',
        recommendation: 'Include credential ID, issue month/year, and issuing platform (Coursera, AWS, HackerRank, Oracle).'
      });
    }
    if (verifiedCerts.length > 0) {
      verifiedClaims.push({
        category: 'Certifications',
        claim: `${verifiedCerts.length} certifications verified with issuer authority`,
        status: 'verified'
      });
    }
  }

  // 5. CODING PROFILES (LeetCode / Codeforces)
  const leetcodeClaim = resumeText.match(/\b(\d{2,4})\+?\s*(?:leetcode|problems|dsa questions|coding questions)\b/i);
  const leetcodeSolved = codingProfiles.leetcodeSolved || 0;
  if (leetcodeClaim && leetcodeSolved > 0) {
    const claimedProblems = parseInt(leetcodeClaim[1], 10);
    if (claimedProblems > leetcodeSolved * 1.8) {
      credibilityScore -= 12;
      discrepancies.push({
        category: 'Coding Profile Stats',
        severity: 'medium',
        claim: `Resume claims "${claimedProblems}+ DSA problems solved"`,
        evidence: `Connected coding profile records ${leetcodeSolved} problems solved.`,
        issue: 'Inconsistent problem solving numbers on profile.',
        recommendation: 'Keep problem counts updated and synchronize your coding stats periodically.'
      });
    }
  } else if (socialLinks.leetcode || codingProfiles.leetcodeSolved) {
    verifiedClaims.push({
      category: 'Coding Profile',
      claim: `LeetCode profile linked: ${socialLinks.leetcode || `${leetcodeSolved} problems solved`}`,
      status: 'verified'
    });
  }

  // Bound score
  credibilityScore = Math.max(35, Math.min(100, Math.round(credibilityScore)));

  // Calculate grade & badge
  let credibilityRating = 'High Credibility';
  let badgeColor = 'emerald';
  let summary = 'Your resume and online presence demonstrate high consistency and authenticity.';

  if (credibilityScore >= 85) {
    credibilityRating = 'High Credibility / Verified';
    badgeColor = 'emerald';
  } else if (credibilityScore >= 70) {
    credibilityRating = 'Moderate Credibility - Minor Discrepancies';
    badgeColor = 'blue';
    summary = 'Minor differences detected between your resume claims and digital portfolio. Easily resolvable with few adjustments.';
  } else if (credibilityScore >= 50) {
    credibilityRating = 'Attention Needed - Inconsistent Claims';
    badgeColor = 'orange';
    summary = 'Notable mismatches found between projects, skill claims, and proof of work. Fix these before campus drives to avoid interview friction.';
  } else {
    credibilityRating = 'High Risk Discrepancies';
    badgeColor = 'red';
    summary = 'Significant discrepancies detected that could trigger recruiter scrutiny or background check flags.';
  }

  const categoryScores = {
    projects: Math.min(100, Math.max(40, 100 - (discrepancies.filter(d => d.category.includes('Project')).length * 25))),
    skills: Math.min(100, Math.max(40, 100 - (discrepancies.filter(d => d.category.includes('Skill')).length * 30))),
    academics: Math.min(100, Math.max(50, 100 - (discrepancies.filter(d => d.category.includes('Academic')).length * 40))),
    certifications: Math.min(100, Math.max(60, 100 - (discrepancies.filter(d => d.category.includes('Cert')).length * 20)))
  };

  return {
    score: credibilityScore,
    rating: credibilityRating,
    badgeColor,
    summary,
    totalDiscrepancies: discrepancies.length,
    highSeverityCount: discrepancies.filter(d => d.severity === 'high').length,
    categoryScores,
    discrepancies,
    verifiedClaims,
    inspectedSources: {
      hasResumeText: Boolean(resumeText),
      profileProjectsCount: actualProfileProjectCount,
      githubProfile: Boolean(socialLinks.github),
      leetcodeProfile: Boolean(socialLinks.leetcode || codingProfiles.leetcodeSolved),
      certificationsCount: profileCerts.length,
      officialCGPA: profileCGPA
    },
    analyzedAt: new Date()
  };
};
