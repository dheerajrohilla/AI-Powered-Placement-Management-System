process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/placement-db-test-gemini';

import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../seed/seed.js';
import mongoose from 'mongoose';

import { isGeminiConfigured, getGeminiModel, checkGeminiHealth, GeminiConfigError } from '../config/gemini.js';
import { cleanAndParseJSON } from '../services/geminiService.js';
import { validateGeneratedQuestion } from '../services/assessmentService.js';
import { ATS_DISCLAIMER } from '../services/resumeService.js';

let server;
let studentToken;

test.before(async () => {
  await connectDB();
  await seedDatabase({ reset: true });
  server = app.listen(0);

  // Login as student
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'prajwal@student.com', password: 'student123' })
  });
  const data = await res.json();
  studentToken = data.token;
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
// 1. CONFIG & UTILS TESTS
// =========================================================================

test('Gemini Config: Configuration check and model default', () => {
  assert.equal(typeof isGeminiConfigured(), 'boolean');
  const model = getGeminiModel();
  assert.ok(model && typeof model === 'string');
});

test('Gemini Service: cleanAndParseJSON extracts clean JSON and strips markdown fences', () => {
  const pureJson = '{"key": "value", "count": 42}';
  const parsed1 = cleanAndParseJSON(pureJson);
  assert.equal(parsed1.key, 'value');
  assert.equal(parsed1.count, 42);

  const fencedJson = '```json\n{"status": "ok", "tags": ["AI", "Gemini"]}\n```';
  const parsed2 = cleanAndParseJSON(fencedJson);
  assert.equal(parsed2.status, 'ok');
  assert.equal(parsed2.tags.length, 2);

  const conversationalWrap = 'Sure! Here is the JSON:\n```json\n{"score": 95}\n```\nHope this helps!';
  const parsed3 = cleanAndParseJSON(conversationalWrap);
  assert.equal(parsed3.score, 95);
});

test('Assessment Service: validateGeneratedQuestion validates MCQ and Subjective schemas', () => {
  const mcq = validateGeneratedQuestion({
    questionText: 'What is the time complexity of binary search in sorted array?',
    questionType: 'mcq',
    options: ['O(N)', 'O(log N)', 'O(1)', 'O(N^2)'],
    correctAnswer: 'O(log N)',
    topic: 'DSA'
  });
  assert.equal(mcq.questionType, 'mcq');
  assert.equal(mcq.options.length, 4);
  assert.equal(mcq.correctAnswer, 'O(log N)');
  assert.equal(mcq.maxMarks, 2);

  const subjective = validateGeneratedQuestion({
    questionText: 'Explain the principles of ACID in database transaction management.',
    questionType: 'subjective',
    topic: 'DBMS',
    expectedKeyPoints: ['Atomicity', 'Consistency', 'Isolation', 'Durability']
  });
  assert.equal(subjective.questionType, 'subjective');
  assert.equal(subjective.expectedKeyPoints.length, 4);
  assert.equal(subjective.maxMarks, 10);
  assert.ok(subjective.rubric.length >= 3);
});

test('Resume Service: ATS Disclaimer is defined and accurate', () => {
  assert.ok(ATS_DISCLAIMER.includes('estimate'));
  assert.ok(ATS_DISCLAIMER.includes('does not guarantee employer ATS decisions'));
});

// =========================================================================
// 2. ENDPOINT TESTS (Authenticated Student)
// =========================================================================

test('API: GET /api/student/gemini-status returns operational diagnostic info', async () => {
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/student/gemini-status`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(typeof data.configured, 'boolean');
  assert.ok(data.model);
});

test('API: GET /api/student/dashboard/ai-summary returns structured placement readiness summary', async () => {
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/student/dashboard/ai-summary`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(typeof data.placementReadinessScore === 'number');
  assert.ok(Array.isArray(data.strengths));
  assert.ok(Array.isArray(data.skillGaps));
  assert.ok(data.recommendedNextAction);
  assert.ok(Array.isArray(data.upcomingGoals));
});

test('API: POST /api/student/application-assistant/cover-letter drafts editable cover letter', async () => {
  // Find a drive
  const driveRes = await fetch(`http://127.0.0.1:${server.address().port}/api/student/drives`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const drives = await driveRes.json();
  const driveId = drives[0]._id;

  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/student/application-assistant/cover-letter`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ driveId, customTone: 'Confident' })
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.subject);
  assert.ok(data.body);
  assert.ok(data.body.length > 50);
});

test('API: POST /api/student/application-assistant/recruiter-email drafts professional email', async () => {
  const driveRes = await fetch(`http://127.0.0.1:${server.address().port}/api/student/drives`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const drives = await driveRes.json();
  const driveId = drives[0]._id;

  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/student/application-assistant/recruiter-email`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ driveId, emailType: 'initial_outreach' })
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.subject);
  assert.ok(data.body);
});

test('API: GET /api/student/application-assistant/summarize/:driveId summarizes JD and matches skills', async () => {
  const driveRes = await fetch(`http://127.0.0.1:${server.address().port}/api/student/drives`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const drives = await driveRes.json();
  const driveId = drives[0]._id;

  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/student/application-assistant/summarize/${driveId}`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.companyName);
  assert.ok(data.role);
  assert.ok(Array.isArray(data.verifiedRequirements));
});

test('API: POST /api/student/collaborate/exercise generates paired study exercise', async () => {
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/student/collaborate/exercise`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ focusArea: 'DSA & System Design' })
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.exerciseTitle);
  assert.ok(data.discussionQuestions);
});
