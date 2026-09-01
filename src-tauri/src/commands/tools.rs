use serde::Serialize;

use crate::process::executor;
use crate::tools::detector;
use crate::tools::registry;

#[derive(Debug, Serialize)]
pub struct ToolDetectionResult {
    pub tool_id: String,
    pub installed: bool,
    pub executable: Option<String>,
    pub version: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ToolExecutionResult {
    pub tool_id: String,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
}

#[tauri::command]
pub async fn detect_tools() -> Vec<ToolDetectionResult> {
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
}

#[tauri::command]
pub async fn discover_tool(
    tool_id: String,
) -> Result<crate::tools::intelligence::ToolIntelligence, String> {
    let tool = registry::get_tool(&tool_id)
        .ok_or_else(|| {
            format!(
                "Tool '{}' is not registered with Heimdall.",
                tool_id
            )
        })?;

    let detected = detector::detect(tool);

    if !detected.installed {
        return Err(format!(
            "Tool '{}' is not installed or could not be detected.",
            tool.name
        ));
    }

    let executable = detected
        .executable
        .ok_or_else(|| {
            format!(
                "Executable for '{}' could not be resolved.",
                tool.name
            )
        })?;

    let tool_id_for_task = tool.id.to_string();
    let tool_name = tool.name.to_string();

    tauri::async_runtime::spawn_blocking(
        move || {
            let discovery =
                crate::tools::discovery::discover(&executable)?;

            Ok::<
                crate::tools::intelligence::ToolIntelligence,
                String,
            >(
                crate::tools::intelligence::build(
                    &tool_id_for_task,
                    &tool_name,
                    discovery,
                )
            )
        },
    )
    .await
    .map_err(|error| {
        format!(
            "Tool intelligence task failed: {}",
            error
        )
    })?
}

#[derive(Debug, Serialize)]
pub struct ToolInstallationResult {
    pub tool_id: String,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
}

#[tauri::command]
pub async fn install_tool(
    tool_id: String,
) -> Result<ToolInstallationResult, String> {
    let tool = registry::get_tool(&tool_id)
        .ok_or_else(|| {
            format!(
                "Tool '{}' is not registered with Heimdall.",
                tool_id
            )
        })?;

    let result = tauri::async_runtime::spawn_blocking(
        move || crate::tools::installer::install(tool),
    )
    .await
    .map_err(|error| {
        format!(
            "Tool installation task failed: {}",
            error
        )
    })??;

    Ok(ToolInstallationResult {
        tool_id,
        stdout: result.stdout,
        stderr: result.stderr,
        exit_code: result.exit_code,
    })
}

#[tauri::command]
pub async fn run_security_tool(
    tool_id: String,
    args: Vec<String>,
) -> Result<ToolExecutionResult, String> {
    let tool = registry::get_tool(&tool_id)
        .ok_or_else(|| {
            format!(
                "Tool '{}' is not registered with Heimdall.",
                tool_id
            )
        })?;

    let detected = detector::detect(tool);

    if !detected.installed {
        return Err(format!(
            "Tool '{}' is not installed or could not be detected.",
            tool.name
        ));
    }

    let executable = detected
        .executable
        .ok_or_else(|| {
            format!(
                "Executable for '{}' could not be resolved.",
                tool.name
            )
        })?;

    let result = tauri::async_runtime::spawn_blocking(
        move || executor::execute(&executable, &args),
    )
    .await
    .map_err(|error| {
        format!(
            "Tool execution task failed: {}",
            error
        )
    })??;

    Ok(ToolExecutionResult {
        tool_id,
        stdout: result.stdout,
        stderr: result.stderr,
        exit_code: result.exit_code,
    })
}