import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { studentAPI } from "../../services/api";
import { useAuth } from "../../context/useAuth";
import "../../styles/aiFeatures.css";

function ChatbotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "Am I eligible for active drives?",
    "How can I improve my ATS score?",
    "When is my next interview?",
    "Which companies offer >8 LPA?",
    "Give me 3 technical interview questions",
    "Tips for HR behavioral round"
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadHistory = async () => {
    try {
      const res = await studentAPI.getChatHistory();
      if (res.data && res.data.length > 0) {
        setMessages(res.data);
      } else {
        // Default welcoming message
        setMessages([
          {
            sender: "assistant",
            text: `### 👋 Welcome to CampusAI Copilot, ${user?.name || "Student"}!\n\nI am your **real-time placement assistant** connected directly to the campus placement database. I can help you with:\n\n- 🔍 **Live Drive Eligibility:** Check if your CGPA and branch qualify for upcoming company drives.\n- 📄 **ATS Resume Optimization:** Tips and missing sections to push your resume score above 85%.\n- 🎯 **Interview Preparation:** Technical questions, system design fundamentals, and behavioral HR guidance.\n- 💰 **Company Insights:** Top packages, salary breakdowns, and recruiting deadlines.\n\nClick any quick prompt below or type your question!`,
            suggestions: [
              "Am I eligible for active drives?",
              "How can I improve my ATS score?",
              "Show upcoming interviews"
            ],
            createdAt: new Date()
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query || !query.trim()) return;

    const userMsg = {
      sender: "user",
      text: query,
      createdAt: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const res = await studentAPI.chatWithBot(query);
      const botMsg = {
        sender: "assistant",
        text: res.data.reply,
        suggestions: res.data.suggestions || [],
        createdAt: new Date()
      };
      setMessages((prev) => [...prev, botMsg]);
      if (res.data.suggestions && res.data.suggestions.length > 0) {
        setSuggestions(res.data.suggestions);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "⚠️ Sorry, I encountered an issue connecting to the placement service. Please try again.",
          createdAt: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Clear all conversation history with CampusAI Copilot?")) return;
    try {
      await studentAPI.clearChatHistory();
      setMessages([
        {
          sender: "assistant",
          text: `Conversation history cleared. How can I help you today, ${user?.name || "Student"}?`,
          createdAt: new Date()
        }
      ]);
    } catch (err) {
      console.error("Clear history error:", err);
    }
  };

  // Basic markdown-like formatter for bullet points, bold text, headers, and code
  const formatText = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith("### ")) {
        return <h3 key={index} style={{ fontSize: "16px", fontWeight: "700", margin: "10px 0 6px 0", color: "#1e293b" }}>{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("#### ")) {
        return <h4 key={index} style={{ fontSize: "14px", fontWeight: "700", margin: "8px 0 4px 0", color: "#334155" }}>{line.replace("#### ", "")}</h4>;
      }
      // Bullets
      if (line.startsWith("• ") || line.startsWith("- ")) {
        const content = line.substring(2);
        return (
          <div key={index} style={{ marginLeft: "14px", marginBottom: "4px", display: "flex", gap: "6px" }}>
            <span style={{ color: "#2563eb", fontWeight: "bold" }}>•</span>
            <span>{renderInline(content)}</span>
          </div>
        );
      }
      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={index} style={{ marginLeft: "14px", marginBottom: "4px" }}>
            <span>{renderInline(line)}</span>
          </div>
        );
      }
      // Empty lines
      if (!line.trim()) {
        return <div key={index} style={{ height: "6px" }} />;
      }
      return <p key={index} style={{ marginBottom: "4px" }}>{renderInline(line)}</p>;
    });
  };

  const renderInline = (str) => {
    // Basic bold **text** replacement
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            style={{
              background: "#e2e8f0",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "12px",
              fontFamily: "monospace"
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <DashboardLayout>
      <div className="ai-portal-container" style={{ padding: "16px 24px" }}>
        <div className="chat-page-container">
          {/* HEADER */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-bot-avatar">🤖</div>
              <div className="chat-header-text">
                <h2>CampusAI Copilot</h2>
                <span className="chat-online-indicator">
                  <span className="chat-online-dot" /> Online • Live Placement Assistant
                </span>
              </div>
            </div>

            <div>
              <button
                className="ai-btn-secondary"
                style={{ padding: "6px 12px", fontSize: "12px", background: "rgba(255,255,255,0.1)", color: "white", borderColor: "rgba(255,255,255,0.2)" }}
                onClick={handleClearHistory}
              >
                🗑️ Clear History
              </button>
            </div>
          </div>

          {/* MESSAGES VIEW */}
          <div className="chat-messages-area">
            {messages.map((msg, index) => {
              const isUser = msg.sender === "user";
              return (
                <div key={index} className={`chat-bubble-wrap ${isUser ? "user" : "assistant"}`}>
                  <div className={`chat-avatar-mini ${isUser ? "user" : "bot"}`}>
                    {isUser ? "👤" : "🤖"}
                  </div>
                  <div className={`chat-bubble ${isUser ? "user" : "assistant"}`}>
                    {isUser ? <p>{msg.text}</p> : formatText(msg.text)}
                    <div className="chat-timestamp">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="chat-bubble-wrap assistant">
                <div className="chat-avatar-mini bot">🤖</div>
                <div className="chat-bubble assistant">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b" }}>
                    <span>Thinking and checking placement database...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* QUICK SUGGESTION CHIPS */}
          <div className="chat-suggestions-tray">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                className="chat-prompt-chip"
                onClick={() => handleSendMessage(s)}
              >
                💡 {s}
              </button>
            ))}
          </div>

          {/* INPUT BAR */}
          <div className="chat-input-area">
            <input
              type="text"
              className="chat-input-box"
              placeholder="Ask anything (e.g. Am I eligible for active drives? Tips to get 90+ ATS score?)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              className="chat-send-btn"
              onClick={() => handleSendMessage()}
              disabled={loading || !inputText.trim()}
              title="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ChatbotPage;
