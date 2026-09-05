import { useState } from "react";
import {
  Bot,
  BrainCircuit,
  ChevronRight,
  Play,
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

interface ToolActionInput {
  name: string;
  value: string;
}

interface ToolAction {
  tool_id: string;
  target: string | null;
  inputs: ToolActionInput[];
}

interface AgentReasonResponse {
  model: string;
  response: string;
  plan: AssessmentPlan | null;
  action_arguments: string[][];
  actions: ToolAction[];
}

interface ScanResult {
  scan_id: string;
  name: string;
  target: string;
  target_type: string;
  project: string;
  tool_id: string;
  status: string;
  stdout: string;
  stderr: string;
  exit_code: number | null;
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
  const [actionArguments, setActionArguments] =
    useState<string[][]>([]);
  const [actions, setActions] =
    useState<ToolAction[]>([]);

  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);

  const [error, setError] = useState("");
  const [executionResult, setExecutionResult] =
    useState<ScanResult | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const prompt = message.trim();

    if (!prompt || loading || executing) {
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");
    setPlan(null);
    setModel("");
    setActionArguments([]);
    setActions([]);
    setExecutionResult(null);

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
      setActionArguments(result.action_arguments);
      setActions(result.actions);
      setMessage("");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleExecute(
    actionIndex: number,
  ) {
    const action = actions[actionIndex];

    if (!action) {
      setError(
        "The selected assessment action could not be found.",
      );
      return;
    }

    if (!action.target?.trim()) {
      setError(
        "The approved assessment action does not contain a target.",
      );
      return;
    }

    setExecuting(true);
    setError("");
    setExecutionResult(null);

    try {
      const result = await invoke<ScanResult>(
        "agent_execute",
        {
          request: {
            action,
            name: `AI Assessment - ${action.tool_id}`,
            project: "AI Assistant",
          },
        },
      );

      setExecutionResult(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setExecuting(false);
    }
  }

  function handleSuggestion(
    title: string,
  ) {
    setMessage(title);
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

        {/* Empty state */}
        {!response &&
          !error &&
          !loading &&
          !executionResult && (
            <div className="ai-empty-state">
              <div className="ai-avatar">
                <Sparkles size={25} />
              </div>

              <h2>
                How can Heimdall help?
              </h2>

              <p>
                Ask questions about your security
                assessments, findings, scans, or
                security tools.
              </p>
            </div>
          )}

        {/* Loading state */}
        {loading && (
          <div className="ai-empty-state">
            <div className="ai-avatar">
              <Sparkles size={25} />
            </div>

            <h2>
              Heimdall is thinking...
            </h2>

            <p>
              Analyzing the request and preparing
              an assessment plan.
            </p>
          </div>
        )}

        {/* Agent response */}
        {response && (
          <div className="ai-response">

            <div className="ai-avatar">
              <Bot size={22} />
            </div>

            <h2>
              Assessment Response
            </h2>

            {model && (
              <p>
                Model:{" "}
                <strong>{model}</strong>
              </p>
            )}

            <pre>
              {response}
            </pre>

            {/* Assessment plan */}
            {plan && (
              <div className="ai-plan">

                <h3>
                  Proposed Assessment Plan
                </h3>

                <p>
                  <strong>
                    Objective:
                  </strong>{" "}
                  {plan.objective}
                </p>

                {plan.actions.length === 0 ? (
                  <p>
                    No actions were proposed
                    for this request.
                  </p>
                ) : (
                  plan.actions.map(
                    (action, index) => (
                      <div
                        key={action.action_id}
                        className="ai-action"
                      >

                        <strong>
                          {action.action_id}
                        </strong>

                        <span>
                          Tool:{" "}
                          {action.tool_id}
                        </span>

                        <span>
                          Reason:{" "}
                          {action.reason}
                        </span>

                        {action.target && (
                          <span>
                            Target:{" "}
                            {action.target}
                          </span>
                        )}

                        {/* Inputs */}
                        {action.inputs.length >
                          0 && (
                          <div>
                            <strong>
                              Inputs:
                            </strong>

                            {action.inputs.map(
                              (input) => (
                                <div
                                  key={
                                    input.name
                                  }
                                >
                                  {input.name}:{" "}
                                  {input.value}
                                </div>
                              ),
                            )}
                          </div>
                        )}

                        {/* Generated arguments */}
                        {actionArguments[
                          index
                        ] && (
                          <div>
                            <strong>
                              Generated Arguments:
                            </strong>

                            <pre>
                              {JSON.stringify(
                                actionArguments[
                                  index
                                ],
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                        )}

                        {/* Approval / execution */}
                        {actions[index] && (
                          <div className="ai-execution">

                            <button
                              type="button"
                              className="ai-execute-button"
                              onClick={() =>
                                handleExecute(
                                  index,
                                )
                              }
                              disabled={
                                executing ||
                                loading
                              }
                            >
                              <Play
                                size={16}
                              />

                              {executing
                                ? "Executing..."
                                : "Approve & Execute"}
                            </button>

                            <span>
                              Heimdall will
                              revalidate this
                              action before
                              execution.
                            </span>

                          </div>
                        )}

                      </div>
                    ),
                  )
                )}

              </div>
            )}

          </div>
        )}

        {/* Execution result */}
        {executionResult && (
          <div className="ai-execution-result">

            <div className="ai-avatar">
              <ShieldCheck size={22} />
            </div>

            <h2>
              Assessment Completed
            </h2>

            <div>
              <strong>
                Scan ID:
              </strong>{" "}
              {executionResult.scan_id}
            </div>

            <div>
              <strong>
                Tool:
              </strong>{" "}
              {executionResult.tool_id}
            </div>

            <div>
              <strong>
                Target:
              </strong>{" "}
              {executionResult.target}
            </div>

            <div>
              <strong>
                Status:
              </strong>{" "}
              {executionResult.status}
            </div>

            <div>
              <strong>
                Exit Code:
              </strong>{" "}
              {executionResult.exit_code ??
                "Unknown"}
            </div>

            {executionResult.stdout && (
              <div>
                <h3>
                  Standard Output
                </h3>

                <pre>
                  {executionResult.stdout}
                </pre>
              </div>
            )}

            {executionResult.stderr && (
              <div>
                <h3>
                  Standard Error
                </h3>

                <pre>
                  {executionResult.stderr}
                </pre>
              </div>
            )}

          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="ai-error">
            <h2>
              Agent Error
            </h2>

            <p>
              {error}
            </p>
          </div>
        )}

        {/* Suggestions */}
        <div className="ai-suggestions">
          {suggestions.map(
            (suggestion) => {
              const Icon =
                suggestion.icon;

              return (
                <button
                  key={suggestion.title}
                  type="button"
                  className="ai-suggestion"
                  onClick={() =>
                    handleSuggestion(
                      suggestion.title,
                    )
                  }
                  disabled={
                    loading ||
                    executing
                  }
                >
                  <div className="ai-suggestion-icon">
                    <Icon size={18} />
                  </div>

                  <div className="ai-suggestion-content">
                    <strong>
                      {suggestion.title}
                    </strong>

                    <span>
                      {
                        suggestion.description
                      }
                    </span>
                  </div>

                  <ChevronRight
                    className="ai-suggestion-arrow"
                    size={17}
                  />
                </button>
              );
            },
          )}
        </div>

        {/* Status */}
        <div className="ai-status">

          <div className="ai-status-indicator">
            <span className="ai-status-dot" />

            <span>
              AI Assistant
            </span>
          </div>

          <span className="ai-status-text">
            {loading
              ? "Thinking..."
              : executing
                ? "Executing..."
                : "Ready"}
          </span>

        </div>

        {/* Input */}
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
              setMessage(
                event.target.value,
              )
            }
            placeholder="Ask Heimdall anything..."
            aria-label="Ask Heimdall anything"
            disabled={
              loading ||
              executing
            }
          />

          <button
            type="submit"
            className="ai-send-button"
            aria-label="Send message"
            disabled={
              !message.trim() ||
              loading ||
              executing
            }
          >
            <Send size={17} />
          </button>
        </form>

        {/* Disclaimer */}
        <div className="ai-disclaimer">
          <span>
            Heimdall AI will assist with
            security analysis.
          </span>

          <span>
            Always verify important
            security decisions.
          </span>
        </div>

      </section>
    </div>
  );
}