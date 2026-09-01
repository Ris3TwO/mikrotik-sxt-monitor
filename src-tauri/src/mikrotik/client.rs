use super::models::{TrafficMonitor, WirelessMonitor, InterfaceStats};
use reqwest::{Client, Response, StatusCode};
use serde_json::json;

pub struct MikrotikClient {
    http: Client,
    base_url: String,
    user: String,
    pass: String,
}

impl MikrotikClient {
    pub fn new(ip: &str, user: &str, pass: &str) -> Self {
        let http = Client::builder()
            .danger_accept_invalid_certs(true) // ⚠️ Alpha only: cert self-signed
            .timeout(std::time::Duration::from_secs(3))
            .build()
            .expect("failed to build http client");

        Self {
            http,
            base_url: format!("http://{}/rest", ip),
            user: user.to_string(),
            pass: pass.to_string(),
        }
    }

    async fn handle_response(&self, resp: Response) -> Result<Response, String> {
        let status = resp.status();
        if status == StatusCode::UNAUTHORIZED || status == StatusCode::FORBIDDEN {
            return Err("Credenciales incorrectas o acceso no autorizado (401)".to_string());
        }
        if !status.is_success() {
            return Err(format!("Error HTTP del router: {}", status));
        }
        Ok(resp)
    }

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
            .ok_or_else(|| "No se encontró ninguna interfaz inalámbrica".to_string())
    }

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

        // Buscamos la interfaz que coincida con el nombre (ej. "Wireless WAN" o "wlan1")
        interfaces
            .into_iter()
            .find(|i| i.name == iface_name || i.id == iface_name)
            .ok_or_else(|| format!("No se encontró la interfaz {}", iface_name))
    }
}
