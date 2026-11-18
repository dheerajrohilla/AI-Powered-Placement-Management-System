process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/placement-db-test-rbac';

import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../seed/seed.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Company from '../models/Company.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';

let server;
let baseUrl;

// Tokens for all 4 roles
let studentToken;
let companyToken;
let tpoToken;
let adminToken;

let studentUser;
let companyUser;
let tpoUser;
let adminUser;

test.before(async () => {
  await connectDB();
  await seedDatabase({ reset: true });
  server = app.listen(0);
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;

  const login = async (email, password) => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  };

  const studentLogin = await login('prajwal@student.com', 'student123');
  studentToken = studentLogin.token;
  studentUser = studentLogin.user;

  const companyLogin = await login('careers@abctech.com', 'company123');
  companyToken = companyLogin.token;
  companyUser = companyLogin.user;

  const tpoLogin = await login('tpohead@placement.com', 'tpohead123');
  tpoToken = tpoLogin.token;
  tpoUser = tpoLogin.user;

  const adminLogin = await login('admin@placement.com', 'admin123');
  adminToken = adminLogin.token;
  adminUser = adminLogin.user;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

// =========================================================================
// 1. AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
// =========================================================================

test('RBAC: All 4 distinct roles can authenticate and receive server-determined roles', () => {
  assert.ok(studentToken, 'Student token should be present');
  assert.equal(studentUser.role, 'student');

  assert.ok(companyToken, 'Company token should be present');
  assert.equal(companyUser.role, 'company');

  assert.ok(tpoToken, 'TPO token should be present');
  assert.equal(tpoUser.role, 'tpo');

  assert.ok(adminToken, 'Admin token should be present');
  assert.equal(adminUser.role, 'admin');
});

test('RBAC: Student cannot access TPO or Admin protected endpoints', async () => {
  const tpoRes = await fetch(`${baseUrl}/tpo/drives`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(tpoRes.status, 403, 'Student should be forbidden from accessing /api/tpo');

  const adminRes = await fetch(`${baseUrl}/admin/users`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(adminRes.status, 403, 'Student should be forbidden from accessing /api/admin');
});

test('RBAC: Company cannot access Admin endpoints or approve its own drives', async () => {
  const adminRes = await fetch(`${baseUrl}/admin/configuration`, {
    headers: { Authorization: `Bearer ${companyToken}` }
  });
  assert.equal(adminRes.status, 403, 'Company should be forbidden from accessing /api/admin');

  const approveRes = await fetch(`${baseUrl}/tpo/drives/someid/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${companyToken}` }
  });
  assert.equal(approveRes.status, 403, 'Company should be forbidden from calling TPO approval endpoints');
});

test('RBAC: TPO cannot access root system Admin user management', async () => {
  const res = await fetch(`${baseUrl}/admin/users`, {
    headers: { Authorization: `Bearer ${tpoToken}` }
  });
  assert.equal(res.status, 403, 'TPO should not have unrestricted admin privileges');
});

test('Security: Root Admin cannot delete the last active administrator account', async () => {
  const res = await fetch(`${baseUrl}/admin/users/${adminUser._id || adminUser.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const data = await res.json();
  assert.equal(res.status, 400);
  assert.match(data.error, /Cannot delete the last (active|remaining) administrator account/i);
});

test('Security: Public registration rejects non-student/non-company roles', async () => {
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Hacker Admin',
      email: 'hacker@admin.com',
      password: 'password123',
      role: 'admin'
    })
  });
  const data = await res.json();
  assert.equal(res.status, 400);
  assert.match(data.error, /Public registration is only available for student and company roles/i);
});

// =========================================================================
// 2. COMPANY DRIVE APPROVAL WORKFLOW
// =========================================================================

let createdDriveId;

test('Workflow: Company creates drive -> status is pending_approval and not visible to students', async () => {
  const createRes = await fetch(`${baseUrl}/company/drives`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${companyToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Senior Cloud Engineer 2026',
      jobRole: 'Senior Cloud Engineer',
      salary: 1800000,
      positions: 3,
      location: 'Hyderabad',
      approvalStatus: 'pending_approval',
      description: 'Design and deploy Kubernetes clusters and cloud systems.',
      requirements: ['Docker', 'Kubernetes', 'Go', 'GCP']
    })
  });

  assert.equal(createRes.status, 201);
  const driveData = await createRes.json();
  createdDriveId = driveData._id;
  assert.equal(driveData.approvalStatus, 'pending_approval');
  assert.equal(driveData.isPublished, false);

  // Verify that students CANNOT see this pending drive
  const studentDrivesRes = await fetch(`${baseUrl}/student/drives`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const studentDrives = await studentDrivesRes.json();
  const found = studentDrives.some((d) => d._id === createdDriveId);
  assert.equal(found, false, 'Pending approval drive must not be visible to students');
});

test('Workflow: TPO reviews pending drives and approves with feedback', async () => {
  // Check pending list in TPO
  const pendingRes = await fetch(`${baseUrl}/tpo/drives/pending`, {
    headers: { Authorization: `Bearer ${tpoToken}` }
  });
  assert.equal(pendingRes.status, 200);
  const pendingList = await pendingRes.json();
  const driveInPending = pendingList.some((d) => d._id === createdDriveId);
  assert.equal(driveInPending, true);

  // TPO approves drive
  const approveRes = await fetch(`${baseUrl}/tpo/drives/${createdDriveId}/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tpoToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ feedback: 'Approved by Placement Cell for eligible senior students.' })
  });

  assert.equal(approveRes.status, 200);
  const approveData = await approveRes.json();
  assert.equal(approveData.drive.approvalStatus, 'approved');
  assert.equal(approveData.drive.isPublished, true);

  // Now verify it IS visible to students
  const studentDrivesRes = await fetch(`${baseUrl}/student/drives`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const studentDrives = await studentDrivesRes.json();
  const foundAfterApproval = studentDrives.some((d) => d._id === createdDriveId);
  assert.equal(foundAfterApproval, true, 'Approved drive must now be visible to students');
});

// =========================================================================
// 3. APPLICATION LIFECYCLE & WITHDRAWAL
// =========================================================================

let studentApplicationId;

test('Workflow: Student applies to approved drive', async () => {
  const applyRes = await fetch(`${baseUrl}/student/apply`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ driveId: createdDriveId })
  });

  assert.equal(applyRes.status, 201);
  const appData = await applyRes.json();
  studentApplicationId = appData._id;
  assert.equal(appData.status, 'applied');
});

test('Workflow: Student can withdraw their own submitted application', async () => {
  const withdrawRes = await fetch(`${baseUrl}/student/applications/${studentApplicationId}/withdraw`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  assert.equal(withdrawRes.status, 200);
  const withdrawData = await withdrawRes.json();
  assert.equal(withdrawData.application.status, 'withdrawn');
});

// =========================================================================
// 4. CANDIDATE PIPELINE, INTERVIEW SCHEDULING & OFFERS
// =========================================================================

test('Workflow: Recruiter pipeline status update & interview scheduling', async () => {
  // Re-apply/update so recruiter can process
  await Application.findByIdAndUpdate(studentApplicationId, { status: 'shortlisted' });

  // Recruiter schedules interview
  const interviewRes = await fetch(`${baseUrl}/company/interviews`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${companyToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      applicationId: studentApplicationId,
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      round: 'Technical Architecture Round',
      mode: 'virtual',
      joinLink: 'https://meet.google.com/test-abc-def',
      timeZone: 'Asia/Kolkata'
    })
  });

  assert.equal(interviewRes.status, 201);
  const interviewData = await interviewRes.json();
  assert.equal(interviewData.round, 'Technical Architecture Round');
  assert.equal(interviewData.mode, 'virtual');
  assert.equal(interviewData.joinLink, 'https://meet.google.com/test-abc-def');

  // Verify application transitioned to interview_scheduled
  const updatedApp = await Application.findById(studentApplicationId);
  assert.equal(updatedApp.status, 'interview_scheduled');

  // Recruiter extends final offer / selects candidate
  const selectRes = await fetch(`${baseUrl}/company/applications/${studentApplicationId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${companyToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'selected', feedback: 'Outstanding technical performance.' })
  });

  assert.equal(selectRes.status, 200);

  // Verify student was marked placed in database
  const studentDoc = await Student.findOne({ userId: studentUser._id || studentUser.id });
  assert.equal(studentDoc.isPlaced, true, 'Selected student must have isPlaced set to true');
});
