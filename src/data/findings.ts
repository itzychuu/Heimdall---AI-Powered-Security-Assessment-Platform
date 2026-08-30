import type { Finding } from "../types/finding";

export const findings: Finding[] = [
  {
    id: "finding-001",
    title: "SQL Injection",
    severity: "Critical",
    status: "Open",
    target: "https://shop.example.com",
    project: "E-Commerce Platform",
    scan: "scan-001",
    description:
      "Potential SQL injection vulnerability discovered in the application.",
    evidence:
      "User-controlled input appears to reach a database query without sufficient parameterization.",
    impact:
      "An attacker may be able to manipulate database queries and access or modify sensitive information.",
    remediation:
      "Use parameterized queries or prepared statements and validate untrusted input.",
    discoveredAt: "Today, 09:43",
    updatedAt: "Today, 09:43",
  },

  {
    id: "finding-002",
    title: "Authentication Bypass",
    severity: "High",
    status: "Open",
    target: "https://shop.example.com",
    project: "E-Commerce Platform",
    scan: "scan-001",
    description:
      "Authentication controls may be bypassed under specific conditions.",
    evidence:
      "Authentication flow accepted an unexpected request sequence during assessment.",
    impact:
      "An attacker may gain access to protected application functionality.",
    remediation:
      "Review authentication state handling and enforce authorization checks server-side.",
    discoveredAt: "Today, 09:47",
    updatedAt: "Today, 09:47",
  },

  {
    id: "finding-003",
    title: "Missing Security Headers",
    severity: "Medium",
    status: "In Progress",
    target: "https://shop.example.com",
    project: "E-Commerce Platform",
    scan: "scan-001",
    description:
      "Recommended HTTP security headers are missing from the application.",
    evidence:
      "HTTP responses were observed without one or more recommended security headers.",
    impact:
      "Missing security headers can increase exposure to browser-based attacks.",
    remediation:
      "Configure appropriate HTTP security headers at the application or reverse-proxy layer.",
    discoveredAt: "Today, 09:50",
    updatedAt: "Today, 10:02",
  },

  {
    id: "finding-004",
    title: "Exposed Service",
    severity: "High",
    status: "Open",
    target: "192.168.1.0/24",
    project: "Internal Infrastructure",
    scan: "scan-002",
    description:
      "An externally accessible network service was identified during discovery.",
    evidence:
      "The assessment identified an accessible service on a monitored host.",
    impact:
      "Unnecessary exposed services can increase the attack surface of the environment.",
    remediation:
      "Restrict unnecessary services and limit access using network controls.",
    discoveredAt: "Today, 07:38",
    updatedAt: "Today, 07:38",
  },

  {
    id: "finding-005",
    title: "Weak TLS Configuration",
    severity: "Medium",
    status: "Resolved",
    target: "https://api.example.com",
    project: "E-Commerce Platform",
    scan: "scan-003",
    description:
      "The API was using a TLS configuration that did not meet the preferred security baseline.",
    evidence:
      "The assessment identified a supported configuration considered weaker than the current baseline.",
    impact:
      "Weak TLS configuration may reduce transport security.",
    remediation:
      "Disable outdated protocols and weak cipher suites and enforce a modern TLS configuration.",
    discoveredAt: "Yesterday, 16:22",
    updatedAt: "Yesterday, 18:05",
  },

  {
    id: "finding-006",
    title: "Information Disclosure",
    severity: "Low",
    status: "Open",
    target: "https://legacy.example.com",
    project: "Legacy System Audit",
    scan: "scan-006",
    description:
      "The application exposes information that may assist reconnaissance.",
    evidence:
      "Application responses revealed implementation-related information.",
    impact:
      "Exposed information may help an attacker understand the application environment.",
    remediation:
      "Remove unnecessary implementation details from client-facing responses.",
    discoveredAt: "May 15, 2026",
    updatedAt: "May 15, 2026",
  },

  {
    id: "finding-007",
    title: "Directory Listing Enabled",
    severity: "Low",
    status: "Accepted",
    target: "https://legacy.example.com",
    project: "Legacy System Audit",
    scan: "scan-006",
    description:
      "Directory listing was enabled on an application path.",
    evidence:
      "A directory response exposed the contents of a server-side directory.",
    impact:
      "Directory listings may expose files and application structure.",
    remediation:
      "Disable directory indexing unless explicitly required.",
    discoveredAt: "May 15, 2026",
    updatedAt: "May 16, 2026",
  },

  {
    id: "finding-008",
    title: "Open Management Port",
    severity: "Critical",
    status: "Open",
    target: "192.168.1.0/24",
    project: "Internal Infrastructure",
    scan: "scan-002",
    description:
      "A management service was identified as accessible from an unexpected network segment.",
    evidence:
      "Network discovery identified an accessible management endpoint.",
    impact:
      "Unauthorized access to management services can provide significant control over infrastructure.",
    remediation:
      "Restrict management services to trusted administration networks and apply strong access controls.",
    discoveredAt: "Today, 07:41",
    updatedAt: "Today, 07:41",
  },
];