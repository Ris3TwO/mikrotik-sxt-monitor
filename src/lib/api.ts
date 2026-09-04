import { DeviceStatus } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

/**
 * Connects to the MikroTik device using the provided credentials via Tauri IPC.
 *
 * @param {string} ip - The target device IP address.
 * @param {string} user - The authentication username.
 * @param {string} pass - The authentication password.
 * @returns {Promise<unknown>} A promise that resolves when the connection attempt completes.
 */
export const connectDevice = (ip: string, user: string, pass: string) =>
  invoke("connect_device", { ip, user, pass });

/**
 * Disconnects from the current MikroTik device via Tauri IPC.
 *
 * @returns {Promise<unknown>} A promise that resolves when the disconnection completes.
 */
export const disconnectDevice = () => invoke("disconnect_device");

/**
 * Listens for real-time device status updates emitted from the Tauri backend.
 * Waits for Tauri internals to be fully initialized before registering the event listener.
 *
 * @param {function(DeviceStatus): void} callback - Function executed when a new status update payload is received.
 * @returns {Promise<function(): void>} A promise resolving to an unlisten function to clean up the event subscription.
 */
export const onStatusUpdate = async (
  callback: (payload: DeviceStatus) => void,
) => {
  // Wait for Tauri internals to become available in the window object
  while (
    typeof window !== "undefined" &&
    !(window as any).__TAURI_INTERNALS__
  ) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  // Register the event listener for device status payloads
  return await listen<DeviceStatus>("device-status-update", (event) => {
    callback(event.payload);
  });
};
