use crate::process::executor;
use crate::tools::detector;
use crate::tools::registry;

use super::models::{
    ScanConfig,
    ScanResult,
    ScanStatus,
    ScanType,
};

pub fn run(config: &ScanConfig) -> Result<ScanResult, String> {
    validate_config(config)?;

    let tool = registry::get_tool(&config.tool_id)
        .ok_or_else(|| {
            format!(
                "Tool '{}' is not registered with Heimdall.",
                config.tool_id
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

    let args = build_arguments(config)?;

    let result = executor::execute(
        &executable,
        &args,
    )?;

    Ok(ScanResult {
        scan_id: generate_scan_id(),
        name: config.name.clone(),
        target: config.target.clone(),
        target_type: config.target_type.clone(),
        project: config.project.clone(),
        tool_id: config.tool_id.clone(),
        status: if result.exit_code == Some(0) {
            ScanStatus::Completed
        } else {
            ScanStatus::Failed
        },
        stdout: result.stdout,
        stderr: result.stderr,
        exit_code: result.exit_code,
    })
}

fn validate_config(
    config: &ScanConfig,
) -> Result<(), String> {
    if config.name.trim().is_empty() {
        return Err(
            "Scan name cannot be empty.".to_string()
        );
    }

    if config.target.trim().is_empty() {
        return Err(
            "Scan target cannot be empty.".to_string()
        );
    }

    if config.project.trim().is_empty() {
        return Err(
            "Scan project cannot be empty.".to_string()
        );
    }

    if config.tool_id.trim().is_empty() {
        return Err(
            "Scan tool cannot be empty.".to_string()
        );
    }

    Ok(())
}

fn build_arguments(
    config: &ScanConfig,
) -> Result<Vec<String>, String> {
    match config.tool_id.as_str() {
        "nmap" => build_nmap_arguments(config),

        _ => Err(format!(
            "Scan execution for tool '{}' is not implemented yet.",
            config.tool_id
        )),
    }
}

fn build_nmap_arguments(
    config: &ScanConfig,
) -> Result<Vec<String>, String> {
    if !matches!(
        config.target_type,
        ScanType::Network
    ) {
        return Err(
            "Nmap scans currently require the Network scan type."
                .to_string()
        );
    }

    let mut args = Vec::new();

    /*
     * Conservative default for our first scan engine.
     *
     * -sV asks Nmap to identify services and versions.
     */
    args.push("-sV".to_string());

    /*
     * Additional scan options can be introduced here
     * later through structured configuration.
     *
     * We intentionally do NOT accept arbitrary executable
     * arguments from the frontend at this layer.
     */

    args.push(config.target.trim().to_string());

    Ok(args)
}

fn generate_scan_id() -> String {
    use std::time::{
        SystemTime,
        UNIX_EPOCH,
    };

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();

    format!("scan-{}", timestamp)
}