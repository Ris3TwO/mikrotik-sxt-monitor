use super::client::MikrotikClient;
use super::models::DeviceStatus;
use chrono::Local;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

pub fn spawn_poller(
    app: AppHandle,
    ip: String,
    user: String,
    pass: String,
) -> tokio::task::JoinHandle<()> {
    tokio::spawn(async move {
        let client = MikrotikClient::new(&ip, &user, &pass);
        let mut consecutive_errors = 0;

        let mut was_connected = false;
        let mut last_connected_at: Option<String> = None;

        let iface = match client.get_wireless_interface_name().await {
            Ok(name) => {
                println!(
                    "📡 Interfaz inalámbrica detectada automáticamente: {}",
                    name
                );
                name
            }
            Err(_) => "Wireless WAN".to_string(), // Fallback por defecto
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

                    println!("❌ Ciclo fallido #{}:", consecutive_errors);
                    if let Err(e) = &identity_err {
                        println!("   - Identity Error: {:?}", e);
                    }
                    if let Err(e) = &wireless_err {
                        println!("   - Wireless Error: {:?}", e);
                    }
                    if let Err(e) = &traffic_err {
                        println!("   - Traffic Error: {:?}", e);
                    }
                    if let Err(e) = &stats_err {
                        println!("   - Stats Error: {:?}", e);
                    }

                    if consecutive_errors >= 3 {
                        let error_status = DeviceStatus {
                            connected: false,
                            error: Some("No se pudo conectar, revisa IP/credenciales".to_string()),
                            ..Default::default()
                        };
                        let _ = app.emit("device-status-update", error_status);
                    }
                }
            }
            tokio::time::sleep(Duration::from_secs(1)).await;
        }
    })
}
