import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import TrafficChart from "./TrafficChart.vue";
import { TrafficPoint } from "@/types";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("vue-chartjs", () => ({
  Line: {
    name: "LineChart",
    props: ["data", "options"],
    template: '<div data-testid="line-chart" :data-history-length="data.labels.length"></div>',
  },
}));

describe("TrafficChart.vue", () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const createWrapper = (history: TrafficPoint[]) => {
    return mount(TrafficChart, {
      global: {
        plugins: [pinia],
      },
      props: {
        history,
      },
    });
  };

  it("should render section headers and line chart component with empty history", () => {
    const wrapper = createWrapper([]);

    expect(wrapper.text()).toContain("dashboard.linkPerformance");
    expect(wrapper.text()).toContain("dashboard.liveTransferRate");
    const chart = wrapper.find('[data-testid="line-chart"]');
    expect(chart.exists()).toBe(true);
    expect(chart.attributes("data-history-length")).toBe("0");
  });

  it("should compute chart labels and scale rx/tx data values correctly when history points are provided", () => {
    const historyData: TrafficPoint[] = [
      { time: "10:00:00", rx: 20000, tx: 40000 },
      { time: "10:00:01", rx: 60000, tx: 80000 },
    ];

    const wrapper = createWrapper(historyData);
    const chart = wrapper.find('[data-testid="line-chart"]');

    expect(chart.exists()).toBe(true);
    expect(chart.attributes("data-history-length")).toBe("2");

    const vm = wrapper.vm as any;
    expect(vm.chartData.labels).toEqual(["10:00:00", "10:00:01"]);
    expect(vm.chartData.datasets[0].data).toEqual([20, 60]);
    expect(vm.chartData.datasets[1].data).toEqual([40, 80]);
  });
});
