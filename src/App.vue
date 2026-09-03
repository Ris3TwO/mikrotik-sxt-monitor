<script setup lang="ts">
/**
 * Root application component managing global authentication flow, real-time
 * telemetry subscription streams, traffic history buffers, and layout transitions
 * between the login gateway and the main NOC dashboard.
 */
import { ref, reactive } from "vue";
import { useDeviceStore } from "@/stores/deviceStore";
import { onStatusUpdate, connectDevice, disconnectDevice } from "@/lib/api";
import { DeviceStatus, LoginCredentials, TrafficPoint } from "@/types";

import LoginView from "@/components/views/LoginView.vue";
import DashboardView from "@/components/views/DashboardView.vue";
import LanguageSelector from "@/components/molecules/LanguageSelector.vue";

const device = useDeviceStore();
const isAuthenticated = ref<boolean>(false);
const trafficHistory = reactive<TrafficPoint[]>([]);
const ipAddress = ref<string>("");

/**
 * Handles successful authentication by storing target device information,
 * establishing the real-time telemetry listener stream, appending traffic points
 * to the performance history buffer, and invoking the connection command.
 *
 * @param {LoginCredentials} credentials - Connection credentials containing IP, user, and password.
 * @returns {Promise<void>}
 */
const handleLoginSuccess = async (
  credentials: LoginCredentials,
): Promise<void> => {
  isAuthenticated.value = true;
  ipAddress.value = credentials.ip;

  try {
    await onStatusUpdate((payload: any) => {
      device.updateStatus(payload);

      if (payload.connected) {
        const timeNow = new Date().toLocaleTimeString();
        trafficHistory.push({
          time: timeNow,
          rx: payload.rx_bps || 0,
          tx: payload.tx_bps || 0,
        });
        if (trafficHistory.length > 30) trafficHistory.shift();
      }
    });

    await connectDevice(credentials.ip, credentials.user, credentials.pass);
  } catch (error) {
    console.error("Initialization failure:", error);
  }
};

/**
 * Resets application state, clears the traffic history buffer,
 * terminates session indicators, and disconnects from the device backend.
 *
 * @returns {void}
 */
const handleLogout = (): void => {
  trafficHistory.length = 0;
  ipAddress.value = "";
  isAuthenticated.value = false;
  disconnectDevice();
};
</script>

<template>
  <notifications position="top center" :max="3" class="p-4" width="400">
    <template #body="props">
      <div
        class="bg-surface/95 backdrop-blur-md p-3.5 rounded-2xl border shadow-xl flex items-start gap-3 mb-2 font-mono text-xs transition-all"
        :class="{
          'border-red-500/30 text-main': props.item.type === 'error',
          'border-amber-500/30 text-main': props.item.type === 'warn',
          'border-blue-500/30 text-main': props.item.type === 'info',
          'border-muted/20 text-main':
            !props.item.type || props.item.type === 'success',
        }"
      >
        <div
          class="w-2 h-2 rounded-full mt-1 shrink-0"
          :class="{
            'bg-red-500': props.item.type === 'error',
            'bg-amber-500': props.item.type === 'warn',
            'bg-blue-500': props.item.type === 'info',
            'bg-accent': !props.item.type || props.item.type === 'success',
          }"
        ></div>

        <div class="flex-1">
          <p class="font-bold text-main tracking-tight">
            {{ props.item.title }}
          </p>
          <p class="text-muted mt-0.5 leading-relaxed">{{ props.item.text }}</p>
        </div>

        <button
          @click="props.close"
          class="text-muted hover:text-main transition p-1 cursor-pointer"
        >
          ✕
        </button>
      </div>
    </template>
  </notifications>

  <!-- Barra superior fija y limpia para controles globales -->
  <header
    class="w-full px-6 py-3 flex justify-end items-center border-b border-muted/10 bg-surface/30 backdrop-blur-sm z-50"
  >
    <LanguageSelector />
  </header>

  <!-- Vista de Login Atómica -->
  <LoginView v-if="!isAuthenticated" @login-success="handleLoginSuccess" />

  <!-- Main Dashboard View (Organizes Header, MetricGrid, and TrafficChart) -->
  <DashboardView
    v-else
    :device="device as DeviceStatus"
    :deviceMeta="{
      name: device.device_name || '',
      ip: ipAddress,
      interface: device.iface || '',
    }"
    :trafficHistory="trafficHistory"
    @logout="handleLogout"
  />
</template>
