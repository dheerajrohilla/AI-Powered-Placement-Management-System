process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/placement-db-test-aiprep';

import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../seed/seed.js';
import mongoose from 'mongoose';

import { evaluateMCQAnswer, evaluateNumericalAnswer } from '../utils/objectiveEvaluator.js';
import { evaluateSubjectiveWithRubric } from '../utils/subjectiveEvaluator.js';
import { executeJavaScriptCode, runCodeEvaluation } from '../utils/codeExecutionService.js';
import { evaluateSQLQuery } from '../utils/sqlEvaluator.js';
import {
  generateAssessmentQuestions,
  adjustAdaptiveDifficulty,
  generateComprehensiveReport
} from '../utils/aiPrepEngine.js';
import AssessmentSession from '../models/AssessmentSession.js';

let server;
let studentToken;
let otherStudentToken;

test.before(async () => {
  await connectDB();
  await seedDatabase({ reset: true });
  server = app.listen(0);

  // Login as student 1 (Prajwal)
  const res1 = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'prajwal@student.com', password: 'student123' })
  });
  const data1 = await res1.json();
  studentToken = data1.token;

  // Register and login as student 2 for authorization tests
  const regRes = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rohan Sharma',
      email: 'rohan.sharma@student.com',
      password: 'student123',
      role: 'student',
      usn: '1MS21CS099',
      branch: 'CSE',
      skills: ['Python', 'SQL']
    })
  });
  const regData = await regRes.json();
  otherStudentToken = regData.token;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close(err => (err ? reject(err) : resolve()));
    });
  }
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

// =========================================================================
// UNIT TESTS: OBJECTIVE EVALUATION (Criteria 1, 2, 3)
// =========================================================================

test('Criteria 1: Correct MCQ receives full marks (both letter and text matching)', () => {
  const q = {
    id: 'Q1',
    maxMarks: 4,
    correctAnswer: 'B',
    options: ['Alpha', 'Beta', 'Gamma', 'Delta'],
    negativeMarking: 0
  };

  // Matched by letter
  const resByLetter = evaluateMCQAnswer(q, 'B');
  assert.equal(resByLetter.isCorrect, true);
  assert.equal(resByLetter.scoreAwarded, 4);

  // Matched by option text
  const resByText = evaluateMCQAnswer(q, 'Beta');
  assert.equal(resByText.isCorrect, true);
  assert.equal(resByText.scoreAwarded, 4);
});

test('Criteria 2: Incorrect MCQ receives 0 or configured negative marking', () => {
  const q1 = {
    id: 'Q1',
    maxMarks: 4,
    correctAnswer: 'A',
    options: ['Alpha', 'Beta', 'Gamma', 'Delta'],
    negativeMarking: 0
  };
  const res1 = evaluateMCQAnswer(q1, 'C');
  assert.equal(res1.isCorrect, false);
  assert.equal(res1.scoreAwarded, 0);

  // Configured negative marking
  const q2 = { ...q1, negativeMarking: 1 };
  const res2 = evaluateMCQAnswer(q2, 'D');
  assert.equal(res2.isCorrect, false);
  assert.equal(res2.scoreAwarded, -1);
});

test('Criteria 3: Unanswered question receives 0 marks without negative marking', () => {
  const q = {
    id: 'Q1',
    maxMarks: 4,
    correctAnswer: 'A',
    options: ['Alpha', 'Beta'],
    negativeMarking: 1
  };
  const resEmpty = evaluateMCQAnswer(q, '');
  assert.equal(resEmpty.isCorrect, false);
  assert.equal(resEmpty.scoreAwarded, 0);

  const resNull = evaluateMCQAnswer(q, null);
  assert.equal(resNull.scoreAwarded, 0);
});

test('Criteria 1 & 2 (Numerical): Tolerance validation & conceptual vs calculation mistake', () => {
  const q = {
    id: 'Q-NUM',
    maxMarks: 5,
    correctAnswer: '0.17',
    numericalTolerance: 0.02
  };

  // Exact match
  const resExact = evaluateNumericalAnswer(q, '0.17');
  assert.equal(resExact.isCorrect, true);
  assert.equal(resExact.scoreAwarded, 5);

  // Within tolerance (0.16 is within 0.02 of 0.17)
  const resTol = evaluateNumericalAnswer(q, '0.16');
  assert.equal(resTol.isCorrect, true);
  assert.equal(resTol.scoreAwarded, 5);

  // Close minor calculation error gets partial credit
  const resClose = evaluateNumericalAnswer(q, '0.20');
  assert.equal(resClose.isCorrect, false);
  assert.ok(resClose.isCalculationMistake);
  assert.ok(resClose.scoreAwarded > 0 && resClose.scoreAwarded < 5);

  // Completely off value gets 0 (conceptual mistake)
  const resFar = evaluateNumericalAnswer(q, '42');
  assert.equal(resFar.isCorrect, false);
  assert.equal(resFar.scoreAwarded, 0);
});

// =========================================================================
// UNIT TESTS: SUBJECTIVE RUBRIC EVALUATION (Criteria 4, 5, 6, 7, 8, 9)
// =========================================================================

test('Criteria 4, 7, 9: Partial subjective answer receives proportional rubric marks and never exceeds maxMarks', async () => {
  const q = {
    id: 'SUBJ-1',
    questionText: 'Explain the difference between Optimistic and Pessimistic Concurrency Control in DBMS.',
    maxMarks: 10,
    expectedKeyPoints: [
      'Pessimistic concurrency control acquires locks before accessing data',
      'Optimistic concurrency control allows transactions without locks and validates at commit',
      'Pessimistic is suited for high-conflict environments to avoid rollback overhead',
      'Optimistic is best for low-contention environments with read-heavy workloads'
    ]
  };

  // Answer covers partial points
  const partialAnswer = 'Pessimistic locking takes locks in advance to prevent conflicts. Optimistic assumes no conflict occurs.';
  const evalResult = await evaluateSubjectiveWithRubric(q, partialAnswer);

  assert.ok(evalResult.scoreAwarded > 0, 'Score should be positive');
  assert.ok(evalResult.scoreAwarded < 10, 'Score should be partial');
  assert.ok(evalResult.scoreAwarded <= q.maxMarks, 'Score should not exceed maximum');
  assert.ok(evalResult.criteriaScores.technicalCorrectness > 0);
  assert.ok(evalResult.criteriaScores.essentialConceptsCoverage > 0);
  assert.ok(Array.isArray(evalResult.coveredPoints));
  assert.ok(Array.isArray(evalResult.missingPoints));
  assert.ok(evalResult.modelAnswer);
});

test('Criteria 5: Technically incorrect subjective answer is penalized for misconceptions', async () => {
  const q = {
    id: 'SUBJ-2',
    questionText: 'How does indexing improve SQL database query performance?',
    maxMarks: 10,
    expectedKeyPoints: [
      'B-tree indexes provide O(log n) lookup time',
      'Indexes reduce the need for full table scans'
    ]
  };

  // Student makes a blatant error
  const incorrectAnswer = 'An index is bad because indexing always slows down read queries and does not use B-trees.';
  const evalResult = await evaluateSubjectiveWithRubric(q, incorrectAnswer);

  assert.ok(evalResult.incorrectStatements.length > 0, 'Should detect misconceptions');
  assert.ok(evalResult.scoreAwarded <= 3, 'Should heavily penalize misconceptions');
});

test('Criteria 6: Valid alternative answer is recognized without requiring word-for-word reproduction', async () => {
  const q = {
    id: 'SUBJ-3',
    questionText: 'What is the advantage of using a microservices architecture over a monolith?',
    maxMarks: 8,
    expectedKeyPoints: [
      'Independent scalability of distinct services',
      'Decoupled technology stack per service',
      'Fault isolation prevents single point of failure'
    ]
  };

  // High quality alternative phrasing
  const alternativeAnswer = 'Microservices decouple domain logic into autonomous services. If service A crashes, service B keeps functioning (fault tolerance). Teams can also deploy changes independently without coordinating a monolithic build.';
  const evalResult = await evaluateSubjectiveWithRubric(q, alternativeAnswer);

  assert.ok(evalResult.percentage >= 70, 'Alternative phrasing should score well');
  assert.ok(evalResult.scoreAwarded >= 5.6);
});

// =========================================================================
// UNIT TESTS: CODE & SQL EXECUTION (Criteria 10, 11)
// =========================================================================

test('Criteria 10: Coding evaluation executes test cases in sandbox and handles pass/fail accurately', async () => {
  const q = {
    id: 'CODING-1',
    maxMarks: 10,
    testCases: [
      { input: [1, 2], expectedOutput: 3, isHidden: false, weight: 1 },
      { input: [5, 7], expectedOutput: 12, isHidden: true, weight: 1 }
    ]
  };

  // Correct implementation
  const passingCode = 'function solution(a, b) { return a + b; }';
  const passRes = await runCodeEvaluation(q, passingCode, 'javascript');
  assert.equal(passRes.isCorrect, true);
  assert.equal(passRes.scoreAwarded, 10);
  assert.equal(passRes.passedTestsCount, 2);

  // Incorrect implementation
  const failingCode = 'function solution(a, b) { return a - b; }';
  const failRes = await runCodeEvaluation(q, failingCode, 'javascript');
  assert.equal(failRes.isCorrect, false);
  assert.equal(failRes.passedTestsCount, 0);
  assert.equal(failRes.scoreAwarded, 0);

  // Runtime error handling without crashing
  const errorThrowingCode = 'function solution(a, b) { throw new Error("Boom"); }';
  const errRes = await runCodeEvaluation(q, errorThrowingCode, 'javascript');
  assert.equal(errRes.isCorrect, false);
  assert.equal(errRes.scoreAwarded, 0);
});

test('Criteria 10 (Security): Sandboxed VM blocks process and dangerous modules', async () => {
  const maliciousCode = 'function solution() { return typeof process !== "undefined" ? process.exit(1) : "safe"; }';
  const res = await executeJavaScriptCode(maliciousCode, []);
  assert.equal(res.status, 'SECURITY_VIOLATION');
  assert.equal(res.success, false);
});

test('Criteria 11: SQL evaluation accurately checks queries against schema requirements', () => {
  const q = {
    id: 'SQL-1',
    maxMarks: 8,
    sqlExpectedQuery: 'SELECT department, AVG(salary) FROM employees WHERE status = "active" GROUP BY department HAVING AVG(salary) > 50000',
    sqlSchema: 'employees(id, name, department, salary, status)'
  };

  // Valid query
  const validSQL = 'SELECT department, AVG(salary) as avg_sal FROM employees WHERE status = "active" GROUP BY department HAVING AVG(salary) > 50000;';
  const validRes = evaluateSQLQuery(q, validSQL);
  assert.equal(validRes.isCorrect, true);
  assert.equal(validRes.scoreAwarded, 8);

  // Missing GROUP BY
  const invalidSQL = 'SELECT department, salary FROM employees WHERE status = "active"';
  const invalidRes = evaluateSQLQuery(q, invalidSQL);
  assert.equal(invalidRes.isCorrect, false);
  assert.ok(invalidRes.scoreAwarded < 8);
  assert.ok(invalidRes.missingPoints.some(p => p.toLowerCase().includes('group by')));
});

// =========================================================================
// UNIT TESTS: ADAPTIVE DIFFICULTY & GENERATION (Criteria 8, 18)
// =========================================================================

test('Criteria 18: Mixed mode question generation includes both objective and subjective questions', () => {
  const questions = generateAssessmentQuestions({
    category: 'technical',
    topics: ['Data Structures & Algorithms', 'DBMS & SQL'],
    difficulty: 'medium',
    questionCount: 6,
    questionMix: 'mixed'
  });

  assert.equal(questions.length, 6);
  const hasObjective = questions.some(q => q.type === 'mcq' || q.type === 'numerical');
  const hasSubjectiveOrPractical = questions.some(q => ['short_answer', 'long_answer', 'coding', 'sql'].includes(q.type));
  assert.ok(hasObjective, 'Should include objective questions');
  assert.ok(hasSubjectiveOrPractical, 'Should include subjective or practical questions');
});

test('Criteria 8: Adaptive difficulty adjusts correctly based on performance', () => {
  // 90% score should increase difficulty
  const upDiff = adjustAdaptiveDifficulty('medium', 9, 10);
  assert.equal(upDiff, 'hard');

  // 30% score should decrease difficulty
  const downDiff = adjustAdaptiveDifficulty('medium', 3, 10);
  assert.equal(downDiff, 'easy');

  // 60% score should stay stable
  const sameDiff = adjustAdaptiveDifficulty('medium', 6, 10);
  assert.equal(sameDiff, 'medium');
});

// =========================================================================
// INTEGRATION TESTS: FULL ASSESSMENT API WORKFLOW (Criteria 12, 13, 14, 15, 17, 19, 20)
// =========================================================================

test('Criteria 17 & 20: Full Assessment Flow (Create session, verify answer sanitization, save answer, submit, report)', async () => {
  const baseUrl = `http://127.0.0.1:${server.address().port}/api/student/ai-prep`;

  // 1. Create Assessment Session
  const createRes = await fetch(`${baseUrl}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      category: 'technical',
      topics: ['Data Structures & Algorithms', 'DBMS & SQL'],
      difficulty: 'medium',
      questionCount: 5,
      questionMix: 'mixed',
      durationMinutes: 30,
      revealMode: 'end'
    })
  });

  assert.equal(createRes.status, 201);
  const createData = await createRes.json();
  const session = createData.session;
  assert.ok(session._id);
  assert.equal(session.questions.length, 5);

  // Criteria 17: Objective answer keys and model answers MUST NOT be exposed while in_progress
  session.questions.forEach(q => {
    assert.equal(q.correctAnswer, undefined, 'Secret correctAnswer must be stripped');
    assert.equal(q.modelAnswer, undefined, 'Secret modelAnswer must be stripped');
    assert.equal(q.explanation, undefined, 'Secret explanation must be stripped');
  });

  const q1 = session.questions[0];

  // 2. Criteria 13: Save Answer (Autosave works without losing answers)
  const saveRes = await fetch(`${baseUrl}/session/${session._id}/save-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      questionId: q1.questionId,
      answer: 'A'
    })
  });
  assert.equal(saveRes.status, 200);

  // 3. Criteria 15: Another student cannot access or save to this session (Security Check)
  const forbiddenRes = await fetch(`${baseUrl}/session/${session._id}/save-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${otherStudentToken}`
    },
    body: JSON.stringify({
      questionId: q1.questionId,
      answer: 'Hacked'
    })
  });
  assert.equal(forbiddenRes.status, 403, 'Should forbid unauthorized student access');

  // 4. Criteria 12 & 14: Submit Assessment Session
  const submitRes = await fetch(`${baseUrl}/session/${session._id}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({ timeTakenSeconds: 300 })
  });
  assert.equal(submitRes.status, 200);
  const submitData = await submitRes.json();
  assert.equal(submitData.session.status, 'completed');

  // Criteria 14: Duplicate submission does not alter or re-evaluate results
  const duplicateSubmitRes = await fetch(`${baseUrl}/session/${session._id}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({ timeTakenSeconds: 320 })
  });
  assert.equal(duplicateSubmitRes.status, 200);
  const dupData = await duplicateSubmitRes.json();
  assert.equal(dupData.alreadySubmitted, true);

  // 5. Criteria 19: Get Final Report and verify topic & score integrity
  const reportRes = await fetch(`${baseUrl}/session/${session._id}/report`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(reportRes.status, 200);
  const reportData = await reportRes.json();
  const rep = reportData.report;

  assert.ok(rep.overallPercentage >= 0 && rep.overallPercentage <= 100);
  assert.ok(rep.totalScore <= rep.maxScore, 'Criteria 9: Total marks never exceed maximum');
  assert.ok(Array.isArray(rep.questionReviews));
  assert.equal(rep.questionReviews.length, 5);
  assert.ok(Array.isArray(rep.strengths));
  assert.ok(Array.isArray(rep.weaknesses));
  assert.ok(rep.topicBreakdown);

  // Now that session is completed, correct answers and explanations are safely revealed
  assert.ok(rep.questionReviews.some(r => r.explanation));

  // 6. Check Assessment History endpoint
  const historyRes = await fetch(`${baseUrl}/history`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(historyRes.status, 200);
  const histData = await historyRes.json();
  assert.ok(histData.history.length >= 1);
  assert.equal(histData.history[0].id, session._id);
});
