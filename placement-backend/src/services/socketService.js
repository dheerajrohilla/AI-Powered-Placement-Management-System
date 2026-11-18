import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Company from '../models/Company.js';
import Interview from '../models/Interview.js';
import Workspace from '../models/Workspace.js';
import WorkspaceMessage from '../models/WorkspaceMessage.js';
import WorkspaceCodeSession from '../models/WorkspaceCodeSession.js';

let ioInstance = null;
const onlineUsers = new Map(); // studentId -> Set(socketId)

export const initSocketIO = (httpServer) => {
  if (ioInstance) return ioInstance;

  const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ].filter(Boolean);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // JWT Authentication Middleware for Socket Connections
  io.use(async (socket, next) => {
    try {
      const rawToken = socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization ||
        socket.handshake.query?.token;

      if (!rawToken) {
        return next(new Error('Authentication error: Token required for real-time collaboration'));
      }

      const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_fallback_placement_jwt_secret_2026');

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      if (user.role === 'student') {
        const student = await Student.findOne({ userId: user._id });
        socket.student = student;
      } else if (user.role === 'company') {
        const company = await Company.findOne({ userId: user._id });
        socket.company = company;
      }

      next();
    } catch (err) {
      console.warn('Socket authentication rejected:', err.message);
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const isStudent = Boolean(socket.student);
    const studentId = isStudent ? socket.student._id.toString() : null;
    const participantName = socket.user.name;
    const studentName = socket.user.name;

    // Track online status for students
    if (studentId) {
      if (!onlineUsers.has(studentId)) {
        onlineUsers.set(studentId, new Set());
      }
      onlineUsers.get(studentId).add(socket.id);
    }

    // Join Workspace Room (with server-side membership authorization check)
    const handleJoinWorkspace = async ({ workspaceId, channelId }) => {
      try {
        if (!workspaceId) return;

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return socket.emit('error', { message: 'Workspace does not exist' });
        }

        const isMember = workspace.members.some(
          m => m.student.toString() === studentId
        );

        if (!isMember && workspace.isPrivate) {
          return socket.emit('error', { message: 'Access denied: You are not a member of this private workspace' });
        }

        socket.join(`workspace:${workspaceId}`);
        if (channelId) {
          socket.join(`workspace:${workspaceId}:channel:${channelId}`);
        }
        io.to(`workspace:${workspaceId}`).emit('user_joined_workspace', {
          studentId,
          studentName,
          workspaceId
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    };

    socket.on('join_workspace', handleJoinWorkspace);
    socket.on('workspace:join', handleJoinWorkspace);

    // Join Specific Channel Room
    socket.on('join_channel', async ({ workspaceId, channelId }) => {
      try {
        if (!workspaceId || !channelId) return;

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return;

        const isMember = workspace.members.some(
          m => m.student.toString() === studentId
        );

        if (!isMember && workspace.isPrivate) {
          return socket.emit('error', { message: 'Access denied to channel' });
        }

        const roomName = `workspace:${workspaceId}:channel:${channelId}`;
        socket.join(roomName);
        socket.emit('joined_channel', { channelId });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Leave Channel Room
    socket.on('leave_channel', ({ workspaceId, channelId }) => {
      if (workspaceId && channelId) {
        socket.leave(`workspace:${workspaceId}:channel:${channelId}`);
      }
    });

    // Real-Time Message Dispatch
    const handleSendMessage = async ({ workspaceId, channelId, content, replyTo }) => {
      try {
        if (!content || !content.trim()) return;

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return socket.emit('error', { message: 'Workspace not found' });
        }

        const isMember = workspace.members.some(
          m => m.student.toString() === studentId
        );

        if (!isMember) {
          return socket.emit('error', { message: 'Forbidden: You must be a workspace member to post messages' });
        }

        const sanitized = content.slice(0, 4000).trim();

        const messageDoc = await WorkspaceMessage.create({
          workspace: workspaceId,
          channel: channelId,
          sender: socket.student._id,
          senderUser: socket.user._id,
          senderName: socket.user.name,
          content: sanitized,
          replyTo: replyTo || null
        });

        const populated = await WorkspaceMessage.findById(messageDoc._id)
          .populate({ path: 'sender', select: 'department batch rollNumber userId', populate: { path: 'userId', select: 'name email profilePicture' } })
          .populate('senderUser', 'name email profilePicture')
          .populate('replyTo');

        const roomName = `workspace:${workspaceId}:channel:${channelId}`;
        io.to(roomName).emit('new_message', populated);
        io.to(roomName).emit('workspace:message:new', populated);
        io.to(`workspace:${workspaceId}`).emit('new_message', populated);
        io.to(`workspace:${workspaceId}`).emit('workspace:message:new', populated);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    };

    socket.on('send_message', handleSendMessage);
    socket.on('workspace:message:send', handleSendMessage);

    // Typing Indicators
    socket.on('typing_start', ({ workspaceId, channelId }) => {
      socket.to(`workspace:${workspaceId}:channel:${channelId}`).emit('user_typing', {
        studentId,
        studentName,
        channelId
      });
      socket.to(`workspace:${workspaceId}:channel:${channelId}`).emit('workspace:typing', {
        userId: socket.user?._id?.toString(),
        userName: socket.user?.name,
        isTyping: true
      });
    });

    socket.on('typing_stop', ({ workspaceId, channelId }) => {
      socket.to(`workspace:${workspaceId}:channel:${channelId}`).emit('user_stopped_typing', {
        studentId,
        channelId
      });
      socket.to(`workspace:${workspaceId}:channel:${channelId}`).emit('workspace:typing', {
        userId: socket.user?._id?.toString(),
        userName: socket.user?.name,
        isTyping: false
      });
    });

    socket.on('workspace:typing', ({ workspaceId, channelId, isTyping }) => {
      const room = channelId ? `workspace:${workspaceId}:channel:${channelId}` : `workspace:${workspaceId}`;
      socket.to(room).emit('workspace:typing', {
        userId: socket.user?._id?.toString(),
        userName: socket.user?.name,
        isTyping: Boolean(isTyping)
      });
    });

    // Collaborative Code Lab Real-Time Editing
    const handleCodeChange = async ({ workspaceId, code, language }) => {
      try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return;

        const isMember = workspace.members.some(
          m => m.student.toString() === studentId
        );
        if (!isMember) return;

        // Broadcast to other collaborators in workspace code room
        socket.to(`workspace:${workspaceId}:code`).emit('code_updated', {
          code,
          language,
          lastEditedByName: studentName
        });
        socket.to(`workspace:${workspaceId}:code`).emit('workspace:code:sync', {
          code,
          language,
          senderUserId: socket.user?._id?.toString()
        });
        socket.to(`workspace:${workspaceId}`).emit('workspace:code:sync', {
          code,
          language,
          senderUserId: socket.user?._id?.toString()
        });
      } catch (err) {
        console.error('code_change error:', err);
      }
    };

    socket.on('code_change', handleCodeChange);
    socket.on('workspace:code:sync', handleCodeChange);

    socket.on('join_code_session', async ({ workspaceId }) => {
      try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return;

        const isMember = workspace.members.some(
          m => m.student.toString() === studentId
        );
        if (!isMember && workspace.isPrivate) return;

        socket.join(`workspace:${workspaceId}:code`);
      } catch (err) {
        console.error('join_code_session error:', err);
      }
    });

    // ==================== WEBRTC VIRTUAL INTERVIEW SIGNALING ====================
    // Join Interview Room with participant authorization check
    socket.on('webrtc_join_room', async ({ interviewId, roomId }) => {
      try {
        if (!interviewId && !roomId) {
          return socket.emit('webrtc_error', { message: 'Interview ID or Room ID is required' });
        }

        const query = roomId ? { roomId } : { _id: interviewId };
        const interview = await Interview.findOne(query)
          .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
          .populate({ path: 'company', populate: { path: 'userId', select: 'name email' } });

        if (!interview) {
          return socket.emit('webrtc_error', { message: 'Interview session not found' });
        }

        // Authorization check: User must be the assigned student, company, or tpo/admin
        const currentUserId = socket.user._id.toString();
        const studentUserId = interview.student?.userId?._id?.toString() || interview.student?.userId?.toString();
        const studentProfileId = interview.student?._id?.toString();
        const companyUserId = interview.company?.userId?._id?.toString() || interview.company?.userId?.toString();
        const companyProfileId = interview.company?._id?.toString();

        const isAuthorizedCandidate = (socket.user.role === 'student') &&
          (currentUserId === studentUserId || (socket.student && socket.student._id.toString() === studentProfileId));
        const isAuthorizedRecruiter = (socket.user.role === 'company') &&
          (currentUserId === companyUserId || (socket.company && socket.company._id.toString() === companyProfileId));
        const isPrivileged = ['admin', 'tpo'].includes(socket.user.role);

        if (!isAuthorizedCandidate && !isAuthorizedRecruiter && !isPrivileged) {
          return socket.emit('webrtc_error', {
            message: 'Access denied: You are not authorized to join this interview room'
          });
        }

        const effectiveRoomId = interview.roomId || roomId || interview._id.toString();
        const roomKey = `interview:${effectiveRoomId}`;

        socket.join(roomKey);
        socket.interviewRoom = effectiveRoomId;
        socket.interviewId = interview._id.toString();

        // Check active peers in this room
        const socketsInRoom = await io.in(roomKey).fetchSockets();
        const peers = socketsInRoom
          .filter(s => s.id !== socket.id)
          .map(s => ({
            socketId: s.id,
            userId: s.user?._id,
            name: s.user?.name,
            role: s.user?.role
          }));

        // Update interview status when joined
        if (socketsInRoom.length >= 2 && ['scheduled', 'upcoming', 'waiting'].includes(interview.status)) {
          interview.status = 'in_progress';
          if (!interview.actualStartTime) {
            interview.actualStartTime = new Date();
          }
          await interview.save();
          io.to(roomKey).emit('webrtc_status_changed', { status: 'in_progress' });
        } else if (socketsInRoom.length === 1 && ['scheduled', 'upcoming'].includes(interview.status)) {
          interview.status = 'waiting';
          await interview.save();
          io.to(roomKey).emit('webrtc_status_changed', { status: 'waiting' });
        }

        // Send existing peers to newly joined participant
        socket.emit('webrtc_room_peers', {
          roomId: effectiveRoomId,
          interviewId: interview._id,
          peers,
          isInitiator: peers.length > 0
        });

        // Notify existing peers that a new participant joined
        socket.to(roomKey).emit('webrtc_peer_joined', {
          socketId: socket.id,
          userId: socket.user._id,
          name: socket.user.name,
          role: socket.user.role
        });
      } catch (err) {
        console.error('webrtc_join_room error:', err);
        socket.emit('webrtc_error', { message: err.message });
      }
    });

    // WebRTC Signaling Relay (SDP offer, SDP answer, ICE candidate)
    socket.on('webrtc_signal', ({ targetSocketId, signalData, type }) => {
      if (!targetSocketId || !signalData) return;
      io.to(targetSocketId).emit('webrtc_signal', {
        senderSocketId: socket.id,
        signalData,
        type,
        senderName: socket.user.name,
        senderRole: socket.user.role
      });
    });

    // Mute/Camera toggle relay
    socket.on('webrtc_media_toggle', ({ roomId, isMuted, isCameraOff }) => {
      const roomKey = `interview:${roomId}`;
      socket.to(roomKey).emit('webrtc_media_toggle', {
        socketId: socket.id,
        isMuted,
        isCameraOff
      });
    });

    // Screen sharing toggle relay
    socket.on('webrtc_screen_share_toggle', ({ roomId, isSharing }) => {
      const roomKey = `interview:${roomId}`;
      socket.to(roomKey).emit('webrtc_screen_share_toggle', {
        socketId: socket.id,
        isSharing,
        userName: socket.user.name
      });
    });

    // End Call handler
    socket.on('webrtc_end_call', async ({ roomId, interviewId, reason }) => {
      try {
        const roomKey = `interview:${roomId}`;
        const query = roomId ? { roomId } : { _id: interviewId };
        const interview = await Interview.findOne(query);
        if (interview) {
          interview.status = 'completed';
          interview.actualEndTime = new Date();
          interview.endedBy = socket.user.name || socket.user.role;
          await interview.save();
        }

        io.to(roomKey).emit('webrtc_call_ended', {
          endedByName: socket.user.name,
          endedByRole: socket.user.role,
          reason: reason || 'Interview session ended',
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('webrtc_end_call error:', err);
      }
    });

    // Disconnect cleanup
    socket.on('disconnecting', () => {
      if (socket.interviewRoom) {
        const roomKey = `interview:${socket.interviewRoom}`;
        socket.to(roomKey).emit('webrtc_peer_disconnected', {
          socketId: socket.id,
          name: socket.user.name,
          role: socket.user.role
        });
      }
    });

    socket.on('disconnect', () => {
      const socketSet = onlineUsers.get(studentId);
      if (socketSet) {
        socketSet.delete(socket.id);
        if (socketSet.size === 0) {
          onlineUsers.delete(studentId);
        }
      }
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = () => {
  return ioInstance;
};

export const isStudentOnline = (studentId) => {
  return onlineUsers.has(studentId.toString());
};
