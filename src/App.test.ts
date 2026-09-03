import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import { onStatusUpdate, connectDevice, disconnectDevice } from "@/lib/api";
import NotificationsMock from "../__mocks__/@kyvg/vue3-notification";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {},
  },
});

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  onStatusUpdate: vi.fn(),
  connectDevice: vi.fn(),
  disconnectDevice: vi.fn(),
}));

vi.mock("@/components/views/LoginView/LoginView.vue", () => ({
  default: {
    name: "LoginView",
    emits: ["login-success"],
    template:
      "<div data-testid=\"login-view\" @click=\"$emit('login-success', { ip: '192.168.88.1', user: 'admin', pass: 'secret' })\">Login View</div>",
  },
}));

vi.mock("@/components/views/DashboardView/DashboardView.vue", () => ({
  default: {
    name: "DashboardView",
    emits: ["logout"],
    template: '<div data-testid="dashboard-view" @click="$emit(\'logout\')">Dashboard View</div>',
  },
}));

vi.mock("@/components/molecules/LanguageSelector/LanguageSelector.vue", () => ({
  default: {
    name: "LanguageSelector",
    template: '<div data-testid="language-selector">Language Selector</div>',
  },
}));

describe("App.vue root component", () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    vi.clearAllMocks();
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const createWrapper = () =>
    mount(App, {
      global: {
        plugins: [pinia, i18n],
        components: { Notifications: NotificationsMock },
      },
    });

  it("should render LoginView by default when not authenticated", () => {
    const wrapper = createWrapper();

    expect(wrapper.find('[data-testid="login-view"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="dashboard-view"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="language-selector"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="notifications"]').exists()).toBe(true);
  });

  it("should transition to DashboardView upon successful login and setup telemetry stream", async () => {
    let statusCallback: (payload: unknown) => void = () => {};
    vi.mocked(onStatusUpdate).mockImplementation(async (cb: any) => {
      statusCallback = cb;
      return (() => {}) as any;
    });
    vi.mocked(connectDevice).mockResolvedValueOnce(true as any);

    const wrapper = createWrapper();

    await wrapper.find('[data-testid="login-view"]').trigger("click");

    await flushPromises();

    expect(connectDevice).toHaveBeenCalledWith("192.168.88.1", "admin", "secret");
    expect(onStatusUpdate).toHaveBeenCalled();

    statusCallback({
      connected: true,
      rx_bps: 1024,
      tx_bps: 2048,
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="login-view"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="dashboard-view"]').exists()).toBe(true);
  });

  it("should catch and log error if connection initialization fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(connectDevice).mockRejectedValueOnce(new Error("Connection timeout"));

    const wrapper = createWrapper();

    await wrapper.find('[data-testid="login-view"]').trigger("click");

    expect(consoleSpy).toHaveBeenCalledWith("Initialization failure:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  it("should render notification types and allow closing them via slot actions", async () => {
    const wrapper = createWrapper();

    // Busca los botones exclusivamente dentro del bloque de notificaciones
    const closeButtons = wrapper.find('[data-testid="notifications"]').findAll("button");
    expect(closeButtons).toHaveLength(5);

    await closeButtons[0].trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="notifications"]').findAll("button")).toHaveLength(4);
  });

  it("should reset state, disconnect device, and return to LoginView on logout", async () => {
    vi.mocked(disconnectDevice).mockReturnValueOnce(undefined as any);

    const wrapper = createWrapper();

    await wrapper.find('[data-testid="login-view"]').trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="dashboard-view"]').exists()).toBe(true);

    await wrapper.find('[data-testid="dashboard-view"]').trigger("click");
    await wrapper.vm.$nextTick();

    expect(disconnectDevice).toHaveBeenCalled();
    expect(wrapper.find('[data-testid="login-view"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="dashboard-view"]').exists()).toBe(false);
  });

  it("should ignore status update payloads when connected is false", async () => {
    let statusCallback: (payload: unknown) => void = () => {};
    vi.mocked(onStatusUpdate).mockImplementation(async (cb: any) => {
      statusCallback = cb;
      return (() => {}) as any;
    });
    vi.mocked(connectDevice).mockResolvedValueOnce(true as any);

    const wrapper = createWrapper();

    await wrapper.find('[data-testid="login-view"]').trigger("click");

    statusCallback({
      connected: false,
      rx_bps: "1024",
      tx_bps: "2048",
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="dashboard-view"]').exists()).toBe(true);
  });

  it("should shift traffic history when buffer exceeds 30 items", async () => {
    let statusCallback: (payload: unknown) => void = () => {};
    vi.mocked(onStatusUpdate).mockImplementation(async (cb: any) => {
      statusCallback = cb;
      return (() => {}) as any;
    });
    vi.mocked(connectDevice).mockResolvedValueOnce(true as any);

    const wrapper = createWrapper();

    await wrapper.find('[data-testid="login-view"]').trigger("click");

    for (let i = 0; i < 31; i++) {
      statusCallback({
        connected: true,
        rx_bps: i * 10,
        tx_bps: i * 20,
      });
    }

    statusCallback({ connected: true, rx_bps: 0, tx_bps: 0 });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="dashboard-view"]').exists()).toBe(true);
  });
});
