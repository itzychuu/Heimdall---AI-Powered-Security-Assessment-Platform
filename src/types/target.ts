export type TargetType = "Web Application" | "API" | "Network" | "Host";

export type TargetStatus = "Active" | "Paused" | "Inactive";

export interface Target {
  id: string;
  name: string;
  type: TargetType;
  project: string;
  findings: number;
  critical: number;
  lastScanned: string;
  status: TargetStatus;
}