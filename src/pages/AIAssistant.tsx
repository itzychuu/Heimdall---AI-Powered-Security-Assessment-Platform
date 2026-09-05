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

import { invoke } from "@tauri-apps/api/core";

import "../styles/ai-assistant.css";

interface AgentActionInput {
  name: string;
  value: string;
}

interface AgentAction {
  action_id: string;
  tool_id: string;
  reason: string;
  target: string | null;
  inputs: AgentActionInput[];
}

interface AssessmentPlan {
  objective: string;
  actions: AgentAction[];
}

interface AgentReasonResponse {
  model: string;
  response: string;
  plan: AssessmentPlan | null;
}

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
  const [response, setResponse] = useState("");
  const [plan, setPlan] = useState<AssessmentPlan | null>(null);
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const prompt = message.trim();

    if (!prompt || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");
    setPlan(null);

    try {
      const result = await invoke<AgentReasonResponse>(
        "agent_reason",
        {
          request: {
            prompt,
          },
        },
      );

      setModel(result.model);
      setResponse(result.response);
      setPlan(result.plan);
      setMessage("");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
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
        {!response && !error && !loading && (
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
        )}

        {loading && (
          <div className="ai-empty-state">
            <div className="ai-avatar">
              <Sparkles size={25} />
            </div>

            <h2>Heimdall is thinking...</h2>

            <p>
              Analyzing the request and preparing an assessment plan.
            </p>
          </div>
        )}

        {response && (
          <div className="ai-response">
            <div className="ai-avatar">
              <Bot size={22} />
            </div>

            <h2>Assessment Response</h2>

            {model && (
              <p>
                Model: <strong>{model}</strong>
              </p>
            )}

            <pre>{response}</pre>

            {plan && (
              <div className="ai-plan">
                <h3>Proposed Assessment Plan</h3>

                <p>
                  <strong>Objective:</strong>{" "}
                  {plan.objective}
                </p>

                {plan.actions.length === 0 ? (
                  <p>
                    No actions were proposed for this request.
                  </p>
                ) : (
                  plan.actions.map((action) => (
                    <div
                      key={action.action_id}
                      className="ai-action"
                    >
                      <strong>
                        {action.action_id}
                      </strong>

                      <span>
                        Tool: {action.tool_id}
                      </span>

                      <span>
                        Reason: {action.reason}
                      </span>

                      {action.target && (
                        <span>
                          Target: {action.target}
                        </span>
                      )}

                      {action.inputs.length > 0 && (
                        <div>
                          <strong>Inputs:</strong>

                          {action.inputs.map((input) => (
                            <div key={input.name}>
                              {input.name}: {input.value}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="ai-error">
            <h2>Agent Error</h2>

            <p>{error}</p>
          </div>
        )}

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
                disabled={loading}
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
            {loading ? "Thinking..." : "Ready"}
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
            disabled={loading}
          />

          <button
            type="submit"
            className="ai-send-button"
            aria-label="Send message"
            disabled={!message.trim() || loading}
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