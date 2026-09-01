use serde::Serialize;
use std::process::Command;

#[derive(Debug, Clone, Serialize)]
pub struct ToolDiscoveryResult {
    pub executable: String,
    pub version: Option<String>,
    pub help: Option<String>,
}

pub fn discover(executable: &str) -> Result<ToolDiscoveryResult, String> {
    let version = run_command(executable, &["--version"]);

    let help = run_command(executable, &["--help"]).or_else(|| run_command(executable, &["-h"]));

    if version.is_none() && help.is_none() {
        return Err(format!(
            "Unable to discover information from '{}'.",
            executable
        ));
    }

    Ok(ToolDiscoveryResult {
        executable: executable.to_string(),
        version,
        help,
    })
}

fn run_command(executable: &str, args: &[&str]) -> Option<String> {
    let output = Command::new(executable).args(args).output().ok()?;

    let stdout = String::from_utf8_lossy(&output.stdout);

    let stderr = String::from_utf8_lossy(&output.stderr);

    let combined = format!("{}{}", stdout, stderr);

    let value = combined.trim();

    if value.is_empty() {
        None
    } else {
        Some(value.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn discovers_nmap_when_available() {
        let result = discover("nmap");

        if let Ok(info) = result {
            assert_eq!(info.executable, "nmap");
            assert!(info.version.is_some() || info.help.is_some());
        }
    }
}
