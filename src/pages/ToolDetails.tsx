import { useNavigate, useParams } from "react-router-dom";

import {
  Activity,
  ArrowLeft,
  Box,
  Globe,
  KeyRound,
  Network,
  Search,
  ShieldAlert,
  Terminal,
  Wifi,
} from "lucide-react";

import { tools } from "../data/tools";
import type { ToolCategory, ToolStatus } from "../types/tool";

import "../styles/tool-details.css";

function ToolIcon({
  category,
}: {
  category: ToolCategory;
}) {
  if (category === "Network") {
    return <Network size={24} />;
  }

  if (category === "Web") {
    return <Globe size={24} />;
  }

  if (category === "Enumeration") {
    return <Search size={24} />;
  }

  if (category === "Password") {
    return <KeyRound size={24} />;
  }

  if (category === "Vulnerability") {
    return <ShieldAlert size={24} />;
  }

  if (category === "Wireless") {
    return <Wifi size={24} />;
  }

  if (category === "Forensics") {
    return <Activity size={24} />;
  }

  return <Box size={24} />;
}

function ToolStatus({
  status,
}: {
  status: ToolStatus;
}) {
  const statusClass = status
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <span
      className={`tool-details-status tool-details-status-${statusClass}`}
    >
      <span className="tool-details-status-dot" />
      {status}
    </span>
  );
}

export default function ToolDetails() {
  const { toolId } = useParams();
  const navigate = useNavigate();

  const tool = tools.find(
    (item) => item.id === toolId,
  );

  if (!tool) {
    return (
      <div className="page tool-details-page">
        <button
          className="tool-details-back"
          onClick={() => navigate("/tools")}
        >
          <ArrowLeft size={16} />
          Back to Tools
        </button>

        <section className="card tool-not-found">
          <div className="tool-not-found-icon">
            ?
          </div>

          <h1>Tool not found</h1>

          <p>
            The requested security tool could not be
            found.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/tools")}
          >
            Return to Tools
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="page tool-details-page">
      <button
        className="tool-details-back"
        onClick={() => navigate("/tools")}
      >
        <ArrowLeft size={16} />
        Back to Tools
      </button>

      {/* Header */}
      <div className="tool-details-header">
        <div className="tool-details-title-section">
          <div className="tool-details-icon">
            <ToolIcon category={tool.category} />
          </div>

          <div>
            <div className="tool-details-title-row">
              <h1>{tool.name}</h1>

              <span className="tool-details-category">
                {tool.category}
              </span>

              <ToolStatus status={tool.status} />
            </div>

            <p className="tool-details-command">
              <Terminal size={14} />
              <code>{tool.command}</code>

              {tool.version && (
                <span>v{tool.version}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="card tool-details-card">
        <div className="section-heading">
          <h2>Tool Overview</h2>

          <p>
            Information and configuration details for this
            security tool.
          </p>
        </div>

        <div className="tool-overview-grid">
          <div className="tool-overview-item">
            <span>Name</span>
            <strong>{tool.name}</strong>
          </div>

          <div className="tool-overview-item">
            <span>Category</span>
            <strong>{tool.category}</strong>
          </div>

          <div className="tool-overview-item">
            <span>Command</span>
            <strong className="tool-monospace">
              {tool.command}
            </strong>
          </div>

          <div className="tool-overview-item">
            <span>Version</span>
            <strong>
              {tool.version
                ? `v${tool.version}`
                : "Unknown"}
            </strong>
          </div>

          <div className="tool-overview-item">
            <span>Status</span>
            <ToolStatus status={tool.status} />
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="card tool-details-card">
        <div className="section-heading">
          <h2>Description</h2>

          <p>
            Summary of the security tool and its primary
            purpose.
          </p>
        </div>

        <div className="tool-details-content">
          <p>{tool.description}</p>
        </div>
      </section>

      {/* Execution */}
      <section className="card tool-details-card">
        <div className="section-heading">
          <h2>Tool Execution</h2>

          <p>
            Execute {tool.name} against an authorized target.
          </p>
        </div>

        <div className="tool-execution">
          <div className="tool-command-preview">
            <div className="tool-command-preview-label">
              COMMAND
            </div>

            <div className="tool-command-preview-value">
              <span>$</span>

              <code>{tool.command}</code>

              <span className="tool-command-placeholder">
                [arguments]
              </span>
            </div>
          </div>

          <div className="tool-execution-actions">
            <button
              className="primary-button"
              disabled={tool.status !== "Installed"}
            >
              <Terminal size={16} />
              Run Tool
            </button>
          </div>
        </div>
      </section>

      {/* Output */}
      <section className="card tool-details-card">
        <div className="section-heading">
          <h2>Output</h2>

          <p>
            Command output will appear here after execution.
          </p>
        </div>

        <div className="tool-terminal">
          <div className="tool-terminal-header">
            <span>TERMINAL</span>

            <span className="tool-terminal-status">
              Ready
            </span>
          </div>

          <div className="tool-terminal-body">
            <span className="tool-terminal-prompt">
              $
            </span>

            <span>
              {tool.command}
            </span>

            <span className="tool-terminal-cursor" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="tool-details-footer">
        <button
          className="secondary-button"
          onClick={() => navigate("/tools")}
        >
          <ArrowLeft size={15} />
          Back to Tools
        </button>
      </div>
    </div>
  );
}