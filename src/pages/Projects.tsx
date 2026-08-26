import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  projects,
  type ProjectStatus,
} from "../data/projects";

export default function Projects() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | ProjectStatus
  >("All");

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        query.length === 0 ||
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        project.status === statusFilter;

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
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              aria-label="Search projects"
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "All"
                  | ProjectStatus,
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
                <tr
                  key={project.id}
                  onDoubleClick={() =>
                    navigate(`/projects/${project.id}`)
                  }
                  className="project-row"
                >
                  <td>
                    <div className="project-name-cell">
                      <div
                        className="project-icon"
                        aria-hidden="true"
                      >
                        ◈
                      </div>

                      <div>
                        <div className="project-name">
                          {project.name}
                        </div>

                        <div className="project-description">
                          {project.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="table-number">
                      {project.targets}
                    </span>
                  </td>

                  <td>
                    <span className="table-number">
                      {project.scans}
                    </span>
                  </td>

                  <td>
                    <span className="table-number">
                      {project.findings}
                    </span>
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
                      onClick={() =>
                        navigate(`/projects/${project.id}`)
                      }
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
            Showing <strong>{filteredProjects.length}</strong>{" "}
            of <strong>{projects.length}</strong> projects
          </span>

          <div className="pagination">
            <button type="button" disabled>
              ←
            </button>

            <button
              type="button"
              className="pagination-active"
            >
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