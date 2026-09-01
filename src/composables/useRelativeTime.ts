import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { setDayjsLocale } from "@/utils/formatters";

export function useRelativeTime(timestamp: string | Date | null | undefined) {
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

  watch(
    () => locale.value,
    (newLang) => {
      setDayjsLocale(newLang);
      tick.value++;
    },
    { immediate: true },
  );

  const relativeTime = computed(() => {
    if (tick.value < 0) return "";
    if (!timestamp) return "N/A";
    return dayjs(timestamp).fromNow();
  });

  const exactTimestamp = computed(() => {
    if (!timestamp) return "";
    return dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss");
  });

  return {
    relativeTime,
    exactTimestamp,
  };
}
