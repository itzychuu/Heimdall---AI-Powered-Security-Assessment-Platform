import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  ArrowRight,
  Box,
  Globe,
  KeyRound,
  Network,
  Search,
  ShieldAlert,
  Terminal,
  Wifi,
} from "lucide-react";

import { tools } from "../data/tools";
import type { ToolCategory, ToolStatus } from "../types/tool";

import "../styles/tools.css";

const categories: Array<"All categories" | ToolCategory> = [
  "All categories",
  "Network",
  "Web",
  "Enumeration",
  "Password",
  "Vulnerability",
  "Wireless",
  "Forensics",
  "Utility",
];

const statuses: Array<"All statuses" | ToolStatus> = [
  "All statuses",
  "Installed",
  "Not Installed",
  "Unknown",
];

function ToolIcon({ category }: { category: ToolCategory }) {
  if (category === "Network") {
    return <Network size={18} />;
  }

  if (category === "Web") {
    return <Globe size={18} />;
  }

  if (category === "Enumeration") {
    return <Search size={18} />;
  }

  if (category === "Password") {
    return <KeyRound size={18} />;
  }

  if (category === "Vulnerability") {
    return <ShieldAlert size={18} />;
  }

  if (category === "Wireless") {
    return <Wifi size={18} />;
  }

  if (category === "Forensics") {
    return <Activity size={18} />;
  }

  return <Box size={18} />;
}

function ToolStatus({
  status,
}: {
  status: ToolStatus;
}) {
  const statusClass = status
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <span
      className={`tool-status tool-status-${statusClass}`}
    >
      <span className="tool-status-dot" />
      {status}
    </span>
  );
}

export default function Tools() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState<"All categories" | ToolCategory>(
      "All categories",
    );

  const [status, setStatus] =
    useState<"All statuses" | ToolStatus>(
      "All statuses",
    );

  const filteredTools = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.command.toLowerCase().includes(query);

      const matchesCategory =
        category === "All categories" ||
        tool.category === category;

      const matchesStatus =
        status === "All statuses" ||
        tool.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [search, category, status]);

  return (
    <div className="page tools-page">
      <div className="tools-header">
        <div>
          <h1>Tools</h1>

          <p>
            Manage and access the security tools available to
            Heimdall.
          </p>
        </div>
      </div>

      <section className="card tools-card">
        <div className="tools-toolbar">
          <div className="tools-search">
            <Search
              className="tools-search-icon"
              size={17}
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search tools..."
              aria-label="Search tools"
            />
          </div>

          <div className="tools-filters">
            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value as
                    | "All categories"
                    | ToolCategory,
                )
              }
              aria-label="Filter by category"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as
                    | "All statuses"
                    | ToolStatus,
                )
              }
              aria-label="Filter by status"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="tools-summary">
          <span>
            {filteredTools.length}{" "}
            {filteredTools.length === 1
              ? "tool"
              : "tools"}
          </span>

          <span>
            {
              tools.filter(
                (tool) => tool.status === "Installed",
              ).length
            }{" "}
            installed
          </span>
        </div>

        <div className="tools-grid">
          {filteredTools.map((tool) => (
            <article
              key={tool.id}
              className="tool-card"
            >
              <div className="tool-card-header">
                <div className="tool-icon">
                  <ToolIcon category={tool.category} />
                </div>

                <ToolStatus status={tool.status} />
              </div>

              <div className="tool-card-body">
                <div className="tool-title-row">
                  <h2>{tool.name}</h2>

                  <span className="tool-category">
                    {tool.category}
                  </span>
                </div>

                <p>{tool.description}</p>
              </div>

              <div className="tool-card-footer">
                <div className="tool-command">
                  <Terminal size={13} />
                  <code>{tool.command}</code>

                  {tool.version && (
                    <span>{tool.version}</span>
                  )}
                </div>

                <button
                  className="tool-open-button"
                  aria-label={`Open ${tool.name}`}
                  onClick={() =>
                    navigate(`/tools/${tool.id}`)
                  }
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="tools-empty-state">
            <div className="tools-empty-icon">
              <Search size={22} />
            </div>

            <h2>No tools found</h2>

            <p>
              Try changing your search or filters.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}