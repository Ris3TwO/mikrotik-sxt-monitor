import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import LanguageSelector from "./LanguageSelector.vue";
import { setDayjsLocale } from "@/utils/formatters";

const mockLocale = ref("es");
const mockT = vi.fn((key: string) => key);

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: mockT,
    locale: mockLocale,
  }),
}));

vi.mock("@/utils/formatters", () => ({
  setDayjsLocale: vi.fn(),
}));

describe("LanguageSelector.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocale.value = "es";
    localStorage.clear();
    vi.spyOn(Storage.prototype, "setItem");
  });

  it("should render correctly and display current language styles", () => {
    const wrapper = mount(LanguageSelector);

    expect(wrapper.text()).toContain("settings.language");

    const buttons = wrapper.findAll("button");
    expect(buttons).toHaveLength(2);

    // ES button should have active styles when locale is 'es'
    expect(buttons[0].classes()).toContain("bg-accent/20");
    // EN button should have inactive styles
    expect(buttons[1].classes()).toContain("text-muted");
  });

  it("should change language to English when EN button is clicked", async () => {
    const wrapper = mount(LanguageSelector);
    const buttons = wrapper.findAll("button");

    // Click EN button (index 1)
    await buttons[1].trigger("click");

    expect(mockLocale.value).toBe("en");
    expect(setDayjsLocale).toHaveBeenCalledWith("en");
    expect(localStorage.setItem).toHaveBeenCalledWith("user-locale", "en");
  });

  it("should change language to Spanish when ES button is clicked while on English", async () => {
    mockLocale.value = "en";
    const wrapper = mount(LanguageSelector);
    const buttons = wrapper.findAll("button");

    // Click ES button (index 0)
    await buttons[0].trigger("click");

    expect(mockLocale.value).toBe("es");
    expect(setDayjsLocale).toHaveBeenCalledWith("es");
    expect(localStorage.setItem).toHaveBeenCalledWith("user-locale", "es");
  });
});
