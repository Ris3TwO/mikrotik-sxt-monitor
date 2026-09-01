import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";

function getInitialLocale(): string {
  const savedLocale = localStorage.getItem("user-locale");
  if (savedLocale && ["es", "en"].includes(savedLocale)) {
    return savedLocale;
  }

  const systemLang = navigator.language || "en";
  const shortLang = systemLang.split("-")[0];

  return ["es", "en"].includes(shortLang) ? shortLang : "en";
}

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
