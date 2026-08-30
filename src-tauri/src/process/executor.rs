use std::path::Path;
use std::process::Command;

use crate::security::tool_policy::ToolDefinition;

#[derive(Debug)]
pub struct ProcessOutput {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
}

fn resolve_executable(tool: &ToolDefinition) -> Result<String, String> {
    // If the tool has an explicit platform-specific path and
    // that executable exists, use it.
    #[cfg(target_os = "windows")]
    {
        if let Some(path) = tool.windows_path {
            if Path::new(path).is_file() {
                return Ok(path.to_string());
            }
        }
    }

    // Otherwise fall back to the executable name and let the
    // operating system resolve it through PATH.
    Ok(tool.executable.to_string())
}

pub fn execute(
    tool: &ToolDefinition,
    args: &[String],
) -> Result<ProcessOutput, String> {
    let executable = resolve_executable(tool)?;

    let output = Command::new(&executable)
        .args(args)
        .output()
        .map_err(|error| {
            format!(
                "Failed to start '{}': {}",
                executable, error
            )
        })?;

    Ok(ProcessOutput {
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code(),
    })
}