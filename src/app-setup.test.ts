import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountApp } from "./app-setup";

const mockMount = vi.fn();
const mockUse = vi.fn().mockReturnThis();

vi.mock("vue", async () => {
  const actual = await vi.importActual<typeof import("vue")>("vue");
  return {
    ...actual,
    createApp: vi.fn(() => ({
      use: mockUse,
      mount: mockMount,
    })),
  };
});

vi.mock("./App.vue", () => ({ default: {} }));
vi.mock("./styles/main.css", () => ({}));

describe("App Setup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("should initialize Vue application with Pinia, Notifications, i18n and mount to #app", async () => {
    mountApp();

    const { createApp } = await import("vue");
    expect(createApp).toHaveBeenCalled();
    expect(mockUse).toHaveBeenCalledTimes(3);
    expect(mockMount).toHaveBeenCalledWith("#app");
  });
});
