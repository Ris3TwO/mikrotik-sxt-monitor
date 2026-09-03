import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { setDayjsLocale } from "@/utils/formatters";
import { TimestampInput } from "@/types";

export const useRelativeTime = (timestamp: TimestampInput) => {
  const { locale } = useI18n();
  const tick = ref(0);
  let timer: number;

  onMounted(() => {
    timer = window.setInterval(() => {
      tick.value++;
    }, 60000);
  });

  onUnmounted(() => {
    clearInterval(timer);
  });

  const resolveTimestamp = () => {
    if (typeof timestamp === "function") {
      return timestamp();
    }
    if (timestamp && typeof timestamp === "object" && "value" in timestamp) {
      return timestamp.value;
    }
    return timestamp;
  };

  watch(
    () => locale.value,
    (newLang) => {
      setDayjsLocale(newLang);
      tick.value++;
    },
    { immediate: true },
  );

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
    if (tick.value < 0) return "";
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
