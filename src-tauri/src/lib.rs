mod commands;
mod process;
mod tools;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::tools::detect_tools,
            commands::tools::install_tool,
            commands::tools::run_security_tool
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
