import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { useAuth } from "./useAuth";
import { invoke } from "@tauri-apps/api/core";
import { notify } from "@kyvg/vue3-notification";

// Mock Tauri invoke and notifications
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

vi.mock("@kyvg/vue3-notification", () => ({
  notify: vi.fn(),
}));

describe("useAuth composable", () => {
  const mockOnSuccess = vi.fn();
  const mockT = vi.fn((key: string) => key);

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with empty or default values", () => {
    let auth: ReturnType<typeof useAuth>;
    mount({
      setup() {
        auth = useAuth(mockOnSuccess, mockT);
        return {};
      },
      template: "<div />",
    });

    expect(auth!.ip.value).toBe("");
    expect(auth!.user.value).toBe("");
    expect(auth!.pass.value).toBe("");
    expect(auth!.rememberPass.value).toBe(false);
    expect(auth!.isLoading.value).toBe(false);
    expect(auth!.showPassword.value).toBe(false);
  });

  it("should notify and return early if login fields are missing", async () => {
    let auth: ReturnType<typeof useAuth>;
    mount({
      setup() {
        auth = useAuth(mockOnSuccess, mockT);
        return {};
      },
      template: "<div />",
    });

    auth!.ip.value = ""; // Missing fields

    await auth!.handleLogin();

    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "login.notify.error.missing_fields.title",
        type: "error",
      })
    );
    expect(invoke).not.toHaveBeenCalled();
  });

  it("should successfully handle login, store credentials, and trigger success callback", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(true);

    let auth: ReturnType<typeof useAuth>;
    mount({
      setup() {
        auth = useAuth(mockOnSuccess, mockT);
        return {};
      },
      template: "<div />",
    });

    auth!.ip.value = "192.168.88.1";
    auth!.user.value = "admin";
    auth!.pass.value = "secret";
    auth!.rememberPass.value = true;

    const loginPromise = auth!.handleLogin();

    // Fast-forward the 1.5s timer embedded in handleLogin
    vi.advanceTimersByTime(1500);
    await loginPromise;

    expect(invoke).toHaveBeenCalledWith("test_mikrotik_connection", {
      ip: "192.168.88.1",
      user: "admin",
      pass: "secret",
    });

    expect(localStorage.getItem("mikrotik_ip")).toBe("192.168.88.1");
    expect(localStorage.getItem("mikrotik_user")).toBe("admin");
    expect(localStorage.getItem("mikrotik_remember")).toBe("true");
    expect(localStorage.getItem("mikrotik_pass")).toBe("secret");

    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "login.notify.success.title",
        type: "success",
      })
    );

    expect(mockOnSuccess).toHaveBeenCalledWith({
      ip: "192.168.88.1",
      user: "admin",
      pass: "secret",
    });
  });

  it("should handle login failure and notify error", async () => {
    vi.mocked(invoke).mockRejectedValueOnce(new Error("Connection timeout"));

    let auth: ReturnType<typeof useAuth>;
    mount({
      setup() {
        auth = useAuth(mockOnSuccess, mockT);
        return {};
      },
      template: "<div />",
    });

    auth!.ip.value = "192.168.88.1";
    auth!.user.value = "admin";
    auth!.pass.value = "secret";

    const loginPromise = auth!.handleLogin();

    vi.advanceTimersByTime(1500);

    // Expect the login promise to reject since the error is now rethrown
    await expect(loginPromise).rejects.toThrow("Connection timeout");

    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "login.notify.error.authenticationFailed.title",
        type: "error",
      })
    );
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("should remove mikrotik_pass from localStorage when rememberPass is false", async () => {
    // Pre-populate localStorage with an old password
    localStorage.setItem("mikrotik_pass", "old-secret");
    localStorage.setItem("mikrotik_remember", "false");

    vi.mocked(invoke).mockResolvedValueOnce(true);

    let auth: ReturnType<typeof useAuth>;
    mount({
      setup() {
        auth = useAuth(mockOnSuccess, mockT);
        return {};
      },
      template: "<div />",
    });

    auth!.ip.value = "192.168.88.1";
    auth!.user.value = "admin";
    auth!.pass.value = "secret";
    auth!.rememberPass.value = false; // Ensure it's false

    const loginPromise = auth!.handleLogin();

    vi.advanceTimersByTime(1500);
    await loginPromise;

    // Verify that the password was removed from storage
    expect(localStorage.getItem("mikrotik_pass")).toBeNull();
    expect(localStorage.getItem("mikrotik_remember")).toBe("false");
  });

  describe("onMounted auto-login", () => {
    it("should load saved credentials from localStorage and trigger auto-login on mount", async () => {
      localStorage.setItem("mikrotik_ip", "192.168.88.1");
      localStorage.setItem("mikrotik_user", "admin");
      localStorage.setItem("mikrotik_remember", "true");
      localStorage.setItem("mikrotik_pass", "secret-pass");

      vi.mocked(invoke).mockResolvedValueOnce(true);

      let composableReturn: any;
      mount({
        setup() {
          composableReturn = useAuth(mockOnSuccess, mockT);
          return {};
        },
        template: "<div />",
      });

      expect(composableReturn.ip.value).toBe("192.168.88.1");
      expect(composableReturn.user.value).toBe("admin");
      expect(composableReturn.rememberPass.value).toBe(true);
      expect(composableReturn.pass.value).toBe("secret-pass");

      // Fast-forward timers and flush async microtasks
      vi.advanceTimersByTime(1500);
      await vi.runAllTimersAsync();
      await nextTick();

      expect(invoke).toHaveBeenCalledWith("test_mikrotik_connection", {
        ip: "192.168.88.1",
        user: "admin",
        pass: "secret-pass",
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("should handle auto-login failure and notify error on mount", async () => {
      localStorage.setItem("mikrotik_ip", "192.168.88.1");
      localStorage.setItem("mikrotik_user", "admin");
      localStorage.setItem("mikrotik_remember", "true");
      localStorage.setItem("mikrotik_pass", "wrong-pass");

      vi.mocked(invoke).mockRejectedValueOnce(new Error("Network error"));

      mount({
        setup() {
          useAuth(mockOnSuccess, mockT);
          return {};
        },
        template: "<div />",
      });

      vi.advanceTimersByTime(1500);
      await vi.runAllTimersAsync();
      await nextTick();

      expect(notify).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "login.notify.error.authenticationFailed.title",
          text: "login.notify.error.authenticationFailed.text",
          type: "error",
        })
      );
    });

    it("should handle auto-login failure with non-Error rejection and use fallback notification text", async () => {
      localStorage.setItem("mikrotik_ip", "192.168.88.1");
      localStorage.setItem("mikrotik_user", "admin");
      localStorage.setItem("mikrotik_remember", "true");
      localStorage.setItem("mikrotik_pass", "wrong-pass");

      // Reject with a plain string instead of an Error object
      vi.mocked(invoke).mockRejectedValueOnce("Some raw string error");

      mount({
        setup() {
          useAuth(mockOnSuccess, mockT);
          return {};
        },
        template: "<div />",
      });

      vi.advanceTimersByTime(1500);
      await vi.runAllTimersAsync();
      await nextTick();

      expect(notify).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "login.notify.error.auto_login_failed.title",
          text: "login.notify.error.auto_login_failed.text",
          type: "error",
        })
      );
    });
  });
});
