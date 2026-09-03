import { defineStore } from "pinia";
import { DeviceStatus } from "@/types";

/**
 * Pinia store managing the real-time telemetry state of the MikroTik device,
 * including connection health, signal metrics, interface speeds, and UI color getters.
 */
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
    device_name: null,
  }),
  getters: {
    /**
     * Computes the dynamic tailwind text color class based on wireless signal strength (dBm).
     * 
     * @param {Partial<DeviceStatus>} state - The current device store state.
     * @returns {string} Tailwind CSS text color class.
     */
    signalColor: (state) => {
      if (state.signal_dbm == null) return "text-muted";
      if (state.signal_dbm > -65) return "text-emerald-400";
      if (state.signal_dbm > -75) return "text-amber-400";
      return "text-red-400";
    },

    /**
     * Computes the dynamic tailwind background color class based on wireless signal strength (dBm).
     *
     * @param {Partial<DeviceStatus>} state - The current device store state.
     * @returns {string} Tailwind CSS background color class.
     */
    signalBgColor: (state) => {
      if (state.signal_dbm == null) return "bg-muted/20";
      if (state.signal_dbm > -65) return "bg-emerald-400";
      if (state.signal_dbm > -75) return "bg-amber-400";
      return "bg-red-400";
    },

    /**
     * Computes the dynamic tailwind text color class based on transmission link quality (CCQ).
     * 
     * @param {Partial<DeviceStatus>} state - The current device store state.
     * @returns {string} Tailwind CSS text color class.
     */
    ccqColor: (state) => {
      if (state.tx_ccq == null) return "text-muted";
      if (state.tx_ccq >= 80) return "text-brand-turquoise";
      if (state.tx_ccq >= 60) return "text-amber-400";
      return "text-red-400";
    },

    /**
     * Computes the dynamic tailwind background color class based on transmission link quality (CCQ).
     *
     * @param {Partial<DeviceStatus>} state - The current device store state.
     * @returns {string} Tailwind CSS background color class.
     */
    ccqBgColor: (state) => {
      if (state.tx_ccq == null) return "bg-muted/20";
      if (state.tx_ccq >= 80) return "bg-brand-turquoise";
      if (state.tx_ccq >= 60) return "bg-amber-400";
      return "bg-red-400";
    },
  },
  actions: {
    /**
     * Merges incoming telemetry payload updates into the current store state.
     *
     * @param {Partial<DeviceStatus>} payload - Partial device status update data.
     */
    updateStatus(payload: Partial<DeviceStatus>) {
      Object.assign(this, payload);
    },

    /**
     * Resets the store state back to its initial default values.
     */
    reset() {
      this.$reset();
    },
  },
});
