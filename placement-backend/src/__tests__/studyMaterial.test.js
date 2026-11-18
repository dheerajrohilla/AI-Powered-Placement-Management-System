process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/placement-db-test-studymaterial';

import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../seed/seed.js';
import mongoose from 'mongoose';
import { scanStudyMaterials, resolvePdfPath } from '../services/studyMaterialService.js';

let server;
let studentToken;

test.before(async () => {
  await connectDB();
  await seedDatabase({ reset: true });

  server = app.listen(0);

  // Authenticate as student to test protected endpoints
  const loginRes = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rahul@student.com', password: 'student123' })
  });

  const loginData = await loginRes.json();
  studentToken = loginData.token;
  assert.ok(studentToken, 'Student login should return a valid JWT token');
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

test('service scans and discovers all 7 core subjects and actual PDFs', () => {
  const result = scanStudyMaterials();
  assert.equal(result.exists, true, 'Study material directory should exist');
  assert.ok(result.totalPdfs >= 7, 'Should find at least 7 core PDF files');

  const subjectIds = result.subjects.map(s => s.id);
  assert.ok(subjectIds.includes('oops'), 'Should have OOPS');
  assert.ok(subjectIds.includes('dsa'), 'Should have DSA');
  assert.ok(subjectIds.includes('daa'), 'Should have DAA');
  assert.ok(subjectIds.includes('coa'), 'Should have COA');
  assert.ok(subjectIds.includes('os'), 'Should have OS');
  assert.ok(subjectIds.includes('dbms'), 'Should have DBMS');
  assert.ok(subjectIds.includes('cn'), 'Should have CN');

  // Verify each core subject has at least 1 PDF
  const oops = result.subjects.find(s => s.id === 'oops');
  assert.ok(oops && oops.pdfCount >= 1, 'OOPS should have at least 1 PDF');

  const dsa = result.subjects.find(s => s.id === 'dsa');
  assert.ok(dsa && dsa.pdfCount >= 1, 'DSA should have at least 1 PDF');

  const daa = result.subjects.find(s => s.id === 'daa');
  assert.ok(daa && daa.pdfCount >= 1, 'DAA should have at least 1 PDF');

  const coa = result.subjects.find(s => s.id === 'coa');
  assert.ok(coa && coa.pdfCount >= 1, 'COA should have at least 1 PDF');

  const os = result.subjects.find(s => s.id === 'os');
  assert.ok(os && os.pdfCount >= 1, 'OS should have at least 1 PDF');

  const dbms = result.subjects.find(s => s.id === 'dbms');
  assert.ok(dbms && dbms.pdfCount >= 1, 'DBMS should have at least 1 PDF');

  const cn = result.subjects.find(s => s.id === 'cn');
  assert.ok(cn && cn.pdfCount >= 1, 'CN should have at least 1 PDF');
});

test('GET /api/study-materials/subjects requires authentication', async () => {
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/study-materials/subjects`);
  assert.equal(res.status, 401);
});

test('GET /api/study-materials/subjects returns all subjects with counts and metadata', async () => {
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/study-materials/subjects`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.subjects.length >= 6);
  assert.ok(data.stats.totalPdfs >= 6);
});

test('GET /api/study-materials/subjects/:subjectId returns specific subject details', async () => {
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/study-materials/subjects/dsa`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.subject.id, 'dsa');
  assert.ok(data.subject.files.length >= 1);
  assert.ok(data.subject.files[0].id);
  assert.ok(data.subject.files[0].title);
  assert.ok(data.subject.files[0].formattedSize);
});

test('GET /api/study-materials/pdf/:fileId/metadata returns single file metadata', async () => {
  const scan = scanStudyMaterials();
  const samplePdf = scan.allPdfs[0];

  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/study-materials/pdf/${samplePdf.id}/metadata`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.pdf.title, samplePdf.title);
  assert.equal(data.pdf.sizeBytes, samplePdf.sizeBytes);
});

test('GET /api/study-materials/pdf/:fileId/stream streams full PDF with 200 OK', async () => {
  const scan = scanStudyMaterials();
  const samplePdf = scan.allPdfs[0];

  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/study-materials/pdf/${samplePdf.id}/stream`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/pdf');
  assert.equal(res.headers.get('accept-ranges'), 'bytes');
  assert.equal(res.headers.get('content-length'), String(samplePdf.sizeBytes));

  const buf = await res.arrayBuffer();
  assert.equal(buf.byteLength, samplePdf.sizeBytes);
});

test('GET /api/study-materials/pdf/:fileId/stream supports HTTP Range requests with 206 Partial Content', async () => {
  const scan = scanStudyMaterials();
  const samplePdf = scan.allPdfs[0];

  const rangeStart = 0;
  const rangeEnd = 1023; // First 1024 bytes
  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/study-materials/pdf/${samplePdf.id}/stream`, {
    headers: {
      Authorization: `Bearer ${studentToken}`,
      Range: `bytes=${rangeStart}-${rangeEnd}`
    }
  });

  assert.equal(res.status, 206);
  assert.equal(res.headers.get('content-type'), 'application/pdf');
  assert.equal(res.headers.get('accept-ranges'), 'bytes');
  assert.equal(res.headers.get('content-range'), `bytes ${rangeStart}-${rangeEnd}/${samplePdf.sizeBytes}`);
  assert.equal(res.headers.get('content-length'), '1024');

  const buf = await res.arrayBuffer();
  assert.equal(buf.byteLength, 1024);
});

test('GET /api/study-materials/pdf/:fileId/download sets attachment headers', async () => {
  const scan = scanStudyMaterials();
  const samplePdf = scan.allPdfs[0];

  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/study-materials/pdf/${samplePdf.id}/download`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/pdf');
  assert.ok(res.headers.get('content-disposition').includes('attachment'));
});

test('rejects path traversal attacks securely', () => {
  assert.throws(() => {
    resolvePdfPath(Buffer.from('../../../package.json').toString('base64url'));
  }, /Access denied|not found/i);
});
