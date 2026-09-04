import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { mount } from "@vue/test-utils";
import { useRelativeTime } from "./useRelativeTime";
import { setDayjsLocale } from "@/utils/formatters";
import dayjs from "dayjs";
import relativeTimePlugin from "dayjs/plugin/relativeTime";

// Extend dayjs with relativeTime plugin for testing
dayjs.extend(relativeTimePlugin);

// Mock vue-i18n
const mockLocale = ref("en");
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    locale: mockLocale,
  }),
}));

// Mock formatters utility
vi.mock("@/utils/formatters", () => ({
  setDayjsLocale: vi.fn(),
}));

describe("useRelativeTime composable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocale.value = "en";
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should format primitive timestamp correctly", () => {
    let result: ReturnType<typeof useRelativeTime>;
    mount({
      setup() {
        // Use a fixed static date string or ISO format
        result = useRelativeTime("2026-01-01 12:00:00");
        return {};
      },
      template: "<div />",
    });

    expect(result!.exactTimestamp.value).toBe("2026-01-01 12:00:00");
    expect(result!.relativeTime.value).toBeDefined();
    expect(result!.relativeTime.value).not.toBe("N/A");
  });

  it("should handle Ref timestamp and update when ref changes", async () => {
    const timestampRef = ref("2026-01-01 10:00:00");

    let result: ReturnType<typeof useRelativeTime>;
    mount({
      setup() {
        result = useRelativeTime(timestampRef);
        return {};
      },
      template: "<div />",
    });

    expect(result!.exactTimestamp.value).toBe("2026-01-01 10:00:00");

    // Update underlying ref
    timestampRef.value = "2026-01-01 15:00:00";
    await vi.runAllTicks();

    expect(result!.exactTimestamp.value).toBe("2026-01-01 15:00:00");
  });

  it("should handle getter function timestamp", () => {
    const getTimestamp = () => "2026-06-01 08:00:00";

    let result: ReturnType<typeof useRelativeTime>;
    mount({
      setup() {
        result = useRelativeTime(getTimestamp);
        return {};
      },
      template: "<div />",
    });

    expect(result!.exactTimestamp.value).toBe("2026-06-01 08:00:00");
  });

  it("should return default fallback values when timestamp is null or undefined", () => {
    let result: ReturnType<typeof useRelativeTime>;
    mount({
      setup() {
        result = useRelativeTime(null as any);
        return {};
      },
      template: "<div />",
    });

    expect(result!.relativeTime.value).toBe("N/A");
    expect(result!.exactTimestamp.value).toBe("");
  });

  it("should update dayjs locale and tick when i18n locale changes", async () => {
    mount({
      setup() {
        useRelativeTime("2026-01-01 12:00:00");
        return {};
      },
      template: "<div />",
    });

    // Change locale
    mockLocale.value = "es";
    await vi.runAllTicks();

    expect(setDayjsLocale).toHaveBeenCalledWith("es");
  });

  it("should setup interval timer on mount and clear it on unmount", () => {
    const setIntervalSpy = vi.spyOn(window, "setInterval");
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");

    const wrapper = mount({
      setup() {
        useRelativeTime("2026-01-01 12:00:00");
        return {};
      },
      template: "<div />",
    });

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000);

    // Unmount component to trigger onUnmounted
    wrapper.unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("should setup interval timer on mount, increment tick, and clear it on unmount", async () => {
    const setIntervalSpy = vi.spyOn(window, "setInterval");
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");

    const wrapper = mount({
      setup() {
        useRelativeTime("2026-01-01 12:00:00");
        return {};
      },
      template: "<div />",
    });

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000);

    // Advance time by 60 seconds to trigger the setInterval callback (tick.value++)
    vi.advanceTimersByTime(60000);
    await vi.runAllTicks();

    // Unmount component to trigger onUnmounted and clearInterval
    wrapper.unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
