use serde::Serialize;
use std::path::Path;
use std::process::Command;

use super::registry::ToolDefinition;

#[derive(Debug, Clone, Serialize)]
pub struct DetectedTool {
    pub installed: bool,
    pub executable: Option<String>,
    pub version: Option<String>,
}

pub fn detect(tool: &ToolDefinition) -> DetectedTool {
    if let Some(path) = find_on_path(tool.command) {
        let version = detect_version(&path);

        return DetectedTool {
            installed: true,
            executable: Some(path),
            version,
        };
    }

    DetectedTool {
        installed: false,
        executable: None,
        version: None,
    }
}

fn find_on_path(command: &str) -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("where.exe")
            .arg(command)
            .output()
            .ok()?;

        if !output.status.success() {
            return None;
        }

        let stdout =
            String::from_utf8_lossy(&output.stdout).to_string();

        let path = stdout
            .lines()
            .map(str::trim)
            .find(|line| !line.is_empty())?;

        let path = Path::new(path);

        if path.is_file() {
            return Some(path.to_string_lossy().to_string());
        }

        None
    }

    #[cfg(not(target_os = "windows"))]
    {
        let output = Command::new("which")
            .arg(command)
            .output()
            .ok()?;

        if !output.status.success() {
            return None;
        }

        let stdout =
            String::from_utf8_lossy(&output.stdout).to_string();

        let path = stdout
            .lines()
            .map(str::trim)
            .find(|line| !line.is_empty())?;

        let path = Path::new(path);

        if path.is_file() {
            return Some(path.to_string_lossy().to_string());
        }

        None
    }
}

fn detect_version(executable: &str) -> Option<String> {
    let output = Command::new(executable)
        .arg("--version")
        .output()
        .ok()?;

    let stdout =
        String::from_utf8_lossy(&output.stdout).to_string();

    let stderr =
        String::from_utf8_lossy(&output.stderr).to_string();

    let combined = format!("{}\n{}", stdout, stderr);

    extract_version(&combined)
}

fn extract_version(output: &str) -> Option<String> {
    for line in output.lines() {
        for raw_token in line.split_whitespace() {
            let token = raw_token
                .trim_matches(|character: char| {
                    matches!(
                        character,
                        '(' | ')' | '[' | ']' | ',' | ':' | ';'
                    )
                })
                .trim_start_matches('v');

            if looks_like_version(token) {
                return Some(token.to_string());
            }
        }
    }

    None
}

fn looks_like_version(value: &str) -> bool {
    let mut saw_digit = false;
    let mut saw_dot = false;

    for character in value.chars() {
        if character.is_ascii_digit() {
            saw_digit = true;
            continue;
        }

        if character == '.' {
            saw_dot = true;
            continue;
        }

        return false;
    }

    saw_digit && saw_dot
}