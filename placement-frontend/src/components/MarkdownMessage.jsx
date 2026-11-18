import { useState } from "react";
import { Check, Copy, Code as CodeIcon } from "lucide-react";

/**
 * Enhanced Markdown and Code Block Renderer for CampusAI Copilot
 * Supports:
 * - Multi-line fenced code blocks with language badge and one-click copy
 * - Markdown tables with clean borders and headers
 * - Headers (h2, h3, h4)
 * - Bullet lists and numbered lists
 * - Inline code, bold, italics, links
 */
export default function MarkdownMessage({ content, isUser = false }) {
  if (isUser) {
    return <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{content}</p>;
  }

  if (!content) return null;

  // Split content by fenced code blocks: ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: content.substring(lastIndex, match.index)
      });
    }
    segments.push({
      type: "code",
      language: match[1] || "code",
      code: match[2].trimEnd()
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: "text",
      value: content.substring(lastIndex)
    });
  }

  return (
    <div className="copilot-markdown-content" style={{ fontSize: "14px", lineHeight: 1.6 }}>
      {segments.map((segment, idx) => {
        if (segment.type === "code") {
          return (
            <CodeBlockCard
              key={idx}
              language={segment.language}
              code={segment.code}
            />
          );
        }
        return <TextSegmentRenderer key={idx} text={segment.value} />;
      })}
    </div>
  );
}

function CodeBlockCard({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const displayLang = (language || "CODE").toUpperCase();

  return (
    <div
      style={{
        margin: "12px 0",
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid #1E293B",
        backgroundColor: "#0B0F19",
        boxShadow: "0 4px 14px rgba(0,0,0,0.25)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 14px",
          backgroundColor: "#111827",
          borderBottom: "1px solid #1F2937",
          color: "#94A3B8",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.5px"
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#60A5FA" }}>
          <CodeIcon size={14} />
          {displayLang}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          style={{
            background: copied ? "#065F46" : "rgba(255,255,255,0.06)",
            color: copied ? "#34D399" : "#E2E8F0",
            border: `1px solid ${copied ? "#059669" : "rgba(255,255,255,0.12)"}`,
            borderRadius: "6px",
            padding: "3px 8px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            transition: "all 0.15s ease"
          }}
          title="Copy code to clipboard"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "12px 16px",
          overflowX: "auto",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          fontSize: "13px",
          lineHeight: 1.5,
          color: "#E2E8F0",
          backgroundColor: "#0B0F19"
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TextSegmentRenderer({ text }) {
  if (!text) return null;
  const rawLines = text.split("\n");

  const elements = [];
  let tableBuffer = [];
  let inTable = false;

  const flushTable = (keyPrefix) => {
    if (tableBuffer.length === 0) return;
    elements.push(renderTable(tableBuffer, `${keyPrefix}-tbl`));
    tableBuffer = [];
    inTable = false;
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const isTableLine = line.trim().startsWith("|") && line.trim().endsWith("|");

    if (isTableLine) {
      inTable = true;
      tableBuffer.push(line);
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    // Process non-table lines
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} style={{ fontSize: "15px", fontWeight: "700", margin: "10px 0 4px 0", color: "#0F172A" }}>
          {renderInline(line.replace("### ", ""))}
        </h3>
      );
    } else if (line.startsWith("#### ")) {
      elements.push(
        <h4 key={i} style={{ fontSize: "13.5px", fontWeight: "700", margin: "8px 0 4px 0", color: "#1E293B" }}>
          {renderInline(line.replace("#### ", ""))}
        </h4>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} style={{ fontSize: "16px", fontWeight: "800", margin: "12px 0 6px 0", color: "#0F172A" }}>
          {renderInline(line.replace("## ", ""))}
        </h2>
      );
    } else if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
      const content = line.replace(/^[•\-\*]\s+/, "");
      elements.push(
        <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "4px", paddingLeft: "4px" }}>
          <span style={{ color: "#2563EB", fontWeight: "bold", fontSize: "14px", lineHeight: "1.4" }}>•</span>
          <span style={{ flex: 1, lineHeight: "1.55" }}>{renderInline(content)}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const matchNumber = line.match(/^(\d+)\.\s+(.*)/);
      elements.push(
        <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "4px", paddingLeft: "4px" }}>
          <span style={{ color: "#2563EB", fontWeight: "700", fontSize: "12.5px", minWidth: "18px" }}>
            {matchNumber ? matchNumber[1] + "." : ""}
          </span>
          <span style={{ flex: 1, lineHeight: "1.55" }}>{renderInline(matchNumber ? matchNumber[2] : line)}</span>
        </div>
      );
    } else if (!line.trim()) {
      elements.push(<div key={i} style={{ height: "6px" }} />);
    } else {
      elements.push(
        <p key={i} style={{ margin: "0 0 6px 0", lineHeight: "1.6" }}>
          {renderInline(line)}
        </p>
      );
    }
  }

  if (inTable) {
    flushTable("end");
  }

  return <>{elements}</>;
}

function renderTable(lines, key) {
  if (lines.length < 2) return null;
  const parseRow = (row) =>
    row
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());

  const headerRow = parseRow(lines[0]);
  const isSeparator = (r) => /^[:\-\|\s]+$/.test(r);

  let bodyStartIndex = 1;
  if (isSeparator(lines[1])) {
    bodyStartIndex = 2;
  }

  const bodyRows = lines.slice(bodyStartIndex).map(parseRow);

  return (
    <div key={key} style={{ overflowX: "auto", margin: "10px 0" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "12.5px",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          overflow: "hidden"
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#F1F5F9" }}>
            {headerRow.map((cell, idx) => (
              <th
                key={idx}
                style={{
                  padding: "8px 12px",
                  textAlign: "left",
                  fontWeight: 700,
                  color: "#0F172A",
                  borderBottom: "2px solid #CBD5E1",
                  borderRight: "1px solid #E2E8F0"
                }}
              >
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rIdx) => (
            <tr
              key={rIdx}
              style={{
                backgroundColor: rIdx % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                borderBottom: "1px solid #E2E8F0"
              }}
            >
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  style={{
                    padding: "7px 12px",
                    color: "#334155",
                    borderRight: "1px solid #E2E8F0"
                  }}
                >
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderInline(str) {
  if (!str) return null;
  // Splits by bold (**...**) and inline code (`...`)
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ color: "#0F172A", fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          style={{
            background: "#F1F5F9",
            color: "#0F172A",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "12px",
            fontFamily: "ui-monospace, monospace",
            border: "1px solid #E2E8F0"
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

