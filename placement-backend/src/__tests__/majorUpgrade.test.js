process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/placement-db-test-upgrade';

import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../seed/seed.js';
import mongoose from 'mongoose';
import { detectFileFormat, extractTextFromResume } from '../utils/resumeParser.js';
import { extractCategorizedSkills, calculateRoleReadiness } from '../utils/skillAnalyzer.js';
import Workspace from '../models/Workspace.js';
import WorkspaceChannel from '../models/WorkspaceChannel.js';
import WorkspaceMessage from '../models/WorkspaceMessage.js';
import WorkspaceTask from '../models/WorkspaceTask.js';
import WorkspaceResource from '../models/WorkspaceResource.js';
import Student from '../models/Student.js';
import vm from 'vm';

let server;
let studentToken;
let studentUser;
let studentProfile;

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

  const body = await res.json();
  studentToken = body.token;
  studentUser = body.user;
  studentProfile = await Student.findOne({ userId: studentUser._id || studentUser.id });
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

// =========================================================================
// PART 1: RESUME & SKILL ANALYSIS TESTS
// =========================================================================

test('detectFileFormat accurately detects PDF magic bytes', () => {
  const pdfBuffer = Buffer.from('%PDF-1.4 sample content');
  const format = detectFileFormat(pdfBuffer, 'resume.pdf');
  assert.equal(format, 'pdf');
});

test('detectFileFormat accurately detects DOCX zip magic bytes', () => {
  const docxBuffer = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00, 0x00]);
  const format = detectFileFormat(docxBuffer, 'resume.docx');
  assert.equal(format, 'docx');
});

test('detectFileFormat rejects unsupported formats', () => {
  const exeBuffer = Buffer.from('MZ executable binary data');
  const format = detectFileFormat(exeBuffer, 'resume.exe');
  assert.equal(format, 'unknown');
});

test('extractTextFromResume throws informative error on corrupted or empty file', async () => {
  const emptyBuffer = Buffer.from('');
  await assert.rejects(
    async () => {
      await extractTextFromResume(emptyBuffer, 'resume.pdf', 'pdf');
    },
    /empty/i
  );
});

test('extractCategorizedSkills extracts technical skills with context evidence', () => {
  const sampleResumeText = `
    Technical Skills:
    Languages: JavaScript, TypeScript, Python
    Frontend: React, Redux, TailwindCSS, HTML5, CSS3
    Backend & Databases: Node.js, Express, MongoDB, PostgreSQL, REST APIs
    Tools: Docker, Git, GitHub Actions, AWS
  `;

  const { detectedSkills, categorized, evidence } = extractCategorizedSkills(sampleResumeText);

  assert.ok(detectedSkills.length >= 6, 'Should extract at least 6 technical skills');
  assert.ok(detectedSkills.includes('React'));
  assert.ok(detectedSkills.includes('Node.js'));
  assert.ok(detectedSkills.includes('MongoDB'));
  assert.ok(detectedSkills.includes('JavaScript'));

  // Evidence should contain snippet where skill was found
  assert.ok(evidence['React'], 'Should capture evidence snippet for React');
  assert.ok(evidence['Node.js'], 'Should capture evidence snippet for Node.js');
});

test('calculateRoleReadiness returns strict 0% when zero skills detected', () => {
  const emptySkills = [];
  const readiness = calculateRoleReadiness(emptySkills);

  assert.ok(Array.isArray(readiness));
  for (const role of readiness) {
    assert.equal(role.readinessScore, 0, `Role ${role.role} should have 0% match when no skills detected`);
    assert.equal(role.matchedSkills.length, 0);
    assert.ok(role.missingSkills.length > 0);
  }
});

test('calculateRoleReadiness returns weighted non-zero score for qualified profile', () => {
  const skills = ['React', 'JavaScript', 'HTML5', 'CSS3', 'Node.js', 'Express', 'MongoDB', 'Git'];
  const readiness = calculateRoleReadiness(skills);

  const fullStack = readiness.find(r => r.role === 'Full Stack Developer');
  assert.ok(fullStack);
  assert.ok(fullStack.readinessScore >= 50, 'Full stack match should reflect matched skills');
  assert.ok(fullStack.matchedSkills.includes('React'));
  assert.ok(fullStack.matchedSkills.includes('Node.js'));
});

test('GET /api/student/skill-analysis returns real extracted skills, evidence and sync status', async () => {
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/student/skill-analysis`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.roleReadiness);
  assert.ok(data.allExtractedSkills);
  assert.ok(data.profileSkills);
  assert.ok(data.categorizedSkills);
  assert.ok(typeof data.hasResume === 'boolean');
});

// =========================================================================
// PART 2: PEER COLLABORATION WORKSPACES & SECURITY TESTS
// =========================================================================

let createdWorkspaceId;
let defaultChannelId;

test('POST /api/student/workspaces creates workspace with owner role and default #general channel', async () => {
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/student/workspaces`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      name: 'DSA Sprint Alpha',
      description: 'Preparing for FAANG and Tier 1 product companies',
      goal: 'DSA & Problem Solving',
      isPrivate: false
    })
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.name, 'DSA Sprint Alpha');
  assert.equal(data.isPrivate, false);
  assert.ok(data._id);
  assert.ok(data.channels && data.channels.length >= 1);
  assert.equal(data.channels[0].name, 'general');

  createdWorkspaceId = data._id;
  defaultChannelId = data.channels[0]._id;
});

test('GET /api/student/workspaces lists workspaces user belongs to', async () => {
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/student/workspaces`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  assert.equal(res.status, 200);
  const list = await res.json();
  assert.ok(Array.isArray(list));
  assert.ok(list.some(w => w._id === createdWorkspaceId));
});

test('POST & GET channel messages with persistence and IDOR protection', async () => {
  // Send message
  const sendRes = await fetch(
    `http://127.0.0.1:${server.address().port}/api/student/workspaces/${createdWorkspaceId}/channels/${defaultChannelId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ content: 'Hello cohort, let us practice Dynamic Programming today!' })
    }
  );

  assert.equal(sendRes.status, 201);
  const msg = await sendRes.json();
  assert.equal(msg.content, 'Hello cohort, let us practice Dynamic Programming today!');
  assert.ok(msg._id);

  // Fetch messages
  const getRes = await fetch(
    `http://127.0.0.1:${server.address().port}/api/student/workspaces/${createdWorkspaceId}/channels/${defaultChannelId}/messages`,
    {
      headers: { Authorization: `Bearer ${studentToken}` }
    }
  );

  assert.equal(getRes.status, 200);
  const data = await getRes.json();
  assert.ok(Array.isArray(data.messages));
  assert.ok(data.messages.some(m => m._id === msg._id));

  // Edit message
  const editRes = await fetch(
    `http://127.0.0.1:${server.address().port}/api/student/workspaces/${createdWorkspaceId}/messages/${msg._id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ content: 'Updated: Let us solve Graph BFS/DFS problems today!' })
    }
  );

  assert.equal(editRes.status, 200);
  const updatedMsg = await editRes.json();
  assert.equal(updatedMsg.content, 'Updated: Let us solve Graph BFS/DFS problems today!');
  assert.equal(updatedMsg.isEdited, true);
});

test('Workspace Tasks CRUD operations work correctly', async () => {
  const taskRes = await fetch(
    `http://127.0.0.1:${server.address().port}/api/student/workspaces/${createdWorkspaceId}/tasks`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Master Topological Sort',
        description: 'Complete Course Schedule I & II on LeetCode',
        priority: 'high'
      })
    }
  );

  assert.equal(taskRes.status, 201);
  const task = await taskRes.json();
  assert.equal(task.title, 'Master Topological Sort');
  assert.equal(task.priority, 'high');
  assert.equal(task.status, 'todo');

  // Update status to completed
  const patchRes = await fetch(
    `http://127.0.0.1:${server.address().port}/api/student/workspaces/${createdWorkspaceId}/tasks/${task._id}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ status: 'completed' })
    }
  );

  assert.equal(patchRes.status, 200);
  const updatedTask = await patchRes.json();
  assert.equal(updatedTask.status, 'completed');
});

test('Workspace Shared Resources operations work correctly', async () => {
  const resRes = await fetch(
    `http://127.0.0.1:${server.address().port}/api/student/workspaces/${createdWorkspaceId}/resources`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'NeetCode 150 Problem Sheet',
        url: 'https://neetcode.io/practice',
        category: 'interview_question',
        description: 'Curated list of standard coding questions'
      })
    }
  );

  assert.equal(resRes.status, 201);
  const resource = await resRes.json();
  assert.equal(resource.title, 'NeetCode 150 Problem Sheet');
  assert.equal(resource.category, 'interview_question');
});

test('Collaborative Code Sandbox executes valid code safely', async () => {
  const codeRes = await fetch(
    `http://127.0.0.1:${server.address().port}/api/student/workspaces/${createdWorkspaceId}/code-session/run`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        code: `
          function fib(n) {
            if (n <= 1) return n;
            return fib(n - 1) + fib(n - 2);
          }
          console.log("Fib(7):", fib(7));
          return fib(7);
        `,
        language: 'javascript'
      })
    }
  );

  assert.equal(codeRes.status, 200);
  const execData = await codeRes.json();
  assert.equal(execData.success, true);
  assert.ok(execData.stdout.includes('Fib(7): 13'));
  assert.equal(execData.result, 13);
  assert.ok(typeof execData.executionTimeMs === 'number');
});

test('Collaborative Code Sandbox blocks malicious infinite loops and timeouts', async () => {
  const infiniteLoopCode = `while (true) {}`;
  const codeRes = await fetch(
    `http://127.0.0.1:${server.address().port}/api/student/workspaces/${createdWorkspaceId}/code-session/run`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        code: infiniteLoopCode,
        language: 'javascript'
      })
    }
  );

  assert.equal(codeRes.status, 200);
  const execData = await codeRes.json();
  assert.equal(execData.success, false);
  assert.ok(execData.error.includes('timed out'));
});

test('IDOR Security: Unauthorized student cannot view private workspace data without membership', async () => {
  // Create private workspace
  const privRes = await fetch(`http://127.0.0.1:${server.address().port}/api/student/workspaces`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      name: 'Classified Executive Prep',
      description: 'Private invites only',
      isPrivate: true
    })
  });

  const privWs = await privRes.json();
  const privWsId = privWs._id;

  // Attempt to access with unauthenticated request
  const unauthRes = await fetch(
    `http://127.0.0.1:${server.address().port}/api/student/workspaces/${privWsId}`
  );
  assert.equal(unauthRes.status, 401, 'Unauthenticated request must be rejected with 401');
});
