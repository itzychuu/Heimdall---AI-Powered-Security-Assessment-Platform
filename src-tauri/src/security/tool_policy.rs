pub struct ToolDefinition {
    pub id: &'static str,
    pub executable: &'static str,
    pub windows_path: Option<&'static str>,
}

const TOOLS: &[ToolDefinition] = &[
    ToolDefinition {
        id: "nmap",
        executable: "nmap",
        windows_path: Some(r"D:\Pentesting Tools\nmap.exe"),
    },
    ToolDefinition {
        id: "nuclei",
        executable: "nuclei",
        windows_path: None,
    },
    ToolDefinition {
        id: "nikto",
        executable: "nikto",
        windows_path: None,
    },
    ToolDefinition {
        id: "gobuster",
        executable: "gobuster",
        windows_path: None,
    },
    ToolDefinition {
        id: "john",
        executable: "john",
        windows_path: None,
    },
    ToolDefinition {
        id: "hydra",
        executable: "hydra",
        windows_path: None,
    },
    ToolDefinition {
        id: "ffuf",
        executable: "ffuf",
        windows_path: None,
    },
    ToolDefinition {
        id: "sqlmap",
        executable: "sqlmap",
        windows_path: None,
    },
    ToolDefinition {
        id: "whatweb",
        executable: "whatweb",
        windows_path: None,
    },
    ToolDefinition {
        id: "masscan",
        executable: "masscan",
        windows_path: None,
    },
    ToolDefinition {
        id: "amass",
        executable: "amass",
        windows_path: None,
    },
    ToolDefinition {
        id: "searchsploit",
        executable: "searchsploit",
        windows_path: None,
    },
];

pub fn get_tool(tool_id: &str) -> Option<&'static ToolDefinition> {
    TOOLS.iter().find(|tool| tool.id == tool_id)
}