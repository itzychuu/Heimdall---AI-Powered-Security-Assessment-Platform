import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import type { Scan, ScanStatus, ScanType } from "../types/scan";

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

const scanStatuses: Array<"All statuses" | ScanStatus> = [
  "All statuses",
  "Running",
  "Completed",
  "Paused",
  "Failed",
];

const scanTypes: Array<"All types" | ScanType> = [
  "All types",
  "Web Application",
  "API Security",
  "Network",
  "Authentication",
];

function ScanIcon({ type }: { type: ScanType }) {
  return (
    <div className="scan-icon" aria-hidden="true">
      {type === "Web Application" && "◇"}
      {type === "API Security" && "⌁"}
      {type === "Network" && "◎"}
      {type === "Authentication" && "◈"}
    </div>
  );
}

function StatusIndicator({ status }: { status: ScanStatus }) {
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"All statuses" | ScanStatus>("All statuses");
  const [typeFilter, setTypeFilter] =
    useState<"All types" | ScanType>("All types");

  const filteredScans = useMemo(() => {
    const query = search.trim().toLowerCase();

    return scans.filter((scan) => {
      const matchesSearch =
        !query ||
        scan.name.toLowerCase().includes(query) ||
        scan.target.toLowerCase().includes(query) ||
        scan.project.toLowerCase().includes(query) ||
        scan.targetType.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" ||
        scan.status === statusFilter;

      const matchesType =
        typeFilter === "All types" ||
        scan.targetType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, statusFilter, typeFilter]);

  return (
    <div className="page scans-page">
      <div className="page-header">
        <div>
          <h1>Scans</h1>
          <p>
            Security assessments and their current status.
          </p>
        </div>

        <button className="primary-button">
          <span>+</span>
          New Scan
        </button>
      </div>

      <section className="card scans-card">
        <div className="scans-toolbar">
          <div className="search-wrapper">
            <span className="search-icon">⌕</span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
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
              {scanStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
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
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

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
              {filteredScans.map((scan) => (
                <tr key={scan.id}>
                  <td>
                    <div className="scan-name-cell">
                      <ScanIcon type={scan.targetType} />

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
                    <StatusIndicator status={scan.status} />
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

              {filteredScans.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        ⌕
                      </div>

                      <strong>No scans found</strong>

                      <span>
                        Try changing your search or filters.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="scans-footer">
          <span>
            Showing {filteredScans.length} of {scans.length} scans
          </span>

          <div className="pagination">
            <button disabled aria-label="Previous page">
              ←
            </button>

            <button
              className="active"
              aria-current="page"
            >
              1
            </button>

            <button disabled aria-label="Next page">
              →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}