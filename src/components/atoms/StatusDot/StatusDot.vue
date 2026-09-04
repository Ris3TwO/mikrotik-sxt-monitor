Fragmento de código
<script setup lang="ts">
/**
 * Status indicator dot component displaying an animated pulse effect
 * colored according to the connection state.
 */
defineProps<{
  /** Connection state flag indicating whether the entity is online */
  connected: boolean;
}>();
</script>

<template>
  <span
    class="w-2 h-2 rounded-full animate-pulse shrink-0"
    :class="connected ? 'bg-accent' : 'bg-red-500'"
  ></span>
</template>
