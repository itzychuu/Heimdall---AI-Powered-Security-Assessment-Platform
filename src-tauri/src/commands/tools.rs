use serde::Serialize;

use crate::process::executor;
use crate::security::tool_policy;
use crate::tools::{detector, registry};

#[derive(Debug, Serialize)]
pub struct ToolExecutionResult {
    pub tool_id: String,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct ToolDetectionResult {
    pub tool_id: String,
    pub installed: bool,
    pub executable: Option<String>,
    pub version: Option<String>,
}

#[tauri::command]
pub async fn run_security_tool(
    tool_id: String,
    args: Vec<String>,
) -> Result<ToolExecutionResult, String> {
    let tool = tool_policy::get_tool(&tool_id)
        .ok_or_else(|| {
            format!(
                "Tool '{}' is not allowed to execute.",
                tool_id
            )
        })?;

    let result = tauri::async_runtime::spawn_blocking(
        move || executor::execute(tool, &args),
    )
    .await
    .map_err(|error| {
        format!("Tool execution task failed: {}", error)
    })??;

    Ok(ToolExecutionResult {
        tool_id,
        stdout: result.stdout,
        stderr: result.stderr,
        exit_code: result.exit_code,
    })
}

#[tauri::command]
pub async fn detect_tools() -> Vec<ToolDetectionResult> {
    tauri::async_runtime::spawn_blocking(|| {
        registry::TOOLS
            .iter()
            .map(|tool| {
                let detected = detector::detect(tool);

                ToolDetectionResult {
                    tool_id: tool.id.to_string(),
                    installed: detected.installed,
                    executable: detected.executable,
                    version: detected.version,
                }
            })
            .collect()
    })
    .await
    .unwrap_or_default()
}