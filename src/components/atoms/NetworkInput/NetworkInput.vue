<script setup lang="ts">
/**
 * Reusable network input component supporting v-model data binding,
 * custom labels, types, placeholders, and an optional password visibility toggle.
 */
defineProps<{
  /** Current input value bound via v-model */
  modelValue?: string | number;
  /** Text label displayed above the input field */
  label: string;
  /** HTML input type attribute */
  type?: string;
  /** Placeholder text shown when the input is empty */
  placeholder?: string;
  /** Flag to determine whether the password visibility toggle button is shown */
  showPasswordToggle?: boolean;
  /** Flag indicating whether the password text is currently visible */
  showPassword?: boolean;
}>();

defineEmits<{
  /** Event emitted when the input value changes */
  (e: "update:modelValue", value: string): void;
  /** Event emitted when the password visibility toggle button is clicked */
  (e: "toggle-password"): void;
}>();
</script>

<template>
  <div class="w-full font-mono text-xs">
    <label class="block text-muted mb-1">{{ label }}</label>
    <div class="relative">
      <input
        :value="modelValue"
        @input="
          $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
        :type="type"
        :placeholder="placeholder"
        class="w-full bg-canvas border border-muted/20 rounded-xl p-3 text-main placeholder-muted/50 focus:border-accent outline-none transition [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
        :class="{ 'pr-10': showPasswordToggle }"
      />

      <!-- Optional button to toggle password visibility -->
      <button
        v-if="showPasswordToggle"
        type="button"
        @click="$emit('toggle-password')"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition cursor-pointer p-1"
      >
        <svg
          v-if="showPassword"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <svg
          v-else
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
