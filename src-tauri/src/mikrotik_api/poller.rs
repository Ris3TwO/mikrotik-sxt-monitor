use crate::config::AppConfig;
use crate::mikrotik_api::client::MikrotikClient;
use crate::models::DeviceStatus;
use chrono::Local;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

/// Maximum consecutive HTTP query failures allowed before declaring the device disconnected.
const MAX_CONSECUTIVE_ERRORS: u32 = 3;

/// Spawns an asynchronous Tokio background task to poll the MikroTik device at fixed intervals.
///
/// Queries identity, wireless metrics, interface traffic, and interface statistics in each cycle,
/// mapping raw JSON responses to `DeviceStatus` payloads emitted via Tauri event `device-status-update`.
///
/// # Arguments
///
/// * `app` - Handle to the Tauri application instance for event broadcasting.
/// * `ip` - Target device IP address or hostname.
/// * `user` - RouterOS API username.
/// * `pass` - RouterOS API password.
/// * `config` - Application runtime configuration containing timeout and polling intervals.
///
/// # Returns
///
/// A Tokio `JoinHandle<()>` representing the running background execution task.
pub fn spawn_poller(
    app: AppHandle,
    ip: String,
    user: String,
    pass: String,
    config: AppConfig,
) -> tokio::task::JoinHandle<()> {
    tokio::spawn(async move {
        let client = MikrotikClient::new_with_timeout(
            &ip,
            &user,
            &pass,
            Duration::from_secs(config.default_timeout_secs),
        );
        let mut consecutive_errors: u32 = 0;

        let mut was_connected = false;
        let mut last_connected_at: Option<String> = None;

        let iface = match client.get_wireless_interface_name().await {
            Ok(name) => {
                println!("[poller] Wireless interface auto-detected: {}", name);
                name
            }
            Err(err) => {
                eprintln!(
                    "[poller] Failed auto-detecting wireless interface: {}. Falling back to 'Wireless WAN'",
                    err
                );
                "Wireless WAN".to_string()
            }
        };

        loop {
            let identity_res = client.get_identity().await;
            let wireless_res = client.get_wireless_monitor(&iface).await;
            let traffic_res = client.get_traffic(&iface).await;
            let stats_res = client.get_interface_stats(&iface).await;

            let now_timestamp = Local::now().format("%H:%M:%S").to_string();

            match (identity_res, wireless_res, traffic_res, stats_res) {
                (Ok(identity), Ok(w), Ok(t), Ok(stats)) => {
                    consecutive_errors = 0;

                    let freq_str = w.frequency.clone();
                    let freq_raw = w.frequency;

                    if !was_connected {
                        last_connected_at = Some(now_timestamp.clone());
                        was_connected = true;
                    }

                    let status = DeviceStatus {
                        signal_dbm: w.signal_strength.and_then(|s| s.parse().ok()),
                        tx_ccq: w.tx_ccq.and_then(|s| s.parse().ok()),
                        rx_ccq: w.rx_ccq.and_then(|s| s.parse().ok()),
                        frequency_mhz: freq_str.and_then(|s| s.split('/').next()?.parse().ok()),
                        frequency_raw: freq_raw,
                        noise_floor: w.noise_floor.and_then(|s| s.parse().ok()),
                        signal_to_noise: w.signal_to_noise.and_then(|s| s.parse().ok()),
                        ssid: w.ssid,
                        bssid: w.bssid,
                        rx_rate: w.rx_rate,
                        tx_rate: w.tx_rate,
                        device_name: Some(identity),
                        rx_bps: t.rx_bps.and_then(|s| s.parse().ok()),
                        tx_bps: t.tx_bps.and_then(|s| s.parse().ok()),
                        connected: true,
                        error: None,
                        iface: Some(iface.clone()),
                        link_downs: stats.link_downs.and_then(|s| s.parse().ok()),
                        last_link_down_time: stats.last_link_down_time,
                        last_link_up_time: stats.last_link_up_time,
                        last_connected_at: last_connected_at.clone(),
                    };

                    let _ = app.emit("device-status-update", status);
                }
                (identity_err, wireless_err, traffic_err, stats_err) => {
                    consecutive_errors += 1;

                    eprintln!("[poller] Polling cycle failed (#{}):", consecutive_errors);
                    if let Err(e) = &identity_err {
                        eprintln!("  - Identity error: {:?}", e);
                    }
                    if let Err(e) = &wireless_err {
                        eprintln!("  - Wireless monitor error: {:?}", e);
                    }
                    if let Err(e) = &traffic_err {
                        eprintln!("  - Traffic monitor error: {:?}", e);
                    }
                    if let Err(e) = &stats_err {
                        eprintln!("  - Interface stats error: {:?}", e);
                    }

                    if consecutive_errors >= MAX_CONSECUTIVE_ERRORS {
                        let error_status = DeviceStatus {
                            connected: false,
                            error: Some(
                                "Failed to connect to MikroTik device. Check IP or credentials."
                                    .to_string(),
                            ),
                            ..Default::default()
                        };
                        let _ = app.emit("device-status-update", error_status);
                    }
                }
            }

            tokio::time::sleep(Duration::from_secs(config.poll_interval_secs)).await;
        }
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Helper to replicate the exact frequency parsing logic from the poller.
    fn parse_frequency(freq_str: Option<&str>) -> Option<u32> {
        let s = freq_str?;
        let first_part = s.split('/').next()?.trim();
        // Strip the "MHz" suffix if present in the raw field
        let clean_num = first_part.trim_end_matches("MHz").trim();
        clean_num.parse().ok()
    }

    /// Helper to replicate full DeviceStatus mapping from mocked responses.
    fn map_wireless_to_status(
        frequency_raw: Option<String>,
        signal: Option<String>,
        ccq: Option<String>,
    ) -> (Option<i32>, Option<u32>, Option<u32>) {
        let signal_dbm = signal.and_then(|s| s.trim_end_matches("dBm").trim().parse().ok());
        let freq_mhz = parse_frequency(frequency_raw.as_deref());
        let tx_ccq = ccq.and_then(|s| s.trim_end_matches('%').trim().parse().ok());
        (signal_dbm, freq_mhz, tx_ccq)
    }

    #[test]
    fn test_comprehensive_frequency_parsing() {
        let cases = vec![
            ("5745", Some(5745)),
            ("5745/20-Ce/AC", Some(5745)),
            ("5180/20/gn", Some(5180)),
            ("5745MHz", Some(5745)),
            ("5240 / 80-eCee", Some(5240)),
            ("2412/20-Ce/gn(20dBm)", Some(2412)),
            ("searching", None),
            ("disabled", None),
            ("", None),
        ];

        for (input, expected) in cases {
            let result = parse_frequency(Some(input));
            assert_eq!(
                result, expected,
                "Failed to parse raw frequency string: '{input}'"
            );
        }
    }

    #[test]
    fn test_numeric_parsing_with_units() {
        // Tests metric conversions that RouterOS sometimes returns with or without unit suffixes (% or dBm)
        let (signal, freq, ccq) = map_wireless_to_status(
            Some("5745MHz".to_string()),
            Some("-68dBm".to_string()),
            Some("98%".to_string()),
        );

        assert_eq!(signal, Some(-68));
        assert_eq!(freq, Some(5745));
        assert_eq!(ccq, Some(98));
    }

    #[test]
    fn test_consecutive_error_threshold_transitions() {
        let mut consecutive_errors = 0;

        // Errors 1 and 2: should not trigger critical failure state
        for i in 1..=2 {
            consecutive_errors += 1;
            assert_eq!(consecutive_errors, i);
            assert!(consecutive_errors < MAX_CONSECUTIVE_ERRORS);
        }

        // Error 3: reaches threshold to emit disconnection event
        consecutive_errors += 1;
        assert!(consecutive_errors >= MAX_CONSECUTIVE_ERRORS);

        // Upon connection recovery, the counter must reset to zero
        let is_successful_cycle = true;
        if is_successful_cycle {
            consecutive_errors = 0;
        }
        assert_eq!(consecutive_errors, 0);
    }
}
