<script setup lang="ts">
/**
 * Formatted time display component that renders relative time strings with
 * a hover tooltip showing the precise formatted timestamp.
 */
import { useRelativeTime } from "@/composables";

const props = defineProps<{
  /** Input timestamp value as a string, Date object, or null */
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
