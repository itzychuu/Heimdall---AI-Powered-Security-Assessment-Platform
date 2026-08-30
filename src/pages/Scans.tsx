import { invoke } from "@tauri-apps/api/core";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import type {
  Scan,
  ScanStatus,
  ScanType,
} from "../types/scan";

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

const scanStatuses: Array<
  "All statuses" | ScanStatus
> = [
  "All statuses",
  "Running",
  "Completed",
  "Paused",
  "Failed",
];

const scanTypes: Array<
  "All types" | ScanType
> = [
  "All types",
  "Web Application",
  "API Security",
  "Network",
  "Authentication",
];

function normalizeTargetType(
  targetType: string,
): ScanType {
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
): ScanStatus {
  switch (status) {
    case "Running":
      return "Running";

    case "Completed":
      return "Completed";

    case "Paused":
      return "Paused";

    case "Failed":
      return "Failed";

    default:
      return "Failed";
  }
}

function backendScanToScan(
  scan: BackendScanResult,
): Scan {
  const status = normalizeStatus(
    scan.status,
  );

  return {
    id: scan.scan_id,

    name: scan.name,

    target: scan.target,

    targetType: normalizeTargetType(
      scan.target_type,
    ),

    project: scan.project,

    progress:
      status === "Completed"
        ? 100
        : status === "Failed"
          ? 100
          : status === "Paused"
            ? 0
            : 0,

    status,

    startedAt: "Just now",

    duration:
      status === "Completed"
        ? "Completed"
        : status === "Failed"
          ? "Failed"
          : "In progress",

    findings: 0,

    critical: 0,
  };
}

function ScanIcon({
  type,
}: {
  type: ScanType;
}) {
  return (
    <div
      className="scan-icon"
      aria-hidden="true"
    >
      {type === "Web Application" && "◇"}
      {type === "API Security" && "⌁"}
      {type === "Network" && "◎"}
      {type === "Authentication" && "◈"}
    </div>
  );
}

function StatusIndicator({
  status,
}: {
  status: ScanStatus;
}) {
  return (
    <span
      className={`scan-status scan-status-${status.toLowerCase()}`}
    >
      <span className="scan-status-dot" />
      {status}
    </span>
  );
}

export default function Scans() {
  const [scans, setScans] = useState<Scan[]>(
    [],
  );

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      "All statuses" | ScanStatus
    >("All statuses");

  const [typeFilter, setTypeFilter] =
    useState<
      "All types" | ScanType
    >("All types");

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadScans() {
    try {
      setIsLoading(true);
      setError("");

      const results =
        await invoke<BackendScanResult[]>(
          "list_scans",
        );

      const normalizedScans =
        results
          .map(backendScanToScan)
          .reverse();

      setScans(normalizedScans);
    } catch (err) {
      console.error(
        "Failed to load scans:",
        err,
      );

      setError(String(err));
      setScans([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadScans();
  }, []);

  const filteredScans = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return scans.filter((scan) => {
      const matchesSearch =
        !query ||
        scan.name
          .toLowerCase()
          .includes(query) ||
        scan.target
          .toLowerCase()
          .includes(query) ||
        scan.project
          .toLowerCase()
          .includes(query) ||
        scan.targetType
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All statuses" ||
        scan.status === statusFilter;

      const matchesType =
        typeFilter === "All types" ||
        scan.targetType === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    scans,
    search,
    statusFilter,
    typeFilter,
  ]);

  return (
    <div className="page scans-page">
      <div className="page-header">
        <div>
          <h1>Scans</h1>

          <p>
            Security assessments and their
            current status.
          </p>
        </div>

        <Link
          to="/scans/new"
          className="primary-button"
        >
          <span>+</span>
          New Scan
        </Link>
      </div>

      <section className="card scans-card">
        <div className="scans-toolbar">
          <div className="search-wrapper">
            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search scans..."
              aria-label="Search scans"
            />
          </div>

          <div className="scan-filters">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "All statuses"
                    | ScanStatus,
                )
              }
              aria-label="Filter by scan status"
            >
              {scanStatuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ),
              )}
            </select>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as
                    | "All types"
                    | ScanType,
                )
              }
              aria-label="Filter by scan type"
            >
              {scanTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div
            className="new-scan-error"
            role="alert"
            style={{
              margin: "16px 18px",
            }}
          >
            {error}
          </div>
        )}

        <div className="scans-table-wrapper">
          <table className="scans-table">
            <thead>
              <tr>
                <th>Scan</th>
                <th>Target</th>
                <th>Project</th>
                <th>Progress</th>
                <th>Findings</th>
                <th>Critical</th>
                <th>Status</th>
                <th>Started</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <strong>
                        Loading scans...
                      </strong>

                      <span>
                        Heimdall is loading your
                        security assessments.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {filteredScans.map((scan) => (
                    <tr key={scan.id}>
                      <td>
                        <div className="scan-name-cell">
                          <ScanIcon
                            type={
                              scan.targetType
                            }
                          />

                          <div className="scan-name-content">
                            <span className="scan-name">
                              {scan.name}
                            </span>

                            <span className="scan-id">
                              {scan.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="scan-target">
                          {scan.target}
                        </span>
                      </td>

                      <td>
                        <span className="scan-project">
                          {scan.project}
                        </span>
                      </td>

                      <td>
                        <div className="scan-progress-cell">
                          <div className="scan-progress">
                            <div
                              className="scan-progress-bar"
                              style={{
                                width: `${scan.progress}%`,
                              }}
                            />
                          </div>

                          <span className="scan-progress-value">
                            {scan.progress}%
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="scan-findings">
                          {scan.findings}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            scan.critical > 0
                              ? "scan-critical"
                              : "scan-critical zero"
                          }
                        >
                          {scan.critical}
                        </span>
                      </td>

                      <td>
                        <StatusIndicator
                          status={scan.status}
                        />
                      </td>

                      <td>
                        <span className="scan-started">
                          {scan.startedAt}
                        </span>
                      </td>

                      <td>
                        <Link
                          to={`/scans/${scan.id}`}
                          className="table-action"
                          aria-label={`Open ${scan.name}`}
                        >
                          →
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {filteredScans.length ===
                    0 && (
                    <tr>
                      <td colSpan={9}>
                        <div className="empty-state">
                          <div className="empty-state-icon">
                            ⌕
                          </div>

                          <strong>
                            No scans found
                          </strong>

                          <span>
                            Try changing your
                            search or filters.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="scans-footer">
          <span>
            Showing{" "}
            {filteredScans.length} of{" "}
            {scans.length} scans
          </span>

          <div className="pagination">
            <button
              disabled
              aria-label="Previous page"
            >
              ←
            </button>

            <button
              className="active"
              aria-current="page"
            >
              1
            </button>

            <button
              disabled
              aria-label="Next page"
            >
              →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}