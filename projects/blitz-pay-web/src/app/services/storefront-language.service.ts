import { Injectable } from '@angular/core';
import { StorefrontMerchant } from '../models/storefront.models';

const INTERNATIONAL_MENU = 'INTERNATIONAL_MENU';

/** The shopper's explicitly chosen catalog language, kept for the browsing session. */
@Injectable({ providedIn: 'root' })
export class StorefrontLanguageService {
  private readonly storageKey = 'blitzpay.storefront-language';
  private chosen: string | null = this.read();

  get language(): string | null {
    return this.chosen;
  }

  choose(language: string): void {
    this.chosen = language;
    try {
      sessionStorage.setItem(this.storageKey, language);
    } catch {
      // Storage may be unavailable (private mode); the choice still applies to this page.
    }
  }

  private read(): string | null {
    try {
      return sessionStorage.getItem(this.storageKey);
    } catch {
      return null;
    }
  }
}

/** Menu languages are defined by the merchant, not by client-side translations. */
export function catalogLanguages(merchant: StorefrontMerchant | null | undefined): string[] {
  const original = merchant?.originalMenuLanguage;
  if (!original || !merchant?.offerings?.includes(INTERNATIONAL_MENU)) return [];
  return [...new Set([original, ...(merchant.supportedMenuLanguages ?? [])])];
}

/** A language's name in that language, e.g. "Deutsch" for `de`. */
export function nativeLanguageName(code: string): string {
  try {
    const name = new Intl.DisplayNames([code], { type: 'language' }).of(code) ?? code;
    return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
  } catch {
    return code.toUpperCase();
  }
}
