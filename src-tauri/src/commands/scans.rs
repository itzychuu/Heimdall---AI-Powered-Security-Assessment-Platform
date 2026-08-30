use serde::Serialize;
use tauri::AppHandle;

use crate::scans::models::{ScanConfig, ScanResult};
use crate::scans::runner;
use crate::scans::store;

#[derive(Debug, Serialize)]
pub struct ScanExecutionResult {
    pub scan: ScanResult,
}

#[tauri::command]
pub async fn start_scan(
    app: AppHandle,
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

    store::save_scan(&app, &result)?;

    Ok(ScanExecutionResult {
        scan: result,
    })
}

#[tauri::command]
pub async fn get_scan(
    app: AppHandle,
    scan_id: String,
) -> Result<Option<ScanResult>, String> {
    store::get_scan(&app, &scan_id)
}

#[tauri::command]
pub async fn list_scans(
    app: AppHandle,
) -> Result<Vec<ScanResult>, String> {
    store::list_scans(&app)
}