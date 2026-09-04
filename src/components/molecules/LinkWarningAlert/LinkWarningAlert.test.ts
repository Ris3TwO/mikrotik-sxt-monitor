import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import LinkWarningAlert from "./LinkWarningAlert.vue";

const mockT = vi.fn((key: string) => key);

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: mockT,
  }),
}));

describe("LinkWarningAlert.vue", () => {
  it("should not render when connected is true and ssid is provided", () => {
    const wrapper = mount(LinkWarningAlert, {
      props: {
        connected: true,
        ssid: "HomeNetwork",
      },
    });

    expect(wrapper.find("div").exists()).toBe(false);
  });

  it("should render unreachable alert when connected is false", () => {
    const wrapper = mount(LinkWarningAlert, {
      props: {
        connected: false,
        ssid: "HomeNetwork",
      },
    });

    expect(wrapper.find("div").exists()).toBe(true);
    expect(wrapper.text()).toContain("dashboard.linkAlert.title");
    expect(wrapper.text()).toContain("dashboard.linkAlert.unreachable");
  });

  it("should render unassociated alert when connected is true but ssid is missing", () => {
    const wrapper = mount(LinkWarningAlert, {
      props: {
        connected: true,
        ssid: null,
      },
    });

    expect(wrapper.find("div").exists()).toBe(true);
    expect(wrapper.text()).toContain("dashboard.linkAlert.title");
    expect(wrapper.text()).toContain("dashboard.linkAlert.unassociated");
  });
});
