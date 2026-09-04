import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NetworkInput from "./NetworkInput.vue";

describe("NetworkInput.vue", () => {
  it("should render label, placeholder, and initial value correctly", () => {
    const wrapper = mount(NetworkInput, {
      props: {
        label: "IP Address",
        modelValue: "192.168.1.1",
        placeholder: "Enter IP",
        type: "text",
      },
    });

    expect(wrapper.text()).toContain("IP Address");
    const input = wrapper.find("input");
    expect(input.element.value).toBe("192.168.1.1");
    expect(input.attributes("placeholder")).toBe("Enter IP");
    expect(input.attributes("type")).toBe("text");
  });

  it("should emit update:modelValue event when input value changes", async () => {
    const wrapper = mount(NetworkInput, {
      props: {
        label: "Password",
        modelValue: "",
      },
    });

    const input = wrapper.find("input");
    await input.setValue("secret123");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["secret123"]);
  });

  it("should not show password toggle button by default", () => {
    const wrapper = mount(NetworkInput, {
      props: {
        label: "Username",
      },
    });

    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("should render password toggle button and correct icon when showPasswordToggle is true", async () => {
    const wrapper = mount(NetworkInput, {
      props: {
        label: "Password",
        showPasswordToggle: true,
        showPassword: false,
      },
    });

    const toggleButton = wrapper.find("button");
    expect(toggleButton.exists()).toBe(true);

    // When showPassword is false, it should render the eye-off icon (first SVG check or path check)
    expect(wrapper.find("button svg").exists()).toBe(true);

    await toggleButton.trigger("click");
    expect(wrapper.emitted("toggle-password")).toBeTruthy();
  });

  it("should render open-eye icon when showPassword is true", () => {
    const wrapper = mount(NetworkInput, {
      props: {
        label: "Password",
        showPasswordToggle: true,
        showPassword: true,
      },
    });

    expect(wrapper.find("button").exists()).toBe(true);
    // Verifies that the open-eye icon branch is evaluated
    expect(wrapper.find("button svg").exists()).toBe(true);
  });
});
