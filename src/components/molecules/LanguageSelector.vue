<script setup lang="ts">
import { setDayjsLocale } from "@/utils/formatters";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const changeLanguage = (lang: string) => {
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
