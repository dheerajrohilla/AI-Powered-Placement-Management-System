/**
 * Company-Specific Preparation Mode Engine
 * Builds an all-in-one preparation playbook tailored to a specific company drive.
 * Highlights required skills, skill gaps, past interview patterns, expected difficulty,
 * company-specific questions, and interactive readiness checklist.
 */

const COMPANY_INTEL_DB = {
  'abc technologies': {
    difficulty: 'Medium',
    rating: 3.8,
    roundsCount: 3,
    rounds: [
      { name: 'Online Assessment', duration: '60 mins', details: '30 MCQs on Core CS & Aptitude + 2 Medium DSA problems' },
      { name: 'Technical Interview', duration: '45 mins', details: 'OOP concepts, Java fundamentals, Database indexing, and Project walk-through' },
      { name: 'HR & Managerial', duration: '30 mins', details: 'Culture fit, situational behavioral questions, willingness to relocate' }
    ],
    commonTopics: ['Java Collections', 'REST APIs', 'SQL Joins', 'Exception Handling', 'Agile Methodologies'],
    tips: 'ABC Tech emphasizes clean, maintainable code over complex algorithms. Focus on unit tests and modular project structure.'
  },
  'tech solutions': {
    difficulty: 'Hard',
    rating: 4.4,
    roundsCount: 4,
    rounds: [
      { name: 'Coding Round', duration: '90 mins', details: '3 DSA questions (Graphs, DP, Trees) on HackerRank platform' },
      { name: 'Technical Round 1', duration: '60 mins', details: 'Deep dive into Spring Boot, multi-threading, concurrency, and SQL queries' },
      { name: 'Technical Round 2 (System Design)', duration: '45 mins', details: 'High-level system design (Rate Limiter, URL Shortener, Microservices caching)' },
      { name: 'Leadership & HR', duration: '30 mins', details: 'Conflict resolution, ownership mindset, previous project challenges' }
    ],
    commonTopics: ['Spring Boot Internals', 'Concurrency & Locks', 'Redis Caching', 'Database Sharding', 'Kafka basics'],
    tips: 'Tech Solutions tests scalability and edge cases. Prepare to discuss database bottlenecks and API latency optimization.'
  },
  'infosys': {
    difficulty: 'Easy-Medium',
    rating: 3.5,
    roundsCount: 3,
    rounds: [
      { name: 'InfyTQ / Online Test', duration: '100 mins', details: 'Hands-on programming in Java/Python + Verbal and Logical reasoning' },
      { name: 'Technical Round', duration: '35 mins', details: 'Basic data structures, DBMS concepts, Final year project explanation' },
      { name: 'HR Round', duration: '20 mins', details: 'Communication skills, shifts preference, relocation flexibility' }
    ],
    commonTopics: ['Strings & Arrays', 'SQL Queries', 'SDLC Models', 'Basic OOP Principles'],
    tips: 'Speed in the initial online test is crucial. Keep your core CS fundamentals sharp and explain projects clearly.'
  },
  'deloitte': {
    difficulty: 'Medium',
    rating: 4.0,
    roundsCount: 3,
    rounds: [
      { name: 'Aptitude & Case Assessment', duration: '75 mins', details: 'Quantitative analysis, critical reasoning, and technical MCQs' },
      { name: 'Case Study & Tech Round', duration: '50 mins', details: 'Data modeling, SQL aggregations, Python data structures, and business problem scenario' },
      { name: 'Partner / HR Round', duration: '30 mins', details: 'Client handling scenarios, behavioral fit, leadership experience' }
    ],
    commonTopics: ['SQL Window Functions', 'Data Warehousing Basics', 'Power BI / Excel', 'Business Logic & Analytics'],
    tips: 'Deloitte values business acumen alongside technical proficiency. Frame your answers around business value and ROI.'
  },
  'wipro': {
    difficulty: 'Easy-Medium',
    rating: 3.4,
    roundsCount: 3,
    rounds: [
      { name: 'Elite National Talent Hunt', duration: '120 mins', details: 'Aptitude, English writing test, and 2 Basic-Medium coding problems' },
      { name: 'Technical Interview', duration: '30 mins', details: 'Core Java, C++, SQL basics, resume projects' },
      { name: 'HR Interview', duration: '20 mins', details: 'Standard behavioral questions, adaptability, documentation verification' }
    ],
    commonTopics: ['Array Manipulation', 'Inheritance & Polymorphism', 'SQL Normalization', 'Computer Networks Basics'],
    tips: 'Essay writing in the first round is evaluated by automated grammar tools. Write structured paragraphs.'
  },
  'tcs': {
    difficulty: 'Medium',
    rating: 3.6,
    roundsCount: 3,
    rounds: [
      { name: 'TCS NQT (National Qualifier Test)', duration: '165 mins', details: 'Foundation Section + Advanced Cognitive & Coding Section' },
      { name: 'Technical & Managerial', duration: '40 mins', details: 'Code tracing, data types, database normalization, branch-specific questions' },
      { name: 'HR Interview', duration: '20 mins', details: 'Background check, relocation readiness, communication clarity' }
    ],
    commonTopics: ['Time Complexity', 'Recursion', 'DBMS Architecture', 'Pointers / References'],
    tips: 'Scoring high on the Advanced section of NQT opens up the TCS Digital / Prime roles (up to 9 LPA).'
  }
};

export const generateCompanyPrepPlan = ({ student = {}, drive = {} }) => {
  const companyName = (drive.company?.companyName || drive.title || 'General').toLowerCase();
  const requirements = (drive.requirements || []).map(r => r.trim());
  const studentSkills = (student.skills || []).map(s => s.toLowerCase().trim());
  const resumeText = (student.resumeParsedText || '').toLowerCase();

  // Retrieve or generate company intel
  let intel = COMPANY_INTEL_DB[companyName];
  if (!intel) {
    for (const [key, val] of Object.entries(COMPANY_INTEL_DB)) {
      if (companyName.includes(key) || key.includes(companyName)) {
        intel = val;
        break;
      }
    }
  }

  if (!intel) {
    intel = {
      difficulty: 'Medium-Hard',
      rating: 4.0,
      roundsCount: 3,
      rounds: [
        { name: 'Coding & Aptitude Test', duration: '60 mins', details: 'Technical MCQs and 2 coding challenges' },
        { name: 'Technical Round', duration: '45 mins', details: 'Core competencies, system design, and resume projects' },
        { name: 'HR & Cultural Round', duration: '30 mins', details: 'Behavioral alignment and final discussions' }
      ],
      commonTopics: requirements.length > 0 ? requirements : ['DSA', 'OOP', 'SQL', 'APIs'],
      tips: 'Ensure your fundamentals in the required JD technologies are rock-solid and practice live coding.'
    };
  }

  // Calculate skill matches and gaps
  const matchedSkills = [];
  const missingSkills = [];

  for (const req of requirements) {
    const lower = req.toLowerCase();
    const isMatched = studentSkills.some(s => s.includes(lower) || lower.includes(s)) ||
      resumeText.includes(lower);

    if (isMatched) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  }

  const matchScore = requirements.length > 0
    ? Math.round((matchedSkills.length / requirements.length) * 100)
    : 80;

  // Interview Readiness Score (weighted combination of match score, student profile strength, and ATS)
  const readinessScore = Math.round(
    (matchScore * 0.45) +
    ((student.atsScore || 75) * 0.3) +
    ((student.profileStrength || 80) * 0.25)
  );

  // Recommended preparation timeline
  const preparationRoadmap = [
    {
      phase: 'Day 1 - 2: Core Concept Revision',
      focus: `Master fundamentals of: ${requirements.slice(0, 3).join(', ') || 'Core Technologies'}`,
      tasks: [
        'Review architecture and key theoretical patterns',
        'Brush up on time & space complexity analysis',
        'Prepare 2-minute elevator pitch for top 2 resume projects'
      ]
    },
    {
      phase: 'Day 3 - 4: Targeted Problem Solving',
      focus: `Practice past interview topics: ${intel.commonTopics.slice(0, 3).join(', ')}`,
      tasks: [
        'Solve 5 company-specific medium problems on LeetCode/HackerRank',
        'Review SQL queries: complex joins, subqueries, and window functions',
        'Fix identified skill gaps: ' + (missingSkills.slice(0, 2).join(', ') || 'System trade-offs')
      ]
    },
    {
      phase: 'Day 5 - 6: Simulation & Mock Rounds',
      focus: 'Real-time AI Mock Interview & Behavioral Framing',
      tasks: [
        'Take full-length AI Mock Interview for ' + (drive.company?.companyName || drive.title),
        'Frame 4 STAR stories for behavioral and leadership rounds',
        'Review company product lines, recent news, and interview tips'
      ]
    }
  ];

  // Curated company-specific mock questions
  const sampleQuestions = [
    `How would you architect a scalable service using ${requirements[0] || 'Java'} under high concurrent read traffic?`,
    `Walk me through the most technically challenging bug in your ${student.projects?.[0]?.title || 'primary project'} and how you resolved it.`,
    `Explain the performance implications of indexing in SQL and how you diagnose slow queries.`,
    `Why do you want to join ${drive.company?.companyName || 'this company'} and what sets you apart from other applicants?`
  ];

  // Interactive Checklist
  const readinessChecklist = [
    { id: 'c1', label: 'Resume tailored with company keywords', completed: matchScore >= 75 },
    { id: 'c2', label: 'All required technical topics reviewed', completed: missingSkills.length === 0 },
    { id: 'c3', label: 'Company AI Mock Interview completed', completed: false },
    { id: 'c4', label: 'Project repositories verified and live demo links working', completed: Boolean(student.socialLinks?.github) },
    { id: 'c5', label: 'Behavioral STAR stories prepared', completed: true }
  ];

  return {
    companyName: drive.company?.companyName || drive.title,
    roleTitle: drive.jobRole || drive.title,
    driveId: drive._id,
    salary: drive.salary,
    location: drive.location || 'Pan-India',
    eligibility: drive.eligibility,
    difficulty: intel.difficulty,
    difficultyRating: intel.rating,
    rounds: intel.rounds,
    commonTopics: intel.commonTopics,
    tips: intel.tips,
    matchScore,
    readinessScore,
    matchedSkills,
    missingSkills,
    sampleQuestions,
    preparationRoadmap,
    readinessChecklist,
    generatedAt: new Date()
  };
};
