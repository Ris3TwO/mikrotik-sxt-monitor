import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import "dayjs/locale/en"; // Importa también el inglés (o los que necesites)

dayjs.extend(relativeTime);
dayjs.locale("en"); // Idioma por defecto inicial

/**
 * Cambia el idioma global de Day.js dinámicamente.
 * @param locale - Código del idioma ('es', 'en', etc.)
 */
export const setDayjsLocale = (locale: string) => {
  // Validamos que el idioma sea soportado o hacemos un fallback seguro
  const supportedLocales = ["es", "en"];
  const targetLocale = supportedLocales.includes(locale) ? locale : "en";
  dayjs.locale(targetLocale);
};

export const formatBps = (bits: number | string | null | undefined): string => {
  if (!bits || isNaN(Number(bits))) return "0 bps";
  const num = Number(bits);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)} Gbps`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)} Mbps`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)} Kbps`;
  return `${num} bps`;
};
