import { DEFAULT_KIOSK_SETTINGS, validateKioskSettings } from './kiosk-settings.validation';

describe('validateKioskSettings', () => {
  const ok = { ...DEFAULT_KIOSK_SETTINGS };

  it('accepts the defaults', () => {
    expect(ok.resetSeconds).toBe(30);
    expect(validateKioskSettings(ok)).toEqual({});
  });

  it('requires at least one payment choice', () => {
    expect(validateKioskSettings({ ...ok, paymentChoices: [] }).paymentChoices).toBeDefined();
    expect(validateKioskSettings({ ...ok, paymentChoices: ['SCAN_TO_PAY'] }).paymentChoices).toBeUndefined();
  });

  it('accepts 5 and 300 seconds and rejects 4, 301, fractions and NaN', () => {
    expect(validateKioskSettings({ ...ok, resetSeconds: 5 }).resetSeconds).toBeUndefined();
    expect(validateKioskSettings({ ...ok, resetSeconds: 300 }).resetSeconds).toBeUndefined();
    for (const bad of [4, 301, 10.5, NaN]) {
      expect(validateKioskSettings({ ...ok, resetSeconds: bad }).resetSeconds).toBeDefined();
    }
  });
});
