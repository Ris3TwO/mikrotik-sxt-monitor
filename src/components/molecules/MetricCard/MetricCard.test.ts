import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MetricCard from "./MetricCard.vue";

describe("MetricCard.vue", () => {
  it("should render title and default slot content correctly", () => {
    const wrapper = mount(MetricCard, {
      props: {
        title: "CPU Usage",
        glowColor: "bg-accent/5",
      },
      slots: {
        default: "<span data-testid='slot-content'>85%</span>",
      },
    });

    expect(wrapper.text()).toContain("CPU Usage");
    expect(wrapper.find('[data-testid="slot-content"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="slot-content"]').text()).toBe("85%");
  });

  it("should render header-action slot when provided", () => {
    const wrapper = mount(MetricCard, {
      props: {
        title: "Memory",
      },
      slots: {
        "header-action": "<button data-testid='action-btn'>Refresh</button>",
        default: "<div>4GB</div>",
      },
    });

    expect(wrapper.find('[data-testid="action-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="action-btn"]').text()).toBe("Refresh");
  });

  it("should apply glowColor class to the background blur element", () => {
    const wrapper = mount(MetricCard, {
      props: {
        title: "Signal",
        glowColor: "bg-brand-turquoise/5",
      },
    });

    const glowDiv = wrapper.find(".absolute.top-0.right-0");
    expect(glowDiv.classes()).toContain("bg-brand-turquoise/5");
  });
});
