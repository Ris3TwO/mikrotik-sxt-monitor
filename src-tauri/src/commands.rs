use tauri::State;
use crate::state::AppState;
use crate::mikrotik::poller::spawn_poller;
use crate::mikrotik::client::MikrotikClient;

#[tauri::command]
pub async fn connect_device(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    ip: String, user: String, pass: String,
) -> Result<(), String> {
    // Si ya había un polling corriendo, lo matamos antes de iniciar otro
    if let Some(handle) = state.poller_handle.lock().unwrap().take() {
        handle.abort();
    }

    let handle = spawn_poller(app, ip, user, pass);
    *state.poller_handle.lock().unwrap() = Some(handle);
    Ok(())
}

#[tauri::command]
pub fn disconnect_device(state: State<'_, AppState>) -> Result<(), String> {
    if let Some(handle) = state.poller_handle.lock().unwrap().take() {
        handle.abort();
    }
    Ok(())
}

#[tauri::command]
pub async fn test_mikrotik_connection(ip: String, user: String, pass: String) -> Result<String, String> {
    let client = MikrotikClient::new(&ip, &user, &pass);
    // Intentamos obtener la identidad del router; si las credenciales fallan, devolverá el error 401
    client.get_identity().await
}