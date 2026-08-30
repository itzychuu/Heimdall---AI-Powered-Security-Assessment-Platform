mod commands;

mod process;

mod security;

mod tools;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::tools::run_security_tool,
            commands::tools::detect_tools
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}