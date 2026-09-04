use serde::{Deserialize, Serialize};

/// Represents the raw wireless monitoring metrics returned directly by RouterOS API endpoints.
///
/// Fields correspond to standard MikroTik `/interface/wireless/monitor` responses.
#[derive(Debug, Deserialize, Serialize, Clone, Default)]
#[serde(rename_all = "kebab-case", default)]
pub struct WirelessMonitor {
    /// Overall wireless signal strength (e.g., `"-65dBm"`).
    #[serde(rename = "signal-strength")]
    pub signal_strength: Option<String>,

    /// Signal strength recorded on spatial chain 0 (e.g., `"-68dBm"`).
    #[serde(rename = "signal-strength-ch0")]
    pub signal_strength_ch0: Option<String>,

    /// Signal strength recorded on spatial chain 1 (e.g., `"-67dBm"`).
    #[serde(rename = "signal-strength-ch1")]
    pub signal_strength_ch1: Option<String>,

    /// Transmit Client Connection Quality percentage (e.g., `"98%"`).
    #[serde(rename = "tx-ccq")]
    pub tx_ccq: Option<String>,

    /// Receive Client Connection Quality percentage (e.g., `"95%"`).
    #[serde(rename = "rx-ccq")]
    pub rx_ccq: Option<String>,

    /// Raw channel/frequency representation (e.g., `"5180MHz/20/ac"` or `"5745"`).
    #[serde(rename = "channel")]
    pub frequency: Option<String>,

    /// Background noise level registered by the radio receiver (e.g., `"-102dBm"`).
    #[serde(rename = "noise-floor")]
    pub noise_floor: Option<String>,

    /// Signal-to-Noise Ratio calculated by the device (e.g., `"37dB"`).
    #[serde(rename = "signal-to-noise")]
    pub signal_to_noise: Option<String>,

    /// Service Set Identifier of the connected wireless network.
    pub ssid: Option<String>,

    /// Basic Service Set Identifier (MAC address of the access point).
    pub bssid: Option<String>,

    /// Current receive physical link rate (e.g., `"86.6Mbps"`).
    #[serde(rename = "rx-rate")]
    pub rx_rate: Option<String>,

    /// Current transmit physical link rate (e.g., `"86.6Mbps"`).
    #[serde(rename = "tx-rate")]
    pub tx_rate: Option<String>,
}

/// Represents real-time throughput traffic data returned from `/interface/monitor-traffic`.
#[derive(Debug, Deserialize, Serialize, Clone, Default)]
#[serde(default)]
pub struct TrafficMonitor {
    /// Current receive data rate expressed in bits per second (raw numeric string).
    #[serde(rename = "rx-bits-per-second")]
    pub rx_bps: Option<String>,

    /// Current transmit data rate expressed in bits per second (raw numeric string).
    #[serde(rename = "tx-bits-per-second")]
    pub tx_bps: Option<String>,
}

/// Consolidated device status payload emitted to the frontend via Tauri event `device-status-update`.
///
/// Contains cleaned numeric values and connectivity state aggregated from multiple API endpoints.
#[derive(Debug, Clone, Serialize, Default)]
pub struct DeviceStatus {
    /// Cleaned signal strength in dBm (e.g., `-65`).
    pub signal_dbm: Option<i32>,

    /// Transmit CCQ percentage (0-100).
    pub tx_ccq: Option<u8>,

    /// Receive CCQ percentage (0-100).
    pub rx_ccq: Option<u8>,

    /// Primary radio frequency value in MHz (e.g., `5180`).
    pub frequency_mhz: Option<u32>,

    /// Unparsed raw frequency/channel string directly from RouterOS.
    pub frequency_raw: Option<String>,

    /// Noise floor value in dBm (e.g., `-102`).
    pub noise_floor: Option<i32>,

    /// Signal-to-noise ratio in dB (e.g., `37`).
    pub signal_to_noise: Option<i32>,

    /// Connected wireless SSID.
    pub ssid: Option<String>,

    /// Access point MAC address (BSSID).
    pub bssid: Option<String>,

    /// Formatted receive physical rate.
    pub rx_rate: Option<String>,

    /// Formatted transmit physical rate.
    pub tx_rate: Option<String>,

    /// Identity/hostname of the target RouterOS device.
    pub device_name: Option<String>,

    /// Receive throughput speed in bits per second.
    pub rx_bps: Option<u64>,

    /// Transmit throughput speed in bits per second.
    pub tx_bps: Option<u64>,

    /// Flag indicating whether active communication with the device is established.
    pub connected: bool,

    /// Error message detailing why communication failed, if applicable.
    pub error: Option<String>,

    /// Target interface name being monitored (e.g., `"wlan1"`).
    pub iface: Option<String>,

    /// Total count of physical link flapping/disconnection events.
    pub link_downs: Option<u32>,

    /// Timestamp string representing the last recorded link down occurrence.
    pub last_link_down_time: Option<String>,

    /// Timestamp string representing the last recorded link recovery occurrence.
    pub last_link_up_time: Option<String>,

    /// Timestamp string indicating when the last successful polling cycle occurred.
    pub last_connected_at: Option<String>,
}

/// Details about interface state, connection counters, and link status.
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InterfaceStats {
    /// Internal RouterOS object identifier (e.g., `"*1"`).
    #[serde(rename = ".id")]
    pub id: String,

    /// Interface name (e.g., `"wlan1"` or `"ether1"`).
    pub name: String,

    /// Total count of link down events recorded by the interface.
    #[serde(rename = "link-downs")]
    pub link_downs: Option<String>,

    /// Last recorded timestamp when the link transitioned to down.
    #[serde(rename = "last-link-down-time")]
    pub last_link_down_time: Option<String>,

    /// Last recorded timestamp when the link recovered to up.
    #[serde(rename = "last-link-up-time")]
    pub last_link_up_time: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Tests deserialization of raw RouterOS wireless monitor JSON responses.
    #[test]
    fn test_deserialize_wireless_monitor() {
        let raw_json = r#"{
            "signal-strength": "-65dBm",
            "signal-strength-ch0": "-68dBm",
            "signal-strength-ch1": "-67dBm",
            "tx-ccq": "98%",
            "rx-ccq": "95%",
            "channel": "5180MHz/20/ac",
            "noise-floor": "-102dBm",
            "signal-to-noise": "37dB",
            "ssid": "MiRed_5G",
            "bssid": "E4:8D:8C:00:11:22",
            "rx-rate": "86.6Mbps",
            "tx-rate": "86.6Mbps"
        }"#;

        let parsed: Result<WirelessMonitor, _> = serde_json::from_str(raw_json);
        assert!(
            parsed.is_ok(),
            "Failed to deserialize WirelessMonitor payload"
        );
        let monitor = parsed.unwrap();
        assert_eq!(monitor.signal_strength.as_deref(), Some("-65dBm"));
        assert_eq!(monitor.tx_ccq.as_deref(), Some("98%"));
        assert_eq!(monitor.frequency.as_deref(), Some("5180MHz/20/ac"));
    }

    /// Tests deserialization of raw RouterOS traffic monitor JSON responses.
    #[test]
    fn test_deserialize_traffic_monitor() {
        let raw_json = r#"{
            "rx-bits-per-second": "1540200",
            "tx-bits-per-second": "450100"
        }"#;

        let parsed: Result<TrafficMonitor, _> = serde_json::from_str(raw_json);
        assert!(
            parsed.is_ok(),
            "Failed to deserialize TrafficMonitor payload"
        );
        let traffic = parsed.unwrap();
        assert_eq!(traffic.rx_bps.as_deref(), Some("1540200"));
        assert_eq!(traffic.tx_bps.as_deref(), Some("450100"));
    }

    /// Tests deserialization of raw RouterOS interface statistics JSON responses.
    #[test]
    fn test_deserialize_interface_stats() {
        let raw_json = r#"{
            ".id": "*1",
            "name": "wlan1",
            "link-downs": "3",
            "last-link-down-time": "2026-08-10 14:32:10",
            "last-link-up-time": "2026-08-10 14:33:00"
        }"#;

        let parsed: Result<InterfaceStats, _> = serde_json::from_str(raw_json);
        assert!(
            parsed.is_ok(),
            "Failed to deserialize InterfaceStats payload"
        );
        let stats = parsed.unwrap();
        assert_eq!(stats.id, "*1");
        assert_eq!(stats.name, "wlan1");
        assert_eq!(stats.link_downs.as_deref(), Some("3"));
    }
}
