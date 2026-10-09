/**
 * "Why Am I Not Getting Shortlisted?" Analyzer
 * Diagnoses application history, tracks rejection stages (Screening, Coding, Technical, HR),
 * pinpoints exact bottlenecks, and creates an actionable turnaround roadmap.
 */

export const analyzeShortlistingHistory = ({
  student = {},
  applications = [],
  allDrives = [],
  interviews = []
}) => {
  const totalApplied = applications.length;
  const studentSkills = (student.skills || []).map(s => s.toLowerCase());
  const studentCGPA = student.cgpa || 0;
  const atsScore = student.atsScore || (student.resumeAnalysis?.score || 0);

  // If student has 0 applications, provide preparatory baseline
  if (totalApplied === 0) {
    return {
      hasData: false,
      totalApplied: 0,
      funnel: {
        applied: 0,
        shortlisted: 0,
        screeningRejected: 0,
        codingRejected: 0,
        interviewRejected: 0,
        selected: 0
      },
      message: "You haven't applied to any placement drives yet. Start applying to generate your shortlist analytics!"
    };
  }

  let shortlistedCount = 0;
  let selectedCount = 0;
  let screeningRejections = 0;
  let codingRejections = 0;
  let interviewRejections = 0;
  let hrRejections = 0;
  let pendingCount = 0;

  const missingSkillFrequency = {};
  const driveDiagnoses = [];

  for (const app of applications) {
    const drive = app.placementDrive || {};
    const company = app.company || drive.company || {};
    const driveRequirements = (drive.requirements || []).map(r => r.toLowerCase().trim());
    const minCGPA = drive.eligibility?.minCGPA || 0;

    // Check skills missing for this drive
    const missingInDrive = [];
    for (const req of driveRequirements) {
      if (!studentSkills.some(s => s.includes(req) || req.includes(s))) {
        missingInDrive.push(req);
        missingSkillFrequency[req] = (missingSkillFrequency[req] || 0) + 1;
      }
    }

    const isCgpaDeficit = studentCGPA > 0 && minCGPA > studentCGPA;

    // Classify stage
    let stage = app.rejectionStage;
    if (!stage && app.status === 'rejected') {
      // Heuristic stage inference if not explicitly set
      if (isCgpaDeficit || missingInDrive.length > 2 || atsScore < 70) {
        stage = 'screening';
      } else if (interviews.some(i => String(i.placementDrive?._id || i.placementDrive) === String(drive._id))) {
        stage = 'interview';
      } else {
        stage = 'screening';
      }
    }

    if (app.status === 'selected') {
      selectedCount++;
    } else if (app.status === 'shortlisted') {
      shortlistedCount++;
    } else if (app.status === 'rejected') {
      if (stage === 'coding') codingRejections++;
      else if (stage === 'interview') interviewRejections++;
      else if (stage === 'hr') hrRejections++;
      else screeningRejections++;
    } else {
      pendingCount++;
    }

    driveDiagnoses.push({
      applicationId: app._id,
      companyName: company.companyName || 'Company',
      role: drive.jobRole || drive.title || 'Role',
      status: app.status,
      rejectionStage: stage || null,
      appliedAt: app.appliedAt,
      cgpaCutoff: minCGPA,
      studentCGPA,
      isCgpaDeficit,
      missingSkills: missingInDrive,
      driveRequirements
    });
  }

  const totalRejections = screeningRejections + codingRejections + interviewRejections + hrRejections;

  // Determine Bottleneck
  let primaryBottleneck = 'Resume-to-JD Matching (Screening)';
  let bottleneckSeverity = 'High';
  let bottleneckDescription = '';
  let turnaroundPlan = [];

  const screeningRate = totalRejections > 0 ? (screeningRejections / totalRejections) : 0;
  const codingRate = totalRejections > 0 ? (codingRejections / totalRejections) : 0;
  const interviewRate = totalRejections > 0 ? (interviewRejections / totalRejections) : 0;

  if (screeningRate >= 0.5 || (totalApplied >= 3 && shortlistedCount === 0 && screeningRejections >= 2)) {
    primaryBottleneck = 'Resume-to-JD Matching (Initial Screening)';
    bottleneckDescription = `Your main bottleneck is resume-to-JD matching (${Math.round(screeningRate * 100)}% of rejections occur during initial screening), not technical interview ability. ATS keyword filtering or CGPA cutoffs are halting your applications before recruiters see them.`;
    turnaroundPlan = [
      {
        priority: 'P1 - Immediate',
        title: 'ATS Keyword Alignment',
        action: `Embed recurring in-demand keywords directly into your resume project descriptions: ${Object.keys(missingSkillFrequency).slice(0, 4).join(', ') || 'Core Tech Stack'}.`
      },
      {
        priority: 'P2 - High',
        title: 'Target CGPA-Compatible Drives',
        action: 'Filter campus drives with eligibility criteria matching your CGPA to prevent automated filter rejections.'
      },
      {
        priority: 'P3 - Medium',
        title: 'Optimize Action Verbs & Metrics',
        action: 'Ensure each project bullet highlights quantifiable business or technical impact (e.g., latency, throughput, user base).'
      }
    ];
  } else if (codingRate >= 0.4) {
    primaryBottleneck = 'Online Coding Assessment (OA)';
    bottleneckDescription = `Your resume gets shortlisted, but you drop out during the Online Coding Assessment (${Math.round(codingRate * 100)}% drop-off). Automated test case execution and speed are the primary limiting factors.`;
    turnaroundPlan = [
      {
        priority: 'P1 - Immediate',
        title: 'Timed DSA Problem Drills',
        action: 'Practice 2-3 Medium LeetCode problems daily focusing on Arrays, Two Pointers, Trees, and Dynamic Programming under 25-minute timers.'
      },
      {
        priority: 'P2 - High',
        title: 'Edge Case & Time Complexity Mastery',
        action: 'Strengthen handling of constraints (N <= 10^5) to avoid Time Limit Exceeded (TLE) errors in campus coding rounds.'
      },
      {
        priority: 'P3 - Medium',
        title: 'Participate in College Mock Contests',
        action: 'Simulate HackerRank / Codeforces virtual contests to build speed under pressure.'
      }
    ];
  } else if (interviewRate >= 0.3) {
    primaryBottleneck = 'Technical & Behavioral Interview Rounds';
    bottleneckDescription = `You consistently crack screening and coding rounds, but drop off during live technical or HR discussions (${Math.round(interviewRate * 100)}% drop-off). Articulating trade-offs and project architecture is your priority.`;
    turnaroundPlan = [
      {
        priority: 'P1 - Immediate',
        title: 'AI Mock Interviews by Company JD',
        action: 'Complete at least 2 AI mock interviews for every company you get shortlisted for before the live panel.'
      },
      {
        priority: 'P2 - High',
        title: 'Master the STAR Method',
        action: 'Structure your project and behavioral answers using Situation, Task, Action, and Result to convey leadership and problem-solving.'
      },
      {
        priority: 'P3 - Medium',
        title: 'Deep-Dive Project Architecture',
        action: 'Be ready to explain every library and database choice made in your resume projects down to the thread and query level.'
      }
    ];
  } else {
    primaryBottleneck = 'Application Volume & Niche Specialization';
    bottleneckDescription = 'Your conversion rates are balanced. Increasing targeted application volume while keeping skills tailored will unlock multiple offers.';
    turnaroundPlan = [
      {
        priority: 'P1 - Immediate',
        title: 'Broaden Drive Applications',
        action: 'Apply to all eligible Tier-1 and Tier-2 campus drives without hesitation.'
      },
      {
        priority: 'P2 - High',
        title: 'Specialized Company Prep Mode',
        action: 'Activate Company Preparation Mode 5 days before each scheduled drive.'
      }
    ];
  }

  // Sorted missing skills
  const topMissingSkills = Object.entries(missingSkillFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([skill, count]) => ({ skill, count }));

  return {
    hasData: true,
    totalApplied,
    shortlistedCount,
    selectedCount,
    pendingCount,
    totalRejections,
    funnel: {
      applied: totalApplied,
      shortlisted: shortlistedCount,
      screeningRejected: screeningRejections,
      codingRejected: codingRejections,
      interviewRejected: interviewRejections,
      hrRejected: hrRejections,
      selected: selectedCount
    },
    conversionRates: {
      shortlistRate: totalApplied > 0 ? Math.round((shortlistedCount / totalApplied) * 100) : 0,
      selectionRate: totalApplied > 0 ? Math.round((selectedCount / totalApplied) * 100) : 0,
      screeningDropoffRate: Math.round(screeningRate * 100),
      codingDropoffRate: Math.round(codingRate * 100),
      interviewDropoffRate: Math.round(interviewRate * 100)
    },
    primaryBottleneck,
    bottleneckSeverity,
    bottleneckDescription,
    topMissingSkills,
    turnaroundPlan,
    driveDiagnoses: driveDiagnoses.slice(0, 10),
    analyzedAt: new Date()
  };
};
