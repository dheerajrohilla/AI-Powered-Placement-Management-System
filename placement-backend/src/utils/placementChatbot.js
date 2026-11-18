/**
 * Deterministic Fallback Placement Assistant Engine (CampusAI Copilot)
 * Production-grade knowledge engine that provides accurate, direct, and concise
 * answers to technical, academic, and placement queries when external AI is offline.
 *
 * Adheres strictly to core response rules:
 * - Direct answers (core answer first, 2-6 sentences for standard concepts)
 * - Structured bullet points and tables for comparisons
 * - Accurate markdown code blocks with Big-O complexity explanations
 * - Verified campus database ground truth without hallucination
 * - Honest limitations when information is unavailable
 */

export const processChatQuery = async ({
  message = '',
  student = null,
  user = null,
  drives = [],
  applications = [],
  interviews = []
}) => {
  const rawQuery = (message || '').trim();
  const query = rawQuery.toLowerCase();
  const studentName = user?.name || 'Student';
  const cgpa = student?.cgpa !== undefined && student?.cgpa !== null ? Number(student.cgpa) : null;
  const department = student?.department || 'Engineering';
  const skills = student?.skills || [];
  const atsScore = student?.atsScore || 0;
  const hasResume = Boolean(student?.resume);

  // Helper to package response with suggestions
  const makeResponse = (reply, suggestions = []) => ({
    reply: reply.trim(),
    suggestions: suggestions.length > 0 ? suggestions : [
      'How can I improve my resume ATS score?',
      'Give me 5 medium-level DSA practice questions',
      'Am I eligible for active placement drives?'
    ],
    isAiPowered: false
  });

  // ==========================================
  // 1. CASUAL GREETINGS & WHO AM I
  // ==========================================
  if (
    /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))\b/i.test(query) ||
    query === 'who are you' || query === 'what can you do'
  ) {
    const cgpaDisplay = cgpa !== null ? `${cgpa}` : 'Not recorded';
    const reply = `Hello ${studentName}! I am **CampusAI Copilot**, your placement and technical interview assistant.

I can help you with:
- **Campus Placements:** Checking active drives, calculating eligibility, and viewing interview schedules.
- **Resume & ATS:** Analyzing keyword gaps and formatting tips to push your ATS score above 80%.
- **Technical Concepts & Coding:** DSA patterns, OOP principles, SQL queries, system design, and coding examples.
- **Interview Preparation:** 30-day prep roadmaps, CS fundamentals, and behavioral HR strategies.

What would you like to prepare or explore today?`;

    return makeResponse(reply, [
      'Am I eligible for active drives?',
      'How can I improve my resume ATS score?',
      'Can you suggest a 30-day placement preparation plan?'
    ]);
  }

  // Explicit profile overview request
  if (query.includes('my profile') || query.includes('profile summary') || query.includes('who am i') || query.includes('my details')) {
    const cgpaDisplay = cgpa !== null ? `${cgpa}` : 'Not recorded';
    const reply = `### 👤 Student Profile Snapshot
- **Name:** **${studentName}**
- **Branch / Department:** **${department}**
- **Current CGPA:** **${cgpaDisplay}**
- **Resume ATS Score:** **${atsScore}%** (${hasResume ? 'PDF Active' : 'No Resume Uploaded'})
- **Registered Skills:** ${skills.length > 0 ? skills.join(', ') : 'None listed yet'}
- **Active Applications:** **${applications.length}** submitted
- **Upcoming Interviews:** **${interviews.length}** scheduled`;

    return makeResponse(reply, [
      'Am I eligible for active drives?',
      'How can I improve my resume ATS score?',
      'Show my upcoming interviews'
    ]);
  }

  // ==========================================
  // 2. DATA STRUCTURES AND ALGORITHMS (DSA)
  // ==========================================
  if (
    query.includes('data structures and algorithms') ||
    query.includes('what is dsa') ||
    query.includes('what is data structure') ||
    query.includes('dsa basics') ||
    query === 'dsa'
  ) {
    const reply = `**Data Structures and Algorithms (DSA)** are the twin foundations of computer science and technical problem-solving.

- **Data Structures** are specialized formats for organizing, storing, and managing data efficiently in memory (e.g., Arrays, Linked Lists, Stacks, Queues, Trees, and Graphs).
- **Algorithms** are finite, step-by-step procedures or sets of instructions designed to perform a computation or solve a specific problem (e.g., Binary Search, Merge Sort, Dijkstra's Algorithm).

Together, they allow software engineers to write programs that process data with optimal time complexity (speed) and space complexity (memory usage). DSA is the primary evaluation metric used by technology companies during technical screening rounds.`;

    return makeResponse(reply, [
      'Explain the difference between Array and LinkedList',
      'Give me 5 medium-level DSA practice questions',
      'What is Big-O notation?'
    ]);
  }

  // ==========================================
  // 3. OBJECT-ORIENTED PROGRAMMING (OOP)
  // ==========================================
  if (
    query.includes('object-oriented programming') ||
    query.includes('object oriented programming') ||
    query.includes('what is oop') ||
    query.includes('explain oop') ||
    query.includes('pillars of oop') ||
    query.includes('oops concepts')
  ) {
    const reply = `**Object-Oriented Programming (OOP)** is a programming paradigm organized around real-world entities called **objects**, which combine data (attributes) and behavior (methods).

The architecture of OOP rests on four fundamental pillars:
1. **Encapsulation:** Bundling data and methods into a single unit (class) while restricting direct outside access using access modifiers (\`private\`, \`protected\`, \`public\`).
2. **Abstraction:** Hiding complex implementation mechanics and exposing only essential interfaces to users (using abstract classes and interfaces).
3. **Inheritance:** Enabling a new class (subclass) to inherit attributes and methods from an existing class (superclass) to maximize code reuse.
4. **Polymorphism:** Allowing methods to perform different actions based on the object invoking them, implemented via method overriding (runtime) and method overloading (compile-time).`;

    return makeResponse(reply, [
      'Difference between Abstraction and Encapsulation',
      'Difference between Method Overloading and Method Overriding',
      'Write a Python program to reverse a string'
    ]);
  }

  // ==========================================
  // 4. PYTHON REVERSE STRING (CODING QUESTION)
  // ==========================================
  if (
    (query.includes('python') && query.includes('reverse') && query.includes('string')) ||
    query.includes('reverse a string') ||
    query.includes('reverse string in python')
  ) {
    const reply = `In Python, you can reverse a string using extended slice syntax \`s[::-1]\` or the built-in \`reversed()\` function.

\`\`\`python
def reverse_string(s: str) -> str:
    # Method 1: Slicing (most idiomatic and fastest in Python)
    return s[::-1]

# Method 2: Two-pointer in-place simulation (interview standard)
def reverse_string_two_pointers(s: str) -> str:
    chars = list(s)
    left, right = 0, len(chars) - 1
    while left < right:
        chars[left], chars[right] = chars[right], chars[left]
        left += 1
        right -= 1
    return "".join(chars)

# Example Usage:
text = "placement"
print(reverse_string(text))  # Output: "tnemecalp"
\`\`\`

**Key Takeaways:**
- **Time Complexity:** **O(N)**, where N is the length of the string, as every character is copied once.
- **Space Complexity:** **O(N)** to create the new reversed string (since Python strings are immutable).`;

    return makeResponse(reply, [
      'Write a Python program to check if a string is a palindrome',
      'Explain Big-O time and space complexity',
      'Give me 5 medium-level DSA practice questions'
    ]);
  }

  // ==========================================
  // 5. RESUME & ATS SCORE IMPROVEMENT
  // ==========================================
  if (
    query.includes('ats') ||
    query.includes('improve resume') ||
    query.includes('ats score') ||
    query.includes('resume score') ||
    query.includes('resume checker')
  ) {
    const currentScoreText = atsScore > 0 ? `Your current resume ATS score is **${atsScore}%**.` : 'You have not uploaded a resume yet.';
    const reply = `An **Applicant Tracking System (ATS)** parses resumes to filter candidates based on keywords, structural readability, and section completeness. ${currentScoreText}

To improve your ATS score above 80%:
1. **Quantify Your Impact:** Replace generic bullet points with measurable results using the formula: *Accomplished [X] as measured by [Y] by doing [Z]*. (e.g. *"Optimized database queries, reducing API latency by 35%"*).
2. **Use Industry-Standard Section Headers:** Label sections cleanly as *Education*, *Technical Skills*, *Projects*, *Work Experience*, and *Certifications*. Avoid creative titles like *"My Journey"*.
3. **Lead Bullets with Power Action Verbs:** Start every description with active verbs such as *Architected, Engineered, Implemented, Deployed, Automated, Scaled*.
4. **Mirror Target Drive Keywords:** Include the exact technical skills required by target companies (e.g., *RESTful APIs, Docker, SQL, Git, DSA*).
5. **Keep Clean Formatting:** Use single-column layouts with standard bullet points. Avoid tables, charts, graphics, and multi-column text boxes that confuse parsers.`;

    return makeResponse(reply, [
      'What are the current placement drives?',
      'Am I eligible for active drives?',
      'Can you suggest a 30-day placement preparation plan?'
    ]);
  }

  // ==========================================
  // 6. SQL INTERVIEW QUESTIONS
  // ==========================================
  if (
    query.includes('sql interview') ||
    query.includes('sql questions') ||
    query.includes('frequently asked sql') ||
    query.includes('important sql') ||
    (query.includes('sql') && query.includes('interview'))
  ) {
    const reply = `Here are the top 5 most frequently asked SQL interview questions with concise answers:

1. **Difference between WHERE and HAVING clause:**
   - \`WHERE\` filters individual rows **before** aggregation.
   - \`HAVING\` filters aggregated groups **after** \`GROUP BY\`.

2. **Types of SQL Joins:**
   - \`INNER JOIN\`: Returns matching rows from both tables.
   - \`LEFT JOIN\`: Returns all rows from left table and matching rows from right.
   - \`RIGHT JOIN\`: Returns all rows from right table and matching rows from left.
   - \`FULL OUTER JOIN\`: Returns all rows when there is a match in either table.

3. **How to find the N-th highest salary:**
\`\`\`sql
SELECT DISTINCT salary 
FROM (
    SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as ranking 
    FROM employees
) ranked 
WHERE ranking = 2; -- Change 2 to N
\`\`\`

4. **Indexes and Trade-offs:**
   - An index speeds up \`SELECT\` queries via B-Tree/Hash data structures, but slows down write operations (\`INSERT\`, \`UPDATE\`, \`DELETE\`) and requires extra storage.

5. **ACID Properties in Transactions:**
   - **Atomicity** (all or nothing), **Consistency** (preserves rules), **Isolation** (independent concurrent transactions), **Durability** (persisted after commit).`;

    return makeResponse(reply, [
      'Explain the difference between DBMS and RDBMS',
      'What is database normalization (1NF, 2NF, 3NF)?',
      'How should I prepare for a technical interview?'
    ]);
  }

  // ==========================================
  // 7. DBMS VS RDBMS
  // ==========================================
  if (
    query.includes('dbms and rdbms') ||
    query.includes('dbms vs rdbms') ||
    query.includes('difference between dbms and rdbms') ||
    query.includes('rdbms vs dbms')
  ) {
    const reply = `**DBMS** (Database Management System) and **RDBMS** (Relational Database Management System) differ primarily in how data is structured, related, and validated:

| Feature | DBMS | RDBMS |
|---|---|---|
| **Data Storage** | Stores data as flat files or navigational structures. | Stores data in structured two-dimensional tables (relations). |
| **Data Relationships** | Does not natively support relationships between files. | Enforces relationships using Primary and Foreign keys. |
| **Data Integrity & Normalization** | Minimal or no built-in constraints; prone to redundancy. | Full normalization support (1NF, 2NF, 3NF) ensuring zero redundancy. |
| **ACID Compliance** | Usually not supported or limited. | Strictly supported for reliable transactions. |
| **Examples** | XML, File System, early dBase. | MySQL, PostgreSQL, Oracle, SQL Server, SQLite. |`;

    return makeResponse(reply, [
      'What are the most frequently asked SQL interview questions?',
      'What is database normalization?',
      'Explain the difference between SQL and NoSQL'
    ]);
  }

  // ==========================================
  // 8. TECHNICAL INTERVIEW PREPARATION
  // ==========================================
  if (
    query.includes('prepare for a technical interview') ||
    query.includes('technical interview prep') ||
    query.includes('how should i prepare for technical') ||
    query.includes('interview preparation strategy')
  ) {
    const reply = `To prepare effectively for campus technical interviews, focus on these three core pillars:

1. **Data Structures & Algorithms (50% effort):**
   - Master core patterns: Two Pointers, Sliding Window, Fast & Slow Pointers, BFS/DFS, Binary Search, and Tree traversals.
   - Practice writing bug-free code on a whiteboard or blank editor while explaining your thought process out loud.

2. **Computer Science Fundamentals (30% effort):**
   - **DBMS:** SQL joins, indexing, ACID transactions, normalization.
   - **Operating Systems:** Process vs Thread, CPU scheduling, deadlocks, virtual memory.
   - **OOP:** 4 pillars with real-world design examples.
   - **Computer Networks:** TCP vs UDP, HTTP/HTTPS lifecycle, DNS lookup.

3. **Projects & Behavioral Practice (20% effort):**
   - Prepare a 2-minute elevator pitch for your two best projects using the **STAR method** (Situation, Task, Action, Result).
   - Be prepared to discuss technical trade-offs, architecture choices, and bugs you resolved.`;

    return makeResponse(reply, [
      'Can you suggest a 30-day placement preparation plan?',
      'What are the most frequently asked SQL interview questions?',
      'How can I improve my resume ATS score?'
    ]);
  }

  // ==========================================
  // 9. MACHINE LEARNING
  // ==========================================
  if (
    query.includes('machine learning') ||
    query.includes('what is ml') ||
    query.includes('machine learning basics') ||
    query === 'ml'
  ) {
    const reply = `**Machine Learning (ML)** is a subset of Artificial Intelligence that enables computer systems to learn patterns from historical data and make predictions or decisions without being explicitly programmed with rule-based code.

ML is divided into three primary paradigms:
1. **Supervised Learning:** The model is trained on labeled data with input-output pairs (e.g., Linear Regression, Decision Trees, SVM). Applications include spam detection and price forecasting.
2. **Unsupervised Learning:** The model discovers hidden patterns or clusters in unlabeled data (e.g., K-Means Clustering, PCA). Applications include customer segmentation and anomaly detection.
3. **Reinforcement Learning:** An agent learns optimal actions through trial-and-error feedback (rewards and penalties) in dynamic environments (e.g., Q-Learning, robotics, game AI).

The standard workflow includes: Data Collection → Feature Engineering → Model Training → Evaluation → Deployment.`;

    return makeResponse(reply, [
      'Difference between AI, Machine Learning, and Deep Learning',
      'Explain Supervised vs Unsupervised Learning',
      'What are popular Python libraries for Machine Learning?'
    ]);
  }

  // ==========================================
  // 10. 30-DAY PLACEMENT PREPARATION PLAN
  // ==========================================
  if (
    query.includes('30-day') ||
    query.includes('30 day') ||
    query.includes('placement preparation plan') ||
    query.includes('preparation roadmap') ||
    query.includes('study plan')
  ) {
    const reply = `Here is a structured, high-yield **30-Day Placement Preparation Plan** divided into four weekly phases:

- **Week 1: Foundations & Linear Data Structures (Days 1–7)**
  - Review time/space complexity (Big-O).
  - Solve 15–20 problems on Arrays, Strings, Two Pointers, Sliding Window, and HashMaps.
  - Finalize your resume draft and upload it to the **Real ATS Checker**.

- **Week 2: Non-Linear Data Structures & Recursion (Days 8–15)**
  - Master Linked Lists, Stacks, Queues, Binary Trees, and Tree Traversals (Inorder, Preorder, Postorder, Level-order).
  - Practice BFS and DFS on simple graphs.
  - Revise OOP principles and implement them in your primary language.

- **Week 3: Core CS Subjects & Advanced Topics (Days 16–22)**
  - **DBMS & SQL:** Practice Joins, Aggregate Functions, Indexing, and ACID transactions.
  - **OS & Networks:** Revise Deadlocks, Process vs Thread, Memory Management, and TCP/IP.
  - Solve basic Dynamic Programming problems (Climbing Stairs, 0/1 Knapsack).

- **Week 4: Mock Interviews, Projects & Polish (Days 23–30)**
  - Rehearse project walkthroughs using the STAR method.
  - Practice quantitative aptitude (Speed, Time & Work, Profit/Loss, Probability).
  - Complete 2 full mock technical and HR rounds under timed conditions.`;

    return makeResponse(reply, [
      'How should I prepare for a technical interview?',
      'What are the most frequently asked SQL interview questions?',
      'Am I eligible for active placement drives?'
    ]);
  }

  // ==========================================
  // 11. FRONTEND VS BACKEND DEVELOPMENT
  // ==========================================
  if (
    query.includes('frontend and backend') ||
    query.includes('frontend vs backend') ||
    query.includes('difference between frontend and backend')
  ) {
    const reply = `**Frontend** and **Backend** represent the two cooperating sides of full-stack web applications:

| Dimension | Frontend (Client-Side) | Backend (Server-Side) |
|---|---|---|
| **Core Focus** | What users see and interact with (UI/UX, responsiveness, state). | What runs behind the scenes (business logic, authentication, databases). |
| **Technologies** | HTML5, CSS3, JavaScript/TypeScript, React, Vue, Angular, Tailwind. | Node.js, Python/Django, Java/Spring Boot, Go, Express. |
| **Data Layer** | Consumes APIs (REST, GraphQL); manages client state (Redux). | Interacts with databases (PostgreSQL, MongoDB, Redis) and queues. |
| **Primary Challenges** | Cross-browser compatibility, web performance, accessibility. | Concurrency, scalability, API security, database optimization, caching. |`;

    return makeResponse(reply, [
      'Explain RESTful API principles',
      'What is the difference between SQL and NoSQL?',
      'Write a Python program to reverse a string'
    ]);
  }

  // ==========================================
  // 12. ACTIVE PLACEMENT DRIVES (FROM DATABASE)
  // ==========================================
  if (
    query.includes('placement drive') ||
    query.includes('current drive') ||
    query.includes('open drive') ||
    query.includes('active drive') ||
    query.includes('what drives') ||
    query.includes('which companies') ||
    query === 'drives'
  ) {
    if (drives && drives.length > 0) {
      const driveList = drives.map((d, index) => {
        const company = d.company?.companyName || 'Recruiter';
        const role = d.jobRole || d.title || 'Software Engineer';
        const pkg = d.salary ? `₹${(d.salary / 100000).toFixed(1)} LPA` : 'Competitive';
        const minCgpa = d.eligibility?.minCGPA || 0;
        const branches = (d.eligibility?.departments || []).join(', ') || 'All Branches';
        const deadline = d.registrationDeadline ? new Date(d.registrationDeadline).toLocaleDateString() : 'Rolling';
        const loc = d.location || 'Pan India';

        return `• **${index + 1}. ${company} — ${role}**\n  - Package: **${pkg}** | Location: ${loc}\n  - Eligibility: Min CGPA **${minCgpa}** | Branches: ${branches}\n  - Registration Deadline: ${deadline}`;
      }).join('\n\n');

      const reply = `### 🏢 Active Campus Placement Drives (${drives.length} Open)\n\n${driveList}\n\n👉 Review complete job descriptions and submit applications under the **Placement Drives** section.`;
      return makeResponse(reply, [
        'Am I eligible for active drives?',
        'How can I improve my ATS score for these drives?',
        'Show my current applications'
      ]);
    }

    return makeResponse(
      `There are currently **0 active placement drives** open for registration in the campus database.\n\nPlease check back soon or monitor the TPO announcements board for upcoming visits.`,
      ['How can I improve my resume ATS score?', 'Can you suggest a 30-day placement preparation plan?']
    );
  }

  // ==========================================
  // 13. ELIGIBILITY CHECKS (FROM DATABASE)
  // ==========================================
  if (
    query.includes('eligible') ||
    query.includes('eligibility') ||
    query.includes('can i apply')
  ) {
    if (!drives || drives.length === 0) {
      return makeResponse(
        `There are currently no active placement drives in the campus portal database to evaluate eligibility against.`,
        ['How can I improve my resume ATS score?', 'Can you suggest a 30-day placement preparation plan?']
      );
    }

    if (cgpa === null) {
      return makeResponse(
        `Your profile does not currently have a **CGPA** recorded. Eligibility calculations require your current CGPA and branch to verify minimum recruiter cutoffs. Please update your profile details under **Profile** settings.`,
        ['What are the current placement drives?', 'How can I improve my resume ATS score?']
      );
    }

    const eligible = [];
    const ineligible = [];

    drives.forEach(d => {
      const minCgpa = d.eligibility?.minCGPA || 0;
      const deptList = (d.eligibility?.departments || []).map(x => x.toLowerCase().trim());
      const cgpaOk = cgpa >= minCgpa;
      const deptOk = deptList.length === 0 || deptList.includes(department.toLowerCase()) || deptList.includes('all');

      const comp = d.company?.companyName || 'Recruiter';
      const role = d.jobRole || d.title || 'Role';
      const pkg = d.salary ? `₹${(d.salary / 100000).toFixed(1)} LPA` : 'Competitive';

      if (cgpaOk && deptOk) {
        eligible.push(`• **${comp}** (*${role}*) — ${pkg} (Cutoff: ${minCgpa} CGPA)`);
      } else {
        const reason = !cgpaOk ? `Requires ${minCgpa} CGPA (your CGPA: ${cgpa})` : `Branch restricted to ${d.eligibility?.departments?.join(', ')}`;
        ineligible.push(`• **${comp}** (*${role}*) — Ineligible (${reason})`);
      }
    });

    let reply = `Based on your profile (**CGPA: ${cgpa}**, Branch: **${department}**):\n\n`;
    if (eligible.length > 0) {
      reply += `#### ✅ You are Eligible for (${eligible.length} drive${eligible.length > 1 ? 's' : ''}):\n${eligible.join('\n')}\n\n`;
    } else {
      reply += `#### ℹ️ Eligible Drives (0):\nYou do not currently meet the cutoff criteria for ongoing drives.\n\n`;
    }

    if (ineligible.length > 0) {
      reply += `#### ❌ Currently Ineligible for (${ineligible.length}):\n${ineligible.join('\n')}\n\n`;
    }

    reply += `👉 Apply for eligible drives directly from the **Placement Drives** tab.`;
    return makeResponse(reply, [
      'What are the current placement drives?',
      'How can I improve my resume ATS score?',
      'Show my current applications'
    ]);
  }

  // ==========================================
  // 14. INTERVIEWS & APPLICATIONS STATUS
  // ==========================================
  if (query.includes('my interview') || query.includes('upcoming interview') || query.includes('interview schedule')) {
    if (interviews && interviews.length > 0) {
      const list = interviews.map((i, idx) => {
        const comp = i.company?.companyName || 'Company';
        const role = i.placementDrive?.jobRole || i.placementDrive?.title || 'Technical Role';
        const dateStr = i.scheduledDate ? new Date(i.scheduledDate).toLocaleString() : 'Date TBD';
        const round = i.round ? i.round.toUpperCase() : 'TECHNICAL';
        const link = i.joinLink ? ` | [Meeting Link](${i.joinLink})` : '';
        return `• **${idx + 1}. ${comp} — ${role}**\n  - Round: \`${round}\` | Time: **${dateStr}** | Status: **${i.status || 'scheduled'}**${link}`;
      }).join('\n\n');

      return makeResponse(`### 📅 Scheduled Interviews (${interviews.length})\n\n${list}`, [
        'How should I prepare for a technical interview?',
        'Give me tips for HR behavioral rounds',
        'Show my current applications'
      ]);
    }

    return makeResponse(
      `You currently have **0 scheduled interviews** in the portal database. When recruiters review and shortlist your application, interview invitations will appear here and in your **Interviews** tab.`,
      ['Show my current applications', 'What are the current placement drives?']
    );
  }

  if (query.includes('application') || query.includes('my applications') || query.includes('applied')) {
    if (applications && applications.length > 0) {
      const list = applications.map((a, idx) => {
        const comp = a.company?.companyName || 'Company';
        const role = a.placementDrive?.jobRole || a.placementDrive?.title || 'Role';
        const st = (a.status || 'pending').toUpperCase();
        const date = a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : 'Recent';
        return `• **${idx + 1}. ${comp}** (*${role}*) — Status: **${st}** (Applied: ${date})`;
      }).join('\n');

      return makeResponse(`### 📋 Your Submitted Applications (${applications.length})\n\n${list}`, [
        'Show my upcoming interviews',
        'What are the current placement drives?',
        'How can I improve my resume ATS score?'
      ]);
    }

    return makeResponse(
      `You have not submitted any applications to campus placement drives yet. Explore active opportunities in the **Placement Drives** section.`,
      ['What are the current placement drives?', 'Am I eligible for active drives?']
    );
  }

  // ==========================================
  // 15. MATHEMATICAL & APTITUDE QUESTIONS
  // ==========================================
  if (query.includes('speed') && query.includes('distance') || query.includes('train problem') || query.includes('work and time') || query.includes('probability')) {
    return makeResponse(
      `For quantitative aptitude questions, follow the standard formula:
- **Speed, Distance & Time:** $\\text{Speed} = \\frac{\\text{Distance}}{\\text{Time}}$. To convert km/h to m/s, multiply by $\\frac{5}{18}$.
- **Work & Time:** If A does work in $X$ days and B in $Y$ days, combined work per day is $\\frac{1}{X} + \\frac{1}{Y} = \\frac{X+Y}{XY}$ (completed in $\\frac{XY}{X+Y}$ days).
- **Probability:** $P(E) = \\frac{\\text{Favorable Outcomes}}{\\text{Total Outcomes}}$.

Provide a specific problem statement and I will calculate the exact solution step-by-step!`,
      ['Can you suggest a 30-day placement preparation plan?', 'How should I prepare for a technical interview?']
    );
  }

  // ==========================================
  // 16. YES / NO QUESTIONS
  // ==========================================
  if (/^is\s|can\s|does\s|do\s|will\s|should\s/i.test(query)) {
    if (query.includes('ats score') && (query.includes('important') || query.includes('matter'))) {
      return makeResponse(
        `**Yes.** An ATS score is critical during campus recruitment drives because automated filters screen out resumes that lack required technical keywords or proper formatting before human recruiters ever review them.`,
        ['How can I improve my resume ATS score?', 'What are the current placement drives?']
      );
    }
  }

  // ==========================================
  // 17. HONEST DEFAULT / LIMITATION ACKNOWLEDGEMENT
  // ==========================================
  return makeResponse(
    `I understand you are asking about: **"${rawQuery}"**.

As your campus placement assistant, I specialize in:
- **Campus Placement Telemetry:** Open company drives, cutoffs, eligibility, and interviews.
- **Resume & ATS Audits:** Keyword optimization and scoring mechanics.
- **Core Computer Science:** DSA, OOP, DBMS/SQL, Web Development, and Machine Learning.
- **Preparation Plans:** Technical interview strategies and 30-day roadmaps.

If you are looking for specific company policies or unlisted records, that information is not available in the campus portal database. Please clarify your question or pick a prompt below!`,
    [
      'What is data structures and algorithms?',
      'How can I improve my resume ATS score?',
      'Can you suggest a 30-day placement preparation plan?'
    ]
  );
};
