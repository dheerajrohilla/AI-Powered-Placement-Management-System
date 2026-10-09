process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/placement-db-test';

import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../seed/seed.js';
import { getLastSentEmail } from '../utils/emailService.js';
import mongoose from 'mongoose';

let server;
let studentToken;
let tpoToken;

test.before(async () => {
  await connectDB();
  await seedDatabase({ reset: true });
  server = app.listen(0);

  // Login as student
  const studentRes = await fetch('http://127.0.0.1:' + server.address().port + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'prajwal@student.com', password: 'student123' })
  });
  const studentData = await studentRes.json();
  studentToken = studentData.token;

  // Login as TPO
  const tpoRes = await fetch('http://127.0.0.1:' + server.address().port + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'tpohead@placement.com', password: 'tpohead123' })
  });
  const tpoData = await tpoRes.json();
  tpoToken = tpoData.token;
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

test('Feature 1: Resume Credibility / Consistency Checker works', async () => {
  const res = await fetch('http://127.0.0.1:' + server.address().port + '/api/student/credibility-analysis', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.score >= 0 && data.score <= 100);
  assert.ok(data.rating);
  assert.ok(Array.isArray(data.discrepancies));
  assert.ok(Array.isArray(data.verifiedClaims));
});

test('Feature 2: Mock Interview generation and answering works', async () => {
  // Generate interview
  const genRes = await fetch('http://127.0.0.1:' + server.address().port + '/api/student/mock-interview/generate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ customRole: 'Backend Developer' })
  });
  assert.equal(genRes.status, 201);
  const interview = await genRes.json();
  assert.ok(interview.questions.length > 0);

  // Submit answer for Q1
  const qId = interview.questions[0].questionId;
  const ansRes = await fetch(`http://127.0.0.1:${server.address().port}/api/student/mock-interview/${interview._id}/answer`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      questionId: qId,
      studentAnswer: 'HashMap uses buckets and hashCode. In Java 8, when collisions exceed 8 items in a bucket, it transforms into a red-black tree with O(log n) lookup.'
    })
  });
  assert.equal(ansRes.status, 200);
  const ansData = await ansRes.json();
  assert.ok(ansData.evaluation.score > 0);

  // Complete interview
  const compRes = await fetch(`http://127.0.0.1:${server.address().port}/api/student/mock-interview/${interview._id}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(compRes.status, 200);
  const compData = await compRes.json();
  assert.ok(compData.placementReadinessScore > 0);
  assert.equal(compData.status, 'completed');
});

test('Feature 3: Placement Journey & Skill Roadmap works', async () => {
  const res = await fetch('http://127.0.0.1:' + server.address().port + '/api/student/placement-journey', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.stages.length === 9);
  assert.ok(data.overallPercentage >= 0 && data.overallPercentage <= 100);
  assert.ok(data.currentStage);
});

test('Feature 4: "Why Am I Not Getting Shortlisted?" Analyzer works', async () => {
  const res = await fetch('http://127.0.0.1:' + server.address().port + '/api/student/rejection-analysis', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.hasData);
  assert.ok(data.totalApplied > 0);
  assert.ok(data.primaryBottleneck);
  assert.ok(Array.isArray(data.turnaroundPlan));
});

test('Feature 5: Company-Specific Preparation Mode works', async () => {
  const res = await fetch('http://127.0.0.1:' + server.address().port + '/api/student/company-prep/default', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.companyName);
  assert.ok(Array.isArray(data.rounds));
  assert.ok(Array.isArray(data.preparationRoadmap));
  assert.ok(Array.isArray(data.readinessChecklist));
});

test('Feature 6: Anonymous Peer Benchmarking works', async () => {
  const res = await fetch('http://127.0.0.1:' + server.address().port + '/api/student/peer-benchmark', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.dimensions));
  assert.ok(data.dimensions.some(d => d.id === 'dsa'));
  assert.ok(Array.isArray(data.actionableInsights));
});

test('Feature 7: Skill-Based Student Collaboration works', async () => {
  const res = await fetch('http://127.0.0.1:' + server.address().port + '/api/student/collaborate/matches', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  assert.equal(res.status, 200);
  const matches = await res.json();
  assert.ok(Array.isArray(matches));
  assert.ok(matches.length > 0);
  assert.ok(matches[0].complementaryFocus);
});

test('Feature 8: Placement Conflict Detector for TPO detects and resolves overlap', async () => {
  const res = await fetch('http://127.0.0.1:' + server.address().port + '/api/tpo/conflicts', {
    headers: { Authorization: `Bearer ${tpoToken}` }
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.totalConflicts > 0);
  assert.ok(data.conflicts.length > 0);

  const conflict = data.conflicts[0];
  assert.ok(conflict.suggestedReschedule.length > 0);

  // Resolve conflict
  const resolveRes = await fetch('http://127.0.0.1:' + server.address().port + '/api/tpo/conflicts/resolve', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tpoToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      interviewId: conflict.targetItemToReschedule,
      newScheduledDate: conflict.suggestedReschedule[0].newDate,
      reason: 'Auto-rescheduled by TPO to avoid activity overlap'
    })
  });

  assert.equal(resolveRes.status, 200);
  const resolveData = await resolveRes.json();
  assert.ok(resolveData.interview);
});

test('Feature 9: Automated Application Confirmation Email & Test Readiness Notification works', async () => {
  // 1. Get available drives
  const drivesRes = await fetch('http://127.0.0.1:' + server.address().port + '/api/student/drives', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(drivesRes.status, 200);
  const drives = await drivesRes.json();
  assert.ok(Array.isArray(drives));

  const targetDrive = drives.find(d => d.title === 'AI Solutions Engineer Hiring') || drives[0];
  assert.ok(targetDrive, 'Target drive must exist');

  // 2. Student applies for drive
  const applyRes = await fetch('http://127.0.0.1:' + server.address().port + '/api/student/apply', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ driveId: targetDrive._id })
  });

  assert.equal(applyRes.status, 201);
  const applyData = await applyRes.json();
  assert.ok(applyData.emailNotification);
  assert.equal(applyData.emailNotification.sent, true);
  assert.equal(applyData.emailNotification.recipient, 'prajwal@student.com');
  assert.equal(applyData.emailNotificationSent, true);

  // 3. Verify dispatched email payload
  const lastEmail = getLastSentEmail();
  assert.ok(lastEmail, 'An automated confirmation email must have been dispatched');
  assert.equal(lastEmail.to, 'prajwal@student.com');
  assert.ok(lastEmail.subject.includes('All the Best'));
  assert.ok(lastEmail.subject.includes('Get ready for the test'));
  assert.ok(lastEmail.html.includes('ABC Technologies') || lastEmail.html.includes(targetDrive.company?.companyName));
  assert.ok(lastEmail.html.includes('Get Ready for the Test'));

  // 4. Verify student notification created
  const notifRes = await fetch('http://127.0.0.1:' + server.address().port + '/api/student/notifications', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(notifRes.status, 200);
  const notifs = await notifRes.json();
  assert.ok(Array.isArray(notifs));
  const appNotif = notifs.find(n => n.title.includes('Applied to'));
  assert.ok(appNotif, 'In-app application notification must be present');
  assert.ok(appNotif.message.includes('Get ready for the test'));
});

