<script setup lang="ts">
/**
 * Reusable network action button component supporting an internal loading spinner,
 * customizable button types, and disabled states.
 */
defineProps<{
  /** Flag indicating whether the button is in an active loading state */
  isLoading?: boolean;
  /** HTML button type attribute */
  type?: "button" | "submit" | "reset";
  /** Flag indicating whether the button interaction is disabled */
  disabled?: boolean;
}>();
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || isLoading"
    class="w-full bg-accent text-canvas font-bold p-3 rounded-xl hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-xs shadow-md"
  >
    <svg
      v-if="isLoading"
      class="animate-spin h-4 w-4 text-canvas"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <slot />
  </button>
</template>
