import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";

/**
 * Determines the initial language locale for the application.
 * Checks local storage first, then falls back to the browser's system language,
 * defaulting to English ("en") if unsupported.
 *
 * @returns {string} The resolved locale code ("en" or "es").
 */

export const getInitialLocale = (): string => {
  const savedLocale = localStorage.getItem("user-locale");
  if (savedLocale && ["es", "en"].includes(savedLocale)) {
    return savedLocale;
  }

  const systemLang = navigator.language || "en";
  const shortLang = systemLang.split("-")[0];

  return ["es", "en"].includes(shortLang) ? shortLang : "en";
};

/**
 * Vue I18n instance configuration supporting English and Spanish localization,
 * with automatic initial locale detection and fallback mechanisms.
 */
const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: "en",
  messages: {
    en,
    es,
  },
});

export default i18n;
