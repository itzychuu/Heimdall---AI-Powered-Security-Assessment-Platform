import { Link, useParams } from "react-router-dom";

import { projects } from "../data/projects";

const targets = [
  {
    target: "https://shop.example.com",
    type: "Web Application",
    status: "Active",
  },
  {
    target: "https://api.example.com",
    type: "API",
    status: "Active",
  },
  {
    target: "192.168.1.0/24",
    type: "Network",
    status: "Active",
  },
];

const recentScans = [
  {
    name: "Web App Assessment",
    target: "https://shop.example.com",
    status: "Running",
    progress: 68,
  },
  {
    name: "Network Assessment",
    target: "192.168.1.0/24",
    status: "Completed",
    progress: 100,
  },
  {
    name: "API Security Test",
    target: "https://api.example.com",
    status: "Completed",
    progress: 100,
  },
];

export default function ProjectDetails() {
  const { projectId } = useParams();

  const project = projects.find(
    (item) => item.id === Number(projectId),
  );

  if (!project) {
    return (
      <div className="page">
        <div className="project-not-found card">
          <h1>Project Not Found</h1>
          <p>
            The project you're looking for doesn't exist.
          </p>

          <Link
            className="secondary-button"
            to="/projects"
          >
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page project-details-page">
      <div className="project-details-header">
        <div>
          <Link
            className="back-link"
            to="/projects"
          >
            ← Back to Projects
          </Link>

          <div className="project-title-row">
            <div>
              <h1>{project.name}</h1>

              <p>{project.description}</p>
            </div>

            <span
              className={`project-status project-status-${project.status.toLowerCase()}`}
            >
              <span className="status-dot" />
              {project.status}
            </span>
          </div>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() =>
            console.log("Start assessment")
          }
        >
          + New Scan
        </button>
      </div>

      <nav className="project-tabs">
        <Link
          className="project-tab project-tab-active"
          to={`/projects/${project.id}`}
        >
          Overview
        </Link>

        <Link
          className="project-tab"
          to={`/projects/${project.id}/targets`}
        >
          Targets
        </Link>

        <Link
          className="project-tab"
          to={`/projects/${project.id}/scans`}
        >
          Scans
        </Link>

        <Link
          className="project-tab"
          to={`/projects/${project.id}/findings`}
        >
          Findings
        </Link>

        <Link
          className="project-tab"
          to={`/projects/${project.id}/reports`}
        >
          Reports
        </Link>

        <Link
          className="project-tab"
          to={`/projects/${project.id}/settings`}
        >
          Settings
        </Link>
      </nav>

      <section className="project-summary-grid">
        <div className="card project-summary-card">
          <span>Targets</span>
          <strong>{project.targets}</strong>
          <small>Monitored targets</small>
        </div>

        <div className="card project-summary-card">
          <span>Scans</span>
          <strong>{project.scans}</strong>
          <small>Total assessments</small>
        </div>

        <div className="card project-summary-card">
          <span>Findings</span>
          <strong>{project.findings}</strong>
          <small>Discovered findings</small>
        </div>

        <div className="card project-summary-card project-critical-card">
          <span>Critical</span>
          <strong>{project.critical}</strong>
          <small>Require attention</small>
        </div>
      </section>

      <div className="project-content-grid">
        <section className="card project-section">
          <div className="section-header">
            <div>
              <h2>Targets</h2>
              <p>Assets included in this assessment.</p>
            </div>

            <Link
              className="section-action"
              to={`/projects/${project.id}/targets`}
            >
              View all →
            </Link>
          </div>

          <div className="project-list">
            {targets.map((item) => (
              <div
                className="project-list-item"
                key={item.target}
              >
                <div className="project-list-icon">
                  ◉
                </div>

                <div className="project-list-content">
                  <strong>{item.target}</strong>
                  <span>{item.type}</span>
                </div>

                <span className="list-status">
                  <span className="status-dot" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="card project-section">
          <div className="section-header">
            <div>
              <h2>Security Overview</h2>
              <p>Current project security posture.</p>
            </div>
          </div>

          <div className="security-score">
            <div>
              <span>Assessment Findings</span>
              <strong>{project.findings}</strong>
            </div>

            <div className="security-progress">
              <div
                className="security-progress-bar"
                style={{
                  width: `${Math.max(
                    20,
                    100 - project.critical * 12,
                  )}%`,
                }}
              />
            </div>

            <div className="security-meta">
              <span>Critical findings</span>
              <strong className="danger-text">
                {project.critical}
              </strong>
            </div>
          </div>

          <div className="project-note">
            <span className="project-note-icon">!</span>

            <div>
              <strong>Attention required</strong>
              <p>
                Review critical findings before beginning
                additional assessments.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="card project-section">
        <div className="section-header">
          <div>
            <h2>Recent Scans</h2>
            <p>Latest security assessments for this project.</p>
          </div>

          <Link
            className="section-action"
            to={`/projects/${project.id}/scans`}
          >
            View all →
          </Link>
        </div>

        <div className="scan-list">
          {recentScans.map((scan) => (
            <div
              className="scan-list-item"
              key={scan.name}
            >
              <div className="scan-icon">⌁</div>

              <div className="scan-info">
                <strong>{scan.name}</strong>
                <span>{scan.target}</span>
              </div>

              <div className="scan-progress-container">
                <div className="scan-progress">
                  <div
                    className="scan-progress-bar"
                    style={{
                      width: `${scan.progress}%`,
                    }}
                  />
                </div>

                <span>{scan.progress}%</span>
              </div>

              <span
                className={`scan-status scan-status-${scan.status.toLowerCase()}`}
              >
                {scan.status}
              </span>

              <button
                className="row-action"
                type="button"
                aria-label={`Open ${scan.name}`}
                onClick={() =>
                  console.log("Open scan:", scan.name)
                }
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