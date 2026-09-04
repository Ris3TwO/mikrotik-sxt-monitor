/**
 * Formatting and localization utility functions for handling date parsing via Day.js
 * and network data rate conversions (bps, Kbps, Mbps, Gbps).
 */
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import "dayjs/locale/en";

dayjs.extend(relativeTime);
dayjs.locale("en"); // Initial default locale

/**
 * Dynamically updates the global Day.js locale with a safe fallback to English.
 * 
 * @param {string} locale - Target locale code (e.g., "es", "en").
 * @returns {void}
 */
export const setDayjsLocale = (locale: string): void => {
  // Validate that the locale is supported or fall back safely
  const supportedLocales = ["es", "en"];
  const targetLocale = supportedLocales.includes(locale) ? locale : "en";
  dayjs.locale(targetLocale);
};

/**
 * Formats raw bit rate values into human-readable network bandwidth units (bps, Kbps, Mbps, Gbps).
 * 
 * @param {number | string | null | undefined} bits - Raw bit rate value to format.
 * @returns {string} Formatted bandwidth string with appropriate unit suffix.
 */
export const formatBps = (bits: number | string | null | undefined): string => {
  if (!bits || isNaN(Number(bits))) return "0 bps";
  const num = Number(bits);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)} Gbps`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)} Mbps`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)} Kbps`;
  return `${num} bps`;
};