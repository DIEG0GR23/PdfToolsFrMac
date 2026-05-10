// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

mod tray;
use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

// State to hold the sidecar child process
struct SidecarState(Mutex<Option<CommandChild>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .manage(SidecarState(Mutex::new(None)))
        .setup(|app| {
            // Start the PdfToolsApi sidecar (backend API server)
            let sidecar = app
                .shell()
                .sidecar("PdfToolsApi")
                .expect("Failed to create PdfToolsApi sidecar command");
            let (_, child) = sidecar
                .spawn()
                .expect("Failed to spawn PdfToolsApi sidecar");

            // Store the child process in state to keep it alive
            let state = app.state::<SidecarState>();
            *state.0.lock().unwrap() = Some(child);

            tray::create_tray(app.handle())?;

            let window = app.get_webview_window("main").unwrap();

            let window_clone = window.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = window_clone.hide();
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle, event| match event {
        tauri::RunEvent::ExitRequested { .. } => {
            let state = app_handle.state::<SidecarState>();
            let mut child_guard = state.0.lock().unwrap();
            if let Some(child) = child_guard.take() {
                let _ = child.kill();
            }
        }
        _ => {}
    });
}
