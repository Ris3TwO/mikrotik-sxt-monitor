export interface DeviceStatus {
  connected: boolean;
  signal_dbm: number | null;
  tx_ccq: number | null;
  rx_ccq: number | null;
  frequency_mhz: number | null;
  frequency_raw: string | null;
  rx_bps: number | null;
  tx_bps: number | null;
  error: string | null;
  iface: string | null;
  ssid: string | null;
  bssid: string | null;
  rx_rate: string | null;
  tx_rate: string | null;
  traffic_history: TrafficPoint[];
  signal_to_noise: number | null;
  noise_floor: number | null;
  link_downs: number | null;
  last_link_down_time: string | null;
  last_link_up_time: string | null;
  last_connected_at: string | null;
}

export interface DeviceMeta {
  name: string;
  ip: string;
  interface: string;
}

export interface TrafficPoint {
  time: string;
  rx: number;
  tx: number;
}
