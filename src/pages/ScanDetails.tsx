import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Link, useParams } from "react-router-dom";

import type { Scan } from "../types/scan";

interface BackendScanResult {
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

function normalizeTargetType(
  targetType: string,
): Scan["targetType"] {
  switch (targetType) {
    case "WebApplication":
    case "Web Application":
      return "Web Application";

    case "ApiSecurity":
    case "API Security":
      return "API Security";

    case "Network":
      return "Network";

    case "Authentication":
      return "Authentication";

    default:
      return "Network";
  }
}

function normalizeStatus(
  status: string,
): Scan["status"] {
  switch (status) {
    case "Running":
      return "Running";

    case "Paused":
      return "Paused";

    case "Failed":
      return "Failed";

    case "Completed":
      return "Completed";

    default:
      return "Failed";
  }
}

export default function ScanDetails() {
  const { scanId } = useParams<{ scanId: string }>();

  const [backendScan, setBackendScan] =
    useState<BackendScanResult | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [, setLoadError] =
    useState("");

  useEffect(() => {
    if (!scanId) {
      setLoadError("No scan ID was provided.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadScan() {
      try {
        setIsLoading(true);
        setLoadError("");

        const result =
          await invoke<BackendScanResult | null>(
            "get_scan",
            {
              scanId,
            },
          );

        if (cancelled) {
          return;
        }

        if (!result) {
          setBackendScan(null);
          return;
        }

        setBackendScan(result);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load scan:",
          error,
        );

        setLoadError(String(error));
        setBackendScan(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadScan();

    return () => {
      cancelled = true;
    };
  }, [scanId]);

  const scan: Scan | undefined = backendScan
    ? {
      id: backendScan.scan_id,

      name: backendScan.name,

      target: backendScan.target,

      targetType: normalizeTargetType(
        backendScan.target_type,
      ),

      project: backendScan.project,

      progress:
        normalizeStatus(backendScan.status) ===
          "Completed"
          ? 100
          : 0,

      status: normalizeStatus(
        backendScan.status,
      ),

      startedAt: "Just now",

      duration:
        normalizeStatus(backendScan.status) ===
          "Completed"
          ? "Completed"
          : "In progress",

      findings: 0,

      critical: 0,
    }
    : undefined;

  if (isLoading) {
    return (
      <div className="page scan-details-page">
        <Link to="/scans" className="back-link">
          ← Back to Scans
        </Link>

        <div className="card not-found-card">
          <h2>Loading scan...</h2>

          <p>
            Heimdall is loading the security assessment.
          </p>
        </div>
      </div>
    );
  }

  if (!scan || !backendScan) {
    return (
      <div className="page scan-details-page">
        <Link to="/scans" className="back-link">
          ← Back to Scans
        </Link>

        <div className="card not-found-card">
          <h2>Scan not found</h2>

          <p>
            The requested security assessment could not
            be found.
          </p>

          <Link
            to="/scans"
            className="secondary-button"
          >
            Return to Scans
          </Link>
        </div>
      </div>
    );
  }

  const isRunning = scan.status === "Running";

  const isCompleted =
    scan.status === "Completed";

  const isFailed =
    scan.status === "Failed";

  const hasStdout =
    backendScan.stdout.trim().length > 0;

  const hasStderr =
    backendScan.stderr.trim().length > 0;

  return (
    <div className="page scan-details-page">
      <Link to="/scans" className="back-link">
        ← Back to Scans
      </Link>

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="scan-detail-header">
        <div className="scan-detail-heading">
          <ScanIcon />

          <div>
            <div className="scan-detail-title-row">
              <h1>{scan.name}</h1>

              <StatusIndicator
                status={scan.status}
              />
            </div>

            <p>
              {scan.target} · {scan.project}
            </p>
          </div>
        </div>

        <div className="scan-detail-actions">
          {isRunning && (
            <button
              type="button"
              className="secondary-button danger-button"
            >
              Stop Scan
            </button>
          )}

          <Link
            to="/scans/new"
            className="primary-button"
          >
            <span>+</span>
            New Scan
          </Link>
        </div>
      </div>

      {/* =====================================================
          METRICS
          ===================================================== */}

      <div className="metric-grid scan-detail-metrics">
        <div className="card metric-card">
          <div className="metric-card-header">
            <span className="metric-label">
              PROGRESS
            </span>
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
            <span className="metric-label">
              FINDINGS
            </span>
          </div>

          <div className="metric-value">
            {scan.findings}
          </div>

          <div className="metric-footer">
            <span className="metric-description">
              Findings discovered
            </span>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-card-header">
            <span className="metric-label">
              CRITICAL
            </span>
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
            <span className="metric-label">
              STATUS
            </span>
          </div>

          <div className="metric-value scan-duration-value">
            {scan.status}
          </div>

          <div className="metric-footer">
            <span className="metric-description">
              Current assessment state
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN INFORMATION
          ===================================================== */}

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

              <strong>
                {scan.targetType}
              </strong>
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
              <span>Security Tool</span>

              <strong>
                {backendScan.tool_id}
              </strong>
            </div>

            <div className="scan-information-item">
              <span>Started</span>

              <strong>{scan.startedAt}</strong>
            </div>

            <div className="scan-information-item">
              <span>Exit Code</span>

              <strong>
                {backendScan.exit_code ??
                  "Not available"}
              </strong>
            </div>

            <div className="scan-information-item">
              <span>Status</span>

              <StatusIndicator
                status={scan.status}
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            EXECUTION OVERVIEW
            ===================================================== */}

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
              <span>
                Assessment progress
              </span>

              <strong>
                {scan.progress}%
              </strong>
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
                  : isFailed
                    ? "Assessment execution failed"
                    : "Assessment execution complete"}
              </span>

              <span>{scan.duration}</span>
            </div>
          </div>

          <div className="execution-stage-list">
            {/* Discovery */}

            <div
              className={`execution-stage ${isFailed
                ? "completed"
                : "completed"
                }`}
            >
              <span className="execution-stage-indicator">
                ✓
              </span>

              <div>
                <strong>Discovery</strong>

                <span>
                  Target supplied to the security
                  tool.
                </span>
              </div>
            </div>

            {/* Security Assessment */}

            <div
              className={`execution-stage ${isRunning
                ? "active"
                : isFailed
                  ? "completed"
                  : "completed"
                }`}
            >
              <span className="execution-stage-indicator">
                {isRunning ? "•" : "✓"}
              </span>

              <div>
                <strong>
                  Security Assessment
                </strong>

                <span>
                  {isRunning
                    ? "Security checks currently running."
                    : isFailed
                      ? "Security tool execution failed."
                      : "Security tool execution completed."}
                </span>
              </div>
            </div>

            {/* Analysis */}

            <div
              className={`execution-stage ${isCompleted
                ? "completed"
                : "pending"
                }`}
            >
              <span className="execution-stage-indicator">
                {isCompleted ? "✓" : "○"}
              </span>

              <div>
                <strong>Analysis</strong>

                <span>
                  Findings analysis and
                  classification.
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          TOOL OUTPUT
          ===================================================== */}

      <section className="card scan-activity-card">
        <div className="section-header">
          <div>
            <h2>Scan Output</h2>

            <p>
              Output returned by the security
              tool.
            </p>
          </div>

          <span className="assessment-count">
            {isRunning
              ? "Running"
              : isFailed
                ? "Failed"
                : "Completed"}
          </span>
        </div>

        <div className="scan-output-terminal">
          <div className="scan-output-terminal-header">
            <span>TERMINAL</span>

            <span
              className={
                isFailed
                  ? "scan-output-error"
                  : "scan-output-success"
              }
            >
              {isRunning
                ? "Running"
                : isFailed
                  ? "Error"
                  : "Completed"}
            </span>
          </div>

          <div className="scan-output-terminal-body">
            <div className="scan-output-command">
              <span>$</span>

              <span>
                {backendScan.tool_id}{" "}
                {backendScan.target}
              </span>
            </div>

            {hasStdout ? (
              <pre>
                {backendScan.stdout}
              </pre>
            ) : (
              <p className="scan-output-empty">
                No standard output was returned.
              </p>
            )}

            {hasStderr && (
              <>
                <div className="scan-output-divider">
                  STDERR
                </div>

                <pre className="scan-output-stderr">
                  {backendScan.stderr}
                </pre>
              </>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          ACTIVITY
          ===================================================== */}

      <section className="card scan-activity-card">
        <div className="section-header">
          <div>
            <h2>Scan Activity</h2>

            <p>
              Events generated during this
              assessment.
            </p>
          </div>

          <span className="assessment-count">
            {isRunning
              ? "Running"
              : isFailed
                ? "Failed"
                : "Completed"}
          </span>
        </div>

        <div className="scan-activity-list">
          <div className="scan-activity-item">
            <span className="scan-activity-dot completed" />

            <div>
              <strong>
                Scan created
              </strong>

              <span>
                Heimdall created the security
                assessment for{" "}
                {scan.target}.
              </span>
            </div>

            <time>Now</time>
          </div>

          <div className="scan-activity-item">
            <span className="scan-activity-dot completed" />

            <div>
              <strong>
                Security tool started
              </strong>

              <span>
                {backendScan.tool_id} was
                selected for this assessment.
              </span>
            </div>

            <time>Now</time>
          </div>

          <div className="scan-activity-item">
            <span
              className={`scan-activity-dot ${isRunning
                ? "active"
                : "completed"
                }`}
            />

            <div>
              <strong>
                {isRunning
                  ? "Security assessment in progress"
                  : isFailed
                    ? "Security assessment failed"
                    : "Security assessment completed"}
              </strong>

              <span>
                {isRunning
                  ? "The configured security tool is currently executing."
                  : isFailed
                    ? "The security tool returned a failure status."
                    : "The configured security tool finished execution."}
              </span>
            </div>

            <time>
              {isRunning
                ? "Running"
                : "Done"}
            </time>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINDINGS
          ===================================================== */}

      <section className="card scan-findings-card">
        <div className="section-header">
          <div>
            <h2>Findings</h2>

            <p>
              Security findings discovered by
              this scan.
            </p>
          </div>

          <Link
            to="/findings"
            className="section-link"
          >
            View all →
          </Link>
        </div>

        {scan.findings === 0 ? (
          <div className="scan-findings-empty">
            <strong>
              No findings recorded
            </strong>

            <span>
              Heimdall has not generated any
              security findings for this scan
              yet.
            </span>
          </div>
        ) : (
          <div className="scan-finding-list">
            <div className="scan-finding-item">
              <span className="finding-severity critical">
                Critical
              </span>

              <div>
                <strong>
                  Security Finding
                </strong>

                <span>
                  View the finding details.
                </span>
              </div>

              <span className="scan-finding-arrow">
                →
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}