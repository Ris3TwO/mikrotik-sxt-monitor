import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import StatusDot from "./StatusDot.vue";

describe("StatusDot.vue", () => {
  it("should render accent background class when connected is true", () => {
    const wrapper = mount(StatusDot, {
      props: {
        connected: true,
      },
    });

    const span = wrapper.find("span");
    expect(span.classes()).toContain("bg-accent");
    expect(span.classes()).not.toContain("bg-red-500");
    expect(span.classes()).toContain("animate-pulse");
  });

  it("should render red background class when connected is false", () => {
    const wrapper = mount(StatusDot, {
      props: {
        connected: false,
      },
    });

    const span = wrapper.find("span");
    expect(span.classes()).toContain("bg-red-500");
    expect(span.classes()).not.toContain("bg-accent");
    expect(span.classes()).toContain("animate-pulse");
  });
});
