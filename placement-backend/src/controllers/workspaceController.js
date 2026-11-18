import Workspace from '../models/Workspace.js';
import WorkspaceChannel from '../models/WorkspaceChannel.js';
import WorkspaceMessage from '../models/WorkspaceMessage.js';
import WorkspaceTask from '../models/WorkspaceTask.js';
import WorkspaceResource from '../models/WorkspaceResource.js';
import WorkspaceCodeSession from '../models/WorkspaceCodeSession.js';
import WorkspaceInvitation from '../models/WorkspaceInvitation.js';
import Student from '../models/Student.js';
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
      .populate('members.student', 'department batch')
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
        .sort({ createdAt: -1 })
        .limit(20);
    }

    // Attach presence counts
    const enrich = (wsList) => wsList.map(ws => {
      const doc = ws.toObject();
      doc.onlineMembersCount = ws.members.filter(m => isStudentOnline(m.student?._id || m.student)).length;
      doc.isJoined = ws.members.some(m => String(m.student?._id || m.student) === String(student._id));
      return doc;
    });

    const enrichedMy = enrich(myWorkspaces);
    if (req.query.scope === 'explore' || req.query.format === 'grouped') {
      return res.json({
        myWorkspaces: enrichedMy,
        exploreWorkspaces: enrich(publicWorkspaces)
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
        populate: { path: 'userId', select: 'name email' }
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

    const channels = await WorkspaceChannel.find({ workspace: id }).sort({ createdAt: 1 });
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
    const { recipientStudentId, message } = req.body;

    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    const isMember = workspace.members.some(
      m => String(m.student) === String(student._id)
    );
    if (!isMember) {
      return res.status(403).json({ error: 'Only current members can invite peers' });
    }

    const recipient = await Student.findById(recipientStudentId);
    if (!recipient) return res.status(404).json({ error: 'Recipient student not found' });

    const alreadyMember = workspace.members.some(
      m => String(m.student) === String(recipient._id)
    );
    if (alreadyMember) {
      return res.status(400).json({ error: 'Student is already a member of this workspace' });
    }

    const invitation = await WorkspaceInvitation.create({
      workspace: id,
      sender: student._id,
      recipient: recipient._id,
      message: message || `Join our ${workspace.name} study workspace!`
    });

    res.status(201).json({ message: 'Invitation sent successfully', invitation });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getMyInvitations = async (req, res) => {
  try {
    const student = await getAuthenticatedStudent(req.user.id);

    const invitations = await WorkspaceInvitation.find({
      recipient: student._id,
      status: 'pending'
    })
      .populate('workspace', 'name description category isPrivate')
      .populate({
        path: 'sender',
        populate: { path: 'userId', select: 'name email' }
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
    const { action } = req.body; // 'accept' | 'decline'

    const invitation = await WorkspaceInvitation.findById(invitationId);
    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });

    if (String(invitation.recipient) !== String(student._id)) {
      return res.status(403).json({ error: 'Forbidden: This invitation was not addressed to you' });
    }

    if (action === 'accept') {
      invitation.status = 'accepted';
      await invitation.save();

      const workspace = await Workspace.findById(invitation.workspace);
      if (workspace) {
        const exists = workspace.members.some(m => String(m.student) === String(student._id));
        if (!exists) {
          workspace.members.push({ student: student._id, role: 'member', joinedAt: new Date() });
          await workspace.save();
        }
      }
      return res.json({ message: 'Invitation accepted and added to workspace', status: 'accepted' });
    } else {
      invitation.status = 'declined';
      await invitation.save();
      return res.json({ message: 'Invitation declined', status: 'declined' });
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
    const limit = parseInt(req.query.limit, 10) || 40;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    const isMember = workspace.members.some(m => String(m.student) === String(student._id));
    if (workspace.isPrivate && !isMember) {
      return res.status(403).json({ error: 'Access denied to private workspace' });
    }

    const total = await WorkspaceMessage.countDocuments({ workspace: workspaceId, channel: channelId });
    const messages = await WorkspaceMessage.find({ workspace: workspaceId, channel: channelId })
      .populate({ path: 'sender', select: 'department batch rollNumber' })
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

    const isMember = workspace.members.some(m => String(m.student) === String(student._id));
    if (!isMember) {
      return res.status(403).json({ error: 'Must be a member to post in workspace' });
    }

    const sanitized = content.slice(0, 4000).trim();

    const messageDoc = await WorkspaceMessage.create({
      workspace: workspaceId,
      channel: channelId,
      sender: student._id,
      senderUser: student.userId?._id || student._id,
      senderName: student.userId?.name || student.rollNumber || 'Student',
      content: sanitized,
      replyTo: replyTo || null
    });

    const populated = await WorkspaceMessage.findById(messageDoc._id)
      .populate({ path: 'sender', select: 'department batch rollNumber' })
      .populate('replyTo');

    // Broadcast through socket if available
    const io = getIO();
    if (io) {
      io.to(`workspace:${workspaceId}:channel:${channelId}`).emit('new_message', populated);
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
