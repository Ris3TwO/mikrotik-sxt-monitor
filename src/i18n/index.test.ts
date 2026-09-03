import { describe, it, expect, beforeEach, vi } from "vitest";
import { getInitialLocale } from "./index";

describe("getInitialLocale", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("should return saved locale from localStorage when valid", () => {
    localStorage.setItem("user-locale", "es");
    expect(getInitialLocale()).toBe("es");
  });

  it("should ignore invalid saved locale in localStorage and use navigator language", () => {
    localStorage.setItem("user-locale", "fr");
    Object.defineProperty(navigator, "language", {
      value: "es-AR",
      configurable: true,
    });

    expect(getInitialLocale()).toBe("es");
  });

  it('should fallback to "en" if navigator language is unsupported', () => {
    Object.defineProperty(navigator, "language", {
      value: "ja-JP",
      configurable: true,
    });

    expect(getInitialLocale()).toBe("en");
  });

  it('should fallback to "en" if navigator.language is undefined', () => {
    Object.defineProperty(navigator, "language", {
      value: undefined,
      configurable: true,
    });

    expect(getInitialLocale()).toBe("en");
  });
});
