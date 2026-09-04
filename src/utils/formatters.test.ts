import { describe, it, expect } from "vitest";
import dayjs from "dayjs";
import { formatBps, setDayjsLocale } from "./formatters";

describe("formatters utility", () => {
  describe("formatBps", () => {
    it('should return "0 bps" for null, undefined, 0, or invalid strings', () => {
      expect(formatBps(null)).toBe("0 bps");
      expect(formatBps(undefined)).toBe("0 bps");
      expect(formatBps(0)).toBe("0 bps");
      expect(formatBps("invalid")).toBe("0 bps");
    });

    it("should format raw bits into bps correctly", () => {
      expect(formatBps(500)).toBe("500 bps");
    });

    it("should format raw bits into Kbps correctly", () => {
      expect(formatBps(5000)).toBe("5.0 Kbps");
      expect(formatBps(150000)).toBe("150.0 Kbps");
    });

    it("should format raw bits into Mbps correctly", () => {
      expect(formatBps(1500000)).toBe("1.50 Mbps");
      expect(formatBps(50000000)).toBe("50.00 Mbps");
    });

    it("should format raw bits into Gbps correctly", () => {
      expect(formatBps(1500000000)).toBe("1.50 Gbps");
    });

    it("should accept numeric strings as input", () => {
      expect(formatBps("2500000")).toBe("2.50 Mbps");
    });
  });

  describe("setDayjsLocale", () => {
    it("should set valid supported locales", () => {
      setDayjsLocale("es");
      expect(dayjs.locale()).toBe("es");

      setDayjsLocale("en");
      expect(dayjs.locale()).toBe("en");
    });

    it("should fallback to English for unsupported locales", () => {
      setDayjsLocale("fr");
      expect(dayjs.locale()).toBe("en");
    });
  });
});
