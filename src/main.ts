/**
 * Application entry point initializing the Vue 3 instance, Pinia state management,
 * global notification plugins, internationalization support, and mounting the root component.
 */
import { createApp } from "vue";
import { createPinia } from 'pinia';
import Notifications from '@kyvg/vue3-notification'
import App from "./App.vue";
import './styles/main.css';
import i18n from "./i18n";

createApp(App).use(createPinia()).use(Notifications).use(i18n).mount('#app');