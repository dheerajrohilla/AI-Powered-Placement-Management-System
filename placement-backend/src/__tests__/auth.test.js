process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/placement-db-test-auth';

import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../seed/seed.js';
import mongoose from 'mongoose';

let server;

test.before(async () => {
  await connectDB();
  await seedDatabase({ reset: true });

  server = app.listen(0);
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

test('seeded admin login succeeds', async () => {
  const response = await fetch('http://127.0.0.1:' + server.address().port + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@placement.com', password: 'admin123' })
  });

  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(data.token);
  assert.equal(data.user.role, 'admin');
});

test('invalid login fails', async () => {
  const response = await fetch('http://127.0.0.1:' + server.address().port + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@placement.com', password: 'wrongpass' })
  });

  assert.equal(response.status, 401);
});

test('forgot password route accepts valid email', async () => {
  const response = await fetch('http://127.0.0.1:' + server.address().port + '/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@placement.com' })
  });

  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(data.message);
});

test('student registration succeeds', async () => {
  const response = await fetch('http://127.0.0.1:' + server.address().port + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Samreen Shaik',
      email: 'samreen.test@example.com',
      password: 'password123',
      role: 'student',
      additionalData: {
        rollNumber: 'ROLL-9999',
        department: 'CSE',
        batch: '2026'
      }
    })
  });

  assert.equal(response.status, 201);
  const data = await response.json();
  assert.ok(data.token);
  assert.equal(data.user.name, 'Samreen Shaik');
  assert.equal(data.user.email, 'samreen.test@example.com');
});

