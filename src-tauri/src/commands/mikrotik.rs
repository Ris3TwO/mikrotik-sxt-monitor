use crate::mikrotik_api::client::MikrotikClient;
use crate::mikrotik_api::poller::spawn_poller;
use crate::state::AppState;
use tauri::State;

/// Internal logic for stopping an active polling task, if any.
///
/// Aborts the existing task stored in `poller_handle` and clears the option.
pub fn inner_disconnect_device(state: &AppState) -> Result<(), String> {
    if let Some(handle) = state.poller_handle.lock().unwrap().take() {
        handle.abort();
    }
    Ok(())
}

/// Internal logic for assigning a new polling task handle to the global state.
///
/// Ensures any previously running task is aborted before setting the new handle.
pub fn inner_register_poller_handle(
    state: &AppState,
    handle: tokio::task::JoinHandle<()>,
) -> Result<(), String> {
    inner_disconnect_device(state)?;
    *state.poller_handle.lock().unwrap() = Some(handle);
    Ok(())
}

/// Establishes a connection to a MikroTik device by spawning a polling background task.
///
/// If an active polling task is already running, it aborts the existing task before
/// initializing a new poller instance with the provided credentials and global configuration.
///
/// # Arguments
///
/// * `app` - The Tauri application handle used to emit status events to the frontend.
/// * `state` - Thread-safe global application state managed by Tauri.
/// * `ip` - Target device IP address or hostname.
/// * `user` - RouterOS API username.
/// * `pass` - RouterOS API password.
///
/// # Returns
///
/// Returns `Ok(())` when the background thread is successfully spawned.
#[tauri::command]
pub async fn connect_device(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    ip: String,
    user: String,
    pass: String,
) -> Result<(), String> {
    let handle = spawn_poller(app, ip, user, pass, state.config.clone());
    inner_register_poller_handle(&state, handle)
}

/// Disconnects the active device monitoring session.
///
/// Aborts the running background polling task stored in the global state, if any.
///
/// # Arguments
///
/// * `state` - Thread-safe global application state managed by Tauri.
///
/// # Returns
///
/// Returns `Ok(())` regardless of whether an active task was running.
#[tauri::command]
pub fn disconnect_device(state: State<'_, AppState>) -> Result<(), String> {
    inner_disconnect_device(&state)
}

/// Performs a one-off connection test against a MikroTik device.
///
/// Attempts to authenticate and retrieve the device identity to verify connectivity
/// without initiating background polling.
///
/// # Arguments
///
/// * `ip` - Target device IP address or hostname.
/// * `user` - RouterOS API username.
/// * `pass` - RouterOS API password.
///
/// # Returns
///
/// Returns `Ok(String)` containing the identity name on success, or `Err(String)` on failure.
#[tauri::command]
pub async fn test_mikrotik_connection(
    ip: String,
    user: String,
    pass: String,
) -> Result<String, String> {
    let client = MikrotikClient::new(&ip, &user, &pass);
    client.get_identity().await
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Tests that disconnecting when no task is active succeeds without errors.
    #[test]
    fn test_disconnect_device_without_active_task() {
        let app_state = AppState::default();
        let result = inner_disconnect_device(&app_state);

        assert!(result.is_ok());
        assert!(app_state.poller_handle.lock().unwrap().is_none());
    }

    /// Tests registering a handle and verifying that disconnecting aborts and clears it.
    #[tokio::test]
    async fn test_register_and_disconnect_poller_task() {
        let app_state = AppState::default();

        // Spawn a dummy background task for testing state management
        let dummy_handle = tokio::spawn(async {
            tokio::time::sleep(std::time::Duration::from_secs(10)).await;
        });

        // Register the dummy handle
        let reg_result = inner_register_poller_handle(&app_state, dummy_handle);
        assert!(reg_result.is_ok());
        assert!(app_state.poller_handle.lock().unwrap().is_some());

        // Disconnect and ensure the handle is removed
        let disc_result = inner_disconnect_device(&app_state);
        assert!(disc_result.is_ok());
        assert!(app_state.poller_handle.lock().unwrap().is_none());
    }

    /// Tests that registering a new poller automatically aborts any existing running task.
    #[tokio::test]
    async fn test_register_poller_aborts_existing_task() {
        let app_state = AppState::default();

        let task_one = tokio::spawn(async {
            tokio::time::sleep(std::time::Duration::from_secs(10)).await;
        });

        let task_two = tokio::spawn(async {
            tokio::time::sleep(std::time::Duration::from_secs(10)).await;
        });

        assert!(inner_register_poller_handle(&app_state, task_one).is_ok());
        assert!(inner_register_poller_handle(&app_state, task_two).is_ok());

        assert!(app_state.poller_handle.lock().unwrap().is_some());
    }
}
