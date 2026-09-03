import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NetworkButton from "./NetworkButton.vue";

describe("NetworkButton.vue", () => {
  it('should render default slot content and type="button" by default', () => {
    const wrapper = mount(NetworkButton, {
      slots: {
        default: "Connect",
      },
    });

    expect(wrapper.text()).toContain("Connect");
    expect(wrapper.attributes("type")).toBe("button");
    expect(wrapper.find("svg").exists()).toBe(false);
    expect(wrapper.attributes("disabled")).toBeUndefined();
  });

  it("should apply custom type prop correctly", () => {
    const wrapper = mount(NetworkButton, {
      props: {
        type: "submit",
      },
    });

    expect(wrapper.attributes("type")).toBe("submit");
  });

  it("should show loading spinner and disable button when isLoading is true", () => {
    const wrapper = mount(NetworkButton, {
      props: {
        isLoading: true,
      },
    });

    expect(wrapper.find("svg").exists()).toBe(true);
    expect(wrapper.attributes("disabled")).toBeDefined();
  });

  it("should disable button when disabled prop is true", () => {
    const wrapper = mount(NetworkButton, {
      props: {
        disabled: true,
      },
    });

    expect(wrapper.attributes("disabled")).toBeDefined();
  });

  it("should emit click event when clicked and not disabled/loading", async () => {
    const wrapper = mount(NetworkButton);

    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });
});
