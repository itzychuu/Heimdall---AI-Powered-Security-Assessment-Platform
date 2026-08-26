export type ProjectStatus = "Active" | "Paused" | "Completed";

export interface Project {
  id: number;
  name: string;
  description: string;
  targets: number;
  scans: number;
  findings: number;
  critical: number;
  status: ProjectStatus;
  lastActivity: string;
}

export const projects: Project[] = [
  {
    id: 1,
    name: "E-Commerce Platform",
    description: "Web application security assessment",
    targets: 12,
    scans: 24,
    findings: 37,
    critical: 2,
    status: "Active",
    lastActivity: "Today, 09:42",
  },
  {
    id: 2,
    name: "Internal Infrastructure",
    description: "Corporate network security assessment",
    targets: 8,
    scans: 11,
    findings: 21,
    critical: 1,
    status: "Active",
    lastActivity: "Today, 08:17",
  },
  {
    id: 3,
    name: "Mobile Banking App",
    description: "Mobile application security assessment",
    targets: 6,
    scans: 9,
    findings: 15,
    critical: 1,
    status: "Active",
    lastActivity: "Yesterday, 18:31",
  },
  {
    id: 4,
    name: "Cloud Environment",
    description: "Cloud infrastructure assessment",
    targets: 10,
    scans: 15,
    findings: 28,
    critical: 3,
    status: "Active",
    lastActivity: "Yesterday, 16:04",
  },
  {
    id: 5,
    name: "Legacy System Audit",
    description: "Legacy application security review",
    targets: 4,
    scans: 7,
    findings: 9,
    critical: 0,
    status: "Completed",
    lastActivity: "May 17, 2026",
  },
  {
    id: 6,
    name: "API Security Assessment",
    description: "REST API security testing",
    targets: 7,
    scans: 12,
    findings: 18,
    critical: 2,
    status: "Paused",
    lastActivity: "May 15, 2026",
  },
];