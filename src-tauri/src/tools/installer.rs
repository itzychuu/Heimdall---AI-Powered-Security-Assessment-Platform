use std::process::Command;

use super::registry::ToolDefinition;

#[derive(Debug)]
pub struct InstallationOutput {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
}

pub fn install(tool: &ToolDefinition) -> Result<InstallationOutput, String> {
    let manager = tool
        .windows_package_manager
        .ok_or_else(|| {
            format!(
                "No automatic installation method is available for '{}'.",
                tool.name
            )
        })?;

    let package_id = tool
        .windows_package_id
        .ok_or_else(|| {
            format!(
                "No package identifier is configured for '{}'.",
                tool.name
            )
        })?;

    match manager {
        "winget" => install_with_winget(package_id),
        _ => Err(format!(
            "Unsupported package manager '{}' for '{}'.",
            manager, tool.name
        )),
    }
}

fn install_with_winget(
    package_id: &str,
) -> Result<InstallationOutput, String> {
    let output = Command::new("winget")
        .args([
            "install",
            "--id",
            package_id,
            "--exact",
            "--accept-package-agreements",
            "--accept-source-agreements",
        ])
        .output()
        .map_err(|error| {
            format!(
                "Failed to start WinGet: {}",
                error
            )
        })?;

    Ok(InstallationOutput {
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code(),
    })
}