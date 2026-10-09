import React, { useState, useEffect, useRef } from "react";
import { studentAPI } from "../services/api";
import "../styles/aiFeatures.css";

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          sender: "assistant",
          text: "👋 Hi! I'm **CampusAI Copilot**. Ask me about your drive eligibility, interview schedules, or how to boost your ATS score!",
          suggestions: ["Am I eligible for drives?", "How to boost my ATS score?", "Upcoming interviews"],
          createdAt: new Date()
        }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text || !text.trim()) return;

    const userMsg = { sender: "user", text, createdAt: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const res = await studentAPI.chatWithBot(text);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: res.data.reply,
          suggestions: res.data.suggestions || [],
          createdAt: new Date()
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "Could not connect to the placement server. Please try again.",
          createdAt: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderSimpleText = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      if (line.startsWith("### ") || line.startsWith("#### ")) {
        return <strong key={i} style={{ display: "block", margin: "6px 0" }}>{line.replace(/^#+\s/, "")}</strong>;
      }
      if (line.startsWith("• ") || line.startsWith("- ")) {
        return (
          <div key={i} style={{ marginLeft: "10px", fontSize: "13px" }}>
            • {line.substring(2)}
          </div>
        );
      }
      if (!line.trim()) return <div key={i} style={{ height: "4px" }} />;
      return <p key={i} style={{ margin: "2px 0", fontSize: "13px" }}>{line}</p>;
    });
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      <button
        className="floating-copilot-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Open Placement Assistant"
      >
        <span>🤖</span>
        <span>{isOpen ? "Close Copilot" : "CampusAI Copilot"}</span>
      </button>

      {/* CHAT POPUP MODAL */}
      {isOpen && (
        <div className="floating-copilot-modal">
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>🤖</span>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700" }}>CampusAI Copilot</h4>
                <span style={{ fontSize: "11px", color: "#34d399" }}>● Online</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                fontSize: "18px",
                cursor: "pointer"
              }}
            >
              ✕
            </button>
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
              background: "#f8fafc"
            }}
          >
            {messages.map((m, idx) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: isUser ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    background: isUser ? "#2563eb" : "white",
                    color: isUser ? "white" : "#1e293b",
                    padding: "10px 14px",
                    borderRadius: "14px",
                    border: isUser ? "none" : "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                  }}
                >
                  {isUser ? <p style={{ margin: 0, fontSize: "13px" }}>{m.text}</p> : renderSimpleText(m.text)}
                </div>
              );
            })}

            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "white",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#64748b"
                }}
              >
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div
            style={{
              padding: "8px 12px",
              background: "white",
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              borderTop: "1px solid #f1f5f9"
            }}
          >
            <button
              onClick={() => handleSend("Am I eligible for active drives?")}
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#2563eb",
                fontSize: "11px",
                padding: "4px 8px",
                borderRadius: "12px",
                whiteSpace: "nowrap",
                cursor: "pointer"
              }}
            >
              Eligibility
            </button>
            <button
              onClick={() => handleSend("How to boost my ATS score?")}
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#2563eb",
                fontSize: "11px",
                padding: "4px 8px",
                borderRadius: "12px",
                whiteSpace: "nowrap",
                cursor: "pointer"
              }}
            >
              ATS Score Tips
            </button>
            <button
              onClick={() => handleSend("When is my next interview?")}
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#2563eb",
                fontSize: "11px",
                padding: "4px 8px",
                borderRadius: "12px",
                whiteSpace: "nowrap",
                cursor: "pointer"
              }}
            >
              My Interviews
            </button>
          </div>

          {/* Input Box */}
          <div
            style={{
              padding: "10px 14px",
              background: "white",
              borderTop: "1px solid #e2e8f0",
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
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                outline: "none"
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputText.trim()}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "#2563eb",
                color: "white",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;
