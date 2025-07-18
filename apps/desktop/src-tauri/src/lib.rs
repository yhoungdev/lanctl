#![allow(unused_imports, unused_variables, dead_code, unused_macros, unused_mut, unused_assignments, unused_attributes)]

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use std::net::SocketAddr;
use std::sync::Arc;
use axum::{Router, routing::{get, post}, extract::Multipart, response::IntoResponse, http::StatusCode};
use axum::body::Body;
use axum::response::Html;
use axum::extract::State;
use tokio::sync::Mutex;
use tower_http::services::ServeDir;
use std::collections::HashMap;
use std::path::{PathBuf, Path};
use std::fs;
use std::io::Write;
use axum_server::Server;
use directories::ProjectDirs;
use std::sync::atomic::{AtomicU16, Ordering};
use once_cell::sync::OnceCell;
static SERVER_PORT: OnceCell<u16> = OnceCell::new();

struct AppState {
    files: tokio::sync::Mutex<std::collections::HashMap<String, PathBuf>>,
}

fn get_upload_dir() -> PathBuf {
    let dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("uploads");
    std::fs::create_dir_all(&dir).ok();
    dir
}

#[axum::debug_handler]
async fn upload(
    state: axum::extract::State<std::sync::Arc<AppState>>,
    mut multipart: axum::extract::Multipart
) -> impl axum::response::IntoResponse {
    let app_upload_dir = get_upload_dir();
    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.file_name().map(|s| s.to_string()).unwrap_or_else(|| "file".to_string());
        let data = field.bytes().await.unwrap();
        let path = app_upload_dir.join(&name);
        let mut file = std::fs::File::create(&path).unwrap();
        file.write_all(&data).unwrap();
        state.files.lock().await.insert(name, path);
    }
    axum::http::StatusCode::OK
}

async fn list(_: State<Arc<AppState>>) -> impl IntoResponse {
    let dir = get_upload_dir();
    let mut names = Vec::new();
    if let Ok(entries) = std::fs::read_dir(dir) {
        for entry in entries.flatten() {
            if let Ok(file_type) = entry.file_type() {
                if file_type.is_file() {
                    if let Some(name) = entry.file_name().to_str() {
                        names.push(name.to_string());
                    }
                }
            }
        }
    }
    Html(names.join("\n"))
}

async fn download(State(state): State<Arc<AppState>>, axum::extract::Path(filename): axum::extract::Path<String>) -> impl IntoResponse {
    let files = state.files.lock().await;
    if let Some(path) = files.get(&filename) {
        if let Ok(data) = tokio::fs::read(path).await {
            return ([("Content-Disposition", format!("attachment; filename=\"{}\"", filename))], data).into_response();
        }
    }
    StatusCode::NOT_FOUND.into_response()
}

async fn api_test() -> impl IntoResponse {
    Html("API running")
}

#[tauri::command]
pub async fn start_server() -> u16 {
    let port = get_free_port();
    SERVER_PORT.set(port).ok();
    std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(async move {
            let state = Arc::new(AppState { files: Mutex::new(HashMap::new()) });
            let app = Router::new()
                .route("/upload", post(upload))
                .route("/list", get(list))
                .route("/download/{filename}", get(download))
                .route("/api/test", get(api_test))
                .nest_service("/", ServeDir::new("webui").not_found_service(get(|| async { Html("Not found") })))
                .with_state(state);
            let addr = SocketAddr::from(([0, 0, 0, 0], port));
            Server::bind(addr)
                .serve(app.into_make_service())
                .await
                .unwrap();
        });
    });
    port
}

fn get_free_port() -> u16 {
    std::net::TcpListener::bind("127.0.0.1:0").unwrap().local_addr().unwrap().port()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, start_server])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
