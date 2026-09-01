<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  glowColor: {
    type: String,
    default: "bg-brand-lavender/5",
  },
});
</script>

<template>
  <div
    class="bg-surface p-4 rounded-2xl border border-muted/10 flex flex-col justify-between shadow-lg relative overflow-hidden font-mono"
  >
    <!-- Efecto de luz ambiental difuminada -->
    <div
      class="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none"
      :class="glowColor"
    ></div>

    <!-- Cabecera de la tarjeta -->
    <!-- <div class="flex justify-between items-center text-primary text-xs tracking-wider mb-3">
      <span>{{ title }}</span>
      <slot name="header-action" />
    </div> -->
    <div class="flex justify-between items-center text-xs mb-3 font-mono">
      <div class="flex items-center gap-2">
        <!-- Pequeña barra vertical con tu color primary -->
        <span class="w-1 h-3 bg-primary rounded-full"></span>
        <span class="text-main font-medium tracking-wider">{{ title }}</span>
      </div>
      <slot name="header-action" />
    </div>

    <!-- Cuerpo principal / Contenido dinámico -->
    <div class="space-y-1">
      <slot />
    </div>
  </div>
</template>
