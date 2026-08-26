import { useNavigate, useParams } from "react-router-dom";

import type { Target } from "../types/target";

const targets: Target[] = [
  {
    id: "target-001",
    name: "https://shop.example.com",
    type: "Web Application",
    project: "E-Commerce Platform",
    findings: 12,
    critical: 2,
    lastScanned: "Today, 09:42",
    status: "Active",
  },
  {
    id: "target-002",
    name: "https://api.example.com",
    type: "API",
    project: "E-Commerce Platform",
    findings: 8,
    critical: 1,
    lastScanned: "Today, 08:17",
    status: "Active",
  },
  {
    id: "target-003",
    name: "192.168.1.0/24",
    type: "Network",
    project: "Internal Infrastructure",
    findings: 21,
    critical: 1,
    lastScanned: "Today, 07:31",
    status: "Active",
  },
  {
    id: "target-004",
    name: "api.internal.local",
    type: "API",
    project: "API Security Assessment",
    findings: 6,
    critical: 0,
    lastScanned: "Yesterday, 18:31",
    status: "Paused",
  },
  {
    id: "target-005",
    name: "10.10.20.15",
    type: "Host",
    project: "Internal Infrastructure",
    findings: 4,
    critical: 0,
    lastScanned: "Yesterday, 16:04",
    status: "Active",
  },
  {
    id: "target-006",
    name: "https://legacy.example.com",
    type: "Web Application",
    project: "Legacy System Audit",
    findings: 9,
    critical: 0,
    lastScanned: "May 17, 2026",
    status: "Inactive",
  },
];

const recentScans = [
  {
    name: "Web App Assessment",
    type: "Web Application",
    status: "Running",
    progress: 68,
    started: "Today, 09:42",
  },
  {
    name: "API Security Test",
    type: "API Security",
    status: "Completed",
    progress: 100,
    started: "Yesterday, 16:20",
  },
  {
    name: "Authentication Assessment",
    type: "Authentication",
    status: "Completed",
    progress: 100,
    started: "May 16, 2026",
  },
];

function TargetIcon({ type }: { type: Target["type"] }) {
  return (
    <div className="target-detail-icon" aria-hidden="true">
      {type === "Web Application" && "◈"}
      {type === "API" && "⌁"}
      {type === "Network" && "◎"}
      {type === "Host" && "◇"}
    </div>
  );
}

export default function TargetDetails() {
  const navigate = useNavigate();
  const { targetId } = useParams();

  const target = targets.find((item) => item.id === targetId);

  if (!target) {
    return (
      <div className="page target-details-page">
        <button
          className="back-button"
          onClick={() => navigate("/targets")}
        >
          ← Back to Targets
        </button>

        <section className="card target-not-found">
          <h2>Target not found</h2>
          <p>
            The requested target does not exist or is no longer available.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/targets")}
          >
            Return to Targets
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="page target-details-page">
      <button
        className="back-button"
        onClick={() => navigate("/targets")}
      >
        ← Back to Targets
      </button>

      <div className="page-header target-details-header">
        <div className="target-details-heading">
          <div className="target-heading-row">
            <TargetIcon type={target.type} />

            <div>
              <div className="target-title-row">
                <h1>{target.name}</h1>

                <span
                  className={`target-status target-status-${target.status.toLowerCase()}`}
                >
                  <span className="target-status-dot" />
                  {target.status}
                </span>
              </div>

              <p>
                {target.type} · {target.project}
              </p>
            </div>
          </div>
        </div>

        <button className="primary-button">
          + New Scan
        </button>
      </div>

      <div className="target-metric-grid">
        <div className="card target-metric-card">
          <span className="target-metric-label">Findings</span>
          <strong>{target.findings}</strong>
          <span className="target-metric-description">
            Discovered findings
          </span>
        </div>

        <div className="card target-metric-card">
          <span className="target-metric-label">Critical</span>
          <strong className="target-metric-danger">
            {target.critical}
          </strong>
          <span className="target-metric-description">
            Require attention
          </span>
        </div>

        <div className="card target-metric-card">
          <span className="target-metric-label">Scans</span>
          <strong>24</strong>
          <span className="target-metric-description">
            Total assessments
          </span>
        </div>

        <div className="card target-metric-card">
          <span className="target-metric-label">Last Scanned</span>
          <strong className="target-metric-text">
            {target.lastScanned}
          </strong>
          <span className="target-metric-description">
            Most recent assessment
          </span>
        </div>
      </div>

      <div className="target-details-grid">
        <section className="card">
          <div className="section-header">
            <div>
              <h2>Target Information</h2>
              <p>Configuration and identification details.</p>
            </div>
          </div>

          <div className="target-information-grid">
            <div className="target-information-item">
              <span>Target ID</span>
              <strong>{target.id}</strong>
            </div>

            <div className="target-information-item">
              <span>Target Type</span>
              <strong>{target.type}</strong>
            </div>

            <div className="target-information-item">
              <span>Project</span>
              <strong>{target.project}</strong>
            </div>

            <div className="target-information-item">
              <span>Status</span>
              <strong>{target.status}</strong>
            </div>

            <div className="target-information-item">
              <span>Last Scanned</span>
              <strong>{target.lastScanned}</strong>
            </div>

            <div className="target-information-item">
              <span>Critical Findings</span>
              <strong className="target-metric-danger">
                {target.critical}
              </strong>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h2>Security Overview</h2>
              <p>Current security posture for this target.</p>
            </div>
          </div>

          <div className="security-overview">
            <div className="security-overview-row">
              <span>Assessment Findings</span>
              <strong>{target.findings}</strong>
            </div>

            <div className="security-progress">
              <div
                className="security-progress-bar"
                style={{
                  width: `${Math.min(
                    Math.max(target.findings * 2.5, 10),
                    100,
                  )}%`,
                }}
              />
            </div>

            <div className="security-overview-row">
              <span>Critical Findings</span>
              <strong className="target-metric-danger">
                {target.critical}
              </strong>
            </div>

            {target.critical > 0 && (
              <div className="security-warning">
                <span className="security-warning-icon">!</span>

                <div>
                  <strong>Attention required</strong>
                  <p>
                    Review critical findings before beginning
                    additional assessments.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="card target-scans-card">
        <div className="section-header">
          <div>
            <h2>Recent Scans</h2>
            <p>Latest security assessments for this target.</p>
          </div>

          <button className="section-link">
            View all →
          </button>
        </div>

        <div className="target-scan-list">
          {recentScans.map((scan) => (
            <div className="target-scan-item" key={scan.name}>
              <div className="target-scan-icon">
                ◈
              </div>

              <div className="target-scan-info">
                <strong>{scan.name}</strong>
                <span>{scan.type}</span>
              </div>

              <div className="target-scan-progress-wrapper">
                <div className="target-scan-progress">
                  <div
                    className="target-scan-progress-bar"
                    style={{ width: `${scan.progress}%` }}
                  />
                </div>

                <span>{scan.progress}%</span>
              </div>

              <div
                className={`target-scan-status ${
                  scan.status === "Running"
                    ? "running"
                    : "completed"
                }`}
              >
                <span className="target-status-dot" />
                {scan.status}
              </div>

              <span className="target-scan-date">
                {scan.started}
              </span>

              <button
                className="table-action"
                aria-label={`Open ${scan.name}`}
              >
                →
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}