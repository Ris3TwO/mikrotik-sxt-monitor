import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { setDayjsLocale } from "@/utils/formatters";
import { TimestampInput } from "@/types";

/**
 * Composable to handle reactive relative time formatting.
 * Automatically updates every minute and responds to locale or timestamp changes.
 * 
 * @param {TimestampInput} timestamp - The timestamp source (string, Date, Ref, or getter function).
 * @returns An object containing `relativeTime` and `exactTimestamp` computed properties.
 */
export const useRelativeTime = (timestamp: TimestampInput) => {
  const { locale } = useI18n();
  const tick = ref(0);
  let timer: number;

  // Refresh ticker every minute to keep relative time strings up to date
  onMounted(() => {
    timer = window.setInterval(() => {
      tick.value++;
    }, 60000);
  });

  onUnmounted(() => {
    clearInterval(timer);
  });

  /**
   * Resolves the current timestamp value regardless of whether 
   * it's a primitive value, a reactive Ref, or a getter function.
   */
  const resolveTimestamp = () => {
    if (typeof timestamp === "function") {
      return timestamp();
    }
    if (timestamp && typeof timestamp === "object" && "value" in timestamp) {
      return timestamp.value;
    }
    return timestamp;
  };

  // Trigger re-calculation when the application locale changes
  watch(
    () => locale.value,
    (newLang) => {
      setDayjsLocale(newLang);
      tick.value++;
    },
    { immediate: true },
  );

  // Trigger re-calculation when the underlying ref value updates
  watch(
    () =>
      typeof timestamp === "object" &&
      timestamp !== null &&
      "value" in timestamp
        ? timestamp.value
        : timestamp,
    () => {
      tick.value++;
    },
  );

  const relativeTime = computed(() => {
    const currentTimestamp = resolveTimestamp();
    if (!currentTimestamp) return "N/A";
    return dayjs(currentTimestamp).fromNow();
  });

  const exactTimestamp = computed(() => {
    const currentTimestamp = resolveTimestamp();
    if (!currentTimestamp) return "";
    return dayjs(currentTimestamp).format("YYYY-MM-DD HH:mm:ss");
  });

  return {
    relativeTime,
    exactTimestamp,
  };
};
