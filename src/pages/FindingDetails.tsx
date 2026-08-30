import { useNavigate, useParams } from "react-router-dom";

import { findings } from "../data/findings";
import "../styles/finding-details.css";

function SeverityBadge({
  severity,
}: {
  severity: string;
}) {
  return (
    <span
      className={`finding-detail-severity finding-detail-severity-${severity.toLowerCase()}`}
    >
      {severity}
    </span>
  );
}

function StatusIndicator({
  status,
}: {
  status: string;
}) {
  const statusClass = status.toLowerCase().replace(/\s+/g, "-");

  return (
    <span
      className={`finding-detail-status finding-detail-status-${statusClass}`}
    >
      <span className="finding-detail-status-dot" />
      {status}
    </span>
  );
}

export default function FindingDetails() {
  const { findingId } = useParams();
  const navigate = useNavigate();

  const finding = findings.find(
    (item) => item.id === findingId,
  );

  /*
   * ========================================
   * FINDING NOT FOUND
   * ========================================
   */

  if (!finding) {
    return (
      <div className="page finding-details-page">
        <button
          className="finding-back-button"
          onClick={() => navigate("/findings")}
        >
          &larr; Back to Findings
        </button>

        <section className="card finding-not-found">
          <div
            className="finding-not-found-icon"
            aria-hidden="true"
          >
            ?
          </div>

          <h1>Finding not found</h1>

          <p>
            The requested security finding could not be found.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/findings")}
          >
            Return to Findings
          </button>
        </section>
      </div>
    );
  }

  /*
   * ========================================
   * FINDING DETAILS
   * ========================================
   */

  return (
    <div className="page finding-details-page">
      {/* Back navigation */}

      <button
        className="finding-back-button"
        onClick={() => navigate("/findings")}
      >
        &larr; Back to Findings
      </button>

      {/* ====================================
          HEADER
          ==================================== */}

      <div className="finding-details-header">
        <div className="finding-details-title-section">
          <div
            className={`finding-details-icon finding-icon-${finding.severity.toLowerCase()}`}
            aria-hidden="true"
          >
            ◆
          </div>

          <div>
            <div className="finding-details-title-row">
              <h1>{finding.title}</h1>

              <SeverityBadge
                severity={finding.severity}
              />

              <StatusIndicator
                status={finding.status}
              />
            </div>

            <p className="finding-details-id">
              {finding.id}
            </p>
          </div>
        </div>
      </div>

      {/* ====================================
          FINDING OVERVIEW
          ==================================== */}

      <section className="card finding-overview-card">
        <div className="section-heading">
          <h2>Finding Overview</h2>

          <p>
            Identification and assessment details for this
            security finding.
          </p>
        </div>

        <div className="finding-overview-grid">
          <div className="finding-overview-item">
            <span>Target</span>

            <strong>{finding.target}</strong>
          </div>

          <div className="finding-overview-item">
            <span>Project</span>

            <strong>{finding.project}</strong>
          </div>

          <div className="finding-overview-item">
            <span>Scan</span>

            <strong>{finding.scan}</strong>
          </div>

          <div className="finding-overview-item">
            <span>Severity</span>

            <SeverityBadge
              severity={finding.severity}
            />
          </div>

          <div className="finding-overview-item">
            <span>Status</span>

            <StatusIndicator
              status={finding.status}
            />
          </div>

          <div className="finding-overview-item">
            <span>Discovered</span>

            <strong>{finding.discoveredAt}</strong>
          </div>

          <div className="finding-overview-item">
            <span>Last Updated</span>

            <strong>{finding.updatedAt}</strong>
          </div>
        </div>
      </section>

      {/* ====================================
          DESCRIPTION
          ==================================== */}

      <section className="card finding-content-card">
        <div className="section-heading">
          <h2>Description</h2>

          <p>
            Summary of the identified security issue.
          </p>
        </div>

        <div className="finding-content">
          <p>{finding.description}</p>
        </div>
      </section>

      {/* ====================================
          EVIDENCE
          ==================================== */}

      <section className="card finding-content-card">
        <div className="section-heading">
          <h2>Evidence</h2>

          <p>
            Assessment evidence associated with this
            finding.
          </p>
        </div>

        <div className="finding-evidence">
          <div
            className="finding-evidence-marker"
            aria-hidden="true"
          >
            !
          </div>

          <p>{finding.evidence}</p>
        </div>
      </section>

      {/* ====================================
          IMPACT + REMEDIATION
          ==================================== */}

      <div className="finding-two-column">
        <section className="card finding-content-card">
          <div className="section-heading">
            <h2>Impact</h2>

            <p>
              Potential security consequences.
            </p>
          </div>

          <div className="finding-content">
            <p>{finding.impact}</p>
          </div>
        </section>

        <section className="card finding-content-card">
          <div className="section-heading">
            <h2>Remediation</h2>

            <p>
              Recommended corrective action.
            </p>
          </div>

          <div className="finding-content">
            <p>{finding.remediation}</p>
          </div>
        </section>
      </div>

      {/* ====================================
          FOOTER
          ==================================== */}

      <div className="finding-details-footer">
        <button
          className="secondary-button"
          onClick={() => navigate("/findings")}
        >
          &larr; Back to Findings
        </button>
      </div>
    </div>
  );
}