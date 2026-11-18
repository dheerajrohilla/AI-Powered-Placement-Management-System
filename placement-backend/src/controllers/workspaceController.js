import Workspace from '../models/Workspace.js';
import WorkspaceChannel from '../models/WorkspaceChannel.js';
import WorkspaceMessage from '../models/WorkspaceMessage.js';
import WorkspaceTask from '../models/WorkspaceTask.js';
import WorkspaceResource from '../models/WorkspaceResource.js';
import WorkspaceCodeSession from '../models/WorkspaceCodeSession.js';
import WorkspaceInvitation from '../models/WorkspaceInvitation.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../services/emailService.js';
import { getIO, isStudentOnline } from '../services/socketService.js';
import vm from 'vm';

/**
 * Helper to get current authenticated student
 */
const getAuthenticatedStudent = async (userId) => {
  const student = await Student.findOne({ userId }).populate('userId', 'name email');
  if (!student) {
    const error = new Error('Student profile not found');
    error.status = 404;
    throw error;
  }
  return student;
};

// =========================================================================
// 1. WORKSPACES CRUD
// =========================================================================

export const getWorkspaces = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const { category, search, scope = 'all' } = req.query;

    const myWorkspacesQuery = { 'members.student': student._id };
    if (category) myWorkspacesQuery.category = category;
    if (search) {
      myWorkspacesQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const myWorkspaces = await Workspace.find(myWorkspacesQuery)
      .populate('owner', 'department batch')
      .populate({
        path: 'members.student',
        populate: { path: 'userId', select: 'name email profilePicture' }
      })
      .sort({ updatedAt: -1 });

    let publicWorkspaces = [];
    if (scope === 'all' || scope === 'explore') {
      const publicQuery = {
        isPrivate: false,
        'members.student': { $ne: student._id }
      };
      if (category) publicQuery.category = category;
      if (search) {
        publicQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      publicWorkspaces = await Workspace.find(publicQuery)
        .populate('owner', 'department batch')
        .populate({
          path: 'members.student',
          populate: { path: 'userId', select: 'name email profilePicture' }
        })
        .sort({ createdAt: -1 })
        .limit(20);
    }

    // Helper to ensure channels exist and attach them
    const attachChannelsAndPresence = async (wsList) => {
      if (!wsList || wsList.length === 0) return [];
      const wsIds = wsList.map(w => w._id);
      const allChannels = await WorkspaceChannel.find({ workspace: { $in: wsIds } }).sort({ createdAt: 1 });

      const channelsByWs = {};
      for (const ch of allChannels) {
        const idStr = String(ch.workspace);
        if (!channelsByWs[idStr]) channelsByWs[idStr] = [];
        channelsByWs[idStr].push(ch);
      }

      const results = [];
      for (const ws of wsList) {
        const doc = ws.toObject();
        let wsChannels = channelsByWs[String(ws._id)] || [];
        if (wsChannels.length === 0) {
          // Self-heal: auto-generate standard default channels
          try {
            wsChannels = await WorkspaceChannel.insertMany([
              { workspace: ws._id, name: 'general', topic: 'General study discussions and announcements', type: 'text', isDefault: true },
              { workspace: ws._id, name: 'study-notes', topic: 'Curated revision notes and interview cheat sheets', type: 'study', isDefault: false },
              { workspace: ws._id, name: 'coding-lab', topic: 'Live problem solving and code review', type: 'code', isDefault: false }
            ]);
          } catch (insertErr) {
            wsChannels = await WorkspaceChannel.find({ workspace: ws._id });
          }
        }
        doc.channels = wsChannels;
        doc.onlineMembersCount = ws.members.filter(m => isStudentOnline(m.student?._id || m.student)).length;
        doc.isJoined = ws.members.some(m => String(m.student?._id || m.student) === String(student._id));
        results.push(doc);
      }
      return results;
    };

    const enrichedMy = await attachChannelsAndPresence(myWorkspaces);
    if (req.query.scope === 'explore' || req.query.format === 'grouped') {
      const enrichedPublic = await attachChannelsAndPresence(publicWorkspaces);
      return res.json({
        myWorkspaces: enrichedMy,
        exploreWorkspaces: enrichedPublic
      });
    }

    res.json(enrichedMy);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const createWorkspace = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const { name, description, goal, category, isPrivate, tags = [] } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }

    const workspace = await Workspace.create({
      name: name.trim(),
      description: description || '',
      goal: goal || 'Campus Placement Preparation',
      category: category || 'DSA & Algorithms',
      isPrivate: Boolean(isPrivate),
      owner: student._id,
      members: [{
        student: student._id,
        role: 'owner',
        joinedAt: new Date()
      }],
      tags: Array.isArray(tags) ? tags : []
    });

    // Create standard default channels
    const channels = await WorkspaceChannel.insertMany([
      { workspace: workspace._id, name: 'general', topic: 'General study discussions and announcements', type: 'text', isDefault: true },
      { workspace: workspace._id, name: 'study-notes', topic: 'Curated revision notes and interview cheat sheets', type: 'study', isDefault: false },
      { workspace: workspace._id, name: 'coding-lab', topic: 'Live problem solving and code review', type: 'code', isDefault: false }
    ]);

    // Create initial code session
    await WorkspaceCodeSession.create({
      workspace: workspace._id,
      title: `${workspace.name} Problem Solving Session`,
      lastEditedBy: student._id,
      lastEditedByName: student.userId?.name || 'Student'
    });

    // Post welcome system message in general channel
    const defaultChannel = channels[0];
    await WorkspaceMessage.create({
      workspace: workspace._id,
      channel: defaultChannel._id,
      sender: student._id,
      senderUser: student.userId?._id || student._id,
      senderName: 'System / Workspace Bot',
      content: `🎉 Welcome to **${workspace.name}**! This workspace has been created for ${workspace.category}. You can now chat in real time, share study resources, track prep tasks, and write code together!`
    });

    res.status(201).json({
      ...workspace.toObject(),
      workspace,
      channels,
      defaultChannelId: defaultChannel._id
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getWorkspaceById = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const { id } = req.params;

    const workspace = await Workspace.findById(id)
      .populate('owner', 'department batch')
      .populate({
        path: 'members.student',
        populate: { path: 'userId', select: 'name email profilePicture' }
      });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const isMember = workspace.members.some(
      m => String(m.student?._id || m.student) === String(student._id)
    );

    if (workspace.isPrivate && !isMember) {
      return res.status(403).json({ error: 'Access denied: Private workspace' });
    }

    let channels = await WorkspaceChannel.find({ workspace: id }).sort({ createdAt: 1 });
    if (channels.length === 0) {
      try {
        channels = await WorkspaceChannel.insertMany([
          { workspace: workspace._id, name: 'general', topic: 'General study discussions and announcements', type: 'text', isDefault: true },
          { workspace: workspace._id, name: 'study-notes', topic: 'Curated revision notes and interview cheat sheets', type: 'study', isDefault: false },
          { workspace: workspace._id, name: 'coding-lab', topic: 'Live problem solving and code review', type: 'code', isDefault: false }
        ]);
      } catch (insertErr) {
        channels = await WorkspaceChannel.find({ workspace: id });
      }
    }

    const tasks = await WorkspaceTask.find({ workspace: id }).sort({ createdAt: -1 });
    const resources = await WorkspaceResource.find({ workspace: id }).sort({ createdAt: -1 });
    const codeSession = await WorkspaceCodeSession.findOne({ workspace: id });

    const memberRole = workspace.members.find(
      m => String(m.student?._id || m.student) === String(student._id)
    )?.role || (isMember ? 'member' : 'viewer');

    res.json({
      workspace,
      isMember,
      myRole: memberRole,
      channels,
      tasks,
      resources,
      codeSession
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getWorkspaceMembers = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const { id } = req.params;

    const workspace = await Workspace.findById(id)
      .populate({
        path: 'members.student',
        populate: { path: 'userId', select: 'name email profilePicture phone' }
      });

    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    const isMember = workspace.members.some(
      m => String(m.student?._id || m.student) === String(student._id)
    );

    if (workspace.isPrivate && !isMember) {
      return res.status(403).json({ error: 'Access denied to private workspace' });
    }

    const members = workspace.members.map(m => {
      const s = m.student || {};
      const u = s.userId || {};
      return {
        _id: s._id,
        studentId: s._id,
        userId: u._id,
        name: u.name || s.rollNumber || 'Student',
        email: u.email || '',
        profilePicture: u.profilePicture || '',
        department: s.department || '',
        batch: s.batch || '',
        role: m.role || 'member',
        joinedAt: m.joinedAt || workspace.createdAt,
        isOnline: isStudentOnline(s._id)
      };
    });

    res.json(members);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const updateWorkspace = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const { id } = req.params;
    const { name, description, goal, category, isPrivate, tags } = req.body;

    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    const member = workspace.members.find(
      m => String(m.student) === String(student._id)
    );
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({ error: 'Forbidden: Admin or owner permissions required' });
    }

    if (name) workspace.name = name.trim();
    if (description !== undefined) workspace.description = description;
    if (goal !== undefined) workspace.goal = goal;
    if (category) workspace.category = category;
    if (isPrivate !== undefined) workspace.isPrivate = isPrivate;
    if (Array.isArray(tags)) workspace.tags = tags;
    workspace.updatedAt = new Date();

    await workspace.save();
    res.json(workspace);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteWorkspace = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const { id } = req.params;

    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    if (String(workspace.owner) !== String(student._id)) {
      return res.status(403).json({ error: 'Forbidden: Only the workspace creator can delete it' });
    }

    // Clean up all related documents
    await Promise.all([
      Workspace.findByIdAndDelete(id),
      WorkspaceChannel.deleteMany({ workspace: id }),
      WorkspaceMessage.deleteMany({ workspace: id }),
      WorkspaceTask.deleteMany({ workspace: id }),
      WorkspaceResource.deleteMany({ workspace: id }),
      WorkspaceCodeSession.deleteMany({ workspace: id }),
      WorkspaceInvitation.deleteMany({ workspace: id })
    ]);

    res.json({ message: 'Workspace deleted successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// =========================================================================
// 2. MEMBERSHIP & INVITATIONS
// =========================================================================

export const joinWorkspace = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const { id } = req.params;
    const { inviteCode } = req.body;

    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    const alreadyMember = workspace.members.some(
      m => String(m.student) === String(student._id)
    );
    if (alreadyMember) {
      return res.status(400).json({ error: 'You are already a member of this workspace' });
    }

    if (workspace.isPrivate && workspace.inviteCode !== inviteCode?.toUpperCase()) {
      return res.status(403).json({ error: 'Invalid invite code for private workspace' });
    }

    workspace.members.push({
      student: student._id,
      role: 'member',
      joinedAt: new Date()
    });
    workspace.updatedAt = new Date();
    await workspace.save();

    res.json({ message: 'Joined workspace successfully', workspace });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const inviteToWorkspace = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const { id } = req.params;
    const { recipientStudentId, email, recipientEmail, message, role = 'member' } = req.body;

    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    const isMember = workspace.members.some(
      m => String(m.student?._id || m.student) === String(student._id)
    );
    if (!isMember) {
      return res.status(403).json({ error: 'Only current members can invite peers' });
    }

    let recipient = null;
    let targetEmail = (email || recipientEmail || '').trim().toLowerCase();

    // 1. If email is provided, validate and find registered account in MongoDB
    if (targetEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(targetEmail)) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
      }

      // Case-insensitive lookup against User model
      const targetUser = await User.findOne({ email: targetEmail });
      if (targetUser) {
        if (targetUser.role && targetUser.role !== 'student') {
          return res.status(400).json({ error: 'Workspace invitations can only be sent to registered student accounts' });
        }
        recipient = await Student.findOne({ userId: targetUser._id }).populate('userId', 'name email profilePicture');
        if (!recipient) {
          recipient = await Student.create({
            userId: targetUser._id,
            rollNumber: `ROLL-${Date.now().toString().slice(-6)}`,
            department: 'General',
            batch: new Date().getFullYear().toString()
          });
          recipient = await Student.findById(recipient._id).populate('userId', 'name email profilePicture');
        }
      } else {
        // Fallback: check Student by userEmail if present
        recipient = await Student.findOne({ userEmail: targetEmail }).populate('userId', 'name email profilePicture');
      }

      if (!recipient) {
        return res.status(404).json({
          error: `No registered student account was found with email: ${targetEmail}. Please ensure the student is registered.`
        });
      }
    } else if (recipientStudentId) {
      // 2. Direct lookup by recipientStudentId if email was not supplied
      recipient = await Student.findById(recipientStudentId).populate('userId', 'name email profilePicture');
      if (!recipient) return res.status(404).json({ error: 'Recipient student not found' });
      targetEmail = recipient.userId?.email?.toLowerCase() || '';
    } else {
      return res.status(400).json({ error: 'Please provide a student email address to invite' });
    }

    // 3. Prevent self-invitation
    if (String(recipient._id) === String(student._id) || String(recipient.userId?._id || recipient.userId) === String(req.user.id)) {
      return res.status(400).json({ error: 'You cannot invite yourself to your own workspace' });
    }

    // 4. Verify recipient is not already a member
    const alreadyMember = workspace.members.some(
      m => String(m.student?._id || m.student) === String(recipient._id)
    );
    if (alreadyMember) {
      return res.status(400).json({ error: 'This student is already a member of this workspace' });
    }

    // 5. Check for duplicate pending invitation
    const existingPending = await WorkspaceInvitation.findOne({
      workspace: workspace._id,
      $or: [
        { recipient: recipient._id },
        ...(targetEmail ? [{ recipientEmail: targetEmail }] : [])
      ],
      status: 'pending'
    });
    if (existingPending) {
      return res.status(400).json({ error: 'A pending invitation has already been sent to this student for this workspace' });
    }

    // 6. Create permanent invitation record in MongoDB
    const invitation = await WorkspaceInvitation.create({
      workspace: workspace._id,
      sender: student._id,
      recipient: recipient._id,
      recipientEmail: targetEmail || recipient.userId?.email?.toLowerCase(),
      message: message ? message.trim() : `Join our ${workspace.name} study workspace!`
    });

    // 7. Create in-app Notification for the recipient student
    try {
      const recipientUserId = recipient.userId?._id || recipient.userId;
      if (recipientUserId) {
        await Notification.create({
          recipientRole: 'student',
          recipientUserId,
          recipientUser: recipientUserId,
          title: 'Workspace Invitation',
          message: `${student.userId?.name || 'A peer'} invited you to join "${workspace.name}" workspace.`,
          type: 'info',
          link: '/student/collaborate',
          isRead: false
        });
      }
    } catch (notifErr) {
      console.warn('Failed to create in-app notification for invitation:', notifErr.message);
    }

    // 8. Dispatch notification email if email service is active or simulate in test
    try {
      if (targetEmail) {
        const senderName = student.userId?.name || 'A peer';
        await sendEmail({
          to: targetEmail,
          subject: `🤝 Workspace Invitation: Join "${workspace.name}" on Placement Portal`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #2563eb;">You've Been Invited to a Study Workspace!</h2>
              <p><strong>${senderName}</strong> has invited you to collaborate in the workspace <strong>"${workspace.name}"</strong> (${workspace.category}).</p>
              <p style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-style: italic;">"${message || 'Join our placement study group!'}"</p>
              <p>Log in to your Student Portal to accept the invitation and start collaborating in real time.</p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/student/collaborate" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Open Peer Collaboration</a>
            </div>
          `,
          text: `${senderName} invited you to join "${workspace.name}". Log in to ${process.env.CLIENT_URL || 'http://localhost:5173'}/student/collaborate to accept.`,
          source: 'workspace_invitation'
        });
      }
    } catch (mailErr) {
      console.warn('Workspace invitation email dispatch:', mailErr.message);
    }

    // 9. Real-Time Socket Broadcast
    const io = getIO();
    if (io) {
      io.emit('workspace:invitation:new', {
        recipientStudentId: recipient._id,
        recipientEmail: targetEmail,
        invitation
      });
    }

    res.status(201).json({
      message: `Invitation successfully sent to ${targetEmail || recipient.userId?.name || 'student'}`,
      invitation
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getMyInvitations = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const userEmail = student.userId?.email?.toLowerCase();

    const query = {
      $or: [
        { recipient: student._id },
        ...(userEmail ? [{ recipientEmail: userEmail }] : [])
      ]
    };

    if (req.query.status) {
      query.status = req.query.status;
    } else {
      query.status = 'pending';
    }

    const invitations = await WorkspaceInvitation.find(query)
      .populate('workspace', 'name description category isPrivate members goal')
      .populate({
        path: 'sender',
        populate: { path: 'userId', select: 'name email profilePicture' }
      })
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const respondToInvitation = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const { invitationId } = req.params;
    const action = (req.body.action || req.body.status || '').toLowerCase().trim();

    if (!action || !['accept', 'accepted', 'decline', 'declined'].includes(action)) {
      return res.status(400).json({ error: 'Valid action (accept or decline) is required' });
    }

    const invitation = await WorkspaceInvitation.findById(invitationId);
    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });

    const userEmail = student.userId?.email?.toLowerCase();
    const isRecipient = String(invitation.recipient) === String(student._id) ||
      (invitation.recipientEmail && userEmail && invitation.recipientEmail === userEmail);

    if (!isRecipient) {
      return res.status(403).json({ error: 'Forbidden: This invitation was not addressed to your account' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        error: `This invitation has already been ${invitation.status}.`,
        status: invitation.status
      });
    }

    const isAccepting = action === 'accept' || action === 'accepted';
    if (isAccepting) {
      invitation.status = 'accepted';
      invitation.updatedAt = new Date();
      await invitation.save();

      const workspace = await Workspace.findById(invitation.workspace);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace no longer exists' });
      }

      const alreadyMember = workspace.members.some(
        m => String(m.student?._id || m.student) === String(student._id)
      );
      if (!alreadyMember) {
        workspace.members.push({ student: student._id, role: 'member', joinedAt: new Date() });
        workspace.updatedAt = new Date();
        await workspace.save();
      }

      return res.json({
        message: 'Invitation accepted and added to workspace',
        status: 'accepted',
        workspaceId: workspace._id
      });
    } else {
      invitation.status = 'declined';
      invitation.updatedAt = new Date();
      await invitation.save();

      return res.json({
        message: 'Invitation declined',
        status: 'declined'
      });
    }
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// =========================================================================
// 3. MESSAGING & CHANNELS
// =========================================================================

export const getChannelMessages = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const { id: workspaceId, channelId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    const isMember = workspace.members.some(m => String(m.student?._id || m.student) === String(student._id));
    if (workspace.isPrivate && !isMember) {
      return res.status(403).json({ error: 'Access denied to private workspace' });
    }

    const total = await WorkspaceMessage.countDocuments({ workspace: workspaceId, channel: channelId });
    const messages = await WorkspaceMessage.find({ workspace: workspaceId, channel: channelId })
      .populate({
        path: 'sender',
        select: 'department batch rollNumber userId',
        populate: { path: 'userId', select: 'name email profilePicture' }
      })
      .populate('senderUser', 'name email profilePicture')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      messages: messages.reverse(),
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const postMessageHttp = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const { id: workspaceId, channelId } = req.params;
    const { content, replyTo } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    const isMember = workspace.members.some(m => String(m.student?._id || m.student) === String(student._id));
    if (!isMember) {
      return res.status(403).json({ error: 'Must be a member to post in workspace' });
    }

    // Auto-resolve channel if channelId is missing or invalid
    let targetChannelId = channelId;
    if (!targetChannelId || targetChannelId === 'default' || targetChannelId === 'general') {
      const defaultCh = await WorkspaceChannel.findOne({ workspace: workspaceId, isDefault: true }) ||
        await WorkspaceChannel.findOne({ workspace: workspaceId });
      if (defaultCh) {
        targetChannelId = defaultCh._id;
      }
    }

    const sanitized = content.slice(0, 4000).trim();

    const messageDoc = await WorkspaceMessage.create({
      workspace: workspaceId,
      channel: targetChannelId,
      sender: student._id,
      senderUser: student.userId?._id || req.user.id,
      senderName: student.userId?.name || student.rollNumber || 'Student',
      content: sanitized,
      replyTo: replyTo || null
    });

    const populated = await WorkspaceMessage.findById(messageDoc._id)
      .populate({
        path: 'sender',
        select: 'department batch rollNumber userId',
        populate: { path: 'userId', select: 'name email profilePicture' }
      })
      .populate('senderUser', 'name email profilePicture')
      .populate('replyTo');

    // Broadcast through socket if available to both channel room and workspace room
    const io = getIO();
    if (io) {
      io.to(`workspace:${workspaceId}:channel:${targetChannelId}`).emit('new_message', populated);
      io.to(`workspace:${workspaceId}:channel:${targetChannelId}`).emit('workspace:message:new', populated);
      io.to(`workspace:${workspaceId}`).emit('new_message', populated);
      io.to(`workspace:${workspaceId}`).emit('workspace:message:new', populated);
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const editMessage = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content cannot be empty' });
    }

    const message = await WorkspaceMessage.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    if (String(message.sender) !== String(student._id)) {
      return res.status(403).json({ error: 'You can only edit your own messages' });
    }

    message.content = content.slice(0, 4000).trim();
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    const io = getIO();
    if (io) {
      io.to(`workspace:${message.workspace}:channel:${message.channel}`).emit('message_updated', message);
    }

    res.json(message);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const { messageId } = req.params;

    const message = await WorkspaceMessage.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    const workspace = await Workspace.findById(message.workspace);
    const memberRole = workspace?.members.find(m => String(m.student) === String(student._id))?.role;

    const isAuthor = String(message.sender) === String(student._id);
    const isAdmin = memberRole === 'owner' || memberRole === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'Permission denied to delete message' });
    }

    message.isDeleted = true;
    message.content = '*(This message was deleted)*';
    await message.save();

    const io = getIO();
    if (io) {
      io.to(`workspace:${message.workspace}:channel:${message.channel}`).emit('message_deleted', { messageId });
    }

    res.json({ message: 'Message deleted', messageId });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// =========================================================================
// 4. WORKSPACE TASKS & STUDY GOALS
// =========================================================================

export const getWorkspaceTasks = async (req, res) => {
  try {
    const { id: workspaceId } = req.params;
    const tasks = await WorkspaceTask.find({ workspace: workspaceId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createWorkspaceTask = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const { id: workspaceId } = req.params;
    const { title, description, category, priority, dueDate, assignedName } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const task = await WorkspaceTask.create({
      workspace: workspaceId,
      title: title.trim(),
      description: description || '',
      category: category || 'Prep Milestone',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedName: assignedName || 'All Members',
      createdBy: student._id,
      createdByName: student.userId?.name || student.rollNumber || 'Student'
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const updateWorkspaceTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body; // 'pending' | 'in_progress' | 'completed'

    const task = await WorkspaceTask.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================================================================
// 5. WORKSPACE SHARED RESOURCES
// =========================================================================

export const getWorkspaceResources = async (req, res) => {
  try {
    const { id: workspaceId } = req.params;
    const resources = await WorkspaceResource.find({ workspace: workspaceId }).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createWorkspaceResource = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const { id: workspaceId } = req.params;
    const { title, url, type, category, description } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    const resource = await WorkspaceResource.create({
      workspace: workspaceId,
      title: title.trim(),
      url: url.trim(),
      type: type || 'link',
      category: category || type || 'article',
      description: description || '',
      addedBy: student._id,
      addedByName: student.userId?.name || student.rollNumber || 'Student'
    });

    res.status(201).json(resource);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// =========================================================================
// 6. COLLABORATIVE CODE SESSION & SECURE EXECUTION
// =========================================================================

export const getCodeSession = async (req, res) => {
  try {
    const { id: workspaceId } = req.params;
    let session = await WorkspaceCodeSession.findOne({ workspace: workspaceId });
    if (!session) {
      session = await WorkspaceCodeSession.create({
        workspace: workspaceId,
        title: 'Placement Practice Session',
        code: `// Write and test solution\nfunction solution() {\n  return "All tests passed";\n}\nconsole.log(solution());`
      });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCodeSession = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);
    const { id: workspaceId } = req.params;
    const { code, language, title, problemDescription } = req.body;

    const session = await WorkspaceCodeSession.findOneAndUpdate(
      { workspace: workspaceId },
      {
        code: code !== undefined ? code : undefined,
        language: language || undefined,
        title: title || undefined,
        problemDescription: problemDescription || undefined,
        lastEditedBy: student._id,
        lastEditedByName: student.userId?.name || 'Student',
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.json(session);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

/**
 * Sandboxed safe execution of JavaScript code in an isolated VM
 * Blocks process, fs, child_process, and enforces 2000ms timeout
 */
export const runCollaborativeCode = async (req, res) => {
  const startTime = Date.now();
  try {
    const { code = '', language = 'javascript' } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, error: 'Code cannot be empty' });
    }

    if (language !== 'javascript') {
      return res.json({
        success: true,
        output: `[Notice] Sandboxed instant execution in browser backend supports JavaScript. For ${language}, algorithms are saved and synchronized across all peer screens in real time.`,
        stdout: 'Code synchronized.'
      });
    }

    const outputLogs = [];
    const sandbox = {
      console: {
        log: (...args) => outputLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        error: (...args) => outputLogs.push('[Error] ' + args.join(' ')),
        warn: (...args) => outputLogs.push('[Warn] ' + args.join(' '))
      },
      Math,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Map,
      Set,
      parseInt,
      parseFloat
    };

    const wrappedCode = `(function() {\n${code}\n})()`;
    const script = new vm.Script(wrappedCode);
    const context = vm.createContext(sandbox);

    const result = script.runInContext(context, { timeout: 2000 });
    const executionTimeMs = Date.now() - startTime;

    res.json({
      success: true,
      result,
      output: outputLogs.length > 0 ? outputLogs.join('\n') : (result !== undefined ? String(result) : '(Code executed successfully with no stdout)'),
      stdout: outputLogs.join('\n'),
      logsCount: outputLogs.length,
      executionTimeMs
    });
  } catch (err) {
    res.json({
      success: false,
      error: `Runtime Exception: ${err.message}`,
      output: `Runtime Exception: ${err.message}`,
      executionTimeMs: Date.now() - startTime
    });
  }
};
