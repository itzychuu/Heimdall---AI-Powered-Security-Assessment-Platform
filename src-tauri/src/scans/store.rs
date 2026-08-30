use std::fs;
use std::path::PathBuf;

use tauri::{AppHandle, Manager};

use super::models::ScanResult;

const STORE_FILE: &str = "scans.json";

fn store_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| {
            format!(
                "Failed to resolve Heimdall application data directory: {}",
                error
            )
        })?;

    fs::create_dir_all(&app_data_dir)
        .map_err(|error| {
            format!(
                "Failed to create Heimdall application data directory: {}",
                error
            )
        })?;

    Ok(app_data_dir.join(STORE_FILE))
}

fn read_scans(app: &AppHandle) -> Result<Vec<ScanResult>, String> {
    let path = store_path(app)?;

    if !path.exists() {
        return Ok(Vec::new());
    }

    let contents = fs::read_to_string(&path)
        .map_err(|error| {
            format!(
                "Failed to read scan store: {}",
                error
            )
        })?;

    if contents.trim().is_empty() {
        return Ok(Vec::new());
    }

    serde_json::from_str(&contents)
        .map_err(|error| {
            format!(
                "Failed to parse scan store: {}",
                error
            )
        })
}

fn write_scans(
    app: &AppHandle,
    scans: &[ScanResult],
) -> Result<(), String> {
    let path = store_path(app)?;

    let contents = serde_json::to_string_pretty(scans)
        .map_err(|error| {
            format!(
                "Failed to serialize scan store: {}",
                error
            )
        })?;

    fs::write(&path, contents)
        .map_err(|error| {
            format!(
                "Failed to write scan store: {}",
                error
            )
        })
}

pub fn save_scan(
    app: &AppHandle,
    scan: &ScanResult,
) -> Result<(), String> {
    let mut scans = read_scans(app)?;

    if let Some(existing) = scans
        .iter_mut()
        .find(|item| item.scan_id == scan.scan_id)
    {
        *existing = scan.clone();
    } else {
        scans.push(scan.clone());
    }

    write_scans(app, &scans)
}

pub fn get_scan(
    app: &AppHandle,
    scan_id: &str,
) -> Result<Option<ScanResult>, String> {
    let scans = read_scans(app)?;

    Ok(scans
        .into_iter()
        .find(|scan| scan.scan_id == scan_id))
}

pub fn list_scans(
    app: &AppHandle,
) -> Result<Vec<ScanResult>, String> {
    read_scans(app)
}