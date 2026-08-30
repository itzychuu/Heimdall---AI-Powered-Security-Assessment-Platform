import { FormEvent, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Link, useNavigate } from "react-router-dom";

import "../styles/new-scan.css";

type ScanType =
  | "Web Application"
  | "API Security"
  | "Network"
  | "Authentication";

interface ScanConfig {
  name: string;
  target: string;
  target_type: string;
  project: string;
  tool_id: string;
  scan_options: string[];
}

interface ScanResult {
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

interface ScanExecutionResult {
  scan: ScanResult;
}

const scanTypes: ScanType[] = [
  "Web Application",
  "API Security",
  "Network",
  "Authentication",
];

const tools = [
  {
    id: "nmap",
    name: "Nmap",
    description:
      "Network discovery and service enumeration.",
    types: ["Network"],
  },
  {
    id: "nuclei",
    name: "Nuclei",
    description:
      "Template-based vulnerability scanning.",
    types: [
      "Web Application",
      "API Security",
    ],
  },
];

const projects = [
  "E-Commerce Platform",
  "Internal Infrastructure",
  "Legacy System Audit",
];

export default function NewScan() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [project, setProject] =
    useState(projects[0]);

  const [scanType, setScanType] =
    useState<ScanType>("Network");

  const [target, setTarget] = useState("");

  const [tool, setTool] = useState("nmap");

  const [error, setError] = useState("");

  const [isRunning, setIsRunning] =
    useState(false);

  const availableTools = tools.filter(
    (item) =>
      item.types.includes(scanType),
  );

  function handleScanTypeChange(
    value: ScanType,
  ) {
    setScanType(value);

    const firstAvailableTool =
      tools.find((item) =>
        item.types.includes(value),
      );

    if (firstAvailableTool) {
      setTool(firstAvailableTool.id);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isRunning) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedTarget = target.trim();

    if (!trimmedName) {
      setError(
        "Enter a name for this scan.",
      );
      return;
    }

    if (!trimmedTarget) {
      setError(
        "Enter an authorized target.",
      );
      return;
    }

    if (scanType !== "Network") {
      setError(
        "Only Network scans are currently supported by the first scan engine.",
      );
      return;
    }

    if (tool !== "nmap") {
      setError(
        "Only Nmap scans are currently supported by the first scan engine.",
      );
      return;
    }

    setError("");
    setIsRunning(true);

    const config: ScanConfig = {
      name: trimmedName,
      target: trimmedTarget,
      target_type: "Network",
      project,
      tool_id: "nmap",
      scan_options: [],
    };

    try {
      const result =
        await invoke<ScanExecutionResult>(
          "start_scan",
          {
            config,
          },
        );

      navigate(
        `/scans/${result.scan.scan_id}`,
        {
          state: {
            scan: result.scan,
          },
        },
      );
    } catch (error) {
      console.error(
        "Failed to start scan:",
        error,
      );

      setError(String(error));
      setIsRunning(false);
    }
  }

  return (
    <div className="page new-scan-page">
      <Link
        to="/scans"
        className="back-link"
      >
        ← Back to Scans
      </Link>

      <div className="page-header">
        <div>
          <h1>New Scan</h1>

          <p>
            Configure a security assessment
            against an authorized target.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <section className="card new-scan-card">
          <div className="section-header">
            <div>
              <h2>
                Scan Configuration
              </h2>

              <p>
                Define what Heimdall should
                assess and which security
                tool should perform the
                assessment.
              </p>
            </div>
          </div>

          <div className="new-scan-form-grid">
            <div className="form-field">
              <label htmlFor="scan-name">
                Scan Name
              </label>

              <input
                id="scan-name"
                type="text"
                value={name}
                disabled={isRunning}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="e.g. Internal Network Assessment"
              />
            </div>

            <div className="form-field">
              <label htmlFor="scan-project">
                Project
              </label>

              <select
                id="scan-project"
                value={project}
                disabled={isRunning}
                onChange={(event) =>
                  setProject(
                    event.target.value,
                  )
                }
              >
                {projects.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="scan-type">
                Scan Type
              </label>

              <select
                id="scan-type"
                value={scanType}
                disabled={isRunning}
                onChange={(event) =>
                  handleScanTypeChange(
                    event.target
                      .value as ScanType,
                  )
                }
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

            <div className="form-field">
              <label htmlFor="scan-tool">
                Security Tool
              </label>

              <select
                id="scan-tool"
                value={tool}
                disabled={isRunning}
                onChange={(event) =>
                  setTool(
                    event.target.value,
                  )
                }
              >
                {availableTools.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ),
                )}
              </select>

              <span className="form-help">
                {
                  availableTools.find(
                    (item) =>
                      item.id === tool,
                  )?.description
                }
              </span>
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="scan-target">
                Target
              </label>

              <input
                id="scan-target"
                type="text"
                value={target}
                disabled={isRunning}
                onChange={(event) =>
                  setTarget(
                    event.target.value,
                  )
                }
                placeholder="e.g. 127.0.0.1"
              />

              <span className="form-help">
                Only scan systems and
                applications you are
                authorized to assess.
              </span>
            </div>
          </div>
        </section>

        <section className="card new-scan-card">
          <div className="section-header">
            <div>
              <h2>Execution</h2>

              <p>
                Heimdall will execute the
                selected security tool using
                the scan configuration.
              </p>
            </div>
          </div>

          <div className="scan-execution-preview">
            <div>
              <span>TOOL</span>

              <strong>
                {
                  availableTools.find(
                    (item) =>
                      item.id === tool,
                  )?.name
                }
              </strong>
            </div>

            <div>
              <span>TYPE</span>

              <strong>
                {scanType}
              </strong>
            </div>

            <div>
              <span>TARGET</span>

              <strong>
                {target.trim() ||
                  "Target not configured"}
              </strong>
            </div>
          </div>
        </section>

        {error && (
          <div
            className="new-scan-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="new-scan-actions">
          <Link
            to="/scans"
            className="secondary-button"
            onClick={(event) => {
              if (isRunning) {
                event.preventDefault();
              }
            }}
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="primary-button"
            disabled={isRunning}
          >
            <span>
              {isRunning ? "..." : "+"}
            </span>

            {isRunning
              ? "Running Scan..."
              : "Start Scan"}
          </button>
        </div>
      </form>
    </div>
  );
}