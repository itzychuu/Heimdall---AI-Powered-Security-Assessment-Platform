export type ToolCategory =
  | "Network"
  | "Web"
  | "Enumeration"
  | "Password"
  | "Vulnerability"
  | "Wireless"
  | "Forensics"
  | "Utility";

export type ToolStatus =
  | "Installed"
  | "Not Installed"
  | "Unknown";

export interface SecurityTool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  command: string;
  status: ToolStatus;
  version?: string;
}