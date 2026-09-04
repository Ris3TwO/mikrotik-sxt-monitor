<script setup lang="ts">
/**
 * Comprehensive device metrics grid component displaying real-time wireless statistics,
 * signal quality, throughput rates, frequency details, and connection status alerts.
 */
import { computed } from "vue";
import LinkWarningAlert from "@/components/molecules/LinkWarningAlert/LinkWarningAlert.vue";
import MetricCard from "@/components/molecules/MetricCard/MetricCard.vue";
import TimeDisplay from "@/components/atoms/TimeDisplay/TimeDisplay.vue";
import { formatBps } from "@/utils/formatters";
import { DeviceStatus } from "@/types";
import { useI18n } from "vue-i18n";
import { useDeviceStore } from "@/stores/deviceStore";
import { storeToRefs } from "pinia";

const { t } = useI18n();
const deviceStore = useDeviceStore();
const { ccqColor, ccqBgColor, signalColor, signalBgColor } = storeToRefs(deviceStore);

const props = defineProps<{
  /** Current network device status payload containing link, signal, and rate metrics */
  device: DeviceStatus;
}>();

/**
 * Computes a human-readable and localized channel description string.
 * It parses the raw frequency telemetry string to extract and append the
 * wireless protocol and channel extension details (e.g., HT/Ce) when available.
 *
 * @returns {string} The formatted channel string with frequency band, protocol, and extension.
 */
const formattedChannel = computed((): string => {
  if (!props.device.frequency_raw) return `${t("dashboard.channel")} 5GHz`;

  const parts = props.device.frequency_raw.split("/");

  if (parts.length >= 4) {
    const protocol = parts[2].toUpperCase();
    const extension = parts[3].toUpperCase();
    return `${t("dashboard.channel")} 5GHz (${protocol}/${extension})`;
  }

  return `${t("dashboard.channel")} 5GHz`;
});
</script>

<template>
  <section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
    <!-- Status alert spanning the entire grid width -->
    <LinkWarningAlert
      v-if="!device.connected || !device.ssid"
      :connected="device.connected"
      :ssid="device.ssid"
    />

    <!-- Card 1: Link Downs (Link Health) -->
    <MetricCard
      v-if="device.connected"
      :title="t('dashboard.linkHealth')"
      glowColor="bg-brand-lavender/5"
    >
      <div class="space-y-1 font-mono">
        <div class="flex justify-between text-xs">
          <span class="text-muted">{{ t("dashboard.totalDowns") }}:</span>
          <span class="text-main font-bold">{{ device.link_downs ?? 0 }}</span>
        </div>
        <div class="flex justify-between text-xs truncate">
          <span class="text-muted">{{ t("dashboard.lastDownTime") }}:</span>
          <TimeDisplay :timestamp="device.last_link_down_time" />
        </div>
      </div>
    </MetricCard>

    <!-- Card 2: Last Uplink / Active Interface -->
    <MetricCard
      v-if="device.connected"
      :title="t('dashboard.activeInterface')"
      glowColor="bg-brand-lavender/5"
    >
      <div class="space-y-1 font-mono">
        <div class="flex justify-between text-xs">
          <span class="text-muted">{{ t("dashboard.wanInterfaceName") }}:</span>
          <span class="text-main font-bold">{{ device.iface ?? "--" }}</span>
        </div>
        <div class="flex justify-between text-xs truncate">
          <span class="text-muted">{{ t("dashboard.lastUplinkTime") }}:</span>
          <TimeDisplay :timestamp="device.last_link_up_time" />
        </div>
      </div>
    </MetricCard>

    <!-- Card 3: SSID and BSSID Identity -->
    <MetricCard
      v-if="device.connected"
      :title="t('dashboard.identity')"
      glowColor="bg-brand-lavender/5"
    >
      <div class="space-y-1 font-mono">
        <div class="flex justify-between text-xs truncate">
          <span class="text-muted">SSID:</span>
          <span class="text-main font-bold truncate max-w-35">{{ device.ssid ?? "--" }}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-muted">BSSID:</span>
          <span class="text-main font-bold">{{ device.bssid ?? "--" }}</span>
        </div>
      </div>
    </MetricCard>

    <!-- Card 4: Physical Rates (RX / TX Rate) -->
    <MetricCard
      v-if="device.connected && device.ssid"
      :title="t('dashboard.physicalRates')"
      glowColor="bg-accent/5"
    >
      <div class="space-y-1 font-mono text-xs">
        <div class="flex justify-between items-center">
          <span class="text-muted">{{ t("dashboard.rxRate") }}:</span>
          <span class="text-main font-bold truncate max-w-37.5">{{
            device.rx_rate?.split?.("-")[0] ?? "--"
          }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-muted">{{ t("dashboard.txRate") }}:</span>
          <span class="text-main font-bold truncate max-w-37.5">{{
            device.tx_rate?.split?.("-")[0] ?? "--"
          }}</span>
        </div>
      </div>
    </MetricCard>

    <!-- Card 5: Signal Strength (RSSI) -->
    <MetricCard
      v-if="device.connected && device.ssid"
      :title="t('dashboard.signalStrength')"
      glowColor="bg-accent/5"
    >
      <div>
        <p
          :class="[
            'text-4xl font-bold font-mono tracking-tight transition-colors duration-300',
            signalColor,
          ]"
        >
          {{ deviceStore.signal_dbm ?? "--" }}
          <span class="text-lg font-normal text-muted">dBm</span>
        </p>
        <div class="w-full bg-muted/20 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            :class="['h-full transition-all duration-500', signalBgColor]"
            :style="{
              width: device.signal_dbm
                ? `${Math.min(100, Math.max(0, (device.signal_dbm + 100) * 2.5))}%`
                : '0%',
            }"
          ></div>
        </div>
      </div>
    </MetricCard>

    <!-- Card 6: Client Connection Quality (CCQ) -->
    <MetricCard
      v-if="device.connected && device.ssid"
      :title="t('dashboard.clientConnectionQuality')"
      glowColor="bg-brand-turquoise/5"
    >
      <div>
        <p
          :class="[
            'text-4xl font-bold font-mono tracking-tight transition-colors duration-300',
            ccqColor,
          ]"
        >
          {{ device.tx_ccq ?? "--" }}<span class="text-lg font-normal text-muted">%</span>
        </p>
        <div class="w-full bg-muted/20 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            :class="['h-full transition-all duration-500', ccqBgColor]"
            :style="{ width: `${device.tx_ccq ?? 0}%` }"
          ></div>
        </div>
      </div>
    </MetricCard>

    <!-- Card 7: Frequency -->
    <MetricCard :title="t('dashboard.frequency')" glowColor="bg-brand-turquoise/5">
      <div>
        <p class="text-3xl font-bold font-mono tracking-tight text-main truncate">
          {{ device.frequency_mhz ?? "--" }}
          <span class="text-sm font-normal text-muted">MHz</span>
        </p>
        <p class="text-xs font-mono text-muted mt-3">{{ formattedChannel }}</p>
      </div>
    </MetricCard>

    <!-- Card 8: Signal-to-Noise Ratio (SNR) -->
    <MetricCard
      v-if="device.connected && device.ssid"
      :title="t('dashboard.signalToNoiseRatio')"
      glowColor="bg-brand-turquoise/5"
    >
      <div>
        <p class="text-4xl font-bold font-mono tracking-tight text-main">
          {{ device.signal_to_noise ?? "--" }}
          <span class="text-lg font-normal text-muted">dB</span>
        </p>
        <p class="text-xs font-mono text-muted mt-3">
          {{ t("dashboard.signalMargin") }}
        </p>
      </div>
    </MetricCard>

    <!-- Card 9: Noise Floor -->
    <MetricCard
      v-if="device.connected && device.ssid"
      :title="t('dashboard.noiseFloor')"
      glowColor="bg-red-500/5"
    >
      <div>
        <p class="text-4xl font-bold font-mono tracking-tight text-main">
          {{ device.noise_floor ?? "--" }}
          <span class="text-lg font-normal text-muted">dBm</span>
        </p>
        <p class="text-xs font-mono text-muted mt-3">
          {{ t("dashboard.noiseFloorInfo") }}
        </p>
      </div>
    </MetricCard>

    <!-- Card 10: Live Network Traffic (Live Throughput) -->
    <MetricCard
      v-if="device.connected && device.ssid"
      :title="t('dashboard.liveTransferRate')"
      glowColor="bg-brand-lavender/5"
    >
      <div class="space-y-1 font-mono">
        <div class="flex justify-between text-sm">
          <span class="text-muted">RX:</span>
          <span class="text-main font-bold">{{ formatBps(device.rx_bps) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-muted">TX:</span>
          <span class="text-main font-bold">{{ formatBps(device.tx_bps) }}</span>
        </div>
      </div>
    </MetricCard>
  </section>
</template>
