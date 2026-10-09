/**
 * Anonymous Peer Benchmarking Engine
 * Aggregates student cohort performance metrics across DSA, Projects, Resume (ATS),
 * CGPA/Aptitude, and Mock Interviews with ZERO PII exposure.
 * Computes cohort averages, top 10% benchmarks, percentiles, and actionable delta insights.
 */

export const calculatePeerBenchmark = ({ currentStudent = {}, allStudents = [] }) => {
  if (allStudents.length === 0) {
    allStudents = [currentStudent];
  }

  // Derive individual dimension scores for a student
  const getDimensionScores = (s) => {
    // 1. DSA Score
    let dsa = s.peerMetrics?.dsaScore || 0;
    if (!dsa) {
      const skills = (s.skills || []).map(sk => sk.toLowerCase());
      if (skills.includes('dsa') || skills.includes('data structures') || skills.includes('algorithms')) dsa += 35;
      if (skills.includes('java') || skills.includes('c++') || skills.includes('python')) dsa += 25;
      if (s.codingProfiles?.leetcodeSolved) {
        dsa += Math.min(35, Math.round(s.codingProfiles.leetcodeSolved / 10));
      } else if (s.socialLinks?.leetcode) {
        dsa += 20;
      }
      dsa = Math.max(45, Math.min(95, dsa || 65));
    }

    // 2. Projects Score
    let projects = s.peerMetrics?.projectScore || 0;
    if (!projects) {
      const pCount = (s.projects || []).length;
      projects = 40 + (pCount * 14);
      if (s.socialLinks?.github) projects += 15;
      projects = Math.max(40, Math.min(98, projects));
    }

    // 3. Resume / ATS Score
    const resume = s.atsScore || (s.resumeAnalysis?.score || 72);

    // 4. Aptitude / Academic Score
    const cgpa = s.cgpa || 7.5;
    const academic = Math.min(100, Math.round((cgpa / 10) * 100));

    // 5. Mock Interview Readiness Score
    const interview = s.peerMetrics?.interviewScore || Math.round((dsa * 0.5) + (projects * 0.3) + 15);

    return {
      dsa,
      projects,
      resume,
      academic,
      interview
    };
  };

  const currentScores = getDimensionScores(currentStudent);

  // Collect cohort values
  const cohortScores = allStudents.map(s => getDimensionScores(s));

  // Helper for averages and top 10%
  const analyzeDimension = (key, userVal) => {
    const vals = cohortScores.map(c => c[key]).sort((a, b) => a - b);
    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / vals.length);
    const top10Index = Math.floor(vals.length * 0.9);
    const top10 = vals[Math.min(top10Index, vals.length - 1)] || 90;

    // Percentile rank
    const belowCount = vals.filter(v => v < userVal).length;
    const percentile = Math.max(5, Math.min(99, Math.round((belowCount / vals.length) * 100)));

    return {
      user: userVal,
      peerAverage: avg,
      top10Percentile: Math.max(top10, avg + 10),
      percentileRank: percentile
    };
  };

  const dimensions = {
    dsa: analyzeDimension('dsa', currentScores.dsa),
    projects: analyzeDimension('projects', currentScores.projects),
    resume: analyzeDimension('resume', currentScores.resume),
    academic: analyzeDimension('academic', currentScores.academic),
    interview: analyzeDimension('interview', currentScores.interview)
  };

  // Generate actionable delta recommendations
  const actionableInsights = [];

  // Check DSA gap
  const dsaGap = dimensions.dsa.peerAverage - dimensions.dsa.user;
  if (dsaGap > 0) {
    actionableInsights.push({
      dimension: 'Data Structures & Algorithms',
      severity: 'high',
      delta: dsaGap + 10,
      text: `Improve DSA by ${dsaGap + 8} points to move into the top 30% of candidates. Focus on Dynamic Programming and Graph traversals.`
    });
  } else {
    actionableInsights.push({
      dimension: 'Data Structures & Algorithms',
      severity: 'positive',
      delta: 0,
      text: `Your DSA score (${dimensions.dsa.user}) exceeds peer average (${dimensions.dsa.peerAverage}). You rank in the ${dimensions.dsa.percentileRank}th percentile!`
    });
  }

  // Check Projects gap
  const projectDiff = dimensions.projects.user - dimensions.projects.peerAverage;
  if (projectDiff >= 0) {
    actionableInsights.push({
      dimension: 'Projects & Engineering',
      severity: 'positive',
      delta: 0,
      text: `Your Projects score (${dimensions.projects.user}) is ${projectDiff} points higher than peer average (${dimensions.projects.peerAverage}). Highlight live deployment URLs in tech rounds.`
    });
  } else {
    actionableInsights.push({
      dimension: 'Projects & Engineering',
      severity: 'medium',
      delta: Math.abs(projectDiff) + 5,
      text: `Your Projects score is ${Math.abs(projectDiff)} points below peers. Add 1 comprehensive full-stack or systems project to close the gap.`
    });
  }

  // Check Resume gap
  const resumeGap = dimensions.resume.peerAverage - dimensions.resume.user;
  if (resumeGap > 0) {
    actionableInsights.push({
      dimension: 'Resume / ATS Score',
      severity: 'medium',
      delta: resumeGap + 6,
      text: `Your ATS score is ${resumeGap} points behind the cohort average (${dimensions.resume.peerAverage}). Add power action verbs and quantified impact metrics.`
    });
  } else {
    actionableInsights.push({
      dimension: 'Resume / ATS Score',
      severity: 'positive',
      delta: 0,
      text: `Strong ATS positioning! Your resume is in the ${dimensions.resume.percentileRank}th percentile of student resumes.`
    });
  }

  // Overall competitiveness rating
  const overallUserAvg = Math.round(
    (currentScores.dsa + currentScores.projects + currentScores.resume + currentScores.academic + currentScores.interview) / 5
  );
  const overallPeerAvg = Math.round(
    (dimensions.dsa.peerAverage + dimensions.projects.peerAverage + dimensions.resume.peerAverage + dimensions.academic.peerAverage + dimensions.interview.peerAverage) / 5
  );

  let cohortStanding = 'Above Average Candidate';
  let badgeClass = 'emerald';
  if (overallUserAvg >= overallPeerAvg + 8) {
    cohortStanding = 'Top Tier Candidate (High Placement Likelihood)';
    badgeClass = 'emerald';
  } else if (overallUserAvg >= overallPeerAvg) {
    cohortStanding = 'Competitive Candidate (Good Foundation)';
    badgeClass = 'blue';
  } else {
    cohortStanding = 'Growth Opportunity Candidate';
    badgeClass = 'orange';
  }

  return {
    cohortSize: allStudents.length,
    overallUserScore: overallUserAvg,
    overallPeerAverage: overallPeerAvg,
    cohortStanding,
    badgeClass,
    dimensions: [
      { id: 'dsa', name: 'DSA & Coding', ...dimensions.dsa, unit: 'pts' },
      { id: 'projects', name: 'Projects & Engineering', ...dimensions.projects, unit: 'pts' },
      { id: 'resume', name: 'Resume (ATS)', ...dimensions.resume, unit: 'pts' },
      { id: 'academic', name: 'Academics & CGPA', ...dimensions.academic, unit: 'pts' },
      { id: 'interview', name: 'Mock Interview Readiness', ...dimensions.interview, unit: 'pts' }
    ],
    actionableInsights,
    analyzedAt: new Date()
  };
};
