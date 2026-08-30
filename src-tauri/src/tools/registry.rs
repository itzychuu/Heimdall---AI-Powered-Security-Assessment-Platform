use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub enum TargetStrategy {
    Append,
    Flag(&'static str),
}

#[derive(Debug, Clone, Serialize)]
pub struct ToolDefinition {
    pub id: &'static str,
    pub name: &'static str,
    pub description: &'static str,
    pub category: &'static str,
    pub command: &'static str,

    pub windows_package_manager: Option<&'static str>,
    pub windows_package_id: Option<&'static str>,

    pub target_strategy: TargetStrategy,
}

pub const TOOLS: &[ToolDefinition] = &[
    ToolDefinition {
        id: "nmap",
        name: "Nmap",
        description:
            "Network discovery and security auditing tool for hosts, ports, services, and operating systems.",
        category: "Network",
        command: "nmap",

        windows_package_manager: Some("winget"),
        windows_package_id: Some("Insecure.Nmap"),

        target_strategy: TargetStrategy::Append,
    },

    ToolDefinition {
        id: "nuclei",
        name: "Nuclei",
        description:
            "Fast vulnerability scanner based on customizable templates for detecting security issues.",
        category: "Vulnerability",
        command: "nuclei",

        windows_package_manager: None,
        windows_package_id: None,

        target_strategy: TargetStrategy::Flag("-u"),
    },

    ToolDefinition {
        id: "nikto",
        name: "Nikto",
        description:
            "Web server scanner that checks for dangerous files, outdated software, and common configuration issues.",
        category: "Web",
        command: "nikto",

        windows_package_manager: None,
        windows_package_id: None,

        target_strategy: TargetStrategy::Flag("-h"),
    },

    ToolDefinition {
        id: "gobuster",
        name: "Gobuster",
        description:
            "Directory, DNS, and virtual-host enumeration tool for discovering exposed resources.",
        category: "Enumeration",
        command: "gobuster",

        windows_package_manager: None,
        windows_package_id: None,

        target_strategy: TargetStrategy::Flag("-u"),
    },

    ToolDefinition {
        id: "john",
        name: "John the Ripper",
        description:
            "Password security auditing and password recovery tool supporting numerous hash formats.",
        category: "Password",
        command: "john",

        windows_package_manager: None,
        windows_package_id: None,

        target_strategy: TargetStrategy::Append,
    },

    ToolDefinition {
        id: "hydra",
        name: "Hydra",
        description:
            "Network authentication testing tool supporting numerous protocols and services.",
        category: "Password",
        command: "hydra",

        windows_package_manager: None,
        windows_package_id: None,

        target_strategy: TargetStrategy::Append,
    },

    ToolDefinition {
        id: "ffuf",
        name: "FFUF",
        description:
            "Fast web fuzzing tool for discovering directories, parameters, virtual hosts, and other resources.",
        category: "Web",
        command: "ffuf",

        windows_package_manager: None,
        windows_package_id: None,

        target_strategy: TargetStrategy::Flag("-u"),
    },

    ToolDefinition {
        id: "sqlmap",
        name: "SQLmap",
        description:
            "Automated SQL injection detection and database security testing tool.",
        category: "Web",
        command: "sqlmap",

        windows_package_manager: None,
        windows_package_id: None,

        target_strategy: TargetStrategy::Flag("-u"),
    },

    ToolDefinition {
        id: "whatweb",
        name: "WhatWeb",
        description:
            "Web fingerprinting tool for identifying technologies, frameworks, servers, and applications.",
        category: "Web",
        command: "whatweb",

        windows_package_manager: None,
        windows_package_id: None,

        target_strategy: TargetStrategy::Append,
    },

    ToolDefinition {
        id: "masscan",
        name: "Masscan",
        description:
            "High-speed Internet-scale port scanner designed for large network discovery operations.",
        category: "Network",
        command: "masscan",

        windows_package_manager: None,
        windows_package_id: None,

        target_strategy: TargetStrategy::Append,
    },

    ToolDefinition {
        id: "amass",
        name: "Amass",
        description:
            "Attack surface mapping and asset discovery tool focused on DNS enumeration and reconnaissance.",
        category: "Enumeration",
        command: "amass",

        windows_package_manager: None,
        windows_package_id: None,

        target_strategy: TargetStrategy::Append,
    },

    ToolDefinition {
        id: "searchsploit",
        name: "SearchSploit",
        description:
            "Command-line interface for searching the Exploit Database for publicly documented exploits.",
        category: "Vulnerability",
        command: "searchsploit",

        windows_package_manager: None,
        windows_package_id: None,

        target_strategy: TargetStrategy::Append,
    },
];

pub fn get_tool(tool_id: &str) -> Option<&'static ToolDefinition> {
    TOOLS.iter().find(|tool| tool.id == tool_id)
}