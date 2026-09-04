/**
 * Application instance creator initializing Pinia, Notifications, and i18n.
 */
import { createApp } from "vue";
import { createPinia } from "pinia";
import Notifications from "@kyvg/vue3-notification";
import App from "./App.vue";
import "./styles/main.css";
import i18n from "./i18n";

export const mountApp = () => {
  return createApp(App).use(createPinia()).use(Notifications).use(i18n).mount("#app");
};
