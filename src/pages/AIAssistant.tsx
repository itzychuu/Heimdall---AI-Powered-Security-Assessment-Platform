import { useState } from "react";
import {
  Bot,
  BrainCircuit,
  ChevronRight,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";

import "../styles/ai-assistant.css";

const suggestions = [
  {
    icon: ShieldCheck,
    title: "Analyze a security finding",
    description: "Understand severity, impact, and remediation.",
  },
  {
    icon: Terminal,
    title: "Explain a scan result",
    description: "Get help interpreting output from a security tool.",
  },
  {
    icon: BrainCircuit,
    title: "Help prioritize vulnerabilities",
    description: "Identify which findings deserve attention first.",
  },
];

export default function AIAssistant() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    // AI functionality will be connected later.
    setMessage("");
  }

  return (
    <div className="page ai-page">
      <div className="ai-header">
        <div>
          <h1>AI Assistant</h1>

          <p>
            Heimdall security intelligence.
          </p>
        </div>
      </div>

      <section className="card ai-workspace">
        <div className="ai-empty-state">
          <div className="ai-avatar">
            <Sparkles size={25} />
          </div>

          <h2>How can Heimdall help?</h2>

          <p>
            Ask questions about your security assessments,
            findings, scans, or security tools.
          </p>
        </div>

        <div className="ai-suggestions">
          {suggestions.map((suggestion) => {
            const Icon = suggestion.icon;

            return (
              <button
                key={suggestion.title}
                type="button"
                className="ai-suggestion"
                onClick={() =>
                  setMessage(suggestion.title)
                }
              >
                <div className="ai-suggestion-icon">
                  <Icon size={18} />
                </div>

                <div className="ai-suggestion-content">
                  <strong>{suggestion.title}</strong>

                  <span>
                    {suggestion.description}
                  </span>
                </div>

                <ChevronRight
                  className="ai-suggestion-arrow"
                  size={17}
                />
              </button>
            );
          })}
        </div>

        <div className="ai-status">
          <div className="ai-status-indicator">
            <span className="ai-status-dot" />
            <span>AI Assistant</span>
          </div>

          <span className="ai-status-text">
            Ready
          </span>
        </div>

        <form
          className="ai-input-container"
          onSubmit={handleSubmit}
        >
          <div className="ai-input-icon">
            <Bot size={19} />
          </div>

          <input
            type="text"
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            placeholder="Ask Heimdall anything..."
            aria-label="Ask Heimdall anything"
          />

          <button
            type="submit"
            className="ai-send-button"
            aria-label="Send message"
            disabled={!message.trim()}
          >
            <Send size={17} />
          </button>
        </form>

        <div className="ai-disclaimer">
          <span>
            Heimdall AI will assist with security analysis.
          </span>

          <span>
            Always verify important security decisions.
          </span>
        </div>
      </section>
    </div>
  );
}