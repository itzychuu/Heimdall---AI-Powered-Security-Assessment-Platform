export type ScanType =
  | "Web Application"
  | "API Security"
  | "Network"
  | "Authentication";

export type ScanStatus =
  | "Running"
  | "Completed"
  | "Paused"
  | "Failed";

export interface Scan {
  id: string;
  name: string;
  target: string;
  targetType: ScanType;
  project: string;
  progress: number;
  status: ScanStatus;
  startedAt: string;
  duration: string;
  findings: number;
  critical: number;
}