import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI } from "../../services/api";
import { getSocket } from "../../services/socket";
import { useAuth } from "../../context/useAuth";
import "../../styles/aiFeatures.css";

function StudentCollaboration() {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;

  // Workspace & Navigation states
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "tasks" | "resources" | "code" | "discovery" | "exercise"
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState([]);

  // Live Chat states
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Tasks & Goals states
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState("all");
  const [taskLoading, setTaskLoading] = useState(false);

  // Shared Resources states
  const [resources, setResources] = useState([]);
  const [resourceCategory, setResourceCategory] = useState("all");
  const [resourceLoading, setResourceLoading] = useState(false);

  // Collaborative Code Lab states
  const [codeSession, setCodeSession] = useState({
    language: "javascript",
    code: "// Welcome to Collaborative Code Lab!\n// Write your solution below and test against test cases.\n\nfunction solve(input) {\n  return input;\n}\n\nconsole.log('Result:', solve('Placement Ready!'));\n",
    testCases: []
  });
  const [codeOutput, setCodeOutput] = useState(null);
  const [runningCode, setRunningCode] = useState(false);
  const codeSyncDebounceRef = useRef(null);

  // Peer Discovery & Exercise states
  const [matches, setMatches] = useState([]);
  const [exerciseTopic, setExerciseTopic] = useState("Binary Search & Two Pointers");
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [exerciseData, setExerciseData] = useState(null);
  const [exerciseError, setExerciseError] = useState("");

  // Modals
  const [showCreateWsModal, setShowCreateWsModal] = useState(false);
  const [newWsData, setNewWsData] = useState({ name: "", description: "", goal: "DSA & Problem Solving", isPrivate: false });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTaskData, setNewTaskData] = useState({ title: "", description: "", priority: "medium", dueDate: "" });
  const [showCreateResModal, setShowCreateResModal] = useState(false);
  const [newResData, setNewResData] = useState({ title: "", url: "", category: "article", description: "" });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const showFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 5000);
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch initial workspaces & invites
  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const [wsRes, invRes] = await Promise.all([
        studentAPI.getWorkspaces(),
        studentAPI.getWorkspaceInvitations()
      ]);
      const wsList = wsRes.data || [];
      setWorkspaces(wsList);
      setInvitations(invRes.data || []);

      if (wsList.length > 0) {
        // preserve active workspace or pick first
        const selected = wsList.find(w => w._id === activeWorkspace?._id) || wsList[0];
        setActiveWorkspace(selected);
        if (selected.channels && selected.channels.length > 0) {
          setActiveChannel(selected.channels[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load workspaces:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Fetch channel messages when channel changes
  const fetchMessages = useCallback(async (workspaceId, channelId) => {
    if (!workspaceId || !channelId) return;
    try {
      const res = await studentAPI.getChannelMessages(workspaceId, channelId);
      setMessages(res.data.messages || []);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async (workspaceId) => {
    if (!workspaceId) return;
    try {
      setTaskLoading(true);
      const res = await studentAPI.getWorkspaceTasks(workspaceId);
      setTasks(res.data || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setTaskLoading(false);
    }
  }, []);

  // Fetch resources
  const fetchResources = useCallback(async (workspaceId) => {
    if (!workspaceId) return;
    try {
      setResourceLoading(true);
      const res = await studentAPI.getWorkspaceResources(workspaceId);
      setResources(res.data || []);
    } catch (err) {
      console.error("Failed to load resources:", err);
    } finally {
      setResourceLoading(false);
    }
  }, []);

  // Fetch code session
  const fetchCodeSession = useCallback(async (workspaceId) => {
    if (!workspaceId) return;
    try {
      const res = await studentAPI.getCodeSession(workspaceId);
      if (res.data) {
        setCodeSession({
          language: res.data.language || "javascript",
          code: res.data.code || "// Collaborative Code Lab",
          testCases: res.data.testCases || []
        });
      }
    } catch (err) {
      console.error("Failed to load code session:", err);
    }
  }, []);

  // Fetch peer matches for discovery tab
  const fetchPeerMatches = async () => {
    try {
      const res = await studentAPI.getCollaborationMatches();
      setMatches(res.data || []);
    } catch (err) {
      console.error("Failed to load peer matches:", err);
    }
  };

  // Switch tabs & fetch associated data
  useEffect(() => {
    if (!activeWorkspace) return;
    if (activeTab === "chat" && activeChannel) {
      fetchMessages(activeWorkspace._id, activeChannel._id);
    } else if (activeTab === "tasks") {
      fetchTasks(activeWorkspace._id);
    } else if (activeTab === "resources") {
      fetchResources(activeWorkspace._id);
    } else if (activeTab === "code") {
      fetchCodeSession(activeWorkspace._id);
    } else if (activeTab === "discovery") {
      fetchPeerMatches();
    }
  }, [activeTab, activeWorkspace, activeChannel, fetchMessages, fetchTasks, fetchResources, fetchCodeSession]);

  // Socket.IO Real-Time listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeWorkspace) return;

    const channelId = activeChannel?._id;

    // Join workspace & channel rooms
    socket.emit("workspace:join", {
      workspaceId: activeWorkspace._id,
      channelId
    });

    const handleNewMessage = (newMsg) => {
      if (newMsg.channelId === activeChannel?._id || newMsg.channel === activeChannel?._id) {
        setMessages((prev) => {
          if (prev.some(m => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 50);
      }
    };

    const handleMessageUpdated = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    const handleTyping = ({ userId, userName, isTyping }) => {
      if (userId === currentUserId) return;
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (isTyping) {
          next[userId] = userName || "Peer";
        } else {
          delete next[userId];
        }
        return next;
      });
    };

    const handleCodeSync = ({ language, code, senderUserId }) => {
      if (senderUserId === currentUserId) return;
      setCodeSession((prev) => ({
        ...prev,
        language: language || prev.language,
        code: code !== undefined ? code : prev.code
      }));
    };

    socket.on("workspace:message:new", handleNewMessage);
    socket.on("workspace:message:updated", handleMessageUpdated);
    socket.on("workspace:message:deleted", handleMessageDeleted);
    socket.on("workspace:typing", handleTyping);
    socket.on("workspace:code:sync", handleCodeSync);

    return () => {
      socket.off("workspace:message:new", handleNewMessage);
      socket.off("workspace:message:updated", handleMessageUpdated);
      socket.off("workspace:message:deleted", handleMessageDeleted);
      socket.off("workspace:typing", handleTyping);
      socket.off("workspace:code:sync", handleCodeSync);
    };
  }, [activeWorkspace, activeChannel, currentUserId]);

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageText.trim() || !activeWorkspace || !activeChannel || sendingMessage) return;

    try {
      setSendingMessage(true);
      const res = await studentAPI.sendWorkspaceMessage(activeWorkspace._id, activeChannel._id, {
        content: messageText.trim()
      });

      // Clear typing indicator
      const socket = getSocket();
      socket?.emit("workspace:typing", {
        workspaceId: activeWorkspace._id,
        channelId: activeChannel._id,
        isTyping: false
      });

      setMessageText("");
      // Append if socket hasn't done so already
      setMessages((prev) => {
        if (prev.some((m) => m._id === res.data._id)) return prev;
        return [...prev, res.data];
      });
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error("Failed to send message:", err);
      showFeedback("Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle typing debounce
  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    const socket = getSocket();
    if (!socket || !activeWorkspace || !activeChannel) return;

    socket.emit("workspace:typing", {
      workspaceId: activeWorkspace._id,
      channelId: activeChannel._id,
      isTyping: true
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("workspace:typing", {
        workspaceId: activeWorkspace._id,
        channelId: activeChannel._id,
        isTyping: false
      });
    }, 2000);
  };

  // Edit message
  const handleEditMessage = async (messageId) => {
    if (!editText.trim() || !activeWorkspace) return;
    try {
      const res = await studentAPI.editWorkspaceMessage(activeWorkspace._id, messageId, {
        content: editText.trim()
      });
      setMessages((prev) => prev.map((m) => (m._id === messageId ? res.data : m)));
      setEditingMessageId(null);
      setEditText("");
    } catch (err) {
      console.error("Failed to edit message:", err);
      showFeedback("Failed to edit message.");
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await studentAPI.deleteWorkspaceMessage(activeWorkspace._id, messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      console.error("Failed to delete message:", err);
      showFeedback("Failed to delete message.");
    }
  };

  // Create Workspace
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsData.name.trim()) return;
    try {
      const res = await studentAPI.createWorkspace(newWsData);
      showFeedback(`✓ Workspace "${res.data.name}" created successfully!`);
      setShowCreateWsModal(false);
      setNewWsData({ name: "", description: "", goal: "DSA & Problem Solving", isPrivate: false });
      await fetchWorkspaces();
      setActiveWorkspace(res.data);
      if (res.data.channels?.length > 0) setActiveChannel(res.data.channels[0]);
    } catch (err) {
      console.error("Failed to create workspace:", err);
      showFeedback(err.response?.data?.error || "Failed to create workspace.");
    }
  };

  // Invite Peer to Workspace
  const handleInvitePeer = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeWorkspace) return;
    try {
      await studentAPI.inviteToWorkspace(activeWorkspace._id, {
        email: inviteEmail.trim(),
        role: inviteRole
      });
      showFeedback(`✓ Invitation sent to ${inviteEmail}!`);
      setShowInviteModal(false);
      setInviteEmail("");
    } catch (err) {
      console.error("Failed to send invitation:", err);
      showFeedback(err.response?.data?.error || "Failed to send invitation.");
    }
  };

  // Respond to Workspace Invitation
  const handleRespondInvitation = async (invitationId, status) => {
    try {
      await studentAPI.respondToWorkspaceInvitation(invitationId, status);
      showFeedback(`✓ Invitation ${status}!`);
      await fetchWorkspaces();
    } catch (err) {
      console.error("Failed to respond to invitation:", err);
      showFeedback("Failed to update invitation.");
    }
  };

  // Create Workspace Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskData.title.trim() || !activeWorkspace) return;
    try {
      const res = await studentAPI.createWorkspaceTask(activeWorkspace._id, newTaskData);
      setTasks((prev) => [res.data, ...prev]);
      setShowCreateTaskModal(false);
      setNewTaskData({ title: "", description: "", priority: "medium", dueDate: "" });
      showFeedback("✓ Task created successfully!");
    } catch (err) {
      console.error("Failed to create task:", err);
      showFeedback(err.response?.data?.error || "Failed to create task.");
    }
  };

  // Update Task Status
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await studentAPI.updateWorkspaceTaskStatus(activeWorkspace._id, taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      console.error("Failed to update task status:", err);
      showFeedback("Failed to update task.");
    }
  };

  // Create Resource
  const handleCreateResource = async (e) => {
    e.preventDefault();
    if (!newResData.title.trim() || !newResData.url.trim() || !activeWorkspace) return;
    try {
      const res = await studentAPI.createWorkspaceResource(activeWorkspace._id, newResData);
      setResources((prev) => [res.data, ...prev]);
      setShowCreateResModal(false);
      setNewResData({ title: "", url: "", category: "article", description: "" });
      showFeedback("✓ Resource shared successfully!");
    } catch (err) {
      console.error("Failed to share resource:", err);
      showFeedback(err.response?.data?.error || "Failed to share resource.");
    }
  };

  // Collaborative Code updates
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCodeSession((prev) => ({ ...prev, code: newCode }));

    // Real-time broadcast via socket
    const socket = getSocket();
    if (socket && activeWorkspace) {
      socket.emit("workspace:code:update", {
        workspaceId: activeWorkspace._id,
        code: newCode,
        language: codeSession.language
      });
    }

    // Debounced persist to database
    if (codeSyncDebounceRef.current) clearTimeout(codeSyncDebounceRef.current);
    codeSyncDebounceRef.current = setTimeout(async () => {
      try {
        await studentAPI.updateCodeSession(activeWorkspace._id, {
          code: newCode,
          language: codeSession.language
        });
      } catch (err) {
        console.error("Auto-save code error:", err);
      }
    }, 1500);
  };

  // Language change
  const handleLanguageChange = async (newLang) => {
    setCodeSession((prev) => ({ ...prev, language: newLang }));
    const socket = getSocket();
    if (socket && activeWorkspace) {
      socket.emit("workspace:code:update", {
        workspaceId: activeWorkspace._id,
        code: codeSession.code,
        language: newLang
      });
    }
    try {
      await studentAPI.updateCodeSession(activeWorkspace._id, {
        language: newLang,
        code: codeSession.code
      });
    } catch (err) {
      console.error("Language save error:", err);
    }
  };

  // Run Code securely in Sandbox
  const handleRunCode = async () => {
    if (!activeWorkspace || runningCode) return;
    try {
      setRunningCode(true);
      setCodeOutput({ status: "running", stdout: "Executing code in isolated VM sandbox..." });
      const res = await studentAPI.runCollaborativeCode(activeWorkspace._id, {
        code: codeSession.code,
        language: codeSession.language
      });
      setCodeOutput(res.data);
    } catch (err) {
      console.error("Code run error:", err);
      setCodeOutput({
        success: false,
        error: err.response?.data?.error || err.message || "Execution failed."
      });
    } finally {
      setRunningCode(false);
    }
  };

  // AI Paired Exercise Generator
  const handleGenerateExercise = async (customTopic) => {
    const topicToUse = customTopic || exerciseTopic;
    if (!topicToUse.trim()) return;
    setExerciseLoading(true);
    setExerciseError("");
    try {
      const res = await studentAPI.generateCollaborativeExercise({
        topic: topicToUse,
        focusArea: "technical-interview-prep"
      });
      setExerciseData(res.data);
    } catch (err) {
      setExerciseError(err.response?.data?.error || "Failed to generate collaborative exercise.");
    } finally {
      setExerciseLoading(false);
    }
  };

  const sampleTopics = [
    "Binary Search & Two Pointers",
    "Dynamic Programming & Memoization",
    "System Design & Scalable Caching",
    "SQL Joins & Window Functions",
    "OOP Principles & Factory Pattern",
    "Behavioral STAR Interview Scenarios"
  ];

  // User membership role in active workspace
  const userRole = activeWorkspace?.members?.find(
    (m) => (m.userId?._id || m.userId) === currentUserId
  )?.role || "member";
  const isOwnerOrAdmin = userRole === "owner" || userRole === "admin";

  return (
    <DashboardLayout>
      <div className="ai-portal-container" style={{ maxWidth: "1400px" }}>
        {/* HEADER */}
        <div className="ai-header" style={{ marginBottom: "16px" }}>
          <div className="ai-header-title">
            <h1>🤝 Peer Collaboration Workspaces</h1>
            <p>
              Industry-grade collaborative prep hub: private team workspaces, real-time messaging, study tasks, shared resources, and live sandboxed code lab.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              className="ai-btn-primary"
              onClick={() => setShowCreateWsModal(true)}
            >
              + Create Workspace
            </button>
            {activeWorkspace && isOwnerOrAdmin && (
              <button
                className="ai-btn-secondary"
                onClick={() => setShowInviteModal(true)}
              >
                ✉️ Invite Member
              </button>
            )}
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        {feedbackMsg && (
          <div
            style={{
              padding: "10px 16px",
              background: "#ecfdf5",
              color: "#065f46",
              borderRadius: "8px",
              marginBottom: "16px",
              border: "1px solid #a7f3d0",
              fontWeight: 600,
              fontSize: "14px"
            }}
          >
            {feedbackMsg}
          </div>
        )}

        {/* PENDING INVITATIONS BANNER */}
        {invitations.length > 0 && (
          <div
            style={{
              padding: "12px 18px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "10px",
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px"
            }}
          >
            <div>
              <strong style={{ color: "#1e40af" }}>📬 Pending Invitations ({invitations.length}):</strong>
              <span style={{ color: "#3b82f6", fontSize: "14px", marginLeft: "8px" }}>
                You have been invited to join peer workspaces.
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {invitations.map((inv) => (
                <div
                  key={inv._id}
                  style={{
                    background: "#ffffff",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px"
                  }}
                >
                  <span><strong>{inv.workspace?.name}</strong></span>
                  <button
                    onClick={() => handleRespondInvitation(inv._id, "accepted")}
                    style={{ background: "#16a34a", color: "#fff", border: "none", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespondInvitation(inv._id, "declined")}
                    style={{ background: "#ef4444", color: "#fff", border: "none", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
                  >
                    Decline
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WORKSPACE SHELL */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", background: "#fff", borderRadius: "12px" }}>
            <div className="spinner" style={{ margin: "0 auto 15px" }}></div>
            <p style={{ color: "#64748b" }}>Connecting to Peer Collaboration network...</p>
          </div>
        ) : workspaces.length === 0 ? (
          /* EMPTY STATE */
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
            }}
          >
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>👥</div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
              No Active Collaboration Workspaces Yet
            </h2>
            <p style={{ color: "#64748b", maxWidth: "560px", margin: "0 auto 24px", lineHeight: 1.6 }}>
              Create your first study group workspace for DSA, system design, mock interviews, or coding tests. You can invite peers, share resources, track goals, and code together in real-time.
            </p>
            <button
              className="ai-btn-primary"
              onClick={() => setShowCreateWsModal(true)}
              style={{ fontSize: "15px", padding: "12px 24px" }}
            >
              🚀 Create Your First Workspace
            </button>
          </div>
        ) : (
          /* WORKSPACE MAIN LAYOUT */
          <div className="collab-layout">
            {/* LEFT SIDEBAR: Workspaces & Channels */}
            <div className="collab-sidebar">
              <div className="collab-sidebar-header">
                <span className="collab-sidebar-title">Workspaces ({workspaces.length})</span>
                <button
                  onClick={() => setShowCreateWsModal(true)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "#f8fafc",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                  title="Create new workspace"
                >
                  + New
                </button>
              </div>

              {/* WORKSPACE SELECTOR */}
              <div className="collab-workspace-list">
                {workspaces.map((ws) => {
                  const isActive = ws._id === activeWorkspace?._id;
                  return (
                    <div
                      key={ws._id}
                      className={`collab-ws-item ${isActive ? "active" : ""}`}
                      onClick={() => {
                        setActiveWorkspace(ws);
                        if (ws.channels && ws.channels.length > 0) {
                          setActiveChannel(ws.channels[0]);
                        }
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                        <span style={{ fontSize: "16px" }}>{ws.isPrivate ? "🔒" : "🌐"}</span>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <div style={{ fontWeight: 600, fontSize: "14px", color: isActive ? "#ffffff" : "#cbd5e1" }}>
                            {ws.name}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            {ws.members?.length || 1} members • {ws.goal || "Study Group"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* CHANNELS SECTION */}
                {activeWorkspace && (
                  <div style={{ marginTop: "20px" }}>
                    <div style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      CHANNELS
                    </div>
                    {(activeWorkspace.channels || []).map((ch) => {
                      const isChActive = ch._id === activeChannel?._id;
                      return (
                        <div
                          key={ch._id}
                          className={`collab-channel-item ${isChActive ? "active" : ""}`}
                          onClick={() => {
                            setActiveChannel(ch);
                            setActiveTab("chat");
                          }}
                        >
                          <span style={{ opacity: 0.7 }}>#</span>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {ch.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* USER FOOTER */}
              <div style={{ padding: "14px 16px", borderTop: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px" }}>
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc" }}>{user?.name || "Student"}</div>
                  <div style={{ fontSize: "11px", color: "#22c55e" }}>● Online</div>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="collab-content">
              {/* TOP NAVIGATION & TABS */}
              <div className="collab-top-nav">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                      {activeWorkspace?.name}
                    </h2>
                    <span style={{ background: "#e2e8f0", color: "#475569", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>
                      {userRole.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
                    {activeWorkspace?.description || "Collaborative study group workspace."}
                  </p>
                </div>

                {/* TABS */}
                <div className="collab-tabs">
                  <button
                    className={`collab-tab-btn ${activeTab === "chat" ? "active" : ""}`}
                    onClick={() => setActiveTab("chat")}
                  >
                    💬 Live Chat {activeChannel ? `(#${activeChannel.name})` : ""}
                  </button>
                  <button
                    className={`collab-tab-btn ${activeTab === "tasks" ? "active" : ""}`}
                    onClick={() => setActiveTab("tasks")}
                  >
                    🎯 Goals & Tasks ({tasks.length})
                  </button>
                  <button
                    className={`collab-tab-btn ${activeTab === "resources" ? "active" : ""}`}
                    onClick={() => setActiveTab("resources")}
                  >
                    📚 Resources ({resources.length})
                  </button>
                  <button
                    className={`collab-tab-btn ${activeTab === "code" ? "active" : ""}`}
                    onClick={() => setActiveTab("code")}
                  >
                    💻 Code Lab
                  </button>
                  <button
                    className={`collab-tab-btn ${activeTab === "discovery" ? "active" : ""}`}
                    onClick={() => setActiveTab("discovery")}
                  >
                    🔍 Peer Discovery
                  </button>
                  <button
                    className={`collab-tab-btn ${activeTab === "exercise" ? "active" : ""}`}
                    onClick={() => {
                      setActiveTab("exercise");
                      if (!exerciseData) handleGenerateExercise();
                    }}
                  >
                    ✨ AI Paired Prep
                  </button>
                </div>
              </div>

              {/* TAB CONTENT: 1. LIVE CHAT */}
              {activeTab === "chat" && (
                <div className="collab-chat-view">
                  {/* MESSAGE STREAM */}
                  <div className="collab-messages-stream">
                    {messages.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
                        <div style={{ fontSize: "36px", marginBottom: "8px" }}>💬</div>
                        <p style={{ fontWeight: 600 }}>No messages yet in #{activeChannel?.name || "general"}.</p>
                        <p style={{ fontSize: "13px" }}>Start the discussion with your study partners below!</p>
                      </div>
                    ) : (
                      messages.map((m) => {
                        const senderId = m.sender?._id || m.sender?.userId?._id || m.sender;
                        const isMe = senderId === currentUserId;
                        const senderName = m.sender?.name || m.sender?.userId?.name || "Peer";
                        const isEditing = editingMessageId === m._id;

                        return (
                          <div key={m._id} className={`collab-msg-bubble ${isMe ? "me" : ""}`}>
                            <div className="collab-msg-avatar" style={{ background: isMe ? "#2563eb" : "#7c3aed" }}>
                              {senderName[0]?.toUpperCase() || "P"}
                            </div>
                            <div className="collab-msg-content" style={{ minWidth: "160px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                <strong style={{ fontSize: "12px", color: isMe ? "#dbeafe" : "#475569" }}>
                                  {isMe ? "You" : senderName}
                                </strong>
                                <span style={{ fontSize: "10px", color: isMe ? "#bfdbfe" : "#94a3b8" }}>
                                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {m.isEdited ? " (edited)" : ""}
                                </span>
                              </div>

                              {isEditing ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                                  <input
                                    type="text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    style={{
                                      padding: "6px 8px",
                                      borderRadius: "6px",
                                      border: "1px solid #cbd5e1",
                                      fontSize: "13px",
                                      color: "#1e293b"
                                    }}
                                  />
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <button
                                      onClick={() => handleEditMessage(m._id)}
                                      style={{ background: "#16a34a", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingMessageId(null)}
                                      style={{ background: "#e2e8f0", color: "#475569", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div style={{ wordBreak: "break-word" }}>{m.content}</div>
                                  {(isMe || isOwnerOrAdmin) && (
                                    <div style={{ display: "flex", gap: "8px", marginTop: "4px", fontSize: "11px", opacity: 0.8 }}>
                                      {isMe && (
                                        <button
                                          onClick={() => {
                                            setEditingMessageId(m._id);
                                            setEditText(m.content);
                                          }}
                                          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                                        >
                                          Edit
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDeleteMessage(m._id)}
                                        style={{ background: "none", border: "none", color: isMe ? "#fca5a5" : "#ef4444", cursor: "pointer", padding: 0 }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* TYPING INDICATOR */}
                  {Object.keys(typingUsers).length > 0 && (
                    <div style={{ padding: "4px 20px", fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
                      {Object.values(typingUsers).join(", ")} {Object.keys(typingUsers).length === 1 ? "is" : "are"} typing...
                    </div>
                  )}

                  {/* MESSAGE COMPOSER */}
                  <form onSubmit={handleSendMessage} className="collab-composer">
                    <input
                      type="text"
                      className="collab-composer-input"
                      placeholder={`Message #${activeChannel?.name || "general"}... (Press Enter to send)`}
                      value={messageText}
                      onChange={handleInputChange}
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      className="ai-btn-primary"
                      disabled={!messageText.trim() || sendingMessage}
                      style={{ padding: "10px 18px" }}
                    >
                      {sendingMessage ? "Sending..." : "Send 🚀"}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB CONTENT: 2. GOALS & TASKS */}
              {activeTab === "tasks" && (
                <div style={{ padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#1e293b" }}>Study Goals & Prep Checklist</h3>
                      <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>Track shared milestones for upcoming placement tests and interviews.</p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <select
                        value={taskFilter}
                        onChange={(e) => setTaskFilter(e.target.value)}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                      >
                        <option value="all">All Tasks ({tasks.length})</option>
                        <option value="todo">To-Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>

                      <button
                        className="ai-btn-primary"
                        onClick={() => setShowCreateTaskModal(true)}
                        style={{ padding: "8px 16px", fontSize: "13px" }}
                      >
                        + Add Task
                      </button>
                    </div>
                  </div>

                  {taskLoading ? (
                    <p style={{ color: "#64748b" }}>Loading tasks...</p>
                  ) : tasks.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", background: "#ffffff", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
                      <p style={{ color: "#64748b" }}>No tasks added yet. Create a study goal or problem-solving checklist item!</p>
                      <button className="ai-btn-secondary" onClick={() => setShowCreateTaskModal(true)} style={{ marginTop: "10px" }}>
                        + Create Goal
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {tasks
                        .filter((t) => taskFilter === "all" || t.status === taskFilter)
                        .map((t) => {
                          const isDone = t.status === "completed";
                          return (
                            <div
                              key={t._id}
                              style={{
                                background: "#ffffff",
                                padding: "16px 20px",
                                borderRadius: "10px",
                                border: "1px solid #e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "14px",
                                textDecoration: isDone ? "line-through" : "none",
                                opacity: isDone ? 0.7 : 1
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={(e) => handleUpdateTaskStatus(t._id, e.target.checked ? "completed" : "todo")}
                                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                                />
                                <div>
                                  <strong style={{ fontSize: "15px", color: "#1e293b" }}>{t.title}</strong>
                                  {t.description && (
                                    <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>{t.description}</p>
                                  )}
                                  {t.dueDate && (
                                    <span style={{ fontSize: "11px", color: "#f59e0b", display: "block", marginTop: "2px" }}>
                                      📅 Due: {new Date(t.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    padding: "3px 8px",
                                    borderRadius: "12px",
                                    background: t.priority === "urgent" ? "#fee2e2" : t.priority === "high" ? "#ffedd5" : "#f1f5f9",
                                    color: t.priority === "urgent" ? "#991b1b" : t.priority === "high" ? "#9a3412" : "#475569"
                                  }}
                                >
                                  {t.priority.toUpperCase()}
                                </span>

                                <select
                                  value={t.status}
                                  onChange={(e) => handleUpdateTaskStatus(t._id, e.target.value)}
                                  style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                                >
                                  <option value="todo">To-Do</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                </select>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: 3. SHARED RESOURCES */}
              {activeTab === "resources" && (
                <div style={{ padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#1e293b" }}>Shared Study Material & Links</h3>
                      <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>Articles, cheatsheets, GitHub repos, and interview problem links.</p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <select
                        value={resourceCategory}
                        onChange={(e) => setResourceCategory(e.target.value)}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                      >
                        <option value="all">All Categories ({resources.length})</option>
                        <option value="article">Articles & Guides</option>
                        <option value="cheatsheet">Cheatsheets</option>
                        <option value="github">GitHub Repos</option>
                        <option value="interview_question">Interview Questions</option>
                        <option value="video">Videos</option>
                        <option value="other">Other</option>
                      </select>

                      <button
                        className="ai-btn-primary"
                        onClick={() => setShowCreateResModal(true)}
                        style={{ padding: "8px 16px", fontSize: "13px" }}
                      >
                        + Share Resource
                      </button>
                    </div>
                  </div>

                  {resourceLoading ? (
                    <p style={{ color: "#64748b" }}>Loading resources...</p>
                  ) : resources.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", background: "#ffffff", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
                      <p style={{ color: "#64748b" }}>No resources shared yet. Share a useful link or article with your workspace!</p>
                      <button className="ai-btn-secondary" onClick={() => setShowCreateResModal(true)} style={{ marginTop: "10px" }}>
                        + Add Resource
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
                      {resources
                        .filter((r) => resourceCategory === "all" || r.category === resourceCategory)
                        .map((r) => (
                          <div
                            key={r._id}
                            style={{
                              background: "#ffffff",
                              padding: "18px",
                              borderRadius: "10px",
                              border: "1px solid #e2e8f0",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between"
                            }}
                          >
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", background: "#eff6ff", color: "#1d4ed8" }}>
                                  {r.category.toUpperCase()}
                                </span>
                                <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                                  By {r.addedBy?.name || "Member"}
                                </span>
                              </div>
                              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>{r.title}</h4>
                              {r.description && (
                                <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: 1.4 }}>{r.description}</p>
                              )}
                            </div>

                            <a
                              href={r.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: "inline-block",
                                marginTop: "12px",
                                color: "#2563eb",
                                fontSize: "13px",
                                fontWeight: 600,
                                textDecoration: "none"
                              }}
                            >
                              🔗 Open Resource ↗
                            </a>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: 4. COLLABORATIVE CODE LAB */}
              {activeTab === "code" && (
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#1e293b" }}>
                        💻 Collaborative Code Lab & Sandbox
                      </h3>
                      <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
                        Real-time synced code editor. Code changes are broadcasted to all workspace members instantly.
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <select
                        value={codeSession.language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: 600 }}
                      >
                        <option value="javascript">JavaScript (Node.js Sandbox)</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                      </select>

                      <button
                        className="ai-btn-primary"
                        onClick={handleRunCode}
                        disabled={runningCode}
                        style={{ padding: "8px 18px", background: "#16a34a" }}
                      >
                        {runningCode ? "Executing..." : "▶ Run Code"}
                      </button>
                    </div>
                  </div>

                  {/* CODE EDITOR TEXTAREA */}
                  <div style={{ position: "relative" }}>
                    <textarea
                      value={codeSession.code}
                      onChange={handleCodeChange}
                      className="prep-code-box"
                      style={{ minHeight: "280px", fontSize: "14px" }}
                      spellCheck="false"
                    />
                    <div style={{ position: "absolute", bottom: "12px", right: "12px", fontSize: "11px", color: "#64748b", background: "rgba(15,23,42,0.8)", padding: "2px 8px", borderRadius: "4px" }}>
                      ⚡ Real-time Synced via Socket.IO
                    </div>
                  </div>

                  {/* EXECUTION OUTPUT CONSOLE */}
                  {codeOutput && (
                    <div style={{ background: "#0f172a", borderRadius: "10px", border: "1px solid #334155", padding: "16px", color: "#f8fafc" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", borderBottom: "1px solid #1e293b", paddingBottom: "6px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: codeOutput.success ? "#4ade80" : "#f87171" }}>
                          {codeOutput.success ? "✓ EXECUTION SUCCESS" : "✕ EXECUTION FAILED"}
                        </span>
                        {codeOutput.executionTimeMs !== undefined && (
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                            Runtime: {codeOutput.executionTimeMs} ms
                          </span>
                        )}
                      </div>

                      <pre style={{ margin: 0, fontFamily: "monospace", fontSize: "13px", color: "#e2e8f0", whiteSpace: "pre-wrap", maxHeight: "160px", overflowY: "auto" }}>
                        {codeOutput.stdout || (codeOutput.result !== undefined ? `Result: ${JSON.stringify(codeOutput.result)}` : "") || codeOutput.error || "No output produced."}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: 5. PEER DISCOVERY */}
              {activeTab === "discovery" && (
                <div style={{ padding: "24px" }}>
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#1e293b" }}>
                      🔍 Discover Complementary Study Partners
                    </h3>
                    <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
                      Peer recommendations matched by strengths bridging your skill gaps.
                    </p>
                  </div>

                  {matches.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", background: "#ffffff", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
                      <p style={{ color: "#64748b" }}>No complementary peer matches found at this moment.</p>
                      <p style={{ fontSize: "13px", color: "#94a3b8" }}>Upload your resume in Real ATS Checker to synchronize your skill profile!</p>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                      {matches.map((peer, idx) => (
                        <div
                          key={peer.peerId || idx}
                          style={{
                            background: "#ffffff",
                            padding: "20px",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#4f46e5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                                {peer.name?.[0]?.toUpperCase() || "P"}
                              </div>
                              <div>
                                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>{peer.name}</h4>
                                <span style={{ fontSize: "12px", color: "#64748b" }}>{peer.department || "Engineering"} • Year {peer.year || "4"}</span>
                              </div>
                            </div>

                            <div style={{ marginBottom: "10px" }}>
                              <span style={{ fontSize: "11px", fontWeight: 700, color: "#4338ca", textTransform: "uppercase" }}>Their Strengths:</span>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                                {(peer.theirStrengths || []).map((s, sIdx) => (
                                  <span key={sIdx} style={{ background: "#e0e7ff", color: "#3730a3", fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 }}>
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {peer.complementaryFocus && (
                              <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "6px", fontSize: "12px", color: "#475569", marginBottom: "12px" }}>
                                💡 <strong>Bridge:</strong> {peer.complementaryFocus}
                              </div>
                            )}
                          </div>

                          <button
                            className="ai-btn-secondary"
                            onClick={() => {
                              setInviteEmail(peer.email || "");
                              setShowInviteModal(true);
                            }}
                            style={{ width: "100%", justifyContent: "center" }}
                          >
                            ✉️ Invite to Workspace
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: 6. AI PAIRED PREP EXERCISE */}
              {activeTab === "exercise" && (
                <div style={{ padding: "24px" }}>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
                      color: "white",
                      padding: "24px 28px",
                      borderRadius: "14px",
                      marginBottom: "20px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                          <span style={{ fontSize: "22px" }}>✨</span>
                          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#ffffff" }}>
                            AI Collaborative Study Exercise Generator
                          </h2>
                        </div>
                        <p style={{ fontSize: "14px", color: "#c7d2fe", margin: 0, maxWidth: "750px", lineHeight: 1.5 }}>
                          Powered by Google Gemini. Creates interactive paired learning exercises where each student takes a defined role (e.g. Architect vs. Implementer) to master technical concepts collaboratively.
                        </p>
                      </div>
                      <span style={{ background: "rgba(255, 255, 255, 0.2)", color: "#ffffff", fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "12px" }}>
                        Gemini 2.5
                      </span>
                    </div>

                    <div style={{ marginTop: "20px" }}>
                      <div style={{ fontSize: "12px", color: "#c7d2fe", marginBottom: "8px", fontWeight: 600 }}>
                        CHOOSE OR TYPE A TOPIC TO PRACTICE TOGETHER:
                      </div>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                        <input
                          type="text"
                          value={exerciseTopic}
                          onChange={(e) => setExerciseTopic(e.target.value)}
                          placeholder="e.g. Graph Traversal, SQL Joins, System Design..."
                          style={{
                            flex: 1,
                            minWidth: "260px",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid rgba(255,255,255,0.3)",
                            background: "rgba(255,255,255,0.1)",
                            color: "white",
                            fontSize: "14px"
                          }}
                        />
                        <button
                          onClick={() => handleGenerateExercise()}
                          disabled={exerciseLoading}
                          style={{
                            background: "#4f46e5",
                            color: "white",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            fontWeight: 700,
                            cursor: exerciseLoading ? "not-allowed" : "pointer"
                          }}
                        >
                          {exerciseLoading ? "Generating..." : "⚡ Generate Paired Exercise"}
                        </button>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {sampleTopics.map((t, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setExerciseTopic(t);
                              handleGenerateExercise(t);
                            }}
                            style={{
                              background: "rgba(255,255,255,0.08)",
                              border: "1px solid rgba(255,255,255,0.15)",
                              color: "#e0e7ff",
                              fontSize: "12px",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {exerciseLoading ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                      <div className="spinner" style={{ margin: "0 auto 15px" }}></div>
                      <p style={{ color: "#64748b" }}>Designing tailored paired collaborative exercise with Google Gemini...</p>
                    </div>
                  ) : exerciseError ? (
                    <div style={{ padding: "16px", background: "#fef2f2", color: "#991b1b", borderRadius: "8px", border: "1px solid #fecaca" }}>
                      {exerciseError}
                    </div>
                  ) : exerciseData ? (
                    <div style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
                        {exerciseData.title || exerciseTopic}
                      </h3>
                      <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "20px" }}>
                        {exerciseData.scenario || exerciseData.problemStatement}
                      </p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div style={{ background: "#f0fdf4", padding: "16px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                          <h4 style={{ color: "#166534", margin: "0 0 8px", fontSize: "15px" }}>
                            👤 Student 1: {exerciseData.role1?.roleTitle || "Architect / Reviewer"}
                          </h4>
                          <p style={{ fontSize: "13px", color: "#15803d", margin: 0 }}>
                            {exerciseData.role1?.tasks || "Analyze constraints and design solution structure."}
                          </p>
                        </div>

                        <div style={{ background: "#eff6ff", padding: "16px", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
                          <h4 style={{ color: "#1e40af", margin: "0 0 8px", fontSize: "15px" }}>
                            👤 Student 2: {exerciseData.role2?.roleTitle || "Implementer / Coder"}
                          </h4>
                          <p style={{ fontSize: "13px", color: "#1d4ed8", margin: 0 }}>
                            {exerciseData.role2?.tasks || "Write the code and verify edge cases."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: CREATE WORKSPACE */}
        {showCreateWsModal && (
          <div className="collab-modal-backdrop" onClick={() => setShowCreateWsModal(false)}>
            <div className="collab-modal-card" onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>🚀 Create Peer Workspace</h3>
                <button onClick={() => setShowCreateWsModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>✕</button>
              </div>

              <form onSubmit={handleCreateWorkspace} style={{ padding: "24px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Workspace Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FAANG DSA Sprint, SDE Interview Prep"
                    value={newWsData.name}
                    onChange={(e) => setNewWsData({ ...newWsData, name: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the focus or target placement drives for this group..."
                    value={newWsData.description}
                    onChange={(e) => setNewWsData({ ...newWsData, description: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Primary Goal
                  </label>
                  <select
                    value={newWsData.goal}
                    onChange={(e) => setNewWsData({ ...newWsData, goal: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  >
                    <option value="DSA & Problem Solving">DSA & Problem Solving</option>
                    <option value="System Design">System Design</option>
                    <option value="Mock Technical Interviews">Mock Technical Interviews</option>
                    <option value="Company Specific Prep">Company Specific Prep</option>
                    <option value="Full Stack Project Showcase">Full Stack Project Showcase</option>
                  </select>
                </div>

                <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    id="isPrivateWs"
                    checked={newWsData.isPrivate}
                    onChange={(e) => setNewWsData({ ...newWsData, isPrivate: e.target.checked })}
                    style={{ width: "16px", height: "16px" }}
                  />
                  <label htmlFor="isPrivateWs" style={{ fontSize: "13px", color: "#334155", cursor: "pointer" }}>
                    Make this workspace private (invite only)
                  </label>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button type="button" className="ai-btn-secondary" onClick={() => setShowCreateWsModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="ai-btn-primary">
                    Create Workspace
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: INVITE MEMBER */}
        {showInviteModal && (
          <div className="collab-modal-backdrop" onClick={() => setShowInviteModal(false)}>
            <div className="collab-modal-card" onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>✉️ Invite Student to Workspace</h3>
                <button onClick={() => setShowInviteModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>✕</button>
              </div>

              <form onSubmit={handleInvitePeer} style={{ padding: "24px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Student Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@campus.edu"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  >
                    <option value="member">Member (Can chat, create tasks, share code)</option>
                    <option value="admin">Admin (Can manage members and channels)</option>
                    <option value="read_only">Read Only (Observer)</option>
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button type="button" className="ai-btn-secondary" onClick={() => setShowInviteModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="ai-btn-primary">
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CREATE TASK */}
        {showCreateTaskModal && (
          <div className="collab-modal-backdrop" onClick={() => setShowCreateTaskModal(false)}>
            <div className="collab-modal-card" onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>🎯 Add Study Task</h3>
                <button onClick={() => setShowCreateTaskModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>✕</button>
              </div>

              <form onSubmit={handleCreateTask} style={{ padding: "24px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solve 5 LeetCode Medium Graphs"
                    value={newTaskData.title}
                    onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Description / Links
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional notes or instructions..."
                    value={newTaskData.description}
                    onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Priority
                    </label>
                    <select
                      value={newTaskData.priority}
                      onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTaskData.dueDate}
                      onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button type="button" className="ai-btn-secondary" onClick={() => setShowCreateTaskModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="ai-btn-primary">
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: SHARE RESOURCE */}
        {showCreateResModal && (
          <div className="collab-modal-backdrop" onClick={() => setShowCreateResModal(false)}>
            <div className="collab-modal-card" onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>📚 Share Resource</h3>
                <button onClick={() => setShowCreateResModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>✕</button>
              </div>

              <form onSubmit={handleCreateResource} style={{ padding: "24px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Resource Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NeetCode 150 Roadmap, Blind 75"
                    value={newResData.title}
                    onChange={(e) => setNewResData({ ...newResData, title: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Resource URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={newResData.url}
                    onChange={(e) => setNewResData({ ...newResData, url: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Category
                  </label>
                  <select
                    value={newResData.category}
                    onChange={(e) => setNewResData({ ...newResData, category: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  >
                    <option value="article">Article / Guide</option>
                    <option value="cheatsheet">Cheatsheet</option>
                    <option value="github">GitHub Repo</option>
                    <option value="interview_question">Interview Question</option>
                    <option value="video">Video Tutorial</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                    Notes / Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe why this is useful for the cohort..."
                    value={newResData.description}
                    onChange={(e) => setNewResData({ ...newResData, description: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button type="button" className="ai-btn-secondary" onClick={() => setShowCreateResModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="ai-btn-primary">
                    Share Resource
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default StudentCollaboration;
