<script setup lang="ts">
/**
 * NOC Header component displaying active device metadata, real-time connection status,
 * and controls for session disconnection or logout.
 */
import { notify } from "@kyvg/vue3-notification";
import StatusDot from "@/components/atoms/StatusDot.vue";
import { DeviceMeta } from "@/types";
import { useDeviceStore } from "@/stores/deviceStore";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const device = useDeviceStore();

defineProps<{
  /** Connection state indicator flag */
  connected: boolean;
  /** Metadata profile of the connected MikroTik device */
  deviceMeta: DeviceMeta;
}>();

const emit = defineEmits<{
  /** Event emitted when the user requests a session logout or disconnection */
  (e: "logout"): void;
}>();

/**
 * Clears saved session credentials, resets the telemetry store state,
 * triggers a success notification, and emits the logout event.
 * 
 * @returns {void}
 */
const handleDisconnect = (): void => {
  localStorage.removeItem("mikrotik_pass");

  device.reset();

  notify({
    title: t("logout.notify.success.title"),
    text: t("logout.notify.success.text"),
    type: "info",
  });

  emit("logout");
};
</script>

<template>
  <header
    class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-5 rounded-2xl border border-muted/10 shadow-lg"
  >
    <div>
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-mono tracking-wide text-accent">
          {{ deviceMeta?.interface || t("misc.noData") }}
        </h1>
        <span
          class="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider flex items-center gap-2 border"
          :class="
            connected
              ? 'bg-accent/10 border-accent/30 text-accent'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          "
        >
          <StatusDot :connected="connected" />
          {{ connected ? t("misc.online") : t("misc.offline") }}
        </span>
      </div>
      <p class="text-sm text-muted font-mono mt-1">
        MikroTik {{ deviceMeta?.name || t("misc.noData") }} —
        {{ deviceMeta?.ip || t("misc.noData") }}
      </p>
    </div>

    <div class="flex items-center gap-4 font-mono text-xs">
      <span class="text-muted hidden sm:inline">{{
        t("misc.realTimeUpdates")
      }}</span>

      <button
        @click="handleDisconnect"
        class="w-8 h-8 rounded-xl border border-muted/20 bg-canvas hover:border-red-500/30 hover:text-red-400 text-muted transition-all cursor-pointer flex items-center justify-center group shadow-sm"
        :title="t('logout.button.title')"
      >
        <svg
          class="w-4 h-4 transition-transform group-hover:scale-110"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    </div>
  </header>
</template>
