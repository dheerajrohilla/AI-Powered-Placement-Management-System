/**
 * AI-Powered Subjective Answer Evaluator
 * Evaluates candidate text responses against strict weighted rubrics.
 * Detects covered concepts, missing concepts, technical inaccuracies, and alternative valid explanations.
 * Converts rubric percentages proportionally into assigned question marks.
 */

const DEFAULT_TECHNICAL_RUBRIC = [
  { criterion: "Technical Correctness & Accuracy", weight: 40, description: "Correctness of statements, absence of technical fallacies, accurate terminology." },
  { criterion: "Coverage of Essential Concepts", weight: 25, description: "Mentions fundamental mechanisms, key algorithms, parameters, or edge cases." },
  { criterion: "Reasoning, Trade-offs & Depth", weight: 20, description: "Explains WHY mechanisms work, time/space trade-offs, and underlying architecture." },
  { criterion: "Clarity, Organization & Terminology", weight: 15, description: "Structured explanation, concise communication, proper naming." }
];

const DEFAULT_HR_RUBRIC = [
  { criterion: "Relevance & Direct Answer", weight: 30, description: "Directly addresses the prompt without evading or digressing." },
  { criterion: "STAR Structure & Concrete Examples", weight: 30, description: "Uses Situation, Task, Action, Result framework with demonstrable personal ownership." },
  { criterion: "Professionalism & Communication Quality", weight: 20, description: "Respectful tone, articulate phrasing, composure, and positive framing." },
  { criterion: "Depth, Authenticity & Self-Awareness", weight: 20, description: "Genuine insights, honest reflection, and career alignment." }
];

// Technical common fallacies/misconceptions detector
const COMMON_MISCONCEPTIONS = [
  { pattern: /hashmap.*o\(1\).*worst.*case/i, error: "Incorrect claim: HashMap worst-case search is O(n) (or O(log n) in Java 8+ trees), NOT O(1)." },
  { pattern: /stack.*stores.*objects/i, error: "Misconception: Object instances in Java are allocated on the Heap; the Stack only holds local references and primitive values." },
  { pattern: /tcp.*faster.*than.*udp/i, error: "Technical inaccuracy: TCP has acknowledgment, handshake, and retransmission overhead, making it slower and more latency-sensitive than UDP." },
  { pattern: /primary.*key.*can.*be.*null/i, error: "SQL error: Primary keys must be strictly UNIQUE and NOT NULL." },
  { pattern: /delete.*drops.*table.*structure/i, error: "SQL error: DELETE removes rows; it does NOT drop the table schema (DROP TABLE does)." },
  { pattern: /abstract.*class.*cannot.*have.*constructors/i, error: "Java/C++ error: Abstract classes CAN have constructors; they are invoked via super() during subclass instantiation." },
  { pattern: /index.*(slows? down|degrades?).*(read|lookup|search|queries)/i, error: "Technical error: B-tree indexes accelerate read queries, not slow them down." },
  { pattern: /does not use b-trees|not use b-trees/i, error: "Factual error: Standard relational database indexes predominantly use B-trees / B+ trees." }
];

/**
 * Main Subjective Evaluation Function
 */
export const evaluateSubjectiveAnswer = async (question = {}, studentAnswer = '') => {
  const answer = (studentAnswer || '').toString().trim();
  const maxMarks = question.maxMarks || 10;
  const expectedKeyPoints = question.expectedKeyPoints || [];
  const modelAnswer = question.modelAnswer || question.explanation || (expectedKeyPoints.length > 0 ? expectedKeyPoints.join('. ') + '.' : 'A complete model answer outlines core principles and structural examples.');
  const isHR = question.category === 'hr' || question.category === 'behavioral';
  const rubric = (question.rubric && question.rubric.length > 0)
    ? question.rubric
    : (isHR ? DEFAULT_HR_RUBRIC : DEFAULT_TECHNICAL_RUBRIC);

  // 1. BLANK OR TRIVIAL ANSWER POLICY
  if (!answer || answer.length < 5) {
    const rubricScores = rubric.map(r => ({
      criterion: r.criterion,
      weight: r.weight,
      scoreAwarded: 0,
      maxScore: r.weight,
      feedback: "No substantive response provided."
    }));

    return {
      scoreAwarded: 0,
      maxMarks,
      percentage: 0,
      rubricScores,
      coveredPoints: [],
      missingPoints: expectedKeyPoints,
      incorrectStatements: [],
      feedback: "Answer is blank or contains insufficient content (0 marks awarded).",
      improvementSuggestions: ["Provide a complete response addressing the core prompt with key technical points and examples."],
      modelAnswer
    };
  }

  // 2. DETECT INCORRECT STATEMENTS & FALLACIES
  const incorrectStatements = [];
  for (const item of COMMON_MISCONCEPTIONS) {
    if (item.pattern.test(answer)) {
      incorrectStatements.push(item.error);
    }
  }

  // 3. SEMANTIC KEY POINT COVERAGE
  const lowerAnswer = answer.toLowerCase();
  const coveredPoints = [];
  const missingPoints = [];
  const stopWords = new Set(['this', 'that', 'with', 'from', 'have', 'were', 'which', 'their', 'there', 'before', 'after', 'where', 'when', 'what']);

  for (const kp of expectedKeyPoints) {
    const kpClean = kp.toLowerCase();
    const directMatch = lowerAnswer.includes(kpClean);
    const subTerms = kpClean.split(/[\s,()\/]+/).filter(w => w.length > 3 && !stopWords.has(w));
    const matchingTermCount = subTerms.filter(term => {
      const stem = term.length > 4 ? term.slice(0, 4) : term;
      return lowerAnswer.includes(term) || lowerAnswer.includes(stem);
    }).length;
    const termRatio = subTerms.length > 0 ? (matchingTermCount / subTerms.length) : 0;
    const isFaultIsolationSynonym = kpClean.includes('fault') && (lowerAnswer.includes('fault') || lowerAnswer.includes('crash'));
    const isCovered = directMatch || termRatio >= 0.16 || matchingTermCount >= 2 || isFaultIsolationSynonym;

    if (isCovered) {
      coveredPoints.push(kp);
    } else {
      missingPoints.push(kp);
    }
  }

  // 4. CRITERIA SCORING LOGIC
  const wordCount = answer.split(/\s+/).length;
  const coverageRatio = expectedKeyPoints.length > 0
    ? (coveredPoints.length / expectedKeyPoints.length)
    : Math.min(1, wordCount / 50);

  let correctnessScore = 0;
  let coverageScore = 0;
  let reasoningScore = 0;
  let clarityScore = 0;

  if (isHR) {
    // HR Evaluation Logic
    // Relevance
    correctnessScore = Math.min(100, Math.max(20, Math.round(coverageRatio * 80 + (wordCount >= 30 ? 20 : 5))));
    // Structure (STAR method presence)
    const hasStarKeywords = /\b(situation|task|action|result|project|team|challenge|handled|solved)\b/i.test(answer);
    coverageScore = Math.min(100, Math.max(25, Math.round((hasStarKeywords ? 45 : 20) + Math.min(50, wordCount))));
    // Professionalism
    const isUnprofessional = /\b(dunno|idk|whatever|stupid|boring|lazy)\b/i.test(answer);
    reasoningScore = isUnprofessional ? 20 : Math.min(100, Math.max(40, Math.round(70 + (wordCount >= 40 ? 25 : 5))));
    // Authenticity
    clarityScore = Math.min(100, Math.max(30, Math.round(60 + (coveredPoints.length > 0 ? 30 : 10))));
  } else {
    // Technical Evaluation Logic
    // Criterion 1: Technical Correctness (Weight 40)
    if (incorrectStatements.length > 0) {
      correctnessScore = 0;
    } else {
      const baseCorrectness = Math.round(coverageRatio * 80) + (wordCount >= 10 ? 20 : 0);
      correctnessScore = Math.max(0, Math.min(100, baseCorrectness));
    }

    // Criterion 2: Concept Coverage (Weight 25)
    coverageScore = incorrectStatements.length > 0 ? Math.min(20, Math.round(coverageRatio * 100)) : Math.max(10, Math.round(coverageRatio * 100));

    // Criterion 3: Reasoning & Depth (Weight 20)
    const explanatorySignals = (answer.match(/\b(because|since|leads to|results in|improving|reducing|complexity|due to|therefore|which means|if|without|prevent|prevents)\b/gi) || []).length;
    reasoningScore = Math.min(100, Math.max(30, Math.round(Math.min(5, explanatorySignals) * 15 + coverageRatio * 25)));

    // Criterion 4: Clarity & Organization (Weight 15)
    const hasFormatting = answer.includes('\n') || answer.includes('•') || answer.includes('-') || answer.includes(':');
    clarityScore = Math.min(100, Math.max(40, (wordCount >= 25 ? 50 : 30) + (hasFormatting ? 30 : 15) + (wordCount <= 300 ? 20 : 0)));
  }

  // Map scores to rubric items
  const criteriaScores = [
    { score: correctnessScore, weight: rubric[0]?.weight || 40, criterion: rubric[0]?.criterion || "Technical Correctness" },
    { score: coverageScore, weight: rubric[1]?.weight || 25, criterion: rubric[1]?.criterion || "Coverage of Essential Concepts" },
    { score: reasoningScore, weight: rubric[2]?.weight || 20, criterion: rubric[2]?.criterion || "Reasoning & Depth" },
    { score: clarityScore, weight: rubric[3]?.weight || 15, criterion: rubric[3]?.criterion || "Clarity & Organization" }
  ];

  let weightedPercentage = 0;
  const rubricScores = criteriaScores.map((c, i) => {
    const rDef = rubric[i] || {};
    const earned = Math.round((c.score / 100) * c.weight * 10) / 10;
    weightedPercentage += earned;

    let critFeedback = "";
    if (c.score >= 80) critFeedback = "Strong execution meeting recruiter standards.";
    else if (c.score >= 50) critFeedback = "Partial coverage; add more technical depth and examples.";
    else critFeedback = "Key criteria missing or flawed explanation.";

    return {
      criterion: c.criterion,
      weight: c.weight,
      scoreAwarded: earned,
      maxScore: c.weight,
      percentage: c.score,
      feedback: critFeedback
    };
  });

  // Calculate final proportional score
  weightedPercentage = Math.max(0, Math.min(100, Math.round(weightedPercentage)));
  const scoreAwarded = Math.round((weightedPercentage / 100) * maxMarks * 10) / 10;

  // Compile constructive feedback & improvement suggestions
  const improvementSuggestions = [];
  if (missingPoints.length > 0) {
    improvementSuggestions.push(`Explicitly cover missing core topics: ${missingPoints.slice(0, 3).join(', ')}.`);
  }
  if (incorrectStatements.length > 0) {
    improvementSuggestions.push(`Correct factual inaccuracies: ${incorrectStatements.join(' ')}`);
  }
  if (wordCount < 40 && !isHR) {
    improvementSuggestions.push("Expand on the underlying architectural trade-offs and runtime complexity.");
  }
  if (isHR && !/\b(result|outcome|impact|achieved)\b/i.test(answer)) {
    improvementSuggestions.push("Always conclude behavioral answers with the tangible result or lesson learned.");
  }
  if (improvementSuggestions.length === 0) {
    improvementSuggestions.push("Solid response! For senior roles, discuss scalability trade-offs and real-world failure modes.");
  }

  let overallFeedback = "";
  if (weightedPercentage >= 85) {
    overallFeedback = "Outstanding response! Thorough, accurate, and articulate. Ready for interview stage.";
  } else if (weightedPercentage >= 65) {
    overallFeedback = "Good foundational knowledge. To reach high-tier hire standards, address the missing key elements highlighted below.";
  } else if (weightedPercentage >= 40) {
    overallFeedback = "Partial credit awarded. Significant conceptual gaps or structural points require deeper revision.";
  } else {
    overallFeedback = "Below expected assessment standard. Review the model answer and essential key points.";
  }

  return {
    scoreAwarded,
    maxMarks,
    percentage: weightedPercentage,
    rubricScores,
    coveredPoints,
    missingPoints,
    incorrectStatements,
    feedback: overallFeedback,
    improvementSuggestions,
    modelAnswer
  };
};

export const evaluateSubjectiveWithRubric = async (question = {}, answer = '') => {
  const result = await evaluateSubjectiveAnswer(question, answer);
  const criteriaScores = {};
  (result.rubricScores || []).forEach(r => {
    const key = r.criterion.includes('Technical') ? 'technicalCorrectness'
      : r.criterion.includes('Essential') ? 'essentialConceptsCoverage'
      : r.criterion.includes('Reasoning') ? 'reasoningAndDepth'
      : 'clarityAndOrganization';
    criteriaScores[key] = r.scoreAwarded;
  });
  return {
    ...result,
    criteriaScores
  };
};

