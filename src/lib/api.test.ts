import { describe, it, expect, vi, beforeEach } from 'vitest';
import { connectDevice, disconnectDevice, onStatusUpdate } from './api';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// Mock Tauri core and event APIs
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(),
}));

describe('Tauri API client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).__TAURI_INTERNALS__;
  });

  it('should invoke connect_device with correct parameters', async () => {
    await connectDevice('192.168.88.1', 'admin', 'secret');
    expect(invoke).toHaveBeenCalledWith('connect_device', {
      ip: '192.168.88.1',
      user: 'admin',
      pass: 'secret',
    });
  });

  it('should invoke disconnect_device', async () => {
    await disconnectDevice();
    expect(invoke).toHaveBeenCalledWith('disconnect_device');
  });

  describe('onStatusUpdate', () => {
    it('should wait for __TAURI_INTERNALS__ and register event listener', async () => {
      // Simulate Tauri internals becoming available immediately
      (window as any).__TAURI_INTERNALS__ = true;

      const mockUnlisten = vi.fn();
      vi.mocked(listen).mockResolvedValueOnce(mockUnlisten as any);

      const callback = vi.fn();
      const unlisten = await onStatusUpdate(callback);

      expect(listen).toHaveBeenCalledWith('device-status-update', expect.any(Function));
      expect(unlisten).toBe(mockUnlisten);
    });

    it('should wait for __TAURI_INTERNALS__ if it is not immediately available', async () => {
      // Leave __TAURI_INTERNALS__ undefined initially to trigger the while loop
      const mockUnlisten = vi.fn();
      vi.mocked(listen).mockResolvedValueOnce(mockUnlisten as any);

      const callback = vi.fn();
      const promise = onStatusUpdate(callback);

      // Simulate Tauri internals appearing after a short delay
      setTimeout(() => {
        (window as any).__TAURI_INTERNALS__ = true;
      }, 60);

      const unlisten = await promise;

      expect(listen).toHaveBeenCalledWith('device-status-update', expect.any(Function));
      expect(unlisten).toBe(mockUnlisten);
    });

    it('should trigger callback when status update event occurs', async () => {
      (window as any).__TAURI_INTERNALS__ = true;

      let capturedHandler: any;
      vi.mocked(listen).mockImplementationOnce((_, handler) => {
        capturedHandler = handler;
        return Promise.resolve(vi.fn() as any);
      });

      const callback = vi.fn();
      await onStatusUpdate(callback);

      // Simulate event payload from Tauri backend
      const payload = { connected: true, signal_dbm: -62 };
      capturedHandler({ payload });

      expect(callback).toHaveBeenCalledWith(payload);
    });
  });
});