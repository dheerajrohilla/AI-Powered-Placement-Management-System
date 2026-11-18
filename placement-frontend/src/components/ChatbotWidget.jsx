import { useState, useEffect, useRef } from "react";
import { studentAPI } from "../services/api";
import MarkdownMessage from "./MarkdownMessage";
import { Sparkles, Trash2, Plus, Send, Square, Bot, User, X, MessageSquare, Minimize2 } from "lucide-react";
import "../styles/aiFeatures.css";

const DEFAULT_WELCOME_MESSAGE = {
  sender: "assistant",
  text: "👋 Hi! I'm **CampusAI Copilot**.\n\nAsk me about your **drive eligibility**, **interview schedules**, **coding questions**, or tips to boost your **ATS score** above 85%!",
  suggestions: [
    "Am I eligible for active drives?",
    "How to boost my ATS score?",
    "Write a Python program to reverse a string",
    "Explain OOP concepts"
  ],
  createdAt: new Date()
};

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([DEFAULT_WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(DEFAULT_WELCOME_MESSAGE.suggestions);

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      let isMounted = true;
      studentAPI.getChatHistory()
        .then((res) => {
          if (!isMounted) return;
          if (res.data && res.data.length > 0) {
            setMessages(res.data);
          } else {
            setMessages([DEFAULT_WELCOME_MESSAGE]);
          }
        })
        .catch(() => {});

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text || !text.trim() || loading) return;

    const userMsg = { sender: "user", text: text.trim(), createdAt: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await studentAPI.chatWithBot(text.trim(), { signal: controller.signal });
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: res.data?.reply || "I received your message.",
          suggestions: res.data?.suggestions || [],
          createdAt: new Date()
        }
      ]);
      if (res.data?.suggestions && res.data.suggestions.length > 0) {
        setSuggestions(res.data.suggestions);
      }
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
        setMessages((prev) => [
          ...prev,
          {
            sender: "assistant",
            text: "_Response generation stopped._",
            createdAt: new Date()
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "assistant",
            text: "⚠️ Could not connect to the placement server. Please try again.",
            createdAt: new Date()
          }
        ]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setSuggestions(DEFAULT_WELCOME_MESSAGE.suggestions);
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Clear all conversation history?")) return;
    try {
      await studentAPI.clearChatHistory();
      setMessages([DEFAULT_WELCOME_MESSAGE]);
      setSuggestions(DEFAULT_WELCOME_MESSAGE.suggestions);
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      <button
        className="floating-copilot-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Open CampusAI Placement Copilot"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer"
        }}
      >
        <Bot size={20} />
        <span>{isOpen ? "Close Copilot" : "CampusAI Copilot"}</span>
      </button>

      {/* CHAT POPUP MODAL */}
      {isOpen && (
        <div className="floating-copilot-modal" style={{ display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              background: "linear-gradient(135deg, #0F172A, #1E1B4B)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Bot size={16} color="#FFFFFF" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "13.5px", fontWeight: "700" }}>CampusAI Copilot</h4>
                <span style={{ fontSize: "10.5px", color: "#34D399", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
                  Online
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                onClick={handleNewChat}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#E2E8F0",
                  fontSize: "11px",
                  padding: "3px 6px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px"
                }}
                title="New chat"
              >
                <Plus size={11} /> New
              </button>
              <button
                onClick={handleClearHistory}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#FCA5A5",
                  fontSize: "11px",
                  padding: "3px 6px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px"
                }}
                title="Clear Chat History"
              >
                <Trash2 size={11} /> Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px"
                }}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "14px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "#F8FAFC"
            }}
          >
            {messages.map((m, idx) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: isUser ? "flex-end" : "flex-start",
                    maxWidth: "88%",
                    background: isUser ? "linear-gradient(135deg, #2563EB, #1D4ED8)" : "#FFFFFF",
                    color: isUser ? "#FFFFFF" : "#1E293B",
                    padding: "10px 14px",
                    borderRadius: "14px",
                    border: isUser ? "none" : "1px solid #E2E8F0",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
                  }}
                >
                  <MarkdownMessage content={m.text} isUser={isUser} />
                </div>
              );
            })}

            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#FFFFFF",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#64748B",
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3B82F6" }} />
                <span>Thinking...</span>
                <button
                  onClick={handleStop}
                  style={{
                    background: "#FEE2E2",
                    color: "#DC2626",
                    border: "1px solid #FCA5A5",
                    borderRadius: "4px",
                    padding: "1px 6px",
                    fontSize: "10px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Stop
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div
            style={{
              padding: "6px 10px",
              background: "#FFFFFF",
              display: "flex",
              gap: "5px",
              overflowX: "auto",
              borderTop: "1px solid #F1F5F9"
            }}
          >
            {suggestions.slice(0, 4).map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                style={{
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  color: "#2563EB",
                  fontSize: "11px",
                  padding: "3px 8px",
                  borderRadius: "12px",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px"
                }}
              >
                <span>⚡</span> {s.length > 25 ? s.substring(0, 25) + "..." : s}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div
            style={{
              padding: "10px 12px",
              background: "#FFFFFF",
              borderTop: "1px solid #E2E8F0",
              display: "flex",
              gap: "8px",
              alignItems: "center"
            }}
          >
            <input
              type="text"
              placeholder="Ask anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "20px",
                border: "1px solid #CBD5E1",
                fontSize: "13px",
                outline: "none"
              }}
            />
            {loading ? (
              <button
                onClick={handleStop}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "#DC2626",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Stop generation"
              >
                <Square size={12} fill="#FFFFFF" color="#FFFFFF" />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "#2563EB",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: !inputText.trim() ? 0.5 : 1
                }}
                title="Send"
              >
                <Send size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;
