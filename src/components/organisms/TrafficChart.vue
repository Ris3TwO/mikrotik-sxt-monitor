<script setup lang="ts">
/**
 * Link performance chart component rendering real-time incoming (RX) and outgoing (TX)
 * network traffic telemetry curves using Chart.js.
 */
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { TrafficPoint } from "@/types";
import { useI18n } from "vue-i18n";

// Register Chart.js components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const { t } = useI18n();

const props = defineProps<{
  /** Historical array of traffic data points used to plot network rates */
  history: TrafficPoint[];
}>();

/**
 * Computed chart dataset mapping historical traffic telemetry into formatted line series
 * for download (RX) and upload (TX) metrics.
 */
const chartData = computed(() => ({
  labels: props.history.map((item) => item.time),
  datasets: [
    {
      label: "RX (Descarga)",
      backgroundColor: "rgba(210, 252, 56, 0.1)",
      borderColor: "#d2fc38", // --color-accent (Pear)
      data: props.history.map((item) => item.rx / 1000), // En Kbps o Mbps
      fill: true,
      tension: 0.3,
    },
    {
      label: "TX (Subida)",
      backgroundColor: "rgba(104, 61, 229, 0.1)",
      borderColor: "#683de5", // --color-primary (Violet)
      data: props.history.map((item) => item.tx / 1000),
      fill: true,
      tension: 0.3,
    },
  ],
}));

/**
 * Configuration options defining responsive layout, axis grids, tick styling,
 * and plugin visibility for the traffic performance chart.
 */
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false as const,
  scales: {
    x: {
      grid: { color: "rgba(114, 120, 160, 0.1)" },
      ticks: { color: "#7278a0", font: { family: "Space Mono", size: 10 } },
    },
    y: {
      grid: { color: "rgba(114, 120, 160, 0.1)" },
      ticks: { color: "#7278a0", font: { family: "Space Mono", size: 10 } },
    },
  },
  plugins: {
    legend: { display: false },
  },
};
</script>

<template>
  <section
    class="mt-6 bg-surface p-6 rounded-2xl border border-muted/10 shadow-lg"
  >
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <!-- Accent pill matching metrics style -->
        <span class="w-1.5 h-6 bg-primary rounded-full"></span>
        <div>
          <h2 class="text-lg font-mono text-main font-semibold">
            {{ t("dashboard.linkPerformance") }}
          </h2>
          <p class="text-xs text-muted font-mono">
            {{ t("dashboard.liveTransferRate") }}
          </p>
        </div>
      </div>
    </div>
    <div class="h-64 w-full relative">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </section>
</template>
