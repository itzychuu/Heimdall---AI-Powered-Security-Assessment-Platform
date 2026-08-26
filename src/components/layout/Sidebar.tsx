import {
  LayoutDashboard,
  FolderKanban,
  Target,
  ScanLine,
  ShieldAlert,
  Wrench,
  FileText,
  Bot,
  Settings,
} from "lucide-react";

const items = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: FolderKanban, label: "Projects" },
  { icon: Target, label: "Targets" },
  { icon: ScanLine, label: "Scans" },
  { icon: ShieldAlert, label: "Findings" },
  { icon: Wrench, label: "Tools" },
  { icon: FileText, label: "Reports" },
  { icon: Bot, label: "AI Assistant" },
  { icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <h2>HEIMDALL</h2>
        <span>THE SENTINEL</span>
      </div>

      <nav>
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button key={item.label} className="nav-item">
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}