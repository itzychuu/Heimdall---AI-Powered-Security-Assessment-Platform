import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  FindingSeverity,
  FindingStatus,
} from "../types/finding";
import { findings } from "../data/findings";

const severityOptions: Array<"All severities" | FindingSeverity> = [
  "All severities",
  "Critical",
  "High",
  "Medium",
  "Low",
  "Info",
];

const statusOptions: Array<"All statuses" | FindingStatus> = [
  "All statuses",
  "Open",
  "In Progress",
  "Resolved",
  "Accepted",
  "False Positive",
];

const severityOrder: Record<FindingSeverity, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
  Info: 4,
};

function FindingIcon({ severity }: { severity: FindingSeverity }) {
  return (
    <div
      className={`finding-icon finding-icon-${severity.toLowerCase()}`}
      aria-hidden="true"
    >
      &#9670;
    </div>
  );
}

function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  return (
    <span
      className={`finding-severity finding-severity-${severity.toLowerCase()}`}
    >
      {severity}
    </span>
  );
}

function StatusIndicator({ status }: { status: FindingStatus }) {
  const statusClass = status.toLowerCase().replace(/\s+/g, "-");

  return (
    <span className={`finding-status finding-status-${statusClass}`}>
      <span className="finding-status-dot" />
      {status}
    </span>
  );
}

export default function Findings() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] =
    useState<"All severities" | FindingSeverity>("All severities");
  const [statusFilter, setStatusFilter] =
    useState<"All statuses" | FindingStatus>("All statuses");
  const [sortBy, setSortBy] = useState<
    "severity" | "title" | "recent"
  >("severity");

  const filteredFindings = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = findings.filter((finding) => {
      const matchesSearch =
        !query ||
        finding.title.toLowerCase().includes(query) ||
        finding.target.toLowerCase().includes(query) ||
        finding.project.toLowerCase().includes(query) ||
        finding.id.toLowerCase().includes(query);

      const matchesSeverity =
        severityFilter === "All severities" ||
        finding.severity === severityFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        finding.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "severity") {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }

      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }

      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [search, severityFilter, statusFilter, sortBy]);

  return (
    <div className="page findings-page">
      <div className="page-header">
        <div>
          <h1>Findings</h1>
          <p>Security vulnerabilities discovered during assessments.</p>
        </div>

        <button className="primary-button">
          <span>+</span>
          New Finding
        </button>
      </div>

      <section className="card findings-card">
        <div className="findings-toolbar">
          <div className="search-wrapper">
            <span className="search-icon" aria-hidden="true">
              &#8981;
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search findings..."
              aria-label="Search findings"
            />
          </div>

          <div className="finding-filters">
            <select
              value={severityFilter}
              onChange={(event) =>
                setSeverityFilter(
                  event.target.value as
                  | "All severities"
                  | FindingSeverity,
                )
              }
              aria-label="Filter by severity"
            >
              {severityOptions.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                  | "All statuses"
                  | FindingStatus,
                )
              }
              aria-label="Filter by status"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value as
                  | "severity"
                  | "title"
                  | "recent",
                )
              }
              aria-label="Sort findings"
            >
              <option value="severity">Severity</option>
              <option value="recent">Recently updated</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        <div className="findings-table-wrapper">
          <table className="findings-table">
            <thead>
              <tr>
                <th>Finding</th>
                <th>Severity</th>
                <th>Target</th>
                <th>Project</th>
                <th>Status</th>
                <th>Discovered</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {filteredFindings.map((finding) => (
                <tr key={finding.id}>
                  <td>
                    <div className="finding-name-cell">
                      <FindingIcon severity={finding.severity} />

                      <div className="finding-name-content">
                        <span className="finding-name">
                          {finding.title}
                        </span>

                        <span className="finding-id">
                          {finding.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <SeverityBadge severity={finding.severity} />
                  </td>

                  <td>
                    <span className="finding-target">
                      {finding.target}
                    </span>
                  </td>

                  <td>
                    <span className="finding-project">
                      {finding.project}
                    </span>
                  </td>

                  <td>
                    <StatusIndicator status={finding.status} />
                  </td>

                  <td>
                    <span className="finding-discovered">
                      {finding.discoveredAt}
                    </span>
                  </td>

                  <td>
                    <button
                      className="table-action"
                      aria-label={`Open ${finding.title}`}
                      onClick={() => navigate(`/findings/${finding.id}`)}
                    >
                      &#8594;
                    </button>
                  </td>
                </tr>
              ))}

              {filteredFindings.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        &#8981;
                      </div>

                      <strong>No findings found</strong>

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

        <div className="findings-footer">
          <span>
            Showing {filteredFindings.length} of {findings.length} findings
          </span>

          <div className="pagination">
            <button disabled aria-label="Previous page">
              &#8592;
            </button>

            <button className="active" aria-current="page">
              1
            </button>

            <button disabled aria-label="Next page">
              &#8594;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}