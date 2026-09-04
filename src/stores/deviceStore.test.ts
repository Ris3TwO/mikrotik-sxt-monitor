import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDeviceStore } from './deviceStore';

describe('useDeviceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should have initial default state', () => {
    const store = useDeviceStore();
    expect(store.connected).toBe(false);
    expect(store.signal_dbm).toBeNull();
    expect(store.tx_ccq).toBeNull();
    expect(store.traffic_history).toEqual([]);
  });

  describe('getters: signalColor & signalBgColor', () => {
    it('should return muted classes when signal_dbm is null', () => {
      const store = useDeviceStore();
      store.signal_dbm = null;
      expect(store.signalColor).toBe('text-muted');
      expect(store.signalBgColor).toBe('bg-muted/20');
    });

    it('should return emerald classes for strong signal (> -65)', () => {
      const store = useDeviceStore();
      store.signal_dbm = -60;
      expect(store.signalColor).toBe('text-emerald-400');
      expect(store.signalBgColor).toBe('bg-emerald-400');
    });

    it('should return amber classes for moderate signal (-65 to -75)', () => {
      const store = useDeviceStore();
      store.signal_dbm = -70;
      expect(store.signalColor).toBe('text-amber-400');
      expect(store.signalBgColor).toBe('bg-amber-400');
    });

    it('should return red classes for poor signal (< -75)', () => {
      const store = useDeviceStore();
      store.signal_dbm = -80;
      expect(store.signalColor).toBe('text-red-400');
      expect(store.signalBgColor).toBe('bg-red-400');
    });
  });

  describe('getters: ccqColor & ccqBgColor', () => {
    it('should return muted classes when tx_ccq is null', () => {
      const store = useDeviceStore();
      store.tx_ccq = null;
      expect(store.ccqColor).toBe('text-muted');
      expect(store.ccqBgColor).toBe('bg-muted/20');
    });

    it('should return turquoise classes for high CCQ (>= 80)', () => {
      const store = useDeviceStore();
      store.tx_ccq = 85;
      expect(store.ccqColor).toBe('text-brand-turquoise');
      expect(store.ccqBgColor).toBe('bg-brand-turquoise');
    });

    it('should return amber classes for medium CCQ (60 to 79)', () => {
      const store = useDeviceStore();
      store.tx_ccq = 70;
      expect(store.ccqColor).toBe('text-amber-400');
      expect(store.ccqBgColor).toBe('bg-amber-400');
    });

    it('should return red classes for low CCQ (< 60)', () => {
      const store = useDeviceStore();
      store.tx_ccq = 45;
      expect(store.ccqColor).toBe('text-red-400');
      expect(store.ccqBgColor).toBe('bg-red-400');
    });
  });

  describe('actions', () => {
    it('should update state using updateStatus action', () => {
      const store = useDeviceStore();
      store.updateStatus({ connected: true, signal_dbm: -55, device_name: 'MikroTik-SXT' });
      expect(store.connected).toBe(true);
      expect(store.signal_dbm).toBe(-55);
      expect(store.device_name).toBe('MikroTik-SXT');
    });

    it('should reset state back to initial values', () => {
      const store = useDeviceStore();
      store.updateStatus({ connected: true, signal_dbm: -50 });
      store.reset();
      expect(store.connected).toBe(false);
      expect(store.signal_dbm).toBeNull();
    });
  });
});