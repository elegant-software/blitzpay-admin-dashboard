import { KioskPaymentChoice, KioskSettings } from '../models/merchant-catalog.models';

export const KIOSK_RESET_MIN_SECONDS = 5;
export const KIOSK_RESET_MAX_SECONDS = 300;
export const KIOSK_RESET_DEFAULT_SECONDS = 30;
export const KIOSK_PAYMENT_CHOICES: readonly KioskPaymentChoice[] = ['CARD', 'CASH', 'SCAN_TO_PAY'];

export const DEFAULT_KIOSK_SETTINGS: KioskSettings = {
  paymentChoices: ['CARD', 'CASH', 'SCAN_TO_PAY'],
  resetSeconds: KIOSK_RESET_DEFAULT_SECONDS,
  languages: [],
  advertisedProductIds: [],
};

export interface KioskSettingsErrors {
  paymentChoices?: string;
  resetSeconds?: string;
}

/** Messages are English source keys, translated in the template. */
export function validateKioskSettings(settings: KioskSettings): KioskSettingsErrors {
  const errors: KioskSettingsErrors = {};
  if (!settings.paymentChoices.length) {
    errors.paymentChoices = 'Select at least one payment choice.';
  }
  const seconds = settings.resetSeconds;
  if (!Number.isInteger(seconds) || seconds < KIOSK_RESET_MIN_SECONDS || seconds > KIOSK_RESET_MAX_SECONDS) {
    errors.resetSeconds = 'Enter a whole number of seconds from 5 to 300.';
  }
  return errors;
}
