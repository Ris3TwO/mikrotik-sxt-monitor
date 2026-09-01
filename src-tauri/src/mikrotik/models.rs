use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone, Default)]
#[serde(rename_all = "kebab-case", default)]
pub struct WirelessMonitor {
    #[serde(rename = "signal-strength")]
    pub signal_strength: Option<String>,
    #[serde(rename = "signal-strength-ch0")]
    pub signal_strength_ch0: Option<String>,
    #[serde(rename = "signal-strength-ch1")]
    pub signal_strength_ch1: Option<String>,
    #[serde(rename = "tx-ccq")]
    pub tx_ccq: Option<String>,
    #[serde(rename = "rx-ccq")]
    pub rx_ccq: Option<String>,
    #[serde(rename = "channel")]
    pub frequency: Option<String>,
    #[serde(rename = "noise-floor")]
    pub noise_floor: Option<String>,
    #[serde(rename = "signal-to-noise")]
    pub signal_to_noise: Option<String>,
    pub ssid: Option<String>,
    pub bssid: Option<String>,
    #[serde(rename = "rx-rate")]
    pub rx_rate: Option<String>,
    #[serde(rename = "tx-rate")]
    pub tx_rate: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone, Default)]
#[serde(default)]
pub struct TrafficMonitor {
    #[serde(rename = "rx-bits-per-second")]
    pub rx_bps: Option<String>,
    #[serde(rename = "tx-bits-per-second")]
    pub tx_bps: Option<String>,
}

#[derive(Debug, Clone, serde::Serialize, Default)]
pub struct DeviceStatus {
    pub signal_dbm: Option<i32>,
    pub tx_ccq: Option<u8>,
    pub rx_ccq: Option<u8>,
    pub frequency_mhz: Option<u32>,
    pub frequency_raw: Option<String>,
    pub noise_floor: Option<i32>,
    pub signal_to_noise: Option<i32>,
    pub ssid: Option<String>,
    pub bssid: Option<String>,
    pub rx_rate: Option<String>,
    pub tx_rate: Option<String>,
    pub device_name: Option<String>,
    pub rx_bps: Option<u64>,
    pub tx_bps: Option<u64>,
    pub connected: bool,
    pub error: Option<String>,
    pub iface: Option<String>,

    pub link_downs: Option<u32>,
    pub last_link_down_time: Option<String>,
    pub last_link_up_time: Option<String>,
    pub last_connected_at: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InterfaceStats {
    #[serde(rename = ".id")]
    pub id: String,
    pub name: String,
    #[serde(rename = "link-downs")]
    pub link_downs: Option<String>,
    #[serde(rename = "last-link-down-time")]
    pub last_link_down_time: Option<String>,
    #[serde(rename = "last-link-up-time")]
    pub last_link_up_time: Option<String>,
}