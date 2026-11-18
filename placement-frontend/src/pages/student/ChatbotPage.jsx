import { useEffect, useState, useRef } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI } from "../../services/api";
import { useAuth } from "../../context/useAuth";
import MarkdownMessage from "../../components/MarkdownMessage";
import { Sparkles, Trash2, Plus, Send, Square, Copy, Check, Bot, User } from "lucide-react";
import "../../styles/aiFeatures.css";

const DEFAULT_SUGGESTIONS = [
  "What is data structures and algorithms?",
  "How can I improve my resume ATS score?",
  "Explain object-oriented programming",
  "Write a Python program to reverse a string",
  "What are the most frequently asked SQL interview questions?",
  "Am I eligible for active campus drives?"
];

function ChatbotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [aiStatus, setAiStatus] = useState("AI Copilot");
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getWelcomeMessage = () => ({
    sender: "assistant",
    text: `### 👋 Welcome to CampusAI Copilot, ${user?.name || "Student"}!\n\nI am your **intelligent placement assistant** powered by advanced AI and connected directly to the campus placement database.\n\nHere is how I can assist you:\n- 🔍 **Live Drive Eligibility:** Check if your CGPA, branch, and active backlogs qualify for active company drives.\n- 📄 **ATS Resume Optimization:** Direct recommendations and keyword gap fixes to push your score above 85%.\n- 🎯 **Technical & DSA Prep:** Code implementations, algorithm complexity, OOP concepts, DBMS vs RDBMS, and SQL.\n- 💼 **Interview Readiness:** Behavioral HR questions, mock interview preparation, and 30-day placement plans.\n\nClick any quick prompt below or type your question!`,
    suggestions: [
      "Am I eligible for active drives?",
      "How can I improve my resume ATS score?",
      "Can you suggest a 30-day placement preparation plan?",
      "Write a Python program to reverse a string"
    ],
    createdAt: new Date()
  });

  useEffect(() => {
    let isMounted = true;

    // Check AI status
    studentAPI.getGeminiStatus?.()
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.configured) {
          setAiStatus(res.data.activeModel || "Gemini 3.8 Flash");
        } else {
          setAiStatus("Campus Knowledge Engine");
        }
      })
      .catch(() => {
        if (isMounted) setAiStatus("CampusAI Active");
      });

    // Load chat history
    studentAPI.getChatHistory()
      .then((res) => {
        if (!isMounted) return;
        if (res.data && res.data.length > 0) {
          setMessages(res.data);
        } else {
          setMessages([getWelcomeMessage()]);
        }
      })
      .catch((err) => {
        console.error("Failed to load chat history:", err);
        if (isMounted) setMessages([getWelcomeMessage()]);
      });

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user?.name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query || !query.trim() || loading) return;

    const userMsg = {
      sender: "user",
      text: query.trim(),
      createdAt: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await studentAPI.chatWithBot(query.trim(), { signal: controller.signal });
      const botMsg = {
        sender: "assistant",
        text: res.data?.reply || "I received your query but could not construct a response.",
        suggestions: res.data?.suggestions || [],
        createdAt: new Date()
      };
      setMessages((prev) => [...prev, botMsg]);
      if (res.data?.suggestions && res.data.suggestions.length > 0) {
        setSuggestions(res.data.suggestions);
      }
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
        setMessages((prev) => [
          ...prev,
          {
            sender: "assistant",
            text: "_Response generation stopped by user._",
            createdAt: new Date()
          }
        ]);
      } else {
        console.error("Chat error:", err);
        setMessages((prev) => [
          ...prev,
          {
            sender: "assistant",
            text: "⚠️ **Service Notice:** Unable to reach the AI placement service. Please check your network or try again shortly.",
            createdAt: new Date()
          }
        ]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([getWelcomeMessage()]);
    setSuggestions(DEFAULT_SUGGESTIONS);
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to delete all saved conversation history?")) return;
    try {
      await studentAPI.clearChatHistory();
      setMessages([getWelcomeMessage()]);
      setSuggestions(DEFAULT_SUGGESTIONS);
    } catch (err) {
      console.error("Clear history error:", err);
    }
  };

  const handleCopyText = (text, idx) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <DashboardLayout>
      <div className="ai-portal-container" style={{ padding: "16px 20px" }}>
        <div
          className="chat-page-container"
          style={{
            boxShadow: "0 20px 40px -15px rgba(15, 23, 42, 0.1), 0 0 1px 1px rgba(226, 232, 240, 0.8)",
            borderRadius: "20px",
            border: "1px solid #E2E8F0"
          }}
        >
          {/* HEADER */}
          <div
            className="chat-header"
            style={{
              background: "linear-gradient(135deg, #0B0F19 0%, #111827 50%, #1E1B4B 100%)",
              padding: "16px 24px"
            }}
          >
            <div className="chat-header-info">
              <div
                className="chat-bot-avatar"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                  boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)"
                }}
              >
                <Bot size={22} color="#FFFFFF" />
              </div>
              <div className="chat-header-text">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#F8FAFC" }}>CampusAI Copilot</h2>
                  <span
                    style={{
                      background: "rgba(59, 130, 246, 0.2)",
                      color: "#93C5FD",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "10px",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Sparkles size={11} /> {aiStatus}
                  </span>
                </div>
                <span className="chat-online-indicator" style={{ marginTop: "2px" }}>
                  <span className="chat-online-dot" /> Connected to University Database & Placement Portal
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <button
                className="ai-btn-secondary"
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#F8FAFC",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px"
                }}
                onClick={handleNewChat}
                title="Start a new chat session"
              >
                <Plus size={14} /> New Chat
              </button>
              <button
                className="ai-btn-secondary"
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#FCA5A5",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px"
                }}
                onClick={handleClearHistory}
                title="Clear all saved messages"
              >
                <Trash2 size={14} /> Clear History
              </button>
            </div>
          </div>

          {/* MESSAGES VIEW */}
          <div className="chat-messages-area" style={{ background: "#F8FAFC", padding: "24px" }}>
            {messages.map((msg, index) => {
              const isUser = msg.sender === "user";
              return (
                <div key={index} className={`chat-bubble-wrap ${isUser ? "user" : "assistant"}`}>
                  <div
                    className={`chat-avatar-mini ${isUser ? "user" : "bot"}`}
                    style={{
                      background: isUser ? "#0F172A" : "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                      color: "#FFFFFF"
                    }}
                  >
                    {isUser ? <User size={18} /> : <Bot size={18} />}
                  </div>

                  <div
                    className={`chat-bubble ${isUser ? "user" : "assistant"}`}
                    style={{
                      position: "relative",
                      background: isUser ? "linear-gradient(135deg, #2563EB, #1D4ED8)" : "#FFFFFF",
                      border: isUser ? "none" : "1px solid #E2E8F0",
                      color: isUser ? "#FFFFFF" : "#1E293B",
                      boxShadow: isUser ? "0 4px 12px rgba(37, 99, 235, 0.25)" : "0 2px 8px rgba(0,0,0,0.03)"
                    }}
                  >
                    {isUser ? (
                      <p style={{ margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{msg.text}</p>
                    ) : (
                      <>
                        <MarkdownMessage content={msg.text} />
                        {/* Action footer for assistant bubble */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "10px",
                            paddingTop: "8px",
                            borderTop: "1px solid #F1F5F9"
                          }}
                        >
                          <button
                            onClick={() => handleCopyText(msg.text, index)}
                            style={{
                              background: copiedIndex === index ? "#ECFDF5" : "#F8FAFC",
                              color: copiedIndex === index ? "#059669" : "#64748B",
                              border: `1px solid ${copiedIndex === index ? "#A7F3D0" : "#E2E8F0"}`,
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.15s ease"
                            }}
                            title="Copy response"
                          >
                            {copiedIndex === index ? <Check size={12} /> : <Copy size={12} />}
                            {copiedIndex === index ? "Copied" : "Copy"}
                          </button>
                          <div className="chat-timestamp" style={{ margin: 0 }}>
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : ""}
                          </div>
                        </div>
                      </>
                    )}

                    {isUser && (
                      <div className="chat-timestamp" style={{ color: "rgba(255, 255, 255, 0.75)" }}>
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : ""}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="chat-bubble-wrap assistant">
                <div
                  className="chat-avatar-mini bot"
                  style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)", color: "#FFFFFF" }}
                >
                  <Bot size={18} />
                </div>
                <div className="chat-bubble assistant" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748B", fontSize: "13px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#3B82F6",
                        animation: "pulse-online 1s infinite"
                      }}
                    />
                    <span>CampusAI is thinking...</span>
                    <button
                      onClick={handleStopGeneration}
                      style={{
                        background: "#FEE2E2",
                        color: "#DC2626",
                        border: "1px solid #FCA5A5",
                        borderRadius: "6px",
                        padding: "2px 8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        marginLeft: "8px"
                      }}
                    >
                      <Square size={10} fill="#DC2626" /> Stop
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* QUICK SUGGESTION CHIPS */}
          <div className="chat-suggestions-tray" style={{ background: "#FFFFFF", borderTop: "1px solid #F1F5F9" }}>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                className="chat-prompt-chip"
                onClick={() => handleSendMessage(s)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "20px",
                  padding: "6px 14px",
                  fontSize: "12.5px"
                }}
              >
                <span style={{ color: "#3B82F6" }}>⚡</span> {s}
              </button>
            ))}
          </div>

          {/* INPUT BAR */}
          <div className="chat-input-area" style={{ background: "#FFFFFF", borderTop: "1px solid #E2E8F0" }}>
            <input
              type="text"
              className="chat-input-box"
              placeholder="Ask anything (e.g. Am I eligible for active drives? Explain OOP with Python examples?)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              style={{
                borderRadius: "14px",
                padding: "14px 20px",
                border: "1px solid #CBD5E1",
                fontSize: "14px"
              }}
            />

            {loading ? (
              <button
                className="chat-send-btn"
                onClick={handleStopGeneration}
                title="Stop generation"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "#DC2626",
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)"
                }}
              >
                <Square size={16} fill="#FFFFFF" color="#FFFFFF" />
              </button>
            ) : (
              <button
                className="chat-send-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                title="Send message"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
                }}
              >
                <Send size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ChatbotPage;
