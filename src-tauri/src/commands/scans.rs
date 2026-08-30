use serde::Serialize;

use crate::scans::models::{ScanConfig, ScanResult};
use crate::scans::runner;

#[derive(Debug, Serialize)]
pub struct ScanExecutionResult {
    pub scan: ScanResult,
}

#[tauri::command]
pub async fn start_scan(
    config: ScanConfig,
) -> Result<ScanExecutionResult, String> {
    let result = tauri::async_runtime::spawn_blocking(
        move || runner::run(&config),
    )
    .await
    .map_err(|error| {
        format!(
            "Scan execution task failed: {}",
            error
        )
    })??;

    Ok(ScanExecutionResult {
        scan: result,
    })
}