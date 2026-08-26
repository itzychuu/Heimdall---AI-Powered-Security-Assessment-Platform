import {
  ArrowRight,
  Globe,
  Network,
  ScanLine,
} from "lucide-react";

import Card from "./Card";

interface Assessment {
  id: number;
  name: string;
  target: string;
  type: "web" | "network";
  progress: number;
  stage: string;
  status: "running" | "queued";
  elapsed: string;
}

const assessments: Assessment[] = [
  {
    id: 1,
    name: "Web App Assessment",
    target: "https://api.example.com",
    type: "web",
    progress: 68,
    stage: "Enumeration",
    status: "running",
    elapsed: "14:32",
  },
  {
    id: 2,
    name: "Network Assessment",
    target: "192.168.1.0/24",
    type: "network",
    progress: 42,
    stage: "Port Discovery",
    status: "running",
    elapsed: "08:17",
  },
  {
    id: 3,
    name: "API Security Test",
    target: "api.internal.local",
    type: "web",
    progress: 18,
    stage: "Discovery",
    status: "running",
    elapsed: "03:41",
  },
];

function AssessmentIcon({
  type,
}: {
  type: Assessment["type"];
}) {
  if (type === "network") {
    return <Network size={18} />;
  }

  return <Globe size={18} />;
}

export default function ActiveAssessments() {
  return (
    <Card className="active-assessments">
      <div className="section-header">
        <div>
          <h2>Active Assessments</h2>

          <p>
            Security assessments currently running.
          </p>
        </div>

        <span className="assessment-count">
          {assessments.length} active
        </span>
      </div>

      <div className="assessment-list">
        {assessments.map((assessment) => (
          <button
            key={assessment.id}
            className="assessment-item"
          >
            <div className="assessment-icon">
              <AssessmentIcon type={assessment.type} />
            </div>

            <div className="assessment-info">
              <div className="assessment-title-row">
                <span className="assessment-title">
                  {assessment.name}
                </span>

                <span className="assessment-status">
                  <span className="status-dot" />
                  Running
                </span>
              </div>

              <span className="assessment-target">
                {assessment.target}
              </span>

              <div className="assessment-progress-row">
                <div className="assessment-progress">
                  <div
                    className="assessment-progress-bar"
                    style={{
                      width: `${assessment.progress}%`,
                    }}
                  />
                </div>

                <span className="assessment-progress-value">
                  {assessment.progress}%
                </span>
              </div>
            </div>

            <div className="assessment-meta">
              <span>{assessment.stage}</span>
              <span>{assessment.elapsed}</span>
            </div>

            <ArrowRight
              className="assessment-arrow"
              size={16}
            />
          </button>
        ))}
      </div>

      <button className="assessment-view-all">
        View all scans
        <ScanLine size={14} />
        <ArrowRight size={14} />
      </button>
    </Card>
  );
}