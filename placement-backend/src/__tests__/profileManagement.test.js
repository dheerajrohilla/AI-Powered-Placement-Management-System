process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/placement-db-test-profile';

import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../seed/seed.js';
import mongoose from 'mongoose';

let server;
let studentToken;
let tpoToken;
let adminToken;
let companyToken;

const api = (path, options = {}) => {
  const url = `http://127.0.0.1:${server.address().port}${path}`;
  return fetch(url, options);
};

test.before(async () => {
  await connectDB();
  await seedDatabase({ reset: true });
  server = app.listen(0);

  // Authenticate student
  const studentRes = await api('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'prajwal@student.com', password: 'student123' })
  });
  const studentData = await studentRes.json();
  studentToken = studentData.token;

  // Authenticate TPO
  const tpoRes = await api('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'tpohead@placement.com', password: 'tpohead123' })
  });
  const tpoData = await tpoRes.json();
  tpoToken = tpoData.token;

  // Authenticate Admin
  const adminRes = await api('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@placement.com', password: 'admin123' })
  });
  const adminData = await adminRes.json();
  adminToken = adminData.token;

  // Authenticate Company
  const companyRes = await api('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'careers@abctech.com', password: 'company123' })
  });
  const companyData = await companyRes.json();
  companyToken = companyData.token;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

// ==========================================
// 1. STUDENT PROFILE TESTS & CGPA RESOLUTION
// ==========================================

test('Student can retrieve full profile via /api/student/profile and /api/profile', async () => {
  const res1 = await api('/api/student/profile', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(res1.status, 200);
  const data1 = await res1.json();
  assert.equal(data1.cgpa, 8.6);
  assert.equal(data1.rollNumber, '2021001');
  assert.ok(data1.userId);
  assert.equal(data1.userId.email, 'prajwal@student.com');

  // Test universal /api/profile
  const res2 = await api('/api/profile', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  assert.equal(data2.cgpa, 8.6);
  assert.equal(data2.userId.email, 'prajwal@student.com');
});

test('Student Dashboard correctly returns academic CGPA and display string', async () => {
  const res = await api('/api/student/dashboard', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.cgpa, 8.6);
  assert.equal(data.cgpaDisplay, '8.60');
});

test('Student can update profile including CGPA, skills, and career preferences', async () => {
  const res = await api('/api/student/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      cgpa: 9.35,
      currentSemester: 8,
      graduationYear: 2025,
      university: 'National Institute of Technology',
      degree: 'B.Tech',
      branch: 'Computer Science and Engineering',
      skills: ['React', 'Node.js', 'Docker', 'Kubernetes'],
      preferredRoles: ['Full Stack Architect', 'Lead Backend Engineer'],
      preferredLocations: ['Bengaluru', 'Pune']
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.cgpa, 9.35);
  assert.equal(Number(data.currentSemester), 8);
  assert.equal(data.university, 'National Institute of Technology');
  assert.deepEqual(data.preferredRoles, ['Full Stack Architect', 'Lead Backend Engineer']);

  // Verify dashboard immediately reflects new CGPA
  const dashRes = await api('/api/student/dashboard', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const dashData = await dashRes.json();
  assert.equal(dashData.cgpa, 9.35);
  assert.equal(dashData.cgpaDisplay, '9.35');
});

test('Student CGPA validation rejects invalid scores (> 10 or < 0)', async () => {
  // Test CGPA > 10
  const highRes = await api('/api/student/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({ cgpa: 10.5 })
  });
  assert.equal(highRes.status, 400);
  const highData = await highRes.json();
  assert.match(highData.error || highData.message, /between 0/i);

  // Test CGPA < 0
  const lowRes = await api('/api/student/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({ cgpa: -1.5 })
  });
  assert.equal(lowRes.status, 400);
  const lowData = await lowRes.json();
  assert.match(lowData.error || lowData.message, /between 0/i);
});

test('Student update does NOT overwrite valid CGPA with 0 or empty string', async () => {
  const res = await api('/api/student/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      skills: ['React', 'Node.js', 'Go']
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  // CGPA must still be 9.35 from previous update, NOT 0 or null
  assert.equal(data.cgpa, 9.35);
});

// ==========================================
// 2. TPO PROFILE & PRIVILEGE PROTECTION
// ==========================================

test('TPO can retrieve profile via /api/tpo/profile and universal /api/profile', async () => {
  const res = await api('/api/profile', {
    headers: { Authorization: `Bearer ${tpoToken}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.user);
  assert.equal(data.user.email, 'tpohead@placement.com');
  assert.equal(data.user.role, 'tpo');
});

test('TPO can update permitted profile fields and cannot escalate privileges', async () => {
  const res = await api('/api/tpo/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tpoToken}`
    },
    body: JSON.stringify({
      name: 'Dr. Rajesh Kumar Updated',
      designation: 'Head of Placement & Corporate Relations',
      department: 'Corporate Training and Placement',
      institution: 'Premier Technical University',
      officeLocation: 'Academic Block 4, Suite 201',
      bio: 'Leading campus recruitment drives for over 15 years.',
      role: 'admin' // Attempted privilege escalation!
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.user.name, 'Dr. Rajesh Kumar Updated');
  assert.equal(data.tpo.designation, 'Head of Placement & Corporate Relations');
  assert.equal(data.tpo.officeLocation, 'Academic Block 4, Suite 201');

  // Verify role was NOT escalated to admin
  const verifyRes = await api('/api/profile', {
    headers: { Authorization: `Bearer ${tpoToken}` }
  });
  const verifyData = await verifyRes.json();
  assert.equal(verifyData.user.role, 'tpo');
});

// ==========================================
// 3. ADMIN PROFILE & PRIVILEGE PROTECTION
// ==========================================

test('Admin can retrieve and update permitted profile fields', async () => {
  const res = await api('/api/profile', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.user);
  assert.equal(data.user.email, 'admin@placement.com');
  assert.equal(data.user.role, 'admin');

  const updateRes = await api('/api/admin/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      name: 'Chief Placement Admin',
      designation: 'Director of University Placements',
      organization: 'Central University System',
      officeLocation: 'Executive Tower 1, 5th Floor',
      bio: 'Overseeing placement infrastructure, security, and university-wide analytics.',
      role: 'super_root' // Attempted privilege tampering
    })
  });

  assert.equal(updateRes.status, 200);
  const updateData = await updateRes.json();
  assert.equal(updateData.user.name, 'Chief Placement Admin');
  assert.equal(updateData.user.designation, 'Director of University Placements');
  assert.equal(updateData.user.role, 'admin'); // Must remain 'admin'
});

// ==========================================
// 4. COMPANY PROFILE & LOGO UPDATES
// ==========================================

test('Company can retrieve and update profile via /api/company/profile and /api/profile', async () => {
  const res = await api('/api/profile', {
    headers: { Authorization: `Bearer ${companyToken}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.companyName, 'ABC Technologies');

  const updateRes = await api('/api/company/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      companyName: 'ABC Technologies Global',
      website: 'https://abctech-global.com',
      companySize: '1000-5000',
      industry: 'Enterprise Cloud Solutions',
      headquarters: 'Hyderabad, India',
      officeLocations: 'Bengaluru, Hyderabad, Pune, Sunnyvale',
      description: 'Next generation enterprise software and cloud consulting.',
      hrName: 'Neha Verma',
      hrPhone: '9898989898',
      hrEmail: 'neha.verma@abctech-global.com',
      linkedin: 'https://linkedin.com/company/abctech',
      role: 'admin' // Attempted role tampering
    })
  });

  assert.equal(updateRes.status, 200);
  const updateData = await updateRes.json();
  assert.equal(updateData.companyName, 'ABC Technologies Global');
  assert.equal(updateData.companySize, '1000-5000');
  assert.equal(updateData.headquarters, 'Hyderabad, India');
  assert.equal(updateData.hrName, 'Neha Verma');

  // Verify role was not changed
  const compProfile = await api('/api/profile', {
    headers: { Authorization: `Bearer ${companyToken}` }
  });
  const compData = await compProfile.json();
  assert.equal(compData.userId.role, 'company');
});

// ==========================================
// 5. SECURITY & ROLE-BASED ACCESS CONTROL
// ==========================================

test('Unauthorized access across role boundaries is strictly rejected with 403', async () => {
  // Student trying to access Admin Profile
  const sToAdmin = await api('/api/admin/profile', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(sToAdmin.status, 403);

  // Student trying to access TPO Profile
  const sToTpo = await api('/api/tpo/profile', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(sToTpo.status, 403);

  // Student trying to access Company Profile
  const sToCompany = await api('/api/company/profile', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert.equal(sToCompany.status, 403);

  // TPO trying to access Admin Profile
  const tToAdmin = await api('/api/admin/profile', {
    headers: { Authorization: `Bearer ${tpoToken}` }
  });
  assert.equal(tToAdmin.status, 403);

  // Company trying to access Student Profile
  const cToStudent = await api('/api/student/profile', {
    headers: { Authorization: `Bearer ${companyToken}` }
  });
  assert.equal(cToStudent.status, 403);
});

test('Unauthenticated requests to /api/profile are rejected with 401', async () => {
  const res = await api('/api/profile');
  assert.equal(res.status, 401);
});

// ==========================================
// 6. IMAGE AND LOGO UPLOAD TESTS
// ==========================================

test('Student can upload profile photo and updates user profilePicture', async () => {
  const form = new FormData();
  // Valid 1x1 transparent PNG buffer
  const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  const blob = new Blob([pngBuffer], { type: 'image/png' });
  form.append('photo', blob, 'test-avatar.png');

  const res = await api('/api/student/profile/photo', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: form
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.profilePicture);
  assert.match(data.profilePicture, /^\/uploads\/avatars\//);

  // Verify in profile
  const profileRes = await api('/api/student/profile', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const profileData = await profileRes.json();
  assert.equal(profileData.userId.profilePicture, data.profilePicture);
});

test('Company can upload company logo and updates company logo and user profilePicture', async () => {
  const form = new FormData();
  const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  const blob = new Blob([pngBuffer], { type: 'image/png' });
  form.append('logo', blob, 'company-logo.png');

  const res = await api('/api/company/profile/logo', {
    method: 'POST',
    headers: { Authorization: `Bearer ${companyToken}` },
    body: form
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.logo);
  assert.match(data.logo, /^\/uploads\/logos\//);

  // Verify in company profile
  const profileRes = await api('/api/company/profile', {
    headers: { Authorization: `Bearer ${companyToken}` }
  });
  const profileData = await profileRes.json();
  assert.equal(profileData.logo, data.logo);
  assert.equal(profileData.userId.profilePicture, data.logo);
});

test('Image upload rejects unsupported file types', async () => {
  const form = new FormData();
  const txtBlob = new Blob(['Plain text not allowed'], { type: 'text/plain' });
  form.append('photo', txtBlob, 'malicious.txt');

  const res = await api('/api/student/profile/photo', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: form
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.error || data.message, /valid image files/i);
});

