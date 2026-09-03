<script setup lang="ts">
/**
 * Language switcher component that enables dynamic locale toggling between Spanish (es) and English (en),
 * updates dayjs localization formatting, and persists the user preference in local storage.
 */
import { setDayjsLocale } from "@/utils/formatters";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

/**
 * Updates the active application locale, synchronizes the date formatting library,
 * and saves the selected language choice.
 *
 * @param {string} lang - The target locale code ("es" or "en").
 * @returns {void}
 */
const changeLanguage = (lang: string): void => {
  locale.value = lang;
  setDayjsLocale(lang);
  localStorage.setItem("user-locale", lang);
};
</script>

<template>
  <div class="flex items-center space-x-2 font-mono text-xs">
    <span class="text-muted">{{ t("settings.language") }}:</span>
    <button
      @click="changeLanguage('es')"
      :class="[
        'px-2 py-1 rounded transition-colors cursor-pointer',
        locale === 'es'
          ? 'bg-accent/20 text-accent font-bold'
          : 'text-muted hover:text-main',
      ]"
    >
      ES
    </button>
    <span class="text-muted/40">/</span>
    <button
      @click="changeLanguage('en')"
      :class="[
        'px-2 py-1 rounded transition-colors cursor-pointer',
        locale === 'en'
          ? 'bg-accent/20 text-accent font-bold'
          : 'text-muted hover:text-main',
      ]"
    >
      EN
    </button>
  </div>
</template>
