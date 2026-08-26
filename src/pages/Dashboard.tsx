import {
  FolderKanban,
  Target,
  ScanLine,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";

import MetricCard from "../components/ui/MetricCard";
import SecurityPosture from "../components/ui/SecurityPosture";

export default function Dashboard() {
  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p>Welcome to Heimdall.</p>

      <div className="metric-grid">
        <MetricCard
          label="Projects"
          value={12}
          description="Active projects"
          icon={<FolderKanban size={18} />}
        />

        <MetricCard
          label="Targets"
          value={24}
          description="Monitored targets"
          icon={<Target size={18} />}
        />

        <MetricCard
          label="Active Scans"
          value={3}
          description="Currently running"
          icon={<ScanLine size={18} />}
        />

        <MetricCard
          label="Findings"
          value={37}
          description="Discovered findings"
          trend="+7 this week"
          trendPositive={true}
          icon={<ShieldAlert size={18} />}
        />

        <MetricCard
          label="Critical"
          value={2}
          description="Require attention"
          trend="Immediate"
          trendPositive={false}
          icon={<AlertTriangle size={18} />}
        />
      </div>
      <div className="dashboard-main-grid">
        <SecurityPosture />
      </div>
    </div>
  );
}