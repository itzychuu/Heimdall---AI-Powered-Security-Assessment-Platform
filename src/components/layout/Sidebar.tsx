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

import { NavLink } from "react-router-dom";

const items = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/",
  },
  {
    icon: FolderKanban,
    label: "Projects",
    path: "/projects",
  },
  {
    icon: Target,
    label: "Targets",
    path: "/targets",
  },
  {
    icon: ScanLine,
    label: "Scans",
    path: "/scans",
  },
  {
    icon: ShieldAlert,
    label: "Findings",
    path: "/findings",
  },
  {
    icon: Wrench,
    label: "Tools",
    path: "/tools",
  },
  {
    icon: FileText,
    label: "Reports",
    path: "/reports",
  },
  {
    icon: Bot,
    label: "AI Assistant",
    path: "/ai",
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/settings",
  },
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
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}