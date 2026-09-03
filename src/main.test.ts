import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./app-setup", () => ({
  mountApp: vi.fn(),
}));

describe("main.ts entry point", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should invoke mountApp when imported", async () => {
    // Dynamically import main.ts to execute its top-level side effect
    await import("./main");

    const { mountApp } = await import("./app-setup");
    expect(mountApp).toHaveBeenCalledOnce();
  });
});
