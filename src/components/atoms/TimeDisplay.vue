<script setup lang="ts">
import { useRelativeTime } from "@/composables/useRelativeTime";

const props = defineProps<{
  timestamp?: string | Date | null;
}>();

const { relativeTime, exactTimestamp } = useRelativeTime(() => props.timestamp);
</script>

<template>
  <time
    :datetime="timestamp?.toString()"
    :title="exactTimestamp"
    class="font-mono text-xs text-muted border-b border-muted border-dashed cursor-help hover:text-accent transition-colors duration-200"
  >
    {{ relativeTime }}
  </time>
</template>
