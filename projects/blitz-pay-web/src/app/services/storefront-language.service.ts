import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { StorefrontMerchant } from '../models/storefront.models';

const INTERNATIONAL_MENU = 'INTERNATIONAL_MENU';

/** The shopper's explicitly chosen catalog language, kept for the browsing session. */
@Injectable({ providedIn: 'root' })
export class StorefrontLanguageService {
  private readonly storageKey = 'blitzpay.storefront-language';
  private chosen: string | null = this.read();
  private resolved: string | null = null;
  /** Emits each explicit choice so the open page reloads its menu text. */
  readonly changes = new Subject<string>();

  get language(): string | null {
    return this.resolved ?? this.chosen;
  }

  /** Resolve the merchant default before requesting menu text; only explicit choices are persisted. */
  resolve(merchant: StorefrontMerchant): string | null {
    const original = merchant.originalMenuLanguage ?? merchant.originalLanguage ?? null;
    this.resolved = this.chosen ?? original;
    return this.language;
  }

  get direction(): 'rtl' | 'ltr' {
    return ['ar', 'fa', 'he', 'ur'].includes(this.language?.split('-')[0].toLowerCase() ?? '') ? 'rtl' : 'ltr';
  }

  choose(language: string): void {
    this.chosen = language;
    this.resolved = language;
    try {
      sessionStorage.setItem(this.storageKey, language);
    } catch {
      // Storage may be unavailable (private mode); the choice still applies to this page.
    }
    this.changes.next(language);
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
  const original = merchant?.originalMenuLanguage ?? merchant?.originalLanguage;
  if (!original || !merchant?.offerings?.includes(INTERNATIONAL_MENU)) return [];
  return [...new Set([original, ...(merchant.supportedMenuLanguages ?? [])])];
}

/** Country whose flag stands for a menu language; codes not listed share their country code (de, fr, it…). */
const FLAG_COUNTRY: Record<string, string> = {
  en: 'gb', ar: 'sa', bn: 'bd', bs: 'ba', ca: 'es-ct', cs: 'cz', da: 'dk', el: 'gr', et: 'ee', fa: 'ir', he: 'il',
  hi: 'in', ja: 'jp', ko: 'kr', ku: 'iq', ms: 'my', sl: 'si', sq: 'al', sr: 'rs', sv: 'se', uk: 'ua', ur: 'pk', vi: 'vn', zh: 'cn'
};

export function flagUrl(language: string): string {
  const code = language.split('-')[0].toLowerCase();
  return `/flags/${FLAG_COUNTRY[code] ?? code}.svg`;
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
