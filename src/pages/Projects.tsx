import { useMemo, useState } from "react";

type ProjectStatus = "Active" | "Paused" | "Completed";

interface Project {
  id: number;
  name: string;
  description: string;
  targets: number;
  scans: number;
  findings: number;
  critical: number;
  status: ProjectStatus;
  lastActivity: string;
}

const projects: Project[] = [
  {
    id: 1,
    name: "E-Commerce Platform",
    description: "Web application security assessment",
    targets: 12,
    scans: 24,
    findings: 37,
    critical: 2,
    status: "Active",
    lastActivity: "Today, 09:42",
  },
  {
    id: 2,
    name: "Internal Infrastructure",
    description: "Corporate network security assessment",
    targets: 8,
    scans: 11,
    findings: 21,
    critical: 1,
    status: "Active",
    lastActivity: "Today, 08:17",
  },
  {
    id: 3,
    name: "Mobile Banking App",
    description: "Mobile application security assessment",
    targets: 6,
    scans: 9,
    findings: 15,
    critical: 1,
    status: "Active",
    lastActivity: "Yesterday, 18:31",
  },
  {
    id: 4,
    name: "Cloud Environment",
    description: "Cloud infrastructure assessment",
    targets: 10,
    scans: 15,
    findings: 28,
    critical: 3,
    status: "Active",
    lastActivity: "Yesterday, 16:04",
  },
  {
    id: 5,
    name: "Legacy System Audit",
    description: "Legacy application security review",
    targets: 4,
    scans: 7,
    findings: 9,
    critical: 0,
    status: "Completed",
    lastActivity: "May 17, 2026",
  },
  {
    id: 6,
    name: "API Security Assessment",
    description: "REST API security testing",
    targets: 7,
    scans: 12,
    findings: 18,
    critical: 2,
    status: "Paused",
    lastActivity: "May 15, 2026",
  },
];

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ProjectStatus>(
    "All",
  );

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        query.length === 0 ||
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <div className="page projects-page">
      <div className="projects-header">
        <div>
          <h1>Projects</h1>
          <p>Manage your security assessment projects.</p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => {
            console.log("New project");
          }}
        >
          <span className="button-icon">+</span>
          New Project
        </button>
      </div>

      <section className="card projects-card">
        <div className="projects-toolbar">
          <div className="search-field">
            <span className="search-icon" aria-hidden="true">
              ⌕
            </span>

            <input
              type="search"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search projects"
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as "All" | ProjectStatus,
              )
            }
            aria-label="Filter projects by status"
          >
            <option value="All">All projects</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="projects-table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Targets</th>
                <th>Scans</th>
                <th>Findings</th>
                <th>Critical</th>
                <th>Status</th>
                <th>Last Activity</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>

            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <div className="project-name-cell">
                      <div className="project-icon" aria-hidden="true">
                        ◈
                      </div>

                      <div>
                        <div className="project-name">{project.name}</div>
                        <div className="project-description">
                          {project.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="table-number">{project.targets}</span>
                  </td>

                  <td>
                    <span className="table-number">{project.scans}</span>
                  </td>

                  <td>
                    <span className="table-number">{project.findings}</span>
                  </td>

                  <td>
                    <span
                      className={
                        project.critical > 0
                          ? "critical-count has-critical"
                          : "critical-count"
                      }
                    >
                      {project.critical}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`project-status project-status-${project.status.toLowerCase()}`}
                    >
                      <span className="status-dot" />
                      {project.status}
                    </span>
                  </td>

                  <td>
                    <span className="last-activity">
                      {project.lastActivity}
                    </span>
                  </td>

                  <td>
                    <button
                      className="row-action"
                      type="button"
                      aria-label={`Open ${project.name}`}
                      onClick={() => {
                        console.log("Open project:", project.name);
                      }}
                    >
                      →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProjects.length === 0 && (
            <div className="projects-empty-state">
              <div className="empty-icon">⌕</div>
              <h3>No projects found</h3>
              <p>
                Try changing your search or status filter.
              </p>
            </div>
          )}
        </div>

        <div className="projects-footer">
          <span>
            Showing{" "}
            <strong>{filteredProjects.length}</strong>{" "}
            of <strong>{projects.length}</strong> projects
          </span>

          <div className="pagination">
            <button type="button" disabled>
              ←
            </button>

            <button type="button" className="pagination-active">
              1
            </button>

            <button type="button" disabled>
              →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}