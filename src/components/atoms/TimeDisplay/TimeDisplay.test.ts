import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { computed } from "vue";
import TimeDisplay from "./TimeDisplay.vue";
import { useRelativeTime } from "@/composables";

vi.mock("@/composables", () => ({
  useRelativeTime: vi.fn(),
}));

describe("TimeDisplay.vue", () => {
  it("should render relative time and attributes correctly and invoke the getter", () => {
    let capturedGetter: (() => any) | undefined;

    vi.mocked(useRelativeTime).mockImplementation((getter: any) => {
      capturedGetter = getter;
      return {
        relativeTime: computed(() => "5 minutes ago"),
        exactTimestamp: computed(() => "2026-09-03 17:34:08"),
      };
    });

    const timestampStr = "2026-09-03T17:34:08Z";
    const wrapper = mount(TimeDisplay, {
      props: {
        timestamp: timestampStr,
      },
    });

    // Invoke the captured getter to hit the line/function branch for coverage
    expect(capturedGetter?.()).toBe(timestampStr);

    const timeElement = wrapper.find("time");
    expect(timeElement.exists()).toBe(true);
    expect(timeElement.text()).toBe("5 minutes ago");
    expect(timeElement.attributes("datetime")).toBe(timestampStr);
    expect(timeElement.attributes("title")).toBe("2026-09-03 17:34:08");
  });

  it("should handle null or undefined timestamp gracefully", () => {
    vi.mocked(useRelativeTime).mockImplementation((getter: any) => {
      // Also exercise the getter here when timestamp is null
      getter?.();
      return {
        relativeTime: computed(() => "N/A"),
        exactTimestamp: computed(() => ""),
      };
    });

    const wrapper = mount(TimeDisplay, {
      props: {
        timestamp: null,
      },
    });

    const timeElement = wrapper.find("time");
    expect(timeElement.attributes("datetime")).toBeUndefined();
    expect(timeElement.text()).toBe("N/A");
  });
});
