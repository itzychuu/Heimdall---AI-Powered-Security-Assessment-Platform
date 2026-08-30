import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronRight,
  FileText,
  Filter,
  FolderKanban,
  Plus,
  Search,
  ShieldAlert,
} from "lucide-react";

import "../styles/reports.css";

type ReportStatus = "Ready" | "Draft" | "Generating";

interface SecurityReport {
  id: string;
  name: string;
  project: string;
  findings: number;
  status: ReportStatus;
  date: string;
}

const reports: SecurityReport[] = [
  {
    id: "report-001",
    name: "Web Application Security Assessment",
    project: "Web Application Audit",
    findings: 12,
    status: "Ready",
    date: "Aug 28, 2026",
  },
  {
    id: "report-002",
    name: "Network Security Assessment",
    project: "Internal Network Assessment",
    findings: 7,
    status: "Ready",
    date: "Aug 26, 2026",
  },
  {
    id: "report-003",
    name: "External Attack Surface Assessment",
    project: "External Infrastructure",
    findings: 18,
    status: "Draft",
    date: "Aug 24, 2026",
  },
  {
    id: "report-004",
    name: "Vulnerability Assessment Report",
    project: "Security Assessment",
    findings: 23,
    status: "Generating",
    date: "Aug 22, 2026",
  },
];

function ReportStatus({
  status,
}: {
  status: ReportStatus;
}) {
  const statusClass = status.toLowerCase();

  return (
    <span
      className={`report-status report-status-${statusClass}`}
    >
      <span className="report-status-dot" />
      {status}
    </span>
  );
}

export default function Reports() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"All statuses" | ReportStatus>("All statuses");

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !query ||
        report.name.toLowerCase().includes(query) ||
        report.project.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" ||
        report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const readyReports = reports.filter(
    (report) => report.status === "Ready",
  ).length;

  const totalFindings = reports.reduce(
    (total, report) => total + report.findings,
    0,
  );

  return (
    <div className="page reports-page">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1>Reports</h1>

          <p>
            Generate and manage security reports.
          </p>
        </div>

        <button
          className="primary-button reports-create-button"
          type="button"
        >
          <Plus size={16} />
          Generate Report
        </button>
      </div>

      {/* Summary */}
      <div className="reports-summary-grid">
        <div className="card reports-summary-card">
          <div className="reports-summary-icon">
            <FileText size={19} />
          </div>

          <div>
            <span>Total Reports</span>
            <strong>{reports.length}</strong>
          </div>
        </div>

        <div className="card reports-summary-card">
          <div className="reports-summary-icon">
            <ShieldAlert size={19} />
          </div>

          <div>
            <span>Total Findings</span>
            <strong>{totalFindings}</strong>
          </div>
        </div>

        <div className="card reports-summary-card">
          <div className="reports-summary-icon">
            <FolderKanban size={19} />
          </div>

          <div>
            <span>Ready Reports</span>
            <strong>{readyReports}</strong>
          </div>
        </div>
      </div>

      {/* Reports */}
      <section className="card reports-card">
        <div className="reports-card-header">
          <div>
            <h2>Security Reports</h2>

            <p>
              View and manage reports generated from your
              security assessments.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="reports-toolbar">
          <div className="reports-search">
            <Search
              className="reports-search-icon"
              size={17}
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search reports..."
              aria-label="Search reports"
            />
          </div>

          <div className="reports-filter">
            <Filter size={15} />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "All statuses"
                    | ReportStatus,
                )
              }
              aria-label="Filter reports by status"
            >
              <option value="All statuses">
                All statuses
              </option>

              <option value="Ready">Ready</option>
              <option value="Draft">Draft</option>
              <option value="Generating">
                Generating
              </option>
            </select>
          </div>
        </div>

        <div className="reports-table-summary">
          <span>
            {filteredReports.length}{" "}
            {filteredReports.length === 1
              ? "report"
              : "reports"}
          </span>
        </div>

        {/* Table */}
        <div className="reports-table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Project</th>
                <th>Findings</th>
                <th>Status</th>
                <th>Date</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div className="report-name-cell">
                      <div className="report-file-icon">
                        <FileText size={17} />
                      </div>

                      <div>
                        <strong>{report.name}</strong>

                        <span>{report.id}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="report-project-cell">
                      <FolderKanban size={15} />
                      {report.project}
                    </div>
                  </td>

                  <td>
                    <div className="report-findings-cell">
                      <ShieldAlert size={14} />
                      {report.findings}
                    </div>
                  </td>

                  <td>
                    <ReportStatus status={report.status} />
                  </td>

                  <td>
                    <div className="report-date-cell">
                      <Calendar size={14} />
                      {report.date}
                    </div>
                  </td>

                  <td>
                    <button
                      className="report-open-button"
                      type="button"
                      aria-label={`Open ${report.name}`}
                    >
                      <ChevronRight size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredReports.length === 0 && (
          <div className="reports-empty-state">
            <div className="reports-empty-icon">
              <Search size={22} />
            </div>

            <h3>No reports found</h3>

            <p>
              Try changing your search or status filter.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}