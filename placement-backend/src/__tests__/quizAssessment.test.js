process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/placement-db-test-quiz';

import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../seed/seed.js';
import mongoose from 'mongoose';
import { seedQuestionBank, sampleQuestions } from '../services/quizService.js';
import SubjectQuestion from '../models/SubjectQuestionBank.js';
import SubjectQuizAttempt from '../models/SubjectQuizAttempt.js';

let server;
let studentToken;
let otherStudentToken;

test.before(async () => {
  await connectDB();
  await seedDatabase({ reset: true });
  await seedQuestionBank();

  server = app.listen(0);

  // Authenticate student 1
  const loginRes = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rahul@student.com', password: 'student123' })
  });
  const loginData = await loginRes.json();
  studentToken = loginData.token;

  // Authenticate student 2
  const loginRes2 = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'prajwal@student.com', password: 'student123' })
  });
  const loginData2 = await loginRes2.json();
  otherStudentToken = loginData2.token;

  assert.ok(studentToken);
  assert.ok(otherStudentToken);
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test('seedQuestionBank loads all 7 subjects into database', async () => {
  const count = await SubjectQuestion.countDocuments();
  assert.ok(count >= 40, `Question bank should have substantial questions (found ${count})`);

  for (const sub of ['oops', 'dsa', 'daa', 'coa', 'os', 'dbms', 'cn']) {
    const subCount = await SubjectQuestion.countDocuments({ subject: sub });
    assert.ok(subCount > 0, `Subject ${sub} should have questions in DB`);
  }
});

test('GET /api/quiz/config returns all 7 subjects, 3 difficulty levels, and default config', async () => {
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/quiz/config`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.subjects.length, 7);
  assert.equal(data.difficulties.length, 3);
  assert.equal(data.config.defaultQuestionsPerQuiz, 15);
  assert.equal(data.config.durationMinutes, 20);
});

test('Difficulty sampling rules: Easy has only easy, Medium only medium, Hard has mix', async () => {
  // Test Easy
  const easyQuestions = await sampleQuestions('dsa', 'easy', 15);
  assert.equal(easyQuestions.length, 15);
  const hasOnlyEasy = easyQuestions.every(q => q.difficulty === 'easy');
  assert.ok(hasOnlyEasy, 'Easy quiz should contain strictly easy questions');

  // Test Medium
  const medQuestions = await sampleQuestions('os', 'medium', 15);
  assert.equal(medQuestions.length, 15);
  const hasOnlyMed = medQuestions.every(q => q.difficulty === 'medium');
  assert.ok(hasOnlyMed, 'Medium quiz should contain strictly medium questions');

  // Test Hard: Mixture of Easy + Medium + Hard
  const hardQuestions = await sampleQuestions('dbms', 'hard', 15);
  assert.equal(hardQuestions.length, 15);
  const diffs = new Set(hardQuestions.map(q => q.difficulty));
  assert.ok(diffs.has('hard'), 'Hard quiz should contain hard questions');
  assert.ok(diffs.size >= 2, 'Hard quiz should contain a mixture of difficulty levels');
});

test('POST /api/quiz/start starts session and NEVER reveals correct answers or explanations', async () => {
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/quiz/start`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ subject: 'dsa', difficulty: 'easy' })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.session.quizSessionId);
  assert.equal(data.session.totalQuestions, 15);
  assert.equal(data.session.questions.length, 15);

  // Security check: ensure NO question contains correctOption or explanation!
  for (const q of data.session.questions) {
    assert.equal(q.correctOption, undefined, 'Client must not receive correctOption');
    assert.equal(q.explanation, undefined, 'Client must not receive explanation during active quiz');
    assert.equal(q.options.length, 4, 'Must have exactly 4 options');
  }
});

test('POST /api/quiz/submit calculates score on backend and returns full evaluated review', async () => {
  // Start quiz session
  const startRes = await fetch(`http://127.0.0.1:${server.address().port}/api/quiz/start`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ subject: 'oops', difficulty: 'medium' })
  });
  const startData = await startRes.json();
  const sessionId = startData.session.quizSessionId;

  // Retrieve attempt from DB to know real answers for deterministic testing
  const attemptInDb = await SubjectQuizAttempt.findById(sessionId);
  assert.ok(attemptInDb);

  // Prepare answers: answer first 10 correctly, next 3 incorrectly, leave 2 unanswered
  const answers = {};
  for (let i = 0; i < 10; i++) {
    const q = attemptInDb.questions[i];
    answers[q.questionId] = q.correctOption; // Correct
  }
  for (let i = 10; i < 13; i++) {
    const q = attemptInDb.questions[i];
    answers[q.questionId] = (q.correctOption + 1) % 4; // Incorrect
  }
  // Questions 13 and 14 left unanswered

  const submitRes = await fetch(`http://127.0.0.1:${server.address().port}/api/quiz/submit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      quizSessionId: sessionId,
      answers,
      timeSpentSeconds: 340
    })
  });

  assert.equal(submitRes.status, 200);
  const submitData = await submitRes.json();
  assert.equal(submitData.success, true);
  const result = submitData.result;

  assert.equal(result.score, 10);
  assert.equal(result.correctCount, 10);
  assert.equal(result.incorrectCount, 3);
  assert.equal(result.unansweredCount, 2);
  assert.equal(result.percentage, Math.round((10 / 15) * 100)); // 67%
  assert.equal(result.performanceCategory, 'Nice effort! Keep practising.');
  assert.ok(result.performanceMessage);
  assert.equal(result.timeSpentSeconds, 340);

  // Verify review section has all 15 questions with explanations
  assert.equal(result.questions.length, 15);
  for (const q of result.questions) {
    assert.ok(q.explanation, 'Review must include detailed explanation');
    assert.ok(q.correctOption !== undefined);
  }
});

test('GET /api/quiz/dashboard returns overall stats, subject cards, and recommendations', async () => {
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/quiz/dashboard`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);

  const dash = data.data;
  assert.ok(dash.overall.totalQuizzes >= 1);
  assert.ok(dash.overall.totalQuestions >= 15);
  assert.ok(dash.overall.overallAvgScore > 0);
  assert.equal(dash.subjectWise.length, 6, 'Must contain all 6 subjects');
  assert.ok(dash.recommendations.length > 0, 'Must provide personalized recommendations');
  assert.ok(dash.recentAttempts.length >= 1, 'Must include recent quiz attempt in history');
});

test('Security: A student cannot view another student attempt details', async () => {
  // Start and complete attempt as student 1
  const startRes = await fetch(`http://127.0.0.1:${server.address().port}/api/quiz/start`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ subject: 'os', difficulty: 'easy' })
  });
  const startData = await startRes.json();
  const attemptId = startData.session.quizSessionId;

  // Student 2 attempts to access student 1's attempt
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/quiz/attempts/${attemptId}`, {
    headers: { Authorization: `Bearer ${otherStudentToken}` }
  });

  assert.equal(res.status, 404, 'Must reject access to another student attempt');
});
