import type { SecurityTool } from "../types/tool";

export const tools: SecurityTool[] = [
  {
    id: "nmap",
    name: "Nmap",
    description:
      "Network discovery and security auditing tool for hosts, ports, services, and operating systems.",
    category: "Network",
    command: "nmap",
    status: "Installed",
    version: "7.95",
  },
  {
    id: "nuclei",
    name: "Nuclei",
    description:
      "Fast vulnerability scanner based on customizable templates for detecting security issues.",
    category: "Vulnerability",
    command: "nuclei",
    status: "Installed",
    version: "3.x",
  },
  {
    id: "nikto",
    name: "Nikto",
    description:
      "Web server scanner that checks for dangerous files, outdated software, and common configuration issues.",
    category: "Web",
    command: "nikto",
    status: "Installed",
  },
  {
    id: "gobuster",
    name: "Gobuster",
    description:
      "Directory, DNS, and virtual-host enumeration tool for discovering exposed resources.",
    category: "Enumeration",
    command: "gobuster",
    status: "Installed",
  },
  {
    id: "john",
    name: "John the Ripper",
    description:
      "Password security auditing and password recovery tool supporting numerous hash formats.",
    category: "Password",
    command: "john",
    status: "Installed",
  },
  {
    id: "hydra",
    name: "Hydra",
    description:
      "Network authentication testing tool supporting numerous protocols and services.",
    category: "Password",
    command: "hydra",
    status: "Installed",
  },
  {
    id: "ffuf",
    name: "FFUF",
    description:
      "Fast web fuzzing tool for discovering directories, parameters, virtual hosts, and other resources.",
    category: "Web",
    command: "ffuf",
    status: "Installed",
  },
  {
    id: "sqlmap",
    name: "SQLmap",
    description:
      "Automated SQL injection detection and database security testing tool.",
    category: "Web",
    command: "sqlmap",
    status: "Installed",
  },
  {
    id: "whatweb",
    name: "WhatWeb",
    description:
      "Web fingerprinting tool for identifying technologies, frameworks, servers, and applications.",
    category: "Web",
    command: "whatweb",
    status: "Installed",
  },
  {
    id: "masscan",
    name: "Masscan",
    description:
      "High-speed Internet-scale port scanner designed for large network discovery operations.",
    category: "Network",
    command: "masscan",
    status: "Installed",
  },
  {
    id: "amass",
    name: "Amass",
    description:
      "Attack surface mapping and asset discovery tool focused on DNS enumeration and reconnaissance.",
    category: "Enumeration",
    command: "amass",
    status: "Installed",
  },
  {
    id: "searchsploit",
    name: "SearchSploit",
    description:
      "Command-line interface for searching the Exploit Database for publicly documented exploits.",
    category: "Vulnerability",
    command: "searchsploit",
    status: "Installed",
  },
];