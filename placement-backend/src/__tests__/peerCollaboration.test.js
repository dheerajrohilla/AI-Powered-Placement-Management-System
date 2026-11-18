process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/placement-db-test-collab';

import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';
import { connectDB } from '../config/db.js';
import { seedDatabase } from '../seed/seed.js';
import mongoose from 'mongoose';
import Workspace from '../models/Workspace.js';
import WorkspaceChannel from '../models/WorkspaceChannel.js';
import WorkspaceInvitation from '../models/WorkspaceInvitation.js';
import WorkspaceMessage from '../models/WorkspaceMessage.js';
import Notification from '../models/Notification.js';

let server;
let studentAToken; // Prajwal Budhwant (prajwal@student.com)
let studentBToken; // Aditya Sharma (aditya@student.com)
let studentCToken; // Sneha Reddy (sneha@student.com)
let workspaceId;
let generalChannelId;

const api = (path, options = {}) => {
  const url = `http://127.0.0.1:${server.address().port}${path}`;
  return fetch(url, options);
};

test.before(async () => {
  await connectDB();
  await seedDatabase({ reset: true });
  server = app.listen(0);

  // Login Student A
  const resA = await api('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'prajwal@student.com', password: 'student123' })
  });
  const dataA = await resA.json();
  studentAToken = dataA.token;

  // Login Student B
  const resB = await api('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aditya@student.com', password: 'student123' })
  });
  const dataB = await resB.json();
  studentBToken = dataB.token;

  // Login Student C
  const resC = await api('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sneha@student.com', password: 'student123' })
  });
  const dataC = await resC.json();
  studentCToken = dataC.token;
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
// 1. WORKSPACE CREATION & CHANNELS
// ==========================================

test('Student A creates a peer workspace with default channels and retrieved properly', async () => {
  const res = await api('/api/student/workspaces', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentAToken}`
    },
    body: JSON.stringify({
      name: 'Algorithm Titans',
      description: 'Daily LeetCode medium & hard problem discussions',
      goal: 'DSA & Algorithms',
      category: 'DSA & Algorithms',
      isPrivate: true
    })
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.name, 'Algorithm Titans');
  assert.ok(data._id);
  assert.ok(data.channels && data.channels.length >= 3, 'Workspace must auto-create at least 3 default channels');

  workspaceId = data._id;
  const generalCh = data.channels.find(c => c.name === 'general') || data.channels[0];
  generalChannelId = generalCh._id;

  // Verify getWorkspaces includes channels on each workspace
  const listRes = await api('/api/student/workspaces', {
    headers: { Authorization: `Bearer ${studentAToken}` }
  });
  assert.equal(listRes.status, 200);
  const list = await listRes.json();
  const myWs = list.find(w => String(w._id) === String(workspaceId));
  assert.ok(myWs, 'Created workspace must be in list');
  assert.ok(myWs.channels && myWs.channels.length >= 3, 'Workspace from getWorkspaces must include channels');
});

// ==========================================
// 2. MESSAGING (BUG 1 VERIFICATION)
// ==========================================

test('Student A can post message into workspace channel and it persists in MongoDB', async () => {
  const content = 'Hello team, welcome to the Algorithm Titans study room! Let us tackle Graphs today.';
  const sendRes = await api(`/api/student/workspaces/${workspaceId}/channels/${generalChannelId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentAToken}`
    },
    body: JSON.stringify({ content })
  });

  assert.equal(sendRes.status, 201);
  const msgData = await sendRes.json();
  assert.equal(msgData.content, content);
  assert.ok(msgData._id);
  assert.equal(String(msgData.workspace), String(workspaceId));
  assert.equal(String(msgData.channel), String(generalChannelId));
  assert.ok(msgData.senderName);

  // Verify persistence in MongoDB
  const saved = await WorkspaceMessage.findById(msgData._id);
  assert.ok(saved);
  assert.equal(saved.content, content);

  // Retrieve channel messages
  const getRes = await api(`/api/student/workspaces/${workspaceId}/channels/${generalChannelId}/messages`, {
    headers: { Authorization: `Bearer ${studentAToken}` }
  });
  assert.equal(getRes.status, 200);
  const stream = await getRes.json();
  assert.ok(stream.messages.some(m => m.content === content));
});

test('Messaging validation rejects empty message submissions', async () => {
  const emptyRes = await api(`/api/student/workspaces/${workspaceId}/channels/${generalChannelId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentAToken}`
    },
    body: JSON.stringify({ content: '   ' })
  });

  assert.equal(emptyRes.status, 400);
});

test('Non-member Student B cannot read or post messages to private workspace before joining', async () => {
  // Reading
  const readRes = await api(`/api/student/workspaces/${workspaceId}/channels/${generalChannelId}/messages`, {
    headers: { Authorization: `Bearer ${studentBToken}` }
  });
  assert.equal(readRes.status, 403);

  // Posting
  const postRes = await api(`/api/student/workspaces/${workspaceId}/channels/${generalChannelId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentBToken}`
    },
    body: JSON.stringify({ content: 'Unauthorized intrusion' })
  });
  assert.equal(postRes.status, 403);
});

// ==========================================
// 3. INVITATIONS WORKFLOW (BUG 2 VERIFICATION)
// ==========================================

test('Student A can invite Student B by email address (case-insensitive)', async () => {
  const inviteRes = await api(`/api/student/workspaces/${workspaceId}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentAToken}`
    },
    body: JSON.stringify({
      email: 'ADITYA@STUDENT.COM', // Test case-insensitive email normalization
      message: 'Hey Aditya, join our graph theory study session!'
    })
  });

  assert.equal(inviteRes.status, 201);
  const inviteData = await inviteRes.json();
  assert.ok(inviteData.invitation);
  assert.equal(inviteData.invitation.status, 'pending');
  assert.equal(inviteData.invitation.recipientEmail, 'aditya@student.com');

  // Verify in MongoDB
  const dbInv = await WorkspaceInvitation.findById(inviteData.invitation._id);
  assert.ok(dbInv);
  assert.equal(dbInv.status, 'pending');

  // Verify in-app Notification was generated for Student B
  const notif = await Notification.findOne({
    title: 'Workspace Invitation',
    message: { $regex: /Algorithm Titans/i }
  });
  assert.ok(notif, 'In-app notification must be created for invited recipient');
});

test('Duplicate pending invitation to the same student is rejected with 400', async () => {
  const dupRes = await api(`/api/student/workspaces/${workspaceId}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentAToken}`
    },
    body: JSON.stringify({ email: 'aditya@student.com' })
  });

  assert.equal(dupRes.status, 400);
  const dupData = await dupRes.json();
  assert.match(dupData.error, /pending invitation/i);
});

test('Inviting an unregistered email address returns 404', async () => {
  const unregRes = await api(`/api/student/workspaces/${workspaceId}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentAToken}`
    },
    body: JSON.stringify({ email: 'nobody_unregistered_999@randomdomain.org' })
  });

  assert.equal(unregRes.status, 404);
  const unregData = await unregRes.json();
  assert.match(unregData.error, /no registered student/i);
});

test('Inviting oneself is rejected with 400', async () => {
  const selfRes = await api(`/api/student/workspaces/${workspaceId}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentAToken}`
    },
    body: JSON.stringify({ email: 'prajwal@student.com' })
  });

  assert.equal(selfRes.status, 400);
  const selfData = await selfRes.json();
  assert.match(selfData.error, /cannot invite yourself/i);
});

test('Student B receives and retrieves pending invitation', async () => {
  const getInvRes = await api('/api/student/workspaces/invitations', {
    headers: { Authorization: `Bearer ${studentBToken}` }
  });

  assert.equal(getInvRes.status, 200);
  const invitations = await getInvRes.json();
  assert.ok(invitations.length >= 1, 'Student B must receive pending invitation');
  const inv = invitations.find(i => String(i.workspace?._id) === String(workspaceId));
  assert.ok(inv);
  assert.equal(inv.workspace.name, 'Algorithm Titans');
  assert.ok(inv.sender);
  assert.equal(inv.status, 'pending');
});

test('Student B can accept the invitation and is added to workspace members', async () => {
  const getInvRes = await api('/api/student/workspaces/invitations', {
    headers: { Authorization: `Bearer ${studentBToken}` }
  });
  const invitations = await getInvRes.json();
  const targetInv = invitations.find(i => String(i.workspace?._id) === String(workspaceId));

  const acceptRes = await api(`/api/student/workspaces/invitations/${targetInv._id}/respond`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentBToken}`
    },
    body: JSON.stringify({ action: 'accept' })
  });

  assert.equal(acceptRes.status, 200);
  const acceptData = await acceptRes.json();
  assert.equal(acceptData.status, 'accepted');

  // Verify in MongoDB
  const updatedInv = await WorkspaceInvitation.findById(targetInv._id);
  assert.equal(updatedInv.status, 'accepted');

  // Verify Student B is in workspace members list
  const wsDoc = await Workspace.findById(workspaceId);
  assert.ok(wsDoc.members.some(m => String(m.student) === String(updatedInv.recipient)));

  // Verify Student B now sees workspace in myWorkspaces
  const bWsListRes = await api('/api/student/workspaces', {
    headers: { Authorization: `Bearer ${studentBToken}` }
  });
  const bList = await bWsListRes.json();
  assert.ok(bList.some(w => String(w._id) === String(workspaceId)));
});

test('Student B can now post messages and both Student A and B see conversation', async () => {
  const replyContent = 'Thanks Prajwal! Excited to collaborate on Bellman-Ford and Dijkstra algorithms.';
  const replyRes = await api(`/api/student/workspaces/${workspaceId}/channels/${generalChannelId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentBToken}`
    },
    body: JSON.stringify({ content: replyContent })
  });

  assert.equal(replyRes.status, 201);

  // Student A retrieves channel messages and sees Student B's reply
  const aMessagesRes = await api(`/api/student/workspaces/${workspaceId}/channels/${generalChannelId}/messages`, {
    headers: { Authorization: `Bearer ${studentAToken}` }
  });
  const aStream = await aMessagesRes.json();
  const bMessage = aStream.messages.find(m => m.content === replyContent);
  assert.ok(bMessage, 'Student A must see Student B message in channel stream');
});

test('Inviting an already existing workspace member is rejected with 400', async () => {
  const alreadyMemberRes = await api(`/api/student/workspaces/${workspaceId}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentAToken}`
    },
    body: JSON.stringify({ email: 'aditya@student.com' })
  });

  assert.equal(alreadyMemberRes.status, 400);
  const data = await alreadyMemberRes.json();
  assert.match(data.error, /already a member/i);
});

// ==========================================
// 4. DECLINING INVITATIONS WORKFLOW
// ==========================================

test('Student C receives invitation and can decline it', async () => {
  // Student A invites Student C
  const inviteCRes = await api(`/api/student/workspaces/${workspaceId}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentAToken}`
    },
    body: JSON.stringify({
      email: 'sneha@student.com',
      message: 'Join us for frontend design patterns'
    })
  });
  assert.equal(inviteCRes.status, 201);
  const inviteCData = await inviteCRes.json();

  // Student C retrieves invitations
  const cInvsRes = await api('/api/student/workspaces/invitations', {
    headers: { Authorization: `Bearer ${studentCToken}` }
  });
  const cInvs = await cInvsRes.json();
  const invForC = cInvs.find(i => String(i._id) === String(inviteCData.invitation._id));
  assert.ok(invForC);

  // Student C declines
  const declineRes = await api(`/api/student/workspaces/invitations/${invForC._id}/respond`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentCToken}`
    },
    body: JSON.stringify({ action: 'decline' })
  });
  assert.equal(declineRes.status, 200);

  // Verify status in DB is declined
  const declinedInv = await WorkspaceInvitation.findById(invForC._id);
  assert.equal(declinedInv.status, 'declined');

  // Verify Student C was NOT added to workspace members
  const wsDoc = await Workspace.findById(workspaceId);
  const isCMember = wsDoc.members.some(m => String(m.student) === String(declinedInv.recipient));
  assert.equal(isCMember, false);
});

test('Responding to an invitation belonging to another student is rejected with 403', async () => {
  // Create an invitation for Student C
  const reInviteC = await api(`/api/student/workspaces/${workspaceId}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentAToken}`
    },
    body: JSON.stringify({ email: 'sneha@student.com' })
  });
  const cData = await reInviteC.json();

  // Student B attempts to accept Student C's invitation
  const tamperRes = await api(`/api/student/workspaces/invitations/${cData.invitation._id}/respond`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentBToken}`
    },
    body: JSON.stringify({ action: 'accept' })
  });

  assert.equal(tamperRes.status, 403);
});

