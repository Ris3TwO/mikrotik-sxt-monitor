<script setup>
import { useAuth } from "@/composables/useAuth";
import NetworkInput from "@/components/atoms/NetworkInput.vue";
import NetworkButton from "@/components/atoms/NetworkButton.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const emit = defineEmits(["login-success"]);

const { ip, user, pass, rememberPass, isLoading, showPassword, handleLogin } =
  useAuth((credentials) => emit("login-success", credentials), t);
</script>

<template>
  <div
    class="min-dvh-screen bg-canvas flex items-center justify-center p-6 font-sans"
  >
    <div
      class="w-full max-w-sm mx-auto overflow-hidden bg-surface rounded-2xl border border-muted/10 shadow-2xl"
    >
      <!-- Cabecera con tu Branding -->
      <div class="px-6 pt-6 pb-4 text-center">
        <!-- Tu Isotipo / Logo limpio sin caja contenedora -->
        <div class="flex justify-center mx-auto mb-3">
          <img
            src="@/assets/images/logo-oc.svg"
            alt="Logo"
            class="w-12 h-12 object-contain"
          />
        </div>

        <!-- Título de la App y tu Marca -->
        <h3 class="text-xl font-mono font-bold text-main">
          NOC Access Gateway
        </h3>
        <p class="mt-1 text-xs text-muted font-mono">
          On Coder's <span class="text-accent">•</span> Expertise & Connection
        </p>
      </div>

      <!-- Formulario principal con Componentes Atómicos -->
      <div class="px-6 pb-6">
        <form @submit.prevent="handleLogin" class="space-y-4">
          <NetworkInput
            v-model="ip"
            :label="t('login.ip_address')"
            placeholder="192.168.88.1"
          />

          <NetworkInput
            v-model="user"
            :label="t('login.username')"
            placeholder="admin"
          />

          <NetworkInput
            v-model="pass"
            :label="t('login.password')"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            :showPasswordToggle="true"
            :showPassword="showPassword"
            @toggle-password="showPassword = !showPassword"
          />

          <!-- Checkbox recordar credenciales -->
          <div class="flex items-center gap-2 pt-1 font-mono text-xs">
            <input
              v-model="rememberPass"
              type="checkbox"
              id="remember"
              class="w-4 h-4 accent-accent rounded cursor-pointer"
            />
            <label for="remember" class="text-muted cursor-pointer select-none">
              {{ t("login.remember_password") }}
            </label>
          </div>

          <!-- Botón Atómico -->
          <NetworkButton :isLoading="isLoading" type="submit">
            {{
              isLoading ? t("login.loginButtonLoading") : t("login.loginButton")
            }}
          </NetworkButton>
        </form>
      </div>

      <!-- Pie de tarjeta con mención técnica y de autoría -->
      <div
        class="flex flex-col items-center justify-center py-3 text-center bg-surface/50 border-t border-muted/10 font-mono space-y-1"
      >
        <div class="flex items-center">
          <span class="text-xs text-muted">{{ t("login.engine") }}: </span>
          <span class="ml-1.5 text-xs font-bold text-accent"
            >MikroTik Direct API REST</span
          >
        </div>
        <div class="text-xs text-muted/80">
          Developed by
          <span class="font-semibold text-primary">On Coder's</span>
        </div>
      </div>
    </div>
  </div>
</template>
