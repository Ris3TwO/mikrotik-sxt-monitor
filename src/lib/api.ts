import { DeviceStatus } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export const connectDevice = (ip: string, user: string, pass: string) =>
  invoke("connect_device", { ip, user, pass });

export const disconnectDevice = () => invoke("disconnect_device");

export const onStatusUpdate = async (
  callback: (payload: DeviceStatus) => void,
) => {
  while (
    typeof window !== "undefined" &&
    !(window as any).__TAURI_INTERNALS__
  ) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return await listen<DeviceStatus>("device-status-update", (event) => {
    callback(event.payload);
  });
};
