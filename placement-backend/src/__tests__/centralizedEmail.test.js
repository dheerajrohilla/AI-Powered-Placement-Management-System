process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/placement-db-test-email';

import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { app } from '../server.js';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../seed/seed.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Company from '../models/Company.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import EmailLog from '../models/EmailLog.js';
import {
  sendEmail,
  getLastSentEmail,
  clearLastSentEmail,
  isRealSmtpConfigured,
  getDefaultFromAddress,
  verifyTransporterConnection,
  sendPasswordResetOtpEmail,
  sendApplicationConfirmationEmail,
  sendInterviewScheduledEmail,
  sendInterviewRescheduledEmail,
  sendApplicationStatusUpdateEmail,
  sendAdminDiagnosticTestEmail,
  getEmailDiagnosticsSummary,
  maskEmail
} from '../services/emailService.js';
import {
  renderPasswordResetOtpTemplate,
  renderApplicationConfirmationTemplate,
  renderInterviewScheduledTemplate,
  renderInterviewRescheduledTemplate,
  renderApplicationStatusUpdateTemplate,
  renderAdminTestEmailTemplate
} from '../templates/emailTemplates.js';

let server;
let adminToken;
let studentAliceToken;
let studentBobToken;
let companyToken;
let tpoToken;

let userAlice;
let userBob;
let userAdmin;
let testDrive;

test.before(async () => {
  await connectDB();
  await seedDatabase({ reset: true });
  server = app.listen(0);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  // 1. Create multiple distinct test users with realistic email addresses
  userAdmin = await User.create({
    name: 'Placement Admin',
    email: 'admin.director@university.edu',
    password: 'password123',
    role: 'admin'
  });

  userAlice = await User.create({
    name: 'Alice Johnson',
    email: 'alice.johnson@university.edu',
    password: 'password123',
    role: 'student'
  });
  const studentAlice = await Student.create({
    userId: userAlice._id,
    rollNumber: 'ALICE-2026',
    department: 'CSE',
    batch: '2026',
    cgpa: 9.1,
    skills: ['Node.js', 'React', 'MongoDB']
  });

  userBob = await User.create({
    name: 'Bob Smith',
    email: 'bob.smith@university.edu',
    password: 'password123',
    role: 'student'
  });
  const studentBob = await Student.create({
    userId: userBob._id,
    rollNumber: 'BOB-2026',
    department: 'ECE',
    batch: '2026',
    cgpa: 8.5,
    skills: ['Python', 'Embedded Systems']
  });

  const userCompany = await User.create({
    name: 'Nexus Corp HR',
    email: 'recruiter.nexus@nexuscorp.com',
    password: 'password123',
    role: 'company'
  });
  const companyDoc = await Company.create({
    userId: userCompany._id,
    companyName: 'Nexus Innovations Inc.',
    hrName: 'Carol Danvers',
    hrEmail: 'recruiter.nexus@nexuscorp.com',
    isVerified: true
  });

  testDrive = await PlacementDrive.create({
    company: companyDoc._id,
    title: 'Cloud & AI Engineer 2026',
    jobRole: 'Cloud Software Engineer',
    positions: 15,
    salary: 1600000,
    location: 'Bengaluru / Hybrid',
    driveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    requirements: ['Node.js', 'Docker', 'REST APIs', 'Cloud Computing'],
    status: 'ongoing',
    approvalStatus: 'approved',
    isPublished: true
  });

  // Login tokens
  const loginUser = async (email, password) => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    return data.token;
  };

  adminToken = await loginUser('admin.director@university.edu', 'password123');
  studentAliceToken = await loginUser('alice.johnson@university.edu', 'password123');
  studentBobToken = await loginUser('bob.smith@university.edu', 'password123');
  companyToken = await loginUser('recruiter.nexus@nexuscorp.com', 'password123');

  const tpoRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'tpohead@placement.com', password: 'tpohead123' })
  });
  tpoToken = (await tpoRes.json()).token;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test('1. Centralized Email Service configuration & safety guards', async () => {
  assert.equal(typeof isRealSmtpConfigured(), 'boolean');
  assert.ok(getDefaultFromAddress().includes('Training & Placement Cell'));

  // Test email masking
  assert.equal(maskEmail('rohilladheerajcaptain@gmail.com'), 'ro***n@gmail.com');
  assert.equal(maskEmail('test@domain.com'), 'te***t@domain.com');

  // Verify transporter connection check
  const connectionCheck = await verifyTransporterConnection();
  assert.equal(connectionCheck.success, true);
  assert.ok(connectionCheck.message);
});

test('2. HTML & Text template generation provides complete, dynamic content', async () => {
  // Password Reset Template
  const otpTmpl = renderPasswordResetOtpTemplate({
    name: 'Alice Johnson',
    otp: '543210',
    expiresInMinutes: 15,
    resetUrl: 'http://localhost:5173/login?mode=reset'
  });
  assert.ok(otpTmpl.subject.includes('543210'));
  assert.ok(otpTmpl.html.includes('543210'));
  assert.ok(otpTmpl.html.includes('Alice Johnson'));
  assert.ok(otpTmpl.text.includes('543210'));

  // Application Confirmation Template
  const appTmpl = renderApplicationConfirmationTemplate({
    studentName: 'Alice Johnson',
    companyName: 'Nexus Innovations Inc.',
    role: 'Cloud Software Engineer',
    salary: 1600000,
    location: 'Bengaluru / Hybrid',
    driveDate: new Date('2026-11-15'),
    requirements: ['Node.js', 'Docker']
  });
  assert.ok(appTmpl.subject.includes('Nexus Innovations Inc.'));
  assert.ok(appTmpl.html.includes('16.0 LPA'));
  assert.ok(appTmpl.html.toLowerCase().includes('ready for the test'));


  // Interview Scheduled Template
  const schedTmpl = renderInterviewScheduledTemplate({
    studentName: 'Alice Johnson',
    companyName: 'Nexus Innovations Inc.',
    role: 'Cloud Software Engineer',
    round: 'Technical Architecture Round',
    scheduledDate: new Date('2026-11-20T10:00:00Z'),
    mode: 'virtual',
    joinLink: 'https://meet.google.com/xyz-abc'
  });
  assert.ok(schedTmpl.subject.includes('Nexus Innovations Inc.'));
  assert.ok(schedTmpl.html.includes('https://meet.google.com/xyz-abc'));
  assert.ok(schedTmpl.html.includes('Technical Architecture Round'));

  // Interview Rescheduled Template
  const reschedTmpl = renderInterviewRescheduledTemplate({
    studentName: 'Alice Johnson',
    companyName: 'Nexus Innovations Inc.',
    role: 'Cloud Software Engineer',
    round: 'Technical Round',
    oldDate: new Date('2026-11-20T10:00:00Z'),
    newDate: new Date('2026-11-21T14:00:00Z'),
    reason: 'Resolved conflict with campus assessment drive'
  });
  assert.ok(reschedTmpl.subject.includes('Rescheduled'));
  assert.ok(reschedTmpl.html.includes('Resolved conflict with campus assessment drive'));

  // Status Update Template
  const statusTmpl = renderApplicationStatusUpdateTemplate({
    studentName: 'Alice Johnson',
    companyName: 'Nexus Innovations Inc.',
    role: 'Cloud Software Engineer',
    status: 'shortlisted'
  });
  assert.ok(statusTmpl.subject.includes('Shortlisted'));
  assert.ok(statusTmpl.html.includes('Shortlisted'));
});

test('3. Idempotency & Deduplication prevents sending duplicate emails', async () => {
  clearLastSentEmail();
  const testKey = `test-idempotency-${Date.now()}`;

  const res1 = await sendEmail({
    to: 'unique.candidate@university.edu',
    subject: 'Unique Confirmation',
    text: 'Hello candidate',
    html: '<p>Hello candidate</p>',
    idempotencyKey: testKey
  });

  assert.equal(res1.success, true);
  assert.equal(res1.recipient, 'unique.candidate@university.edu');

  // Second immediate attempt with same idempotency key
  const res2 = await sendEmail({
    to: 'unique.candidate@university.edu',
    subject: 'Unique Confirmation',
    text: 'Hello candidate duplicate',
    html: '<p>Hello candidate duplicate</p>',
    idempotencyKey: testKey
  });

  assert.equal(res2.success, true);
  assert.equal(res2.deduplicated, true, 'Second call must be deduplicated and not dispatched again');
});

test('4. Invalid or malformed recipient email addresses are gracefully blocked', async () => {
  const invalidRes = await sendEmail({
    to: 'not-a-valid-email-address',
    subject: 'Test',
    text: 'Test',
    html: '<p>Test</p>'
  });

  assert.equal(invalidRes.success, false);
  assert.ok(invalidRes.error.includes('Invalid recipient'));
});

test('5. Multi-User Flow A: Password Reset OTP generates email, verifies OTP, and resets password', async () => {
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  // Request password reset for Alice
  clearLastSentEmail();
  const forgotRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alice.johnson@university.edu' })
  });

  assert.equal(forgotRes.status, 200);
  const forgotData = await forgotRes.json();
  assert.ok(forgotData.message);

  // Check dispatched email payload
  const aliceEmail = getLastSentEmail();
  assert.ok(aliceEmail, 'Email must have been dispatched');
  assert.equal(aliceEmail.to, 'alice.johnson@university.edu');
  assert.ok(aliceEmail.subject.includes('Password Reset OTP'));

  // Extract the 6-digit OTP from the dispatched email text
  const otpMatch = aliceEmail.text.match(/CODE:\s*(\d{6})/i) || aliceEmail.html.match(/>(\d{6})</);
  assert.ok(otpMatch, 'Dispatched email must contain a 6-digit OTP code');
  const otpCode = otpMatch[1];
  assert.equal(otpCode.length, 6);

  // Verify OTP via verify-reset-otp endpoint
  const verifyRes = await fetch(`${baseUrl}/api/auth/verify-reset-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alice.johnson@university.edu', otp: otpCode })
  });
  assert.equal(verifyRes.status, 200);
  const verifyData = await verifyRes.json();
  assert.equal(verifyData.valid, true);

  // Reset password using the verified OTP
  const resetRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alice.johnson@university.edu',
      otp: otpCode,
      password: 'newAlicePassword2026!'
    })
  });
  assert.equal(resetRes.status, 200);
  const resetData = await resetRes.json();
  assert.ok(resetData.message.includes('successful'));

  // Confirm Alice can log in with new password
  const newLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alice.johnson@university.edu', password: 'newAlicePassword2026!' })
  });
  assert.equal(newLoginRes.status, 200);
  const newLoginData = await newLoginRes.json();
  assert.ok(newLoginData.token);
  studentAliceToken = newLoginData.token; // Update token for subsequent tests
});

test('6. Multi-User Flow B: Password Reset OTP works independently for Bob', async () => {
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  clearLastSentEmail();
  const forgotRes = await fetch(`${baseUrl}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bob.smith@university.edu' })
  });

  assert.equal(forgotRes.status, 200);
  const bobEmail = getLastSentEmail();
  assert.ok(bobEmail);
  assert.equal(bobEmail.to, 'bob.smith@university.edu');
  assert.ok(bobEmail.subject.includes('Password Reset OTP'));
});

test('7. Multi-User Flow C: Student job application confirmation is sent strictly to authenticated student', async () => {
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  clearLastSentEmail();
  const applyRes = await fetch(`${baseUrl}/api/student/apply`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${studentAliceToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ driveId: testDrive._id })
  });

  assert.equal(applyRes.status, 201);
  const applyData = await applyRes.json();
  assert.equal(applyData.emailNotificationSent, true);
  assert.equal(applyData.emailNotification.recipient, 'alice.johnson@university.edu');

  // Verify email dispatched matches student Alice
  const lastEmail = getLastSentEmail();
  assert.ok(lastEmail);
  assert.equal(lastEmail.to, 'alice.johnson@university.edu');
  assert.ok(lastEmail.subject.includes('Nexus Innovations Inc.'));
  assert.ok(lastEmail.subject.includes('Application Confirmed'));
  assert.ok(lastEmail.html.includes('Cloud Software Engineer'));

  // Verify outbox log persisted in MongoDB
  const outboxLog = await EmailLog.findOne({
    recipient: 'alice.johnson@university.edu',
    eventType: 'application_confirmation'
  });
  assert.ok(outboxLog, 'Outbox log must exist in database');
  assert.equal(outboxLog.recipient, 'alice.johnson@university.edu');
});

test('8. Multi-User Flow D: Company schedules interview -> email dispatched strictly to student', async () => {
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const studentAliceDoc = await Student.findOne({ userId: userAlice._id });
  clearLastSentEmail();

  const schedRes = await fetch(`${baseUrl}/api/company/interviews`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${companyToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      studentId: studentAliceDoc._id,
      placementDriveId: testDrive._id,
      round: 'Technical Architecture Round',
      scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      mode: 'virtual',
      joinLink: 'https://meet.google.com/test-nexus-meet',
      interviewer: 'Nexus Lead Architect'
    })
  });

  assert.equal(schedRes.status, 201);
  const interviewData = await schedRes.json();
  assert.ok(interviewData._id);

  // Verify email sent to Alice
  const lastEmail = getLastSentEmail();
  assert.ok(lastEmail);
  assert.equal(lastEmail.to, 'alice.johnson@university.edu');
  assert.ok(lastEmail.subject.includes('Interview Scheduled'));
  assert.ok(lastEmail.html.includes('https://meet.google.com/test-nexus-meet'));
  assert.ok(lastEmail.html.includes('Technical Architecture Round'));

  // Test TPO Conflict Rescheduling on this interview
  clearLastSentEmail();
  const newDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const reschedRes = await fetch(`${baseUrl}/api/tpo/conflicts/resolve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tpoToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      interviewId: interviewData._id,
      newScheduledDate: newDate,
      reason: 'Shifted by TPO to prevent scheduling clash with pre-placement talk'
    })
  });

  assert.equal(reschedRes.status, 200);

  // Verify reschedule email sent to Alice
  const reschedEmail = getLastSentEmail();
  assert.ok(reschedEmail);
  assert.equal(reschedEmail.to, 'alice.johnson@university.edu');
  assert.ok(reschedEmail.subject.includes('Rescheduled'));
  assert.ok(reschedEmail.html.includes('Shifted by TPO to prevent scheduling clash'));
});

test('9. Multi-User Flow E: Company status update (Shortlisted / Selected) sends notification email', async () => {
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const applicationDoc = await Application.findOne({
    student: (await Student.findOne({ userId: userAlice._id }))._id,
    placementDrive: testDrive._id
  });
  assert.ok(applicationDoc, 'Application must exist');

  clearLastSentEmail();

  // Mark Alice as shortlisted
  const updateRes = await fetch(`${baseUrl}/api/company/applications/${applicationDoc._id}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${companyToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'shortlisted',
      feedback: 'Excellent resume score and foundational problem solving.'
    })
  });

  assert.equal(updateRes.status, 200);

  // Check email sent to Alice
  const lastEmail = getLastSentEmail();
  assert.ok(lastEmail);
  assert.equal(lastEmail.to, 'alice.johnson@university.edu');
  assert.ok(lastEmail.subject.includes('Shortlisted'));
  assert.ok(lastEmail.html.includes('Excellent resume score'));
});

test('10. Admin Email Diagnostics & Authorized Test Send mechanism works securely', async () => {
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  // 1. Unauthenticated or student access must be rejected (401 / 403)
  const forbiddenRes = await fetch(`${baseUrl}/api/admin/email/diagnostics`, {
    headers: { Authorization: `Bearer ${studentAliceToken}` }
  });
  assert.equal(forbiddenRes.status, 403);

  // 2. Admin diagnostics endpoint
  const diagRes = await fetch(`${baseUrl}/api/admin/email/diagnostics`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.equal(diagRes.status, 200);
  const diagData = await diagRes.json();
  assert.ok(diagData.provider);
  assert.ok(diagData.fromAddress);
  assert.ok(diagData.stats);
  assert.ok(diagData.stats.totalLogged >= 1);
  // Verify secrets are NOT leaked
  assert.equal(diagData.SMTP_PASS, undefined);
  assert.equal(diagData.password, undefined);

  // 3. Admin verify connection
  const connRes = await fetch(`${baseUrl}/api/admin/email/verify-connection`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.equal(connRes.status, 200);
  const connData = await connRes.json();
  assert.equal(connData.success, true);

  // 4. Admin authorized test email send
  clearLastSentEmail();
  const testSendRes = await fetch(`${baseUrl}/api/admin/email/test-send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ targetEmail: 'admin.director@university.edu' })
  });

  assert.equal(testSendRes.status, 200);
  const testSendData = await testSendRes.json();
  assert.equal(testSendData.success, true);
  assert.equal(testSendData.recipient, 'admin.director@university.edu');
  assert.ok(testSendData.messageId);

  const testEmail = getLastSentEmail();
  assert.ok(testEmail);
  assert.equal(testEmail.to, 'admin.director@university.edu');
  assert.ok(testEmail.subject.includes('Verification'));

  // 5. Admin retrieve email logs
  const logsRes = await fetch(`${baseUrl}/api/admin/email/logs?limit=10`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.equal(logsRes.status, 200);
  const logs = await logsRes.json();
  assert.ok(Array.isArray(logs));
  assert.ok(logs.length > 0);
  assert.ok(logs.some(l => l.eventType === 'admin_test'));
});
