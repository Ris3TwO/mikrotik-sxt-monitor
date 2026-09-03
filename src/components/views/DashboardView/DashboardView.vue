<script setup lang="ts">
import NocHeader from "@/components/organisms/NocHeader/NocHeader.vue";
import MetricGrid from "@/components/organisms/MetricGrid/MetricGrid.vue";
import TrafficChart from "@/components/organisms/TrafficChart/TrafficChart.vue";
import { DeviceMeta, DeviceStatus, TrafficPoint } from "@/types";

defineProps<{
  device: DeviceStatus;
  deviceMeta: DeviceMeta;
  trafficHistory: TrafficPoint[];
}>();

const emit = defineEmits(["logout"]);
</script>

<template>
  <div class="min-h-screen bg-canvas p-4 sm:p-6 lg:p-8 font-mono text-main">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Cabecera -->
      <NocHeader :connected="device.connected" :deviceMeta="deviceMeta" @logout="emit('logout')" />

      <!-- Cuadrícula de Métricas -->
      <MetricGrid :device="device" />

      <!-- Gráfico de Rendimiento en Vivo -->
      <TrafficChart v-if="device.connected && device.ssid" :history="trafficHistory" />
    </div>
  </div>
</template>
