/**
 * AI Mock Interview & Placement Score Engine
 * Generates tailored interview questions based on Company JD, Job Role, and Tech Stack.
 * Evaluates candidate responses and calculates Placement Readiness Score.
 */

const QUESTION_BANK = {
  java: [
    {
      question: "Explain the internal working of HashMap in Java. How are hash collisions resolved in Java 8+?",
      category: "technical",
      difficulty: "medium",
      topic: "Java",
      expectedKeyPoints: ["hashCode()", "equals()", "bucket array", "LinkedList", "TreeNode", "Red-Black Tree when threshold > 8", "O(log n) lookup"],
      modelAnswer: "HashMap uses an array of Node buckets. When a key is inserted, its hashCode() determines the bucket index. If collisions occur, items are initially chained in a linked list. In Java 8+, once bucket size exceeds 8 (TREEIFY_THRESHOLD) and table capacity >= 64, the bucket transforms into a balanced Red-Black Tree, improving worst-case search complexity from O(n) to O(log n)."
    },
    {
      question: "What is the difference between fail-fast and fail-safe iterators in Java? Give examples.",
      category: "technical",
      difficulty: "medium",
      topic: "Java",
      expectedKeyPoints: ["ConcurrentModificationException", "modCount", "cloned copy", "ArrayList vs CopyOnWriteArrayList"],
      modelAnswer: "Fail-fast iterators (e.g. ArrayList, HashMap) immediately throw ConcurrentModificationException if the collection is structurally modified during iteration using an internal modCount check. Fail-safe iterators (e.g. CopyOnWriteArrayList, ConcurrentHashMap) operate on a cloned copy or weakly consistent view of the collection and never throw ConcurrentModificationException."
    }
  ],
  'spring boot': [
    {
      question: "How does Spring Boot auto-configuration work internally? Explain the role of @EnableAutoConfiguration and @Conditional annotations.",
      category: "technical",
      difficulty: "hard",
      topic: "Spring Boot",
      expectedKeyPoints: ["@SpringBootApplication", "@EnableAutoConfiguration", "spring.factories", "AutoConfigurationImportSelector", "@ConditionalOnClass", "@ConditionalOnMissingBean"],
      modelAnswer: "Spring Boot auto-configuration uses @EnableAutoConfiguration which activates AutoConfigurationImportSelector. This reads configuration classes listed in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports. Each configuration class uses conditional annotations like @ConditionalOnClass and @ConditionalOnMissingBean to configure beans only when dependencies are present on classpath and no custom bean is defined."
    },
    {
      question: "How do you handle database transactions and rollbacks in Spring Boot using @Transactional?",
      category: "technical",
      difficulty: "medium",
      topic: "Spring Boot",
      expectedKeyPoints: ["AOP proxy", "rollbackFor RuntimeException", "checked vs unchecked exceptions", "propagation levels", "isolation"],
      modelAnswer: "@Transactional creates an AOP proxy around the method. By default, Spring only rolls back for unchecked exceptions (RuntimeException and Error). To roll back for checked exceptions, specify @Transactional(rollbackFor = Exception.class). Transaction propagation like REQUIRED or REQUIRES_NEW manages nesting across service calls."
    }
  ],
  sql: [
    {
      question: "What is the difference between Clustered and Non-Clustered Indexes in SQL, and how does indexing affect SELECT vs INSERT performance?",
      category: "sql_problem",
      difficulty: "medium",
      topic: "SQL",
      expectedKeyPoints: ["physical data order", "one clustered index per table", "B-tree structure", "leaf nodes contain pointers", "faster reads", "overhead on writes"],
      modelAnswer: "A clustered index determines the physical order of data rows in the table; therefore only one clustered index can exist per table (usually primary key). Non-clustered indexes create a separate B-tree structure where leaf nodes point to data rows via pointers. Indexes significantly accelerate SELECT and WHERE queries but introduce overhead on INSERT, UPDATE, and DELETE operations as indexes must be rebalanced."
    },
    {
      question: "Explain the difference between WHERE and HAVING clauses, and how SQL execution order impacts aggregation.",
      category: "sql_problem",
      difficulty: "easy",
      topic: "SQL",
      expectedKeyPoints: ["WHERE filters before GROUP BY", "HAVING filters after aggregation", "aggregate functions like COUNT, SUM, AVG", "execution order"],
      modelAnswer: "The WHERE clause filters individual rows before grouping and aggregation takes place; it cannot contain aggregate functions. The HAVING clause filters grouped rows after the GROUP BY clause and can evaluate aggregate functions like SUM(amount) > 1000. In SQL execution flow: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY."
    }
  ],
  react: [
    {
      question: "Explain how React's Virtual DOM and Reconciliation algorithm (Fiber) optimize UI updates.",
      category: "technical",
      difficulty: "medium",
      topic: "React",
      expectedKeyPoints: ["virtual representation", "diffing algorithm", "batched DOM updates", "Fiber architecture", "incremental rendering", "keys"],
      modelAnswer: "React maintains a lightweight Virtual DOM in memory. When state changes, a new VDOM tree is generated and compared against the previous tree using a heuristic diffing algorithm (Reconciliation). React Fiber enables asynchronous, incremental rendering with priority-based scheduling, batching updates to commit minimal DOM changes."
    },
    {
      question: "What are the key rules of React Hooks, and why must useEffect dependencies be carefully managed?",
      category: "technical",
      difficulty: "medium",
      topic: "React",
      expectedKeyPoints: ["call hooks at top level", "call only inside React components/custom hooks", "infinite re-renders", "stale closures", "cleanup function"],
      modelAnswer: "Hooks must only be called at the top level (never in loops or conditions) to ensure React maintains state across renders. Dependency arrays in useEffect prevent stale closures and infinite re-render loops by synchronizing external side-effects when dependencies change."
    }
  ],
  dsa: [
    {
      question: "How would you detect a cycle in a singly linked list with O(1) auxiliary space, and how do you find the entry point of the cycle?",
      category: "coding",
      difficulty: "medium",
      topic: "DSA",
      expectedKeyPoints: ["Floyd's Cycle-Finding Algorithm", "slow and fast pointers", "tortoise and hare", "meet at node", "reset one pointer to head", "move both by 1 step"],
      modelAnswer: "Use Floyd's Cycle-Finding Algorithm (Slow and Fast pointers). Advance slow by 1 step and fast by 2 steps. If fast meets slow, a cycle exists. To find the cycle entry node: keep one pointer at collision and move another to head; increment both by 1 step until they meet."
    }
  ],
  system_design: [
    {
      question: "How would you design a rate limiter for a public REST API? What algorithms and caching layers would you use?",
      category: "system_design",
      difficulty: "hard",
      topic: "System Design",
      expectedKeyPoints: ["Token Bucket", "Leaky Bucket", "Sliding Window Log / Counter", "Redis", "HTTP 429 Too Many Requests", "headers Retry-After", "distributed locks"],
      modelAnswer: "A distributed rate limiter can be built using Redis and the Token Bucket or Sliding Window Counter algorithm. Each client (by IP or API Key) has a counter in Redis with TTL. If requests exceed threshold, return HTTP 429 Too Many Requests with a Retry-After header. In distributed environments, Redis Lua scripts ensure atomic increments without race conditions."
    }
  ],
  behavioral: [
    {
      question: "Tell me about a situation where a technical project hit a blocker or critical bug right before a deadline. How did you handle it?",
      category: "behavioral",
      difficulty: "medium",
      topic: "Behavioral",
      expectedKeyPoints: ["STAR method (Situation, Task, Action, Result)", "root cause analysis", "prioritization", "communication with team", "successful resolution"],
      modelAnswer: "Strong answers use the STAR format: Explain the context, identify the core root cause calmly, describe step-by-step triage (logging, rollbacks, isolation), communicate transparently with stakeholders, and deliver a reliable fix alongside post-mortem preventive measures."
    }
  ]
};

/**
 * Generate targeted interview questions for a given drive / role
 */
export const generateCompanyMockInterview = (drive = {}, role = 'Software Engineer') => {
  const requirements = (drive.requirements || []).map(r => r.toLowerCase().trim());
  const companyName = drive.company?.companyName || drive.title || 'Target Company';
  const selectedQuestions = [];

  // Match JD keywords to question topics
  const topicsFound = new Set();
  for (const req of requirements) {
    for (const key of Object.keys(QUESTION_BANK)) {
      if (req.includes(key) || key.includes(req)) {
        topicsFound.add(key);
      }
    }
  }

  // If few topics found, add standard fullstack/backend defaults
  if (topicsFound.size < 2) {
    if (role.toLowerCase().includes('backend') || role.toLowerCase().includes('java')) {
      topicsFound.add('java');
      topicsFound.add('spring boot');
      topicsFound.add('sql');
    } else if (role.toLowerCase().includes('frontend') || role.toLowerCase().includes('react')) {
      topicsFound.add('react');
      topicsFound.add('dsa');
    } else {
      topicsFound.add('java');
      topicsFound.add('sql');
      topicsFound.add('dsa');
    }
  }

  // Collect questions from matching topics
  for (const topic of topicsFound) {
    const pool = QUESTION_BANK[topic] || [];
    if (pool.length > 0) {
      selectedQuestions.push(...pool);
    }
  }

  // Always include a system design or architecture question
  selectedQuestions.push(QUESTION_BANK.system_design[0]);
  // Always include a behavioral question
  selectedQuestions.push(QUESTION_BANK.behavioral[0]);

  // Deduplicate and cap to 5 questions
  const finalQuestions = selectedQuestions.slice(0, 5).map((q, idx) => ({
    questionId: `Q-${idx + 1}`,
    question: q.question,
    category: q.category,
    topic: q.topic,
    difficulty: q.difficulty,
    expectedKeyPoints: q.expectedKeyPoints,
    studentAnswer: '',
    score: 0,
    feedback: '',
    modelAnswer: q.modelAnswer,
    strengths: [],
    missingPoints: [],
    isAnswered: false
  }));

  return {
    companyName,
    targetRole: drive.jobRole || role,
    jdRequirements: drive.requirements || Array.from(topicsFound),
    questions: finalQuestions
  };
};

/**
 * Evaluates student answer against expected key points and technical depth
 */
export const evaluateAnswer = (question = {}, studentAnswer = '') => {
  const answer = (studentAnswer || '').trim();
  const lowerAnswer = answer.toLowerCase();
  const keyPoints = question.expectedKeyPoints || [];

  if (answer.length < 20) {
    return {
      score: 25,
      strengths: [],
      missingPoints: keyPoints,
      feedback: "Answer is too brief. In a real technical interview, explain the underlying mechanism, trade-offs, and concrete examples.",
      modelAnswer: question.modelAnswer
    };
  }

  const coveredPoints = [];
  const missingPoints = [];

  for (const kp of keyPoints) {
    const terms = kp.toLowerCase().split(/[\s,()\/]+/).filter(w => w.length > 3);
    const hasTerm = terms.some(t => lowerAnswer.includes(t));
    if (hasTerm || lowerAnswer.includes(kp.toLowerCase())) {
      coveredPoints.push(kp);
    } else {
      missingPoints.push(kp);
    }
  }

  // Word count & depth score
  let lengthBonus = 0;
  if (answer.split(/\s+/).length >= 50) lengthBonus = 15;
  else if (answer.split(/\s+/).length >= 30) lengthBonus = 10;

  const coverageRatio = keyPoints.length > 0 ? (coveredPoints.length / keyPoints.length) : 0.8;
  let rawScore = Math.round((coverageRatio * 75) + lengthBonus + 10);
  rawScore = Math.max(30, Math.min(98, rawScore));

  const strengths = [];
  if (coveredPoints.length > 0) {
    strengths.push(`Clearly articulated core concepts: ${coveredPoints.slice(0, 3).join(', ')}.`);
  }
  if (answer.split(/\s+/).length >= 40) {
    strengths.push("Good descriptive depth with structured explanation.");
  }

  let feedback = "";
  if (rawScore >= 80) {
    feedback = "Excellent response! Shows strong conceptual command and covers critical technical nuances expected in top-tier interviews.";
  } else if (rawScore >= 60) {
    feedback = `Good foundational answer. To elevate it to hire-level, dive deeper into: ${missingPoints.slice(0, 2).join(', ')}.`;
  } else {
    feedback = `Needs more technical precision. Ensure you discuss key fundamentals like: ${missingPoints.slice(0, 3).join(', ')}.`;
  }

  return {
    score: rawScore,
    strengths,
    missingPoints,
    feedback,
    modelAnswer: question.modelAnswer
  };
};

/**
 * Calculates overall Placement Score, topic breakdown, and readiness summary
 */
export const calculatePlacementScore = (interviewDoc) => {
  const questions = interviewDoc.questions || [];
  const answered = questions.filter(q => q.isAnswered);

  if (answered.length === 0) {
    return {
      overallScore: 0,
      placementReadinessScore: 0,
      readinessStatus: 'Not Evaluated',
      topicBreakdown: [],
      strengthsSummary: [],
      improvementRoadmap: []
    };
  }

  const totalScore = answered.reduce((acc, q) => acc + (q.score || 0), 0);
  const avgScore = Math.round(totalScore / answered.length);

  // Group by topic
  const topicMap = {};
  for (const q of answered) {
    const t = q.topic || 'General';
    if (!topicMap[t]) topicMap[t] = { total: 0, count: 0 };
    topicMap[t].total += (q.score || 0);
    topicMap[t].count += 1;
  }

  const topicBreakdown = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    score: Math.round(data.total / data.count),
    count: data.count
  }));

  let readinessStatus = 'Needs Practice';
  if (avgScore >= 80) readinessStatus = 'Ready for Technical Rounds';
  else if (avgScore >= 65) readinessStatus = 'Moderate Readiness - Target Gaps';

  const strengthsSummary = [];
  const improvementRoadmap = [];

  for (const tb of topicBreakdown) {
    if (tb.score >= 75) {
      strengthsSummary.push(`Strong performance in ${tb.topic} (${tb.score}/100)`);
    } else {
      improvementRoadmap.push(`Review key architectural patterns and edge-cases in ${tb.topic} (Current: ${tb.score}/100)`);
    }
  }

  if (strengthsSummary.length === 0) {
    strengthsSummary.push("Demonstrated active attempt across all interview technical domains.");
  }
  if (improvementRoadmap.length === 0) {
    improvementRoadmap.push("Maintain consistency by practicing timed mock system design interviews.");
  }

  return {
    overallScore: avgScore,
    placementReadinessScore: Math.round(avgScore * 0.9 + 5), // weighted readiness index
    readinessStatus,
    topicBreakdown,
    strengthsSummary,
    improvementRoadmap
  };
};
