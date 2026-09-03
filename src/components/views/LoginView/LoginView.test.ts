import { describe, it, expect, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import LoginView from "@/components/views/LoginView/LoginView.vue";
import { createI18n } from "vue-i18n";
import { ref } from "vue";

const mockIp = ref("192.168.88.1");
const mockUser = ref("admin");
const mockPass = ref("secret");
const mockRememberPass = ref(false);
const mockIsLoading = ref(false);
const mockShowPassword = ref(false);

let capturedCallback: ((creds: any) => void) | null = null;

vi.mock("@/composables", () => ({
  useAuth: (onSuccess: (creds: any) => void) => {
    capturedCallback = onSuccess;
    return {
      ip: mockIp,
      user: mockUser,
      pass: mockPass,
      rememberPass: mockRememberPass,
      isLoading: mockIsLoading,
      showPassword: mockShowPassword,
      handleLogin: () => {
        if (capturedCallback) {
          capturedCallback({
            ip: mockIp.value,
            user: mockUser.value,
            pass: mockPass.value,
            remember: mockRememberPass.value,
          });
        }
      },
    };
  },
}));

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      login: {
        ip_address: "IP Address",
        username: "Username",
        password: "Password",
        remember_password: "Remember password",
        loginButton: "Connect",
        loginButtonLoading: "Connecting...",
        engine: "Engine",
      },
    },
  },
});

describe("LoginView.vue", () => {
  it("should render correctly and emit login-success with credentials on submit", async () => {
    mockIp.value = "192.168.88.1";
    mockUser.value = "admin";
    mockPass.value = "secret";
    mockRememberPass.value = false;

    const wrapper = mount(LoginView, {
      global: {
        plugins: [i18n],
      },
    });

    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(wrapper.emitted("login-success")).toBeTruthy();
    const emittedEvents = wrapper.emitted("login-success") as any[];
    expect(emittedEvents[0][0]).toMatchObject({
      ip: "192.168.88.1",
      user: "admin",
      pass: "secret",
      remember: false,
    });
  });

  it("should update input values via NetworkInput bindings", async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [i18n],
      },
    });

    const inputs = wrapper.findAllComponents({ name: "NetworkInput" });

    // Disparamos el evento de actualización que activa el v-model de cada NetworkInput (Líneas 47-52)
    await inputs[0].vm.$emit("update:modelValue", "10.0.0.1");
    await inputs[1].vm.$emit("update:modelValue", "root");
    await inputs[2].vm.$emit("update:modelValue", "my-secure-pass");

    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(wrapper.emitted("login-success")).toBeTruthy();
    const emittedEvents = wrapper.emitted("login-success") as any[];
    expect(emittedEvents[0][0]).toMatchObject({
      ip: "10.0.0.1",
      user: "root",
      pass: "my-secure-pass",
    });
  });

  it("should handle rememberPass checkbox toggle and include it in submission", async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [i18n],
      },
    });

    // Interactuamos directamente con el checkbox nativo para activar la línea del v-model (Línea 64)
    const checkbox = wrapper.find('input[type="checkbox"]#remember');
    await checkbox.setValue(true);

    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(wrapper.emitted("login-success")).toBeTruthy();
    const emittedEvents = wrapper.emitted("login-success") as any[];
    expect(emittedEvents[0][0]).toMatchObject({
      remember: true,
    });
  });

  it("should display loading state and change button text when isLoading is true", async () => {
    mockIsLoading.value = true;

    const wrapper = mount(LoginView, {
      global: {
        plugins: [i18n],
      },
    });

    const button = wrapper.findComponent({ name: "NetworkButton" });
    expect(button.props("isLoading")).toBe(true);
    expect(wrapper.text()).toContain("Connecting...");

    mockIsLoading.value = false;
  });

  it("should toggle password visibility", async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [i18n],
      },
    });

    const passwordInput = wrapper.findAllComponents({ name: "NetworkInput" })[2];
    await passwordInput.vm.$emit("toggle-password");

    expect(passwordInput.props("type")).toBe("text");
  });
});
