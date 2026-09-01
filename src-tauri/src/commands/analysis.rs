use crate::analysis::models::ProjectContext;
use crate::analysis::project;

#[tauri::command]
pub async fn analyze_project(
    path: String,
) -> Result<ProjectContext, String> {
    tauri::async_runtime::spawn_blocking(
        move || project::analyze(&path),
    )
    .await
    .map_err(|error| {
        format!(
            "Project analysis task failed: {}",
            error
        )
    })?
}