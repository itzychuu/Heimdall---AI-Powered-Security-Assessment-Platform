mod agent;
mod analysis;
mod commands;
mod process;
mod scans;
mod tools;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::tools::detect_tools,
            commands::tools::install_tool,
            commands::tools::discover_tool,
            commands::tools::run_security_tool,
            commands::scans::start_scan,
            commands::scans::get_scan,
            commands::scans::list_scans,
            commands::agent::agent_reason,
            commands::analysis::analyze_project
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
