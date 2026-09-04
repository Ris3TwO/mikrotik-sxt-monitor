use serde::{Deserialize, Serialize};

/// Application configuration settings for device connectivity and polling behavior.
///
/// This struct holds global parameters utilized by the API client and background poller tasks.
///
/// # Examples
///
/// ```
/// use oncoders_mikrotik_noc_lib::config::AppConfig;
///
/// let config = AppConfig::default();
/// assert_eq!(config.default_timeout_secs, 3);
/// assert_eq!(config.poll_interval_secs, 1);
/// ```
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    /// Default HTTP client request timeout in seconds.
    pub default_timeout_secs: u64,
    /// Polling loop interval duration in seconds.
    pub poll_interval_secs: u64,
    /// Default HTTPS port used for RouterOS REST API communication.
    pub default_port: u16,
    /// Flag indicating whether to automatically attempt connection on startup.
    pub auto_connect: bool,
}

impl Default for AppConfig {
    /// Provides default configuration values optimized for local network latency.
    ///
    /// Default values:
    /// - `default_timeout_secs`: `3`
    /// - `poll_interval_secs`: `1`
    /// - `default_port`: `443`
    /// - `auto_connect`: `false`
    fn default() -> Self {
        Self {
            default_timeout_secs: 3,
            poll_interval_secs: 1,
            default_port: 443,
            auto_connect: false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Verifies that `AppConfig::default()` returns expected initial values.
    #[test]
    fn test_default_config_values() {
        let config = AppConfig::default();
        assert_eq!(config.default_timeout_secs, 3);
        assert_eq!(config.poll_interval_secs, 1);
        assert_eq!(config.default_port, 443);
        assert!(!config.auto_connect);
    }
}
