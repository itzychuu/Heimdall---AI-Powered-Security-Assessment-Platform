import {
  AlertTriangle,
  ArrowRight,
  CircleAlert,
  ScanLine,
} from "lucide-react";

import Card from "./Card";

interface ActionItem {
  id: number;
  type: "critical" | "high" | "scan";
  title: string;
  description: string;
  action: string;
}

const actionItems: ActionItem[] = [
  {
    id: 1,
    type: "critical",
    title: "SQL Injection",
    description: "api.example.com",
    action: "Review finding",
  },
  {
    id: 2,
    type: "high",
    title: "Authentication Bypass",
    description: "admin.example.com",
    action: "Review finding",
  },
  {
    id: 3,
    type: "scan",
    title: "Network Assessment",
    description: "Scan requires attention",
    action: "Open scan",
  },
];

function ActionIcon({ type }: { type: ActionItem["type"] }) {
  if (type === "critical") {
    return <CircleAlert size={18} />;
  }

  if (type === "high") {
    return <AlertTriangle size={18} />;
  }

  return <ScanLine size={18} />;
}

export default function ActionRequired() {
  return (
    <Card className="action-required">
      <div className="section-header">
        <div>
          <h2>Action Required</h2>

          <p>
            Items that may require your attention.
          </p>
        </div>
      </div>

      <div className="action-list">
        {actionItems.map((item) => (
          <button
            key={item.id}
            className={`action-item action-${item.type}`}
          >
            <div className="action-icon">
              <ActionIcon type={item.type} />
            </div>

            <div className="action-content">
              <span className="action-title">
                {item.title}
              </span>

              <span className="action-description">
                {item.description}
              </span>
            </div>

            <div className="action-arrow">
              <ArrowRight size={16} />
            </div>
          </button>
        ))}
      </div>

      <button className="action-view-all">
        View all findings
        <ArrowRight size={14} />
      </button>
    </Card>
  );
}