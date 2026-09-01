import { ref, onMounted } from "vue";
import { notify } from "@kyvg/vue3-notification";
import { invoke } from "@tauri-apps/api/core";
import { LoginCredentials } from "@/types";

export const useAuth = (
  onSuccess: (credentials: LoginCredentials) => void,
  t: (key: string, params?: Record<string, unknown>) => string,
) => {
  const ip = ref<string>("");
  const user = ref<string>("");
  const pass = ref<string>("");
  const rememberPass = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  const showPassword = ref<boolean>(false);

  onMounted(() => {
    ip.value = localStorage.getItem("mikrotik_ip") || "";
    user.value = localStorage.getItem("mikrotik_user") || "";
    const shouldRemember = localStorage.getItem("mikrotik_remember") === "true";
    rememberPass.value = shouldRemember;

    if (shouldRemember && localStorage.getItem("mikrotik_pass")) {
      pass.value = localStorage.getItem("mikrotik_pass") || "";

      handleLogin().catch((err) => {
        notify({
          title: t("login.notify.error.auto_login_failed.title"),
          text:
            err instanceof Error
              ? err.message
              : t("login.notify.error.auto_login_failed.text"),
          type: "error",
        });
      });
    }
  });

  const handleLogin = async (): Promise<void> => {
    const trimmedIp = ip.value.trim();
    const trimmedUser = user.value.trim();

    if (!trimmedIp || !trimmedUser || !pass.value) {
      notify({
        title: t("login.notify.error.missing_fields.title"),
        text: t("login.notify.error.missing_fields.text"),
        type: "error",
      });
      return;
    }

    isLoading.value = true;
    const timerPromise = new Promise<void>((res) => setTimeout(res, 1500));
    const apiPromise = invoke<unknown>("test_mikrotik_connection", {
      ip: trimmedIp,
      user: trimmedUser,
      pass: pass.value,
    });

    try {
      await Promise.all([apiPromise, timerPromise]);

      localStorage.setItem("mikrotik_ip", trimmedIp);
      localStorage.setItem("mikrotik_user", trimmedUser);
      localStorage.setItem("mikrotik_remember", String(rememberPass.value));

      if (rememberPass.value) {
        localStorage.setItem("mikrotik_pass", pass.value);
      } else {
        localStorage.removeItem("mikrotik_pass");
      }

      notify({
        title: t("login.notify.success.title"),
        text: t("login.notify.success.text"),
        type: "success",
      });
      onSuccess({ ip: trimmedIp, user: trimmedUser, pass: pass.value });
    } catch (err: unknown) {
      await timerPromise;
      const errorMsg =
        typeof err === "string" ? err : "Credenciales inválidas.";
      notify({
        title: t("login.notify.error.authenticationFailed.title"),
        text: t("login.notify.error.authenticationFailed.text", {
          error: errorMsg,
        }),
        type: "error",
      });
    } finally {
      isLoading.value = false;
    }
  };

  return {
    ip,
    user,
    pass,
    rememberPass,
    isLoading,
    showPassword,
    handleLogin,
  };
};
