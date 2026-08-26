import { useParams, Link } from "react-router-dom";
import type { Scan } from "../types/scan";

const scans: Scan[] = [
  {
    id: "scan-001",
    name: "Web App Assessment",
    target: "https://shop.example.com",
    targetType: "Web Application",
    project: "E-Commerce Platform",
    progress: 68,
    status: "Running",
    startedAt: "Today, 09:42",
    duration: "14:32",
    findings: 12,
    critical: 2,
  },
  {
    id: "scan-002",
    name: "Network Assessment",
    target: "192.168.1.0/24",
    targetType: "Network",
    project: "Internal Infrastructure",
    progress: 100,
    status: "Completed",
    startedAt: "Today, 07:31",
    duration: "08:17",
    findings: 21,
    critical: 1,
  },
  {
    id: "scan-003",
    name: "API Security Test",
    target: "https://api.example.com",
    targetType: "API Security",
    project: "E-Commerce Platform",
    progress: 100,
    status: "Completed",
    startedAt: "Yesterday, 16:20",
    duration: "03:41",
    findings: 8,
    critical: 1,
  },
  {
    id: "scan-004",
    name: "Authentication Assessment",
    target: "https://shop.example.com",
    targetType: "Authentication",
    project: "E-Commerce Platform",
    progress: 100,
    status: "Completed",
    startedAt: "May 16, 2026",
    duration: "11:24",
    findings: 5,
    critical: 0,
  },
  {
    id: "scan-005",
    name: "Internal Network Discovery",
    target: "10.10.20.0/24",
    targetType: "Network",
    project: "Internal Infrastructure",
    progress: 42,
    status: "Running",
    startedAt: "Today, 08:17",
    duration: "05:12",
    findings: 4,
    critical: 0,
  },
  {
    id: "scan-006",
    name: "Legacy Application Audit",
    target: "https://legacy.example.com",
    targetType: "Web Application",
    project: "Legacy System Audit",
    progress: 100,
    status: "Paused",
    startedAt: "May 15, 2026",
    duration: "18:09",
    findings: 9,
    critical: 0,
  },
];

function ScanIcon() {
  return (
    <div className="scan-detail-icon" aria-hidden="true">
      ◇
    </div>
  );
}

function StatusIndicator({
  status,
}: {
  status: Scan["status"];
}) {
  return (
    <span
      className={`scan-detail-status scan-detail-status-${status.toLowerCase()}`}
    >
      <span className="scan-detail-status-dot" />
      {status}
    </span>
  );
}

export default function ScanDetails() {
  const { scanId } = useParams<{ scanId: string }>();

  const scan = scans.find((item) => item.id === scanId);

  if (!scan) {
    return (
      <div className="page scan-details-page">
        <Link to="/scans" className="back-link">
          ← Back to Scans
        </Link>

        <div className="card not-found-card">
          <h2>Scan not found</h2>
          <p>
            The requested security assessment could not be found.
          </p>

          <Link to="/scans" className="secondary-button">
            Return to Scans
          </Link>
        </div>
      </div>
    );
  }

  const isRunning = scan.status === "Running";

  return (
    <div className="page scan-details-page">
      <Link to="/scans" className="back-link">
        ← Back to Scans
      </Link>

      <div className="scan-detail-header">
        <div className="scan-detail-heading">
          <ScanIcon />

          <div>
            <div className="scan-detail-title-row">
              <h1>{scan.name}</h1>
              <StatusIndicator status={scan.status} />
            </div>

            <p>
              {scan.target} · {scan.project}
            </p>
          </div>
        </div>

        <div className="scan-detail-actions">
          {isRunning && (
            <button className="secondary-button danger-button">
              Stop Scan
            </button>
          )}

          <button className="primary-button">
            <span>+</span>
            New Scan
          </button>
        </div>
      </div>

      <div className="metric-grid scan-detail-metrics">
        <div className="card metric-card">
          <div className="metric-card-header">
            <span className="metric-label">PROGRESS</span>
          </div>

          <div className="metric-value">
            {scan.progress}%
          </div>

          <div className="scan-detail-metric-progress">
            <div className="scan-detail-metric-progress-track">
              <div
                className="scan-detail-metric-progress-bar"
                style={{
                  width: `${scan.progress}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-card-header">
            <span className="metric-label">FINDINGS</span>
          </div>

          <div className="metric-value">
            {scan.findings}
          </div>

          <div className="metric-footer">
            <span className="metric-description">
              Discovered findings
            </span>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-card-header">
            <span className="metric-label">CRITICAL</span>
          </div>

          <div className="metric-value scan-detail-critical-value">
            {scan.critical}
          </div>

          <div className="metric-footer">
            <span className="metric-description">
              Require attention
            </span>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-card-header">
            <span className="metric-label">DURATION</span>
          </div>

          <div className="metric-value scan-duration-value">
            {scan.duration}
          </div>

          <div className="metric-footer">
            <span className="metric-description">
              Elapsed assessment time
            </span>
          </div>
        </div>
      </div>

      <div className="scan-detail-main-grid">
        <section className="card">
          <div className="section-header">
            <div>
              <h2>Scan Information</h2>
              <p>
                Configuration and execution details.
              </p>
            </div>
          </div>

          <div className="scan-information-grid">
            <div className="scan-information-item">
              <span>Scan ID</span>
              <strong>{scan.id}</strong>
            </div>

            <div className="scan-information-item">
              <span>Scan Type</span>
              <strong>{scan.targetType}</strong>
            </div>

            <div className="scan-information-item">
              <span>Target</span>
              <strong>{scan.target}</strong>
            </div>

            <div className="scan-information-item">
              <span>Project</span>
              <strong>{scan.project}</strong>
            </div>

            <div className="scan-information-item">
              <span>Started</span>
              <strong>{scan.startedAt}</strong>
            </div>

            <div className="scan-information-item">
              <span>Status</span>
              <StatusIndicator status={scan.status} />
            </div>
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h2>Execution Overview</h2>
              <p>
                Current scan execution status.
              </p>
            </div>
          </div>

          <div className="execution-overview">
            <div className="execution-progress-header">
              <span>Assessment progress</span>
              <strong>{scan.progress}%</strong>
            </div>

            <div className="execution-progress">
              <div
                className="execution-progress-bar"
                style={{
                  width: `${scan.progress}%`,
                }}
              />
            </div>

            <div className="execution-meta">
              <span>
                {isRunning
                  ? "Assessment currently running"
                  : "Assessment execution complete"}
              </span>

              <span>{scan.duration}</span>
            </div>
          </div>

          <div className="execution-stage-list">
            <div className="execution-stage completed">
              <span className="execution-stage-indicator">
                ✓
              </span>

              <div>
                <strong>Discovery</strong>
                <span>Target enumeration completed</span>
              </div>
            </div>

            <div className="execution-stage active">
              <span className="execution-stage-indicator">
                {isRunning ? "•" : "✓"}
              </span>

              <div>
                <strong>
                  {isRunning
                    ? "Assessment"
                    : "Security Assessment"}
                </strong>

                <span>
                  {isRunning
                    ? "Security checks currently running"
                    : "Security checks completed"}
                </span>
              </div>
            </div>

            <div
              className={`execution-stage ${
                scan.progress === 100 ? "completed" : "pending"
              }`}
            >
              <span className="execution-stage-indicator">
                {scan.progress === 100 ? "✓" : "○"}
              </span>

              <div>
                <strong>Analysis</strong>
                <span>
                  Findings analysis and classification
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="card scan-activity-card">
        <div className="section-header">
          <div>
            <h2>Scan Activity</h2>
            <p>
              Recent events generated during this assessment.
            </p>
          </div>

          <span className="assessment-count">
            {isRunning ? "Running" : "Completed"}
          </span>
        </div>

        <div className="scan-activity-list">
          <div className="scan-activity-item">
            <span className="scan-activity-dot completed" />

            <div>
              <strong>Target discovered</strong>
              <span>
                {scan.target} was successfully enumerated.
              </span>
            </div>

            <time>09:43</time>
          </div>

          <div className="scan-activity-item">
            <span className="scan-activity-dot completed" />

            <div>
              <strong>Port and service discovery completed</strong>
              <span>
                Identified accessible services and endpoints.
              </span>
            </div>

            <time>09:47</time>
          </div>

          <div className="scan-activity-item">
            <span
              className={`scan-activity-dot ${
                isRunning ? "active" : "completed"
              }`}
            />

            <div>
              <strong>
                {isRunning
                  ? "Security assessment in progress"
                  : "Security assessment completed"}
              </strong>

              <span>
                {isRunning
                  ? "Running configured security checks."
                  : "All configured security checks have finished."}
              </span>
            </div>

            <time>09:54</time>
          </div>
        </div>
      </section>

      <section className="card scan-findings-card">
        <div className="section-header">
          <div>
            <h2>Findings</h2>
            <p>
              Security findings discovered by this scan.
            </p>
          </div>

          <Link to="/findings" className="section-link">
            View all →
          </Link>
        </div>

        <div className="scan-finding-list">
          <div className="scan-finding-item">
            <span className="finding-severity critical">
              Critical
            </span>

            <div>
              <strong>SQL Injection</strong>
              <span>
                Potential injection vulnerability discovered.
              </span>
            </div>

            <span className="scan-finding-arrow">→</span>
          </div>

          <div className="scan-finding-item">
            <span className="finding-severity high">
              High
            </span>

            <div>
              <strong>Authentication Bypass</strong>
              <span>
                Authentication control may be bypassed.
              </span>
            </div>

            <span className="scan-finding-arrow">→</span>
          </div>

          <div className="scan-finding-item">
            <span className="finding-severity medium">
              Medium
            </span>

            <div>
              <strong>Missing Security Headers</strong>
              <span>
                Recommended HTTP security headers are missing.
              </span>
            </div>

            <span className="scan-finding-arrow">→</span>
          </div>
        </div>
      </section>
    </div>
  );
}