import { defineStore } from "pinia";
import { DeviceStatus } from "@/types";

export const useDeviceStore = defineStore("device", {
  state: (): Partial<DeviceStatus> => ({
    connected: false,
    signal_dbm: null,
    tx_ccq: null,
    rx_ccq: null,
    frequency_mhz: null,
    frequency_raw: null,
    rx_bps: null,
    tx_bps: null,
    error: null,
    iface: null,
    ssid: null,
    bssid: null,
    rx_rate: null,
    tx_rate: null,
    traffic_history: [],
    signal_to_noise: null,
    noise_floor: null,
    link_downs: null,
    last_link_down_time: null,
    last_link_up_time: null,
  }),
  getters: {
    signalBgColor: (state) => {
      if (state.signal_dbm == null) return "bg-muted/20";
      if (state.signal_dbm > -65) return "bg-emerald-400";
      if (state.signal_dbm > -75) return "bg-amber-400";
      return "bg-red-400";
    },
    ccqBgColor: (state) => {
      if (state.tx_ccq == null) return "bg-muted/20";
      if (state.tx_ccq >= 80) return "bg-brand-turquoise";
      if (state.tx_ccq >= 60) return "bg-amber-400";
      return "bg-red-400";
    },
  },
  actions: {
    updateStatus(payload: Partial<DeviceStatus>) {
      Object.assign(this, payload);
    },
    reset() {
      this.$reset();
    },
  },
});
