<script setup>
import { ref, reactive } from "vue";
import { useDeviceStore } from "@/stores/deviceStore";
import { onStatusUpdate, connectDevice } from "@/lib/api";

import LoginView from "@/components/views/LoginView.vue";
import DashboardView from "@/components/views/DashboardView.vue";
import LanguageSelector from "@/components/molecules/LanguageSelector.vue";

const device = useDeviceStore();
const isAuthenticated = ref(false);
const trafficHistory = reactive([]);
const ipAddress = ref("");

const handleLoginSuccess = async (credentials) => {
  isAuthenticated.value = true;
  ipAddress.value = credentials.ip;

  try {
    await onStatusUpdate((payload) => {
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
    console.error("Fallo de inicialización:", error);
  }
};

const handleLogout = () => {
  trafficHistory.length = 0;
  ipAddress.value = "";
  isAuthenticated.value = false;
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

  <!-- Vista Principal del Dashboard (Organiza Header, MetricGrid y TrafficChart) -->
  <DashboardView
    v-else
    :device="device"
    :deviceMeta="{
      name: device.device_name,
      ip: ipAddress,
      interface: device.iface,
    }"
    :trafficHistory="trafficHistory"
    @logout="handleLogout"
  />
</template>
