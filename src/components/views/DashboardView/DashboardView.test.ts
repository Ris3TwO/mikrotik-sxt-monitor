import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import DashboardView from "./DashboardView.vue";
import { DeviceStatus, DeviceMeta, TrafficPoint } from "@/types";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe("DashboardView.vue", () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const createWrapper = (
    device: Partial<DeviceStatus>,
    deviceMeta: Partial<DeviceMeta>,
    history: TrafficPoint[] = []
  ) => {
    return mount(DashboardView, {
      global: {
        plugins: [pinia],
        stubs: {
          NocHeader: {
            template: '<div data-testid="noc-header" @click="$emit(\'logout\')">NocHeader</div>',
          },
          MetricGrid: {
            template: '<div data-testid="metric-grid">MetricGrid</div>',
          },
          TrafficChart: {
            template: '<div data-testid="traffic-chart">TrafficChart</div>',
          },
        },
      },
      props: {
        device: device as DeviceStatus,
        deviceMeta: deviceMeta as DeviceMeta,
        trafficHistory: history,
      },
    });
  };

  it("should render NocHeader and MetricGrid, but hide TrafficChart when device is not connected or ssid is missing", () => {
    const wrapper = createWrapper(
      { connected: false, ssid: "" },
      { name: "SXTsq", ip: "192.168.88.1", interface: "ether1" },
      []
    );

    expect(wrapper.find('[data-testid="noc-header"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="metric-grid"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="traffic-chart"]').exists()).toBe(false);
  });

  it("should render TrafficChart when device is connected and ssid is present", () => {
    const wrapper = createWrapper(
      { connected: true, ssid: "TestSSID" },
      { name: "SXTsq", ip: "192.168.88.1", interface: "ether1" },
      [{ time: "10:00:00", rx: 100, tx: 200 }]
    );

    expect(wrapper.find('[data-testid="noc-header"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="metric-grid"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="traffic-chart"]').exists()).toBe(true);
  });

  it("should forward logout event from NocHeader", async () => {
    const wrapper = createWrapper(
      { connected: true, ssid: "TestSSID" },
      { name: "SXTsq", ip: "192.168.88.1", interface: "ether1" }
    );

    await wrapper.find('[data-testid="noc-header"]').trigger("click");

    expect(wrapper.emitted("logout")).toBeTruthy();
    expect(wrapper.emitted("logout")?.length).toBe(1);
  });
});
