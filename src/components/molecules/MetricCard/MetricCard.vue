<script setup lang="ts">
/**
 * Reusable metric card container component featuring an ambient glow background,
 * structured title layout with an accent indicator, and dynamic slot content.
 */
defineProps<{
  /** Title text displayed in the card header */
  title: string;
  /** Tailwind CSS class configuring the ambient glow color effect */
  glowColor?: string;
}>();
</script>

<template>
  <div
    class="bg-surface p-4 rounded-2xl border border-muted/10 flex flex-col justify-between shadow-lg relative overflow-hidden font-mono"
  >
    <!-- Diffused ambient light effect -->
    <div
      class="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none"
      :class="glowColor"
    ></div>

    <!-- Card header -->
    <div class="flex justify-between items-center text-xs mb-3 font-mono">
      <div class="flex items-center gap-2">
        <!-- Small vertical indicator bar with primary color -->
        <span class="w-1 h-3 bg-primary rounded-full"></span>
        <span class="text-main font-medium tracking-wider">{{ title }}</span>
      </div>
      <slot name="header-action" />
    </div>

    <!-- Main body / Dynamic slot content -->
    <div class="space-y-1">
      <slot />
    </div>
  </div>
</template>
