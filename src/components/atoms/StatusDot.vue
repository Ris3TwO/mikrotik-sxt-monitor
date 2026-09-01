<script setup>
defineProps({
  connected: Boolean,
});
</script>

<template>
  <span
    class="w-2 h-2 rounded-full animate-pulse shrink-0"
    :class="connected ? 'bg-accent' : 'bg-red-500'"
  ></span>
</template>
