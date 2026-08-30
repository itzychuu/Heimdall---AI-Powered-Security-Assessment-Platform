use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ScanStatus {
    Queued,
    Running,
    Completed,
    Failed,
    Paused,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ScanType {
    WebApplication,
    ApiSecurity,
    Network,
    Authentication,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanConfig {
    pub name: String,
    pub target: String,
    pub target_type: ScanType,
    pub project: String,
    pub tool_id: String,

    // User-selected scan options.
    // The scan runner is responsible for translating these
    // options into tool-specific arguments.
    pub scan_options: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanResult {
    pub scan_id: String,
    pub name: String,
    pub target: String,
    pub target_type: ScanType,
    pub project: String,
    pub tool_id: String,
    pub status: ScanStatus,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
}