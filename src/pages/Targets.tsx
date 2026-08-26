import { useMemo, useState } from "react";
import type {
  Target,
  TargetStatus,
  TargetType,
} from "../types/target";

const initialTargets: Target[] = [
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

const targetTypes: Array<"All types" | TargetType> = [
  "All types",
  "Web Application",
  "API",
  "Network",
  "Host",
];

const targetStatuses: Array<"All statuses" | TargetStatus> = [
  "All statuses",
  "Active",
  "Paused",
  "Inactive",
];

const projects = [
  "E-Commerce Platform",
  "Internal Infrastructure",
  "Mobile Banking App",
  "Cloud Environment",
  "Legacy System Audit",
  "API Security Assessment",
];

function TargetIcon({ type }: { type: TargetType }) {
  return (
    <div className="target-icon" aria-hidden="true">
      {type === "Web Application" && "◈"}
      {type === "API" && "⌁"}
      {type === "Network" && "◎"}
      {type === "Host" && "◇"}
    </div>
  );
}

function StatusIndicator({ status }: { status: TargetStatus }) {
  return (
    <span
      className={`target-status target-status-${status.toLowerCase()}`}
    >
      <span className="target-status-dot" />
      {status}
    </span>
  );
}

interface AddTargetModalProps {
  onClose: () => void;
  onCreate: (target: Target) => void;
}

function AddTargetModal({
  onClose,
  onCreate,
}: AddTargetModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<TargetType>("Web Application");
  const [project, setProject] = useState(projects[0]);
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Target address is required.");
      return;
    }

    const target: Target = {
      id: `target-${Date.now()}`,
      name: trimmedName,
      type,
      project,
      findings: 0,
      critical: 0,
      lastScanned: "Never",
      status: "Active",
    };

    onCreate(target);
  }

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-target-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="add-target-title">Add Target</h2>
            <p>
              Add an asset to your security assessment workspace.
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="target-name">
                Target Address
                <span className="required">*</span>
              </label>

              <input
                id="target-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (error) {
                    setError("");
                  }
                }}
                placeholder="https://example.com"
                autoFocus
              />

              <span className="form-hint">
                Enter a URL, hostname, IP address, or network range.
              </span>

              {error && (
                <span className="form-error">
                  {error}
                </span>
              )}
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="target-type">
                  Target Type
                </label>

                <select
                  id="target-type"
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as TargetType)
                  }
                >
                  {targetTypes
                    .filter(
                      (targetType) => targetType !== "All types",
                    )
                    .map((targetType) => (
                      <option
                        key={targetType}
                        value={targetType}
                      >
                        {targetType}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="target-project">
                  Project
                </label>

                <select
                  id="target-project"
                  value={project}
                  onChange={(event) =>
                    setProject(event.target.value)
                  }
                >
                  {projects.map((projectName) => (
                    <option
                      key={projectName}
                      value={projectName}
                    >
                      {projectName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
            >
              Add Target
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Targets() {
  const [targets, setTargets] = useState<Target[]>(initialTargets);

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] =
    useState<"All types" | TargetType>("All types");

  const [statusFilter, setStatusFilter] =
    useState<"All statuses" | TargetStatus>("All statuses");

  const [isAddTargetOpen, setIsAddTargetOpen] =
    useState(false);

  const filteredTargets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return targets.filter((target) => {
      const matchesSearch =
        !query ||
        target.name.toLowerCase().includes(query) ||
        target.project.toLowerCase().includes(query) ||
        target.type.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "All types" ||
        target.type === typeFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        target.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [targets, search, typeFilter, statusFilter]);

  function handleCreateTarget(target: Target) {
    setTargets((currentTargets) => [
      target,
      ...currentTargets,
    ]);

    setIsAddTargetOpen(false);
  }

  return (
    <div className="page targets-page">
      <div className="page-header">
        <div>
          <h1>Targets</h1>

          <p>
            Manage the assets included in your security
            assessments.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setIsAddTargetOpen(true)}
        >
          <span>+</span>
          Add Target
        </button>
      </div>

      <section className="card targets-card">
        <div className="targets-toolbar">
          <div className="search-wrapper">
            <span className="search-icon" aria-hidden="true">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search targets..."
              aria-label="Search targets"
            />
          </div>

          <div className="target-filters">
            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as
                    | "All types"
                    | TargetType,
                )
              }
              aria-label="Filter by target type"
            >
              {targetTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "All statuses"
                    | TargetStatus,
                )
              }
              aria-label="Filter by target status"
            >
              {targetStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="targets-table-wrapper">
          <table className="targets-table">
            <thead>
              <tr>
                <th>Target</th>
                <th>Type</th>
                <th>Project</th>
                <th>Findings</th>
                <th>Critical</th>
                <th>Status</th>
                <th>Last Scanned</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {filteredTargets.map((target) => (
                <tr key={target.id}>
                  <td>
                    <div className="target-name-cell">
                      <TargetIcon type={target.type} />

                      <div className="target-name-content">
                        <span className="target-name">
                          {target.name}
                        </span>

                        <span className="target-id">
                          {target.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="target-type">
                      {target.type}
                    </span>
                  </td>

                  <td>
                    <span className="target-project">
                      {target.project}
                    </span>
                  </td>

                  <td>
                    <span className="target-findings">
                      {target.findings}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        target.critical > 0
                          ? "target-critical"
                          : "target-critical zero"
                      }
                    >
                      {target.critical}
                    </span>
                  </td>

                  <td>
                    <StatusIndicator
                      status={target.status}
                    />
                  </td>

                  <td>
                    <span className="target-last-scanned">
                      {target.lastScanned}
                    </span>
                  </td>

                  <td>
                    <button
                      className="table-action"
                      aria-label={`Open ${target.name}`}
                    >
                      →
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTargets.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div
                        className="empty-state-icon"
                        aria-hidden="true"
                      >
                        ⌕
                      </div>

                      <strong>
                        No targets found
                      </strong>

                      <span>
                        Try changing your search or
                        filters.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="targets-footer">
          <span>
            Showing {filteredTargets.length} of{" "}
            {targets.length} targets
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

      {isAddTargetOpen && (
        <AddTargetModal
          onClose={() => setIsAddTargetOpen(false)}
          onCreate={handleCreateTarget}
        />
      )}
    </div>
  );
}