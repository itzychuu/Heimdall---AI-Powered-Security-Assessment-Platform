export type FindingSeverity =
  | "Critical"
  | "High"
  | "Medium"
  | "Low"
  | "Info";

export type FindingStatus =
  | "Open"
  | "In Progress"
  | "Resolved"
  | "Accepted"
  | "False Positive";

export interface Finding {
  id: string;
  title: string;
  severity: FindingSeverity;
  status: FindingStatus;

  target: string;
  project: string;
  scan: string;

  description: string;
  evidence: string;
  impact: string;
  remediation: string;

  discoveredAt: string;
  updatedAt: string;
}