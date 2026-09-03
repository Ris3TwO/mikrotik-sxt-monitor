<script setup lang="ts">
/**
 * Link warning alert component displayed when the device is disconnected
 * or lacks an active wireless SSID association.
 */
import { useI18n } from "vue-i18n";

defineProps<{
  /** Connection status flag */
  connected: boolean;
  /** Active wireless service set identifier */
  ssid?: string | null;
}>();

const { t } = useI18n();
</script>

<template>
  <div
    v-if="!connected || !ssid"
    class="col-span-full mb-2 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 font-mono text-xs text-amber-400 shadow-lg"
  >
    <svg
      class="w-5 h-5 shrink-0 animate-pulse"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
    <div>
      <p class="font-bold">{{ t("dashboard.linkAlert.title") }}</p>
      <p class="opacity-80">
        {{
          !connected ? t("dashboard.linkAlert.unreachable") : t("dashboard.linkAlert.unassociated")
        }}
      </p>
    </div>
  </div>
</template>
