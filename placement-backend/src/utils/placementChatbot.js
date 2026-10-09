/**
 * Real-time Placement Assistant Chatbot Engine (CampusAI Copilot)
 * Context-aware engine that answers questions using live database data.
 */

export const processChatQuery = async ({
  message = '',
  student = null,
  user = null,
  drives = [],
  applications = [],
  interviews = []
}) => {
  const query = (message || '').trim().toLowerCase();
  const studentName = user?.name || 'Student';
  const cgpa = student?.cgpa || 0;
  const department = student?.department || 'Engineering';
  const skills = student?.skills || [];
  const atsScore = student?.atsScore || 0;
  const hasResume = Boolean(student?.resume);

  // Quick suggestions generated alongside each answer
  let suggestions = [
    'Check my drive eligibility',
    'How to boost my ATS score?',
    'Show upcoming interviews',
    'Recommended skills for me'
  ];

  let replyText = '';

  // 1. ELIGIBILITY QUERIES
  if (
    query.includes('eligible') ||
    query.includes('eligibility') ||
    query.includes('can i apply') ||
    query.includes('my drives')
  ) {
    const eligibleDrives = (drives || []).filter(drive => {
      const minCgpa = drive.eligibility?.minCGPA || 0;
      const deptList = (drive.eligibility?.departments || []).map(d => d.toLowerCase());
      const cgpaOk = cgpa >= minCgpa;
      const deptOk = deptList.length === 0 || deptList.includes(department.toLowerCase()) || deptList.includes('all');
      return cgpaOk && deptOk;
    });

    if (eligibleDrives.length > 0) {
      const driveList = eligibleDrives.map(d => {
        const pkg = (d.salary / 100000).toFixed(1);
        const deadline = d.registrationDeadline ? new Date(d.registrationDeadline).toLocaleDateString() : 'Open';
        return `• **${d.company?.companyName || 'Recruiter'}** — *${d.jobRole || d.title}*\n  - Package: **₹${pkg} LPA** | Min CGPA: ${d.eligibility?.minCGPA || 0} | Deadline: ${deadline}`;
      }).join('\n\n');

      replyText = `###  Your Eligible Placement Drives\n\nBased on your CGPA of **${cgpa}** in **${department}**, you qualify for **${eligibleDrives.length} active drive(s)**:\n\n${driveList}\n\n👉 Head over to the **Placement Drives** tab to submit your 1-click application!`;
      suggestions = [
        'Which companies pay the highest package?',
        'How to improve my ATS score for these drives?',
        'Show my current applications'
      ];
    } else {
      replyText = `###  Drive Eligibility Status\n\nCurrently, there are no open drives with a minimum CGPA criteria matching **${cgpa}** in **${department}**, or deadlines have passed.\n\nKeep an eye on the portal as recruiters post new drives weekly!`;
      suggestions = [
        'How to boost my ATS score?',
        'Practice technical interview questions',
        'Show all active drives'
      ];
    }

    return { reply: replyText, suggestions };
  }

  // 2. HIGHEST PACKAGE / SALARY QUERIES
  if (
    query.includes('highest package') ||
    query.includes('salary') ||
    query.includes('package') ||
    query.includes('lpa') ||
    query.includes('top company') ||
    query.includes('highest paying')
  ) {
    const sorted = [...(drives || [])].sort((a, b) => (b.salary || 0) - (a.salary || 0));

    if (sorted.length > 0) {
      const top3 = sorted.slice(0, 4).map(d => {
        const lpa = (d.salary / 100000).toFixed(1);
        return `• **${d.company?.companyName || 'Recruiter'}**: **₹${lpa} LPA** for *${d.jobRole || d.title}* (${d.location || 'Pan India'})`;
      }).join('\n');

      replyText = `### 💰 Top Placement Packages on Campus\n\nHere are the highest packages currently offered:\n\n${top3}\n\n💡 *Tip: Higher package roles evaluate DSA and System Design heavily in Technical Rounds.*`;
      suggestions = [
        'Am I eligible for these top drives?',
        'What skills are required for these roles?',
        'Give me DSA practice questions'
      ];
    } else {
      replyText = `There are currently no placement drives listed in the system. Check back soon!`;
    }

    return { reply: replyText, suggestions };
  }

  // 3. ATS SCORE & RESUME IMPROVEMENT QUERIES
  if (
    query.includes('ats') ||
    query.includes('resume') ||
    query.includes('score') ||
    query.includes('cv')
  ) {
    if (!hasResume) {
      replyText = `### 📄 Resume Status: Not Uploaded\n\nYou haven't uploaded a resume yet! To get a real ATS compatibility score:\n\n1. Go to **Resume** in the sidebar.\n2. Upload your PDF resume.\n3. The system parses your PDF and checks contact info, sections, action verbs, metrics, and technical skills.\n\nUpload your resume today to unlock personalized job matching!`;
      suggestions = ['How does ATS scoring work?', 'What sections should be in a resume?'];
    } else {
      const scoreRating = atsScore >= 80 ? 'Excellent' : atsScore >= 60 ? 'Good' : 'Needs Optimization';
      replyText = `### 🤖 Your ATS Resume Evaluation\n\n- **Current ATS Score:** **${atsScore}%** (${scoreRating})\n- **Registered Skills:** ${skills.length} skills listed (${skills.slice(0, 5).join(', ')}${skills.length > 5 ? '...' : ''})\n\n#### Top 4 Ways to Hit 90+ ATS Score:\n1. **Quantify Results:** Add measurable metrics in your projects (e.g., *"Reduced latency by 35%"*, *"Handled 1,000+ records"*).\n2. **Include Links:** Ensure both your clickable **GitHub** and **LinkedIn** URLs are present near the top.\n3. **Use Power Action Verbs:** Begin project bullets with strong verbs: *Engineered, Architected, Spearheaded, Optimized*.\n4. **Standard Headers:** Keep sections clearly named: *Education, Projects, Technical Skills, Experience, Certifications*.\n\n👉 Visit **AI Resume Analysis** for your full multi-point audit and live drive match!`;
      suggestions = [
        'Give me high-impact action verbs',
        'Which skills are missing from my resume?',
        'Check my drive eligibility'
      ];
    }

    return { reply: replyText, suggestions };
  }

  // 4. INTERVIEW QUERIES & PREP
  if (
    query.includes('interview') ||
    query.includes('scheduled') ||
    query.includes('round')
  ) {
    if (interviews.length > 0) {
      const interviewList = interviews.map(i => {
        const dateStr = i.scheduledDate ? new Date(i.scheduledDate).toLocaleString() : 'Date TBD';
        return `• **${i.company?.companyName || 'Company'}** — *${i.round?.toUpperCase() || 'TECHNICAL'} Round*\n  - Scheduled: **${dateStr}**\n  - Status: \`${i.status || 'scheduled'}\`${i.joinLink ? `\n  - Meeting Link: [Join Here](${i.joinLink})` : ''}`;
      }).join('\n\n');

      replyText = `### 📅 Your Upcoming Interviews\n\nYou have **${interviews.length} interview(s)** scheduled:\n\n${interviewList}\n\n#### 🎯 Quick Prep Checklist:\n- Review core CS concepts (DSA, OOP, DBMS, Networks).\n- Prepare 2-3 project deep dives following the **STAR method** (Situation, Task, Action, Result).\n- Keep a neat digital background and test your camera & microphone ahead of time.`;
      suggestions = [
        'Give me technical interview questions',
        'How to answer "Tell me about yourself"?',
        'System design tips for freshers'
      ];
    } else {
      replyText = `### 📅 Interview Status\n\nYou currently have no scheduled interviews.\n\nOnce companies shortlist your application, interview invites with meeting links and round details will appear here and in your **Interviews** tab.`;
      suggestions = [
        'Show my active applications',
        'Practice common interview questions',
        'Which drives can I apply to?'
      ];
    }

    return { reply: replyText, suggestions };
  }

  // 5. APPLICATION STATUS QUERIES
  if (
    query.includes('application') ||
    query.includes('status') ||
    query.includes('shortlisted') ||
    query.includes('applied')
  ) {
    if (applications.length > 0) {
      const appSummary = applications.map(a => {
        const comp = a.company?.companyName || 'Company';
        const role = a.placementDrive?.jobRole || a.placementDrive?.title || 'Role';
        const st = a.status.toUpperCase();
        return `• **${comp}** (*${role}*) — Status: **${st}**`;
      }).join('\n');

      replyText = `### 📋 Your Current Applications\n\nYou have applied to **${applications.length} drive(s)**:\n\n${appSummary}\n\nShortlisted candidates will receive interview invitations automatically in the portal!`;
      suggestions = ['When will I hear back from companies?', 'Check my interview schedule'];
    } else {
      replyText = `You haven't applied to any placement drives yet.\n\nBrowse active drives in the **Placement Drives** tab and apply with one click!`;
      suggestions = ['Show eligible drives for me', 'How to prepare my resume?'];
    }

    return { reply: replyText, suggestions };
  }

  // 6. MOCK INTERVIEW QUESTIONS / PRACTICE
  if (
    query.includes('question') ||
    query.includes('practice') ||
    query.includes('mock') ||
    query.includes('dsa') ||
    query.includes('technical round')
  ) {
    replyText = `### 💡 Campus Technical Interview Practice Questions\n\nHere are 3 frequently asked questions in campus tech drives:\n\n1. **Data Structures & Algorithms (Array / Two Pointers):**\n   - *Problem:* Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.\n   - *Optimal Approach:* Use a Hash Map for **O(N)** time and **O(N)** space complexity.\n\n2. **Web Technologies (React / Node):**\n   - *Question:* What is the difference between Virtual DOM and Real DOM, and how does React reconciliation work?\n   - *Key Points to Mention:* Diffing algorithm, batching state updates, Fiber architecture.\n\n3. **Database & Backend:**\n   - *Question:* What are ACID properties in DBMS, and how do SQL and NoSQL handle concurrency differently?\n   - *Key Points to Mention:* Atomicity, Consistency, Isolation, Durability, transactions vs eventual consistency.\n\nWould you like more questions in **System Design**, **Java/OOP**, or **Behavioral HR**?`;
    suggestions = [
      'Give me HR behavioral questions',
      'Explain the STAR method for interviews',
      'System design basics for freshers'
    ];
    return { reply: replyText, suggestions };
  }

  // 7. BEHAVIORAL / HR QUESTIONS
  if (
    query.includes('hr') ||
    query.includes('behavioral') ||
    query.includes('tell me about yourself') ||
    query.includes('star')
  ) {
    replyText = `### 🤝 HR & Behavioral Round Guide\n\nRecruiters use the HR round to check communication, teamwork, and cultural fit.\n\n#### Master the STAR Technique:\n- **S — Situation:** Describe the challenge or context.\n- **T — Task:** What was your specific goal or responsibility?\n- **A — Action:** What concrete steps did you take? (Focus on *"I"*, not just *"we"*)\n- **R — Result:** What was the measurable outcome or learning?\n\n#### Top 3 Common Questions:\n1. *"Tell me about a technical conflict in a team project and how you resolved it."*\n2. *"Where do you see yourself in 3 years in our organization?"*\n3. *"Why do you want to join our company over other offers?"*`;
    suggestions = [
      'How to answer salary expectations?',
      'Show upcoming interviews',
      'Check my eligible drives'
    ];
    return { reply: replyText, suggestions };
  }

  // 8. SKILLS TO LEARN / ROADMAP
  if (
    query.includes('skill') ||
    query.includes('learn') ||
    query.includes('roadmap') ||
    query.includes('technology')
  ) {
    replyText = `### 🚀 In-Demand Tech Skills for 2026 Placements\n\nBased on hiring trends from tech recruiters on our campus:\n\n| Domain | Must-Have Skills | Bonus Edge |\n|---|---|---|\n| **Full Stack** | React, Node.js, Express, MongoDB/PostgreSQL | TypeScript, Docker |\n| **Core Tech** | DSA (150+ LeetCode), OOP, DBMS, OS | System Design (HLD/LLD) |\n| **Cloud/DevOps** | Git/GitHub, Linux Basics | AWS/GCP, CI/CD Actions |\n| **AI/Data** | Python, Pandas, Scikit-learn | LLMs, PyTorch, RAG |\n\n👉 Check the **Skill Analysis** tab to see your exact skill match against every campus drive!`;
    suggestions = [
      'Check my ATS score',
      'Which drives match my skills?',
      'Give me DSA questions'
    ];
    return { reply: replyText, suggestions };
  }

  // 9. DEFAULT SMART RESPONSE
  replyText = `### 👋 Hello, ${studentName}!\n\nI am **CampusAI Copilot**, your real-time campus placement assistant.\n\nHere is a quick snapshot of your profile:\n- **Academic:** CGPA: **${cgpa}** | Department: **${department}**\n- **Resume ATS Score:** **${atsScore}%**\n- **Active Applications:** ${applications.length}\n- **Upcoming Interviews:** ${interviews.length}\n\n#### How can I assist you right now?\n- **"Am I eligible for active drives?"** — Check criteria against open company postings\n- **"How to boost my ATS score?"** — Personalized recommendations for your resume\n- **"Give me technical interview questions"** — Practice DSA, React, and Java problems\n- **"When is my next interview?"** — Check your scheduled interview dates & links`;

  return { reply: replyText, suggestions };
};
