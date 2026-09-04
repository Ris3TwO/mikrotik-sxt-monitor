use crate::models::{InterfaceStats, TrafficMonitor, WirelessMonitor};
use reqwest::{Client, Response, StatusCode};
use serde_json::json;

/// Asynchronous client for interacting with the MikroTik RouterOS REST API.
///
/// Handles HTTPS requests, Basic Authentication, and JSON deserialization
/// for RouterOS system and interface monitoring endpoints.
pub struct MikrotikClient {
    http: Client,
    base_url: String,
    user: String,
    pass: String,
}

impl MikrotikClient {
    /// Creates a new `MikrotikClient` instance with a default 1-second timeout.
    ///
    /// # Arguments
    ///
    /// * `ip` - Target device IP address or hostname.
    /// * `user` - RouterOS API username.
    /// * `pass` - RouterOS API password.
    pub fn new(ip: &str, user: &str, pass: &str) -> Self {
        Self::new_with_timeout(ip, user, pass, std::time::Duration::from_secs(1))
    }

    /// Creates a new `MikrotikClient` instance with a custom HTTP timeout.
    ///
    /// Configures the client to accept self-signed certificates (`danger_accept_invalid_certs`).
    ///
    /// # Arguments
    ///
    /// * `ip` - Target device IP address or hostname.
    /// * `user` - RouterOS API username.
    /// * `pass` - RouterOS API password.
    /// * `timeout` - Duration before HTTP requests time out.
    pub fn new_with_timeout(
        ip: &str,
        user: &str,
        pass: &str,
        timeout: std::time::Duration,
    ) -> Self {
        let http = Client::builder()
            .danger_accept_invalid_certs(true)
            .timeout(timeout)
            .build()
            .expect("failed to build http client");

        Self {
            http,
            base_url: format!("https://{}/rest", ip),
            user: user.to_string(),
            pass: pass.to_string(),
        }
    }

    /// Evaluates HTTP response status codes and converts authorization/server errors.
    ///
    /// # Arguments
    ///
    /// * `resp` - Raw HTTP response received from reqwest.
    ///
    /// # Errors
    ///
    /// Returns `Err(String)` if status is 401/403 or any non-2xx status code.
    async fn handle_response(&self, resp: Response) -> Result<Response, String> {
        let status = resp.status();
        if status == StatusCode::UNAUTHORIZED || status == StatusCode::FORBIDDEN {
            return Err("Incorrect credentials or unauthorized access (401/403)".to_string());
        }
        if !status.is_success() {
            return Err(format!("Router HTTP error status: {}", status));
        }
        Ok(resp)
    }

    /// Queries wireless monitoring parameters for a specific interface.
    ///
    /// Executes `POST /rest/interface/wireless/monitor` with `once: ""`.
    ///
    /// # Arguments
    ///
    /// * `iface` - Interface name or ID (e.g., `wlan1`).
    pub async fn get_wireless_monitor(&self, iface: &str) -> Result<WirelessMonitor, String> {
        let url = format!("{}/interface/wireless/monitor", self.base_url);
        let resp = self
            .http
            .post(&url)
            .basic_auth(&self.user, Some(&self.pass))
            .json(&json!({
                ".id": iface,
                "once": ""
            }))
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let resp = self.handle_response(resp).await?;
        let arr: Vec<WirelessMonitor> = resp.json().await.map_err(|e| e.to_string())?;
        arr.into_iter().next().ok_or_else(|| "no data".into())
    }

    /// Queries real-time traffic statistics for a specific interface.
    ///
    /// Executes `POST /rest/interface/monitor-traffic` with `once: ""`.
    ///
    /// # Arguments
    ///
    /// * `iface` - Interface name or ID (e.g., `wlan1`).
    pub async fn get_traffic(&self, iface: &str) -> Result<TrafficMonitor, String> {
        let url = format!("{}/interface/monitor-traffic", self.base_url);
        let resp = self
            .http
            .post(&url)
            .basic_auth(&self.user, Some(&self.pass))
            .json(&json!({ "interface": iface, "once": "" }))
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let resp = self.handle_response(resp).await?;
        let arr: Vec<TrafficMonitor> = resp.json().await.map_err(|e| e.to_string())?;
        arr.into_iter().next().ok_or_else(|| "no data".into())
    }

    /// Retrieves the configured system identity (hostname) of the RouterOS device.
    ///
    /// Executes `GET /rest/system/identity`.
    pub async fn get_identity(&self) -> Result<String, String> {
        let url = format!("{}/system/identity", self.base_url);
        let resp = self
            .http
            .get(&url)
            .basic_auth(&self.user, Some(&self.pass))
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let resp = self.handle_response(resp).await?;

        use serde::Deserialize;

        #[derive(Deserialize)]
        struct Identity {
            name: String,
        }

        let id: Identity = resp.json().await.map_err(|e| e.to_string())?;
        Ok(id.name)
    }

    /// Automatically discovers the name of the first available wireless interface.
    ///
    /// Executes `GET /rest/interface/wireless`.
    pub async fn get_wireless_interface_name(&self) -> Result<String, String> {
        let url = format!("{}/interface/wireless", self.base_url);
        let resp = self
            .http
            .get(&url)
            .basic_auth(&self.user, Some(&self.pass))
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let resp = self.handle_response(resp).await?;

        use serde::Deserialize;

        #[derive(Deserialize)]
        struct WirelessInterface {
            name: String,
        }

        let interfaces: Vec<WirelessInterface> = resp.json().await.map_err(|e| e.to_string())?;

        interfaces
            .into_iter()
            .next()
            .map(|i| i.name)
            .ok_or_else(|| "No wireless interface found on device".to_string())
    }

    /// Retrieves detailed statistics and link state history for a target interface.
    ///
    /// Executes `GET /rest/interface` and filters the array by interface name or ID.
    ///
    /// # Arguments
    ///
    /// * `iface_name` - Target interface name or ID to filter by.
    pub async fn get_interface_stats(&self, iface_name: &str) -> Result<InterfaceStats, String> {
        let url = format!("{}/interface", self.base_url);
        let resp = self
            .http
            .get(&url)
            .basic_auth(&self.user, Some(&self.pass))
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let resp = self.handle_response(resp).await?;
        let interfaces: Vec<InterfaceStats> = resp.json().await.map_err(|e| e.to_string())?;

        interfaces
            .into_iter()
            .find(|i| i.name == iface_name || i.id == iface_name)
            .ok_or_else(|| format!("Interface {} not found", iface_name))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{InterfaceStats, WirelessMonitor};

    /// Tests client construction and base URL formatting.
    #[test]
    fn test_client_initialization_urls() {
        let client = MikrotikClient::new("192.168.88.1", "admin", "secret");
        assert_eq!(client.base_url, "https://192.168.88.1/rest");
        assert_eq!(client.user, "admin");
        assert_eq!(client.pass, "secret");
    }

    /// Tests custom timeout client initialization.
    #[test]
    fn test_client_custom_timeout_initialization() {
        let client = MikrotikClient::new_with_timeout(
            "10.0.0.1",
            "root",
            "pass",
            std::time::Duration::from_secs(5),
        );
        assert_eq!(client.base_url, "https://10.0.0.1/rest");
    }

    /// Tests JSON array parsing for wireless monitoring responses.
    #[test]
    fn test_parse_wireless_monitor_json_array() {
        let raw_json = r#"[
            {
                "signal-strength": "-65dBm",
                "tx-ccq": "95%",
                "rx-ccq": "92%",
                "frequency": "5745MHz",
                "noise-floor": "-110dBm",
                "ssid": "MikroTik-NOC"
            }
        ]"#;

        let parsed: Result<Vec<WirelessMonitor>, _> = serde_json::from_str(raw_json);
        assert!(parsed.is_ok());

        let items = parsed.unwrap();
        assert_eq!(items.len(), 1);
        assert_eq!(items[0].signal_strength.as_deref(), Some("-65dBm"));
        assert_eq!(items[0].ssid.as_deref(), Some("MikroTik-NOC"));
    }

    /// Tests interface matching logic for get_interface_stats filtering.
    #[test]
    fn test_interface_stats_filtering_logic() {
        let raw_json = r#"[
            {
                ".id": "*1",
                "name": "ether1",
                "link-downs": "0"
            },
            {
                ".id": "*2",
                "name": "wlan1",
                "link-downs": "3",
                "last-link-down-time": "aug/12/2026 10:15:00"
            }
        ]"#;

        let interfaces: Vec<InterfaceStats> = serde_json::from_str(raw_json).unwrap();

        let found = interfaces
            .into_iter()
            .find(|i| i.name == "wlan1" || i.id == "wlan1");

        assert!(found.is_some());
        let iface = found.unwrap();
        assert_eq!(iface.id, "*2");
        assert_eq!(iface.link_downs.as_deref(), Some("3"));
    }

    /// Tests discovery of wireless interface name from JSON response.
    #[test]
    fn test_wireless_interface_discovery_parsing() {
        let raw_json = r#"[
            {
                ".id": "*1",
                "name": "wlan1-5G",
                "default-name": "wlan1"
            }
        ]"#;

        #[derive(serde::Deserialize)]
        struct WirelessInterface {
            name: String,
        }

        let interfaces: Vec<WirelessInterface> = serde_json::from_str(raw_json).unwrap();
        let first_name = interfaces.into_iter().next().map(|i| i.name);

        assert_eq!(first_name, Some("wlan1-5G".to_string()));
    }
}
