use crate::config::AppConfig;
use std::sync::Mutex;
use tokio::task::JoinHandle;

/// Shared application state managed by Tauri's state container.
///
/// Holds thread-safe references to active background tasks and system configuration.
pub struct AppState {
    /// Thread-safe mutex wrapping an optional handle to the running polling background task.
    pub poller_handle: Mutex<Option<JoinHandle<()>>>,
    /// Global application configuration instance.
    pub config: AppConfig,
}

impl Default for AppState {
    /// Creates a new `AppState` instance with no active poller handle and default configuration values.
    fn default() -> Self {
        Self {
            poller_handle: Mutex::new(None),
            config: AppConfig::default(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Tests default state initialization values.
    #[test]
    fn test_app_state_default() {
        let state = AppState::default();
        let poller = state.poller_handle.lock().unwrap();

        assert!(poller.is_none(), "Poller handle should initially be None");
        assert_eq!(state.config.default_timeout_secs, 3);
        assert_eq!(state.config.poll_interval_secs, 1);
    }

    /// Tests thread-safe mutation and cancellation of the Tokio poller handle.
    #[tokio::test]
    async fn test_poller_handle_lifecycle() {
        let state = AppState::default();

        // Spawn a dummy background task
        let handle = tokio::spawn(async {
            tokio::time::sleep(std::time::Duration::from_secs(10)).await;
        });

        // Store handle inside state
        {
            let mut poller = state.poller_handle.lock().unwrap();
            *poller = Some(handle);
            assert!(poller.is_some(), "Poller handle should be populated");
        }

        // Abort task and clear handle (simulating disconnect command)
        {
            let mut poller = state.poller_handle.lock().unwrap();
            if let Some(h) = poller.take() {
                h.abort();
            }
            assert!(
                poller.is_none(),
                "Poller handle should be cleared after take"
            );
        }
    }
}
